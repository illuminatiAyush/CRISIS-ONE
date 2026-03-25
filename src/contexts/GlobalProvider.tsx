"use client";

import React from "react";
import { ThemeProvider } from "./ThemeContext";
import { LanguageProvider } from "./LanguageContext";
import { AccessibilityProvider } from "./AccessibilityContext";

/**
 * Wraps all global custom Providers required for the MVP UI functionality.
 */
export default function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          {children}
        </AccessibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
