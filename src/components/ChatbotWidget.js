"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send, Settings } from "lucide-react";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hi there! I'm your PetZone assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored) setApiKey(stored);
  }, []);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem("gemini_api_key", apiKey);
    setShowSettings(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    const userMessage = { text: input, isBot: false };
    const conversation = [...messages, userMessage];
    
    setMessages(conversation);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({ messages: conversation })
      });

      const data = await response.json();
      
      if (data.content) {
        setMessages(prev => [...prev, { text: data.content, isBot: true }]);
      } else {
        setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isBot: true }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { text: "Network error occurred.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 transition-transform ${isOpen ? 'scale-0' : 'scale-100'} z-50`}
        aria-label="Open Chat"
      >
        <Bot size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-brand-500 p-4 flex justify-between items-center text-white shrink-0">
            <div className="flex gap-2 items-center">
              <div className="bg-white/20 p-1 rounded-lg">
                <Bot size={20} />
              </div>
              <span className="font-semibold text-sm">PetZone Robot</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowSettings(!showSettings)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                <Settings size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition">
                <X size={18} />
              </button>
            </div>
          </div>
          
          {showSettings && (
            <div className="bg-brand-50 p-4 border-b border-brand-100 text-sm">
              <p className="text-brand-700 font-medium mb-2">Configure Gemini API Key</p>
              <form onSubmit={handleSaveKey} className="flex gap-2">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..." 
                  className="flex-1 px-3 py-1.5 border border-brand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <button type="submit" className="bg-brand-500 text-white px-3 py-1.5 rounded-md hover:bg-brand-600 font-medium">
                  Save
                </button>
              </form>
              <p className="text-xs text-brand-600 mt-2">Key securely saved to local browser storage.</p>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.isBot ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm" : "bg-brand-500 text-white rounded-tr-sm shadow-sm"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={loading ? "Thinking..." : "Ask me anything..."} 
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button 
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-full bg-brand-500 text-white disabled:opacity-50 hover:bg-brand-600 transition"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
