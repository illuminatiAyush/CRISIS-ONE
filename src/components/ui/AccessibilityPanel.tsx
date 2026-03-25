"use client";

import React, { useState, useEffect } from "react";
import { Accessibility, X, Type, Eye, Wind, RotateCcw, Moon, Sun } from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, updateState, resetState } = useAccessibility();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const resetAll = () => {
    resetState();
    if (theme === "dark") toggleTheme();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-5 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-blue-500" />
                {t("a11y.panel_title")}
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("a11y.high_contrast")}</span>
                </div>
                <button
                  onClick={() => updateState({ highContrast: !state.highContrast })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.highContrast ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    state.highContrast ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Reduce Motion */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Wind className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("a11y.reduce_motion")}</span>
                </div>
                <button
                  onClick={() => updateState({ reduceMotion: !state.reduceMotion })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    state.reduceMotion ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    state.reduceMotion ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Font Size */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Type className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("a11y.font_size")}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                  {(["normal", "large", "x-large"] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateState({ fontSize: size })}
                      className={`py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        state.fontSize === size
                          ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 font-black"
                          : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {t(`a11y.font_${size.replace("-", "")}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {theme === "light" ? (
                      <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {theme === "light" ? t("a11y.theme_dark") : t("a11y.theme_light")}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === "dark" ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>

              {/* Reset */}
              <button
                onClick={resetAll}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                {t("a11y.reset")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("a11y.trigger")}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all group overflow-hidden"
      >
        <Accessibility className={`w-7 h-7 transition-all duration-300 ${isOpen ? "rotate-90 opacity-0 scale-50" : "opacity-100 scale-100"}`} />
        <X className={`w-7 h-7 absolute transition-all duration-300 ${isOpen ? "rotate-0 opacity-100 scale-100" : "rotate-180 opacity-0 scale-50"}`} />
      </button>
    </div>
  );
}
