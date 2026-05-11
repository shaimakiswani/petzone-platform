"use client";

import { useState } from "react";
import { Languages, RotateCcw, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TranslateButton({ text, className = "" }) {
  const { lang, t } = useLanguage();
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);

  const handleTranslate = async () => {
    if (translatedText) {
      setShowOriginal(!showOriginal);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: lang }),
      });

      const data = await res.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        setShowOriginal(false);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  if (!text || text === t('details.no_desc')) return null;

  return (
    <div className={`mt-2 ${className}`}>
      {!showOriginal && translatedText && (
        <div className="p-4 bg-brand-50/50 border border-brand-100 rounded-2xl mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
            {translatedText}
          </p>
          <div className="mt-2 text-[10px] text-brand-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <Languages size={10} /> {t('common.verified')} AI Translation
          </div>
        </div>
      )}

      <button
        onClick={handleTranslate}
        disabled={isTranslating}
        className="flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors bg-white border border-brand-100 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md disabled:opacity-70"
      >
        {isTranslating ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            {t('details.translating')}
          </>
        ) : showOriginal ? (
          <>
            <Languages size={14} />
            {t('details.translate')}
          </>
        ) : (
          <>
            <RotateCcw size={14} />
            {t('details.view_original')}
          </>
        )}
      </button>
    </div>
  );
}
