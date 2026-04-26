"use client";

import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Clock, 
  User, 
  Mail, 
  Trash2, 
  CheckCircle, 
  Filter,
  Search
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AdminSupportInbox() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, closed
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "support_tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleStatus = async (ticketId, currentStatus, ticketData) => {
    try {
      const newStatus = currentStatus === "open" ? "closed" : "open";
      await updateDoc(doc(db, "support_tickets", ticketId), {
        status: newStatus
      });

      // Notify user if resolving
      if (newStatus === "closed" && ticketData.userId !== "guest") {
        await addDoc(collection(db, "notifications"), {
          userId: ticketData.userId,
          message: `Correction: Your support message "${ticketData.message.substring(0, 40)}..." has been RESOLVED! 🐾✅`,
          type: "support",
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Update Status Error:", err);
    }
  };

  const deleteTicket = async (ticketId) => {
    if (!confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await deleteDoc(doc(db, "support_tickets", ticketId));
    } catch (err) {
      console.error("Delete Ticket Error:", err);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filter === "all" || t.status === filter;
    const matchesSearch = t.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <MessageSquare className="text-brand-500" /> Support Inbox
          </h1>
          <p className="text-gray-500 mt-1">Manage and respond to user help requests.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 shadow-sm"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none shadow-sm"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center animate-pulse text-gray-400">Loading inbox...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 text-center text-gray-400 italic">No support tickets found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className={`p-8 hover:bg-gray-50 transition-colors flex flex-col lg:flex-row gap-6 ${ticket.status === 'closed' ? 'opacity-60' : ''}`}>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center font-bold">
                      {ticket.userName?.charAt(0) || "G"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{ticket.userName}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        <span className="flex items-center gap-1"><Mail size={12} /> {ticket.userEmail}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {ticket.createdAt?.toDate?.().toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`ml-auto lg:ml-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ticket.status === 'open' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-6 rounded-2xl border border-gray-100 italic">
                    "{ticket.message}"
                  </p>
                </div>

                <div className="flex lg:flex-col justify-end gap-3 shrink-0">
                  <button 
                    onClick={() => toggleStatus(ticket.id, ticket.status, ticket)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${ticket.status === 'open' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    <CheckCircle size={18} />
                    {ticket.status === 'open' ? "Mark as Resolved" : "Re-open Ticket"}
                  </button>
                  <button 
                    onClick={() => deleteTicket(ticket.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={18} />
                    Delete Record
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
