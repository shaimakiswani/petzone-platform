"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { db } from "@/firebase/config";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  limit
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Send, User, ChevronLeft, Trash2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ChatSystem() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatIdFromUrl = searchParams.get("chatId");

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolvedNames, setResolvedNames] = useState({});
  const scrollRef = useRef();

  // Derived state: Active chat is determined solely by the URL
  const activeChat = useMemo(() => {
    return chats.find(c => c.id === chatIdFromUrl) || null;
  }, [chats, chatIdFromUrl]);

  // 1. Fetch all chats for the current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort in-memory to bypass index requirement
      const sortedList = chatList.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis?.() || a.updatedAt?.seconds * 1000 || 0;
        const timeB = b.updatedAt?.toMillis?.() || b.updatedAt?.seconds * 1000 || 0;
        return timeB - timeA;
      });

      setChats(sortedList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 1.5. Dynamic Name Resolution: Fetch real names for all chat participants
  useEffect(() => {
    if (chats.length === 0) return;

    const resolveNames = async () => {
      const uidsToFetch = new Set();
      chats.forEach(chat => {
        const otherId = chat.participants?.find(p => p !== user.uid);
        if (otherId && !resolvedNames[otherId]) {
          uidsToFetch.add(otherId);
        }
      });

      if (uidsToFetch.size === 0) return;

      const newNames = { ...resolvedNames };
      let updated = false;

      for (const uid of uidsToFetch) {
        try {
          const userSnap = await getDoc(doc(db, "users", uid));
          if (userSnap.exists()) {
            newNames[uid] = userSnap.data().name;
            updated = true;
          }
        } catch (err) {
          console.error("Error resolving name for:", uid, err);
        }
      }

      if (updated) {
        setResolvedNames(newNames);
      }
    };

    resolveNames();
  }, [chats, user, resolvedNames]);

  // 2. Clear unread status when focusing on a chat
  useEffect(() => {
    if (!activeChat || !user) return;

    if (activeChat.unreadBy?.includes(user.uid)) {
      const chatRef = doc(db, "chats", activeChat.id);
      updateDoc(chatRef, {
        unreadBy: arrayRemove(user.uid)
      });
    }
  }, [activeChat, user]);

  const handleSelectChat = (chat) => {
    // Navigate will trigger the useMemo and state updates
    const params = new URLSearchParams(searchParams);
    params.set("chatId", chat.id);
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  const handleCloseChat = () => {
    // Simply removing the ID from the URL closes the chat deterministically
    const params = new URLSearchParams(searchParams);
    params.delete("chatId");
    router.push(`/profile?${params.toString()}`, { scroll: false });
  };

  // 2. Fetch messages for the active chat
  useEffect(() => {
    if (!activeChat) return;

    const q = query(
      collection(db, "chats", activeChat.id, "messages"),
      orderBy("createdAt", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgList);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => {
      unsubscribe();
      // Clearing messages in cleanup to avoid set-state-in-body error
      setMessages([]);
    };
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !user) return;

    const msgData = {
      text: newMessage,
      senderId: user.uid,
      createdAt: serverTimestamp()
    };

    const tempMsg = newMessage;
    setNewMessage("");

    try {
      // Add message
      await addDoc(collection(db, "chats", activeChat.id, "messages"), msgData);
      
      // Update chat meta & set unread for the other person
      const otherId = activeChat.participants.find(p => p !== user.uid);
      await updateDoc(doc(db, "chats", activeChat.id), {
        lastMessage: tempMsg,
        updatedAt: serverTimestamp(),
        unreadBy: arrayUnion(otherId)
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!confirm("Remove this message for everyone?")) return;
    try {
      // 1. Delete the message
      await deleteDoc(doc(db, "chats", activeChat.id, "messages", msgId));

      // 2. Re-sync the lastMessage on the parent chat object
      const mRef = collection(db, "chats", activeChat.id, "messages");
      const q = query(mRef, orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      let newLastMsg = "Start a conversation";
      if (!querySnapshot.empty) {
        newLastMsg = querySnapshot.docs[0].data().text || "Sent a message";
      }

      await updateDoc(doc(db, "chats", activeChat.id), {
        lastMessage: newLastMsg
      });
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Error deleting message");
    }
  };

  const handleDeleteChat = async (e, id) => {
    e.stopPropagation();
    if (!confirm("Delete this entire conversation? This cannot be undone.")) return;
    
    try {
      if (activeChat?.id === id) {
        handleCloseChat();
      }
      await deleteDoc(doc(db, "chats", id));
    } catch (err) {
      console.error("Delete Chat Error:", err);
      alert("Failed to delete conversation.");
    }
  };

  const getOtherParticipantName = (chat) => {
    if (!user || !chat.participants) return "User";
    const otherId = chat.participants.find(p => p !== user.uid);
    return resolvedNames[otherId] || chat.participantNames?.[otherId] || "User";
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading conversations...</div>;

  return (
    <div className="flex h-[600px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-r border-gray-200 bg-white flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 font-bold text-gray-900">Conversations</div>
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400 italic">No messages yet</div>
          ) : (
            chats.map(chat => (
              <div key={chat.id} className="group relative">
                <button 
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition text-left border-b border-gray-50 ${activeChat?.id === chat.id ? 'bg-brand-50 border-brand-100' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                      <User size={20} />
                    </div>
                    {chat.unreadBy?.includes(user.uid) && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden pr-6">
                    <div className="font-bold text-gray-900 truncate flex justify-between items-center gap-2">
                      <span>{getOtherParticipantName(chat)}</span>
                      {chat.unreadBy?.includes(user.uid) && <span className="text-[10px] bg-brand-500 text-white px-1.5 rounded-full">New</span>}
                    </div>
                    <div className={`text-xs truncate ${chat.unreadBy?.includes(user.uid) ? 'text-brand-600 font-bold' : 'text-gray-500'}`}>
                      {chat.lastMessage || "Start a conversation"}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 sm:opacity-100"
                  title="Delete Conversation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <button 
                onClick={handleCloseChat} 
                className="md:hidden p-1.5 -ml-1 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="w-8 h-8 bg-brand-50 rounded-full flex items-center justify-center text-brand-500"><User size={16} /></div>
              <div className="font-bold text-gray-900">{getOtherParticipantName(activeChat)}</div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex group ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%] flex flex-col items-end">
                    <div className={`p-3 rounded-2xl text-sm relative ${
                      msg.senderId === user.uid 
                        ? 'bg-brand-500 text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      {msg.text}
                      {msg.senderId === user.uid && (
                        <button 
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 flex gap-2">
              <input 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-brand-400 text-sm"
              />
              <button disabled={!newMessage.trim()} className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 disabled:opacity-50 transition">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <span className="text-6xl">💬</span>
            <p>Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
