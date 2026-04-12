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
      className={`flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm transition w-full text-left border ${
        copied ? "border-green-400 bg-green-50" : "border-brand-100 hover:border-brand-300"
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition ${
        copied ? "bg-green-500 text-white" : "bg-green-100 text-green-600"
      }`}>
        {copied ? <Check size={24} /> : <Phone size={24} />}
      </div>
      <div>
        <p className="text-sm text-gray-500">{copied ? "Copied to clipboard!" : "Phone Number (Click to Copy)"}</p>
        <p className="text-lg font-bold text-gray-900">{phone || "Not Provided"}</p>
      </div>
    </button>
  );
}
