"use client";

import { useState } from "react";
import { MessageCircle, X, Send, HelpCircle, Bot } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function SupportBubble() {
  const { t, isAr } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Use Bot icon too
  const Icon = Bot;

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
      });
      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
      }, 3000);
    } catch (err) {
      console.error("Support Ticket Error:", err);
      alert("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* Support Window */}
      {isOpen && (
        <div className={`absolute bottom-20 ${isAr ? 'left-auto -right-10' : 'left-0'} w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all animate-in slide-in-from-bottom-5 duration-300`}>
          <div className="bg-brand-500 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <HelpCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-sm">PetZone Support</h3>
                <p className="text-[10px] opacity-80">We're here to help!</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {sent ? (
              <div className="text-center py-10 space-y-4">
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
                    className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-50 resize-none transition-all"
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
              </form>
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
