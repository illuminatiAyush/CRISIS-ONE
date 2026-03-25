"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 absolute transition-all opacity-100 rotate-0" />
      ) : (
        <Sun className="w-5 h-5 absolute transition-all opacity-100 rotate-0" />
      )}
      {/* Invisible placeholder to maintain size during transitions mentally */}
      <span className="w-5 h-5 invisible flex shrink-0 inline-block pointer-events-none" />
    </button>
  );
}
