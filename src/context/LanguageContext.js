"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/constants/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // Default to English
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load preference from localStorage
    const savedLang = localStorage.getItem("petzone_lang");
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      setLang(savedLang);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("petzone_lang", lang);
      // Update HTML attributes for RTL/LTR
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang, isLoaded]);

  // Translation helper function
  const t = (key) => {
    const keys = key.split('.');
    let result = translations[lang];
    
    for (const k of keys) {
      if (result?.[k]) {
        result = result[k];
      } else {
        return key; // Fallback to key name if not found
      }
    }
    return result;
  };

  const value = {
    lang,
    setLang,
    t,
    isAr: lang === "ar"
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
