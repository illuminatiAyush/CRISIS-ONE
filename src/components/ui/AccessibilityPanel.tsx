"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accessibility, X, Type, Eye, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, updateState, resetState } = useAccessibility();
  const { t } = useLanguage();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const togglePanel = () => setIsOpen(!isOpen);

  const increaseFont = () => {
    if (state.fontSize === "normal") updateState({ fontSize: "large" });
    else if (state.fontSize === "large") updateState({ fontSize: "x-large" });
  };

  const decreaseFont = () => {
    if (state.fontSize === "x-large") updateState({ fontSize: "large" });
    else if (state.fontSize === "large") updateState({ fontSize: "normal" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Button */}
      <button
        onClick={togglePanel}
        aria-label={t("a11y.panel")}
        aria-expanded={isOpen}
        aria-controls="a11y-panel"
        className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Slide-out Panel */}
      <div
        id="a11y-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Accessibility Settings"
        className={`absolute bottom-16 right-0 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 origin-bottom-right transform ${
          isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {t("a11y.panel")}
          </h2>
          <button
            onClick={togglePanel}
            aria-label="Close panel"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Visual Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Visual</h3>
            
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <Eye className="w-4 h-4" /> {t("a11y.highContrast")}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={state.highContrast}
                  onChange={(e) => updateState({ highContrast: e.target.checked })}
                  aria-label="Toggle High Contrast"
                />
                <div className={`block w-10 h-6 border-2 rounded-full transition-colors ${state.highContrast ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-200 dark:bg-slate-700 dark:border-slate-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${state.highContrast ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                {t("a11y.reduceMotion")}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={state.reduceMotion}
                  onChange={(e) => updateState({ reduceMotion: e.target.checked })}
                  aria-label="Toggle Reduce Motion"
                />
                <div className={`block w-10 h-6 border-2 rounded-full transition-colors ${state.reduceMotion ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-200 dark:bg-slate-700 dark:border-slate-700'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${state.reduceMotion ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* Typography Settings */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Typography</h3>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Type className="w-4 h-4" /> {t("a11y.fontSize")}
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={decreaseFont}
                  disabled={state.fontSize === "normal"}
                  aria-label="Decrease font size"
                  className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium w-6 text-center text-slate-700 dark:text-slate-300">
                  {state.fontSize === "normal" ? "1x" : state.fontSize === "large" ? "1.5x" : "2x"}
                </span>
                <button
                  onClick={increaseFont}
                  disabled={state.fontSize === "x-large"}
                  aria-label="Increase font size"
                  className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl">
          <button
            onClick={resetState}
            className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border items-center border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow transition-all"
          >
            <RefreshCw className="w-4 h-4" /> {t("a11y.reset")}
          </button>
        </div>
      </div>
    </div>
  );
}
