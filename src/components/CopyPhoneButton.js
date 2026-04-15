"use client";

import { useState } from "react";
import { Phone, Check } from "lucide-react";

export default function CopyPhoneButton({ phone }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button 
      onClick={handleCopy}
      className={`flex items-center gap-3 bg-white p-3.5 rounded-2xl shadow-sm transition w-full text-left border ${
        copied ? "border-green-400 bg-green-50" : "border-slate-100 hover:border-brand-300"
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition ${
        copied ? "bg-green-500 text-white shadow-md shadow-green-500/20" : "bg-green-50 text-green-600"
      }`}>
        {copied ? <Check size={20} /> : <Phone size={20} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-0.5 leading-none">
          {copied ? "Copied!" : "Phone Number (Click to Copy)"}
        </p>
        <p className="text-sm sm:text-base font-black text-slate-900 leading-tight">
          {phone || "Not Provided"}
        </p>
      </div>
    </button>
  );
}
