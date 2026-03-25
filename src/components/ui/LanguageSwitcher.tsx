"use client";

import React, { useRef, useState, useEffect } from "react";
import { useLanguage, LanguageCode } from "@/contexts/LanguageContext";
import { Globe, ChevronDown } from "lucide-react";

const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "US" },
  { code: "hi", label: "हिंदी", flag: "IN" },
  { code: "mr", label: "मराठी", flag: "IN" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-slate-400" />
        <span className="uppercase">{currentLangObj.code}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                role="option"
                aria-selected={language === lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                  language === lang.code
                    ? "text-blue-600 dark:text-blue-400 font-semibold bg-blue-50/50 dark:bg-blue-900/10"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {lang.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
