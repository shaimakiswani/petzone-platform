"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, HelpCircle, History, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function SupportBubble() {
  const { t, isAr } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("new"); // new, history, chat
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);

  // Use MessageCircle icon for support
  const Icon = MessageCircle;

  useEffect(() => {
    const handleOpenSupport = (e) => {
      setIsOpen(true);
      if (e.detail?.view) setView(e.detail.view);
      if (e.detail?.ticket) setActiveTicket(e.detail.ticket);
    };
    window.addEventListener('openSupport', handleOpenSupport);
    return () => window.removeEventListener('openSupport', handleOpenSupport);
  }, []);

  useEffect(() => {
    if (!user || !isOpen) return;
    const q = query(
      collection(db, "support_tickets"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTickets(list);
      
      // If we are in chat view, update the active ticket
      if (activeTicket) {
        const updated = list.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
    });
    return () => unsubscribe();
  }, [user, isOpen, activeTicket?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);

    try {
      await addDoc(collection(db, "support_tickets"), {
        userId: user?.uid || "guest",
        userEmail: user?.email || "Guest",
        userName: user?.displayName || "Guest",
        message: message.trim(),
        status: "open",
        createdAt: serverTimestamp(),
        responses: []
      });
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setView("history");
      }, 2000);
    } catch (err) {
      console.error("Support Ticket Error:", err);
      alert("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTicket) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, "support_tickets", activeTicket.id), {
        responses: arrayUnion({
          text: message.trim(),
          sender: "user",
          createdAt: new Date().toISOString()
        }),
        status: "open" // Re-open if it was closed maybe? 
      });
      setMessage("");
    } catch (err) {
      console.error("Reply Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-8 ${isAr ? 'right-8' : 'left-8'} z-50`}>
      {/* Support Window */}
      {isOpen && (
        <div className={`absolute bottom-20 ${isAr ? 'right-0' : 'left-0'} w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all animate-in slide-in-from-bottom-5 duration-300 flex flex-col h-[500px]`}>
          <div className="bg-brand-500 p-6 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              {view !== "new" && (
                <button onClick={() => setView(view === "chat" ? "history" : "new")} className="hover:bg-white/20 p-1 rounded-lg transition">
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{view === "chat" ? "Conversation" : "PetZone Support"}</h3>
                <p className="text-[10px] opacity-80">We're here to help!</p>
              </div>
            </div>
            <div className="flex gap-2">
              {user && view === "new" && tickets.length > 0 && (
                <button onClick={() => setView("history")} className="hover:bg-white/20 p-1.5 rounded-lg transition flex items-center gap-1">
                  <History size={18} />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {view === "new" ? (
              sent ? (
                <div className="text-center py-10 space-y-4 h-full flex flex-col justify-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <HelpCircle size={32} />
                  </div>
                  <p className="text-sm font-bold text-gray-700">Request Sent! 🐾</p>
                  <p className="text-xs text-gray-400">Our team will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">How can we help?</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue or question..."
                      className="w-full h-32 p-4 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 resize-none transition-all shadow-sm"
                      required
                    />
                  </div>
                  <button 
                    disabled={loading}
                    className="w-full bg-brand-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? "Sending..." : (
                      <>
                        <Send size={18} />
                        Send Request
                      </>
                    )}
                  </button>
                  {user && tickets.length > 0 && (
                    <button 
                      type="button"
                      onClick={() => setView("history")}
                      className="w-full text-brand-600 text-xs font-bold py-2 hover:underline"
                    >
                      View my previous requests
                    </button>
                  )}
                </form>
              )
            ) : view === "history" ? (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">My Requests</h4>
                {tickets.map(ticket => (
                  <button 
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setView("chat"); }}
                    className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-brand-300 transition-all text-left flex justify-between items-center group"
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-gray-700 truncate">{ticket.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{new Date(ticket.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${ticket.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {ticket.status}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              /* Chat View */
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-4 pb-4">
                  {/* User's Original Message */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[90%] p-4 bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-none text-sm">
                      <p className="font-bold text-[10px] text-brand-500 uppercase mb-1">My Request</p>
                      {activeTicket.message}
                    </div>
                  </div>

                  {/* Responses */}
                  {activeTicket.responses?.map((resp, i) => (
                    <div key={i} className={`flex flex-col ${resp.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[90%] p-4 rounded-2xl text-sm ${resp.sender === 'admin' ? 'bg-brand-500 text-white rounded-tr-none shadow-md' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'}`}>
                        {resp.text}
                      </div>
                      <span className="text-[9px] text-gray-400 mt-1 uppercase font-bold">
                        {resp.sender === 'admin' ? 'Admin' : 'Me'} • {new Date(resp.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>

                {activeTicket.status === 'open' && (
                  <form onSubmit={handleReply} className="pt-4 border-t border-gray-100 flex gap-2">
                    <input 
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Reply to admin..."
                      className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                    <button 
                      disabled={loading || !message.trim()}
                      className="p-2 bg-brand-500 text-white rounded-xl hover:bg-brand-600 transition disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center border border-gray-100 hover:scale-110 transition-all duration-300 group overflow-hidden"
      >
         <div className="absolute inset-0 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
         {isOpen ? (
           <X className="relative z-10 text-gray-500 group-hover:text-white" size={28} />
         ) : (
           <div className="relative z-10 flex flex-col items-center">
              <Icon className="text-brand-500 group-hover:text-white" size={28} />
              <span className="text-[8px] font-black group-hover:text-white uppercase mt-0.5">Help</span>
           </div>
         )}
      </button>
    </div>
  );
}

