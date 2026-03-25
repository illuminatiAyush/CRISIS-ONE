"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

// Import dictionaries directly to avoid network overhead for MVP
import en from "@/i18n/en.json";
import hi from "@/i18n/hi.json";
import mr from "@/i18n/mr.json";

export type LanguageCode = "en" | "hi" | "mr";
type Translations = Record<string, string>;

const dictionaries: Record<LanguageCode, Translations> = { en, hi, mr };

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    // Load saved lang on mount
    const saved = localStorage.getItem("CrisisOne-lang") as LanguageCode | null;
    if (saved && dictionaries[saved]) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("CrisisOne-lang", lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let translation: any = dictionaries[language];
    
    for (const k of keys) {
      translation = translation?.[k];
    }

    if (typeof translation !== "string") {
      // Fallback to english
      let fallback: any = dictionaries["en"];
      for (const k of keys) {
        fallback = fallback?.[k];
      }
      return typeof fallback === "string" ? fallback : key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
