"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityState {
  highContrast: boolean;
  reduceMotion: boolean;
  fontSize: "normal" | "large" | "x-large";
}

interface AccessibilityContextType {
  state: AccessibilityState;
  updateState: (updates: Partial<AccessibilityState>) => void;
  resetState: () => void;
}

const defaultState: AccessibilityState = {
  highContrast: false,
  reduceMotion: false,
  fontSize: "normal",
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem("CrisisOne-a11y");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      } catch (e) {
        console.error("Failed to parse a11y state", e);
      }
    }
  }, []);

  // Apply classes to document element whenever state changes
  useEffect(() => {
    const html = document.documentElement;

    // High Contrast
    if (state.highContrast) {
      html.classList.add("a11y-high-contrast");
    } else {
      html.classList.remove("a11y-high-contrast");
    }

    // Reduce Motion
    if (state.reduceMotion) {
      html.classList.add("a11y-reduce-motion");
    } else {
      html.classList.remove("a11y-reduce-motion");
    }

    // Font Size
    html.classList.remove("a11y-font-large", "a11y-font-xlarge");
    if (state.fontSize === "large") {
      html.classList.add("a11y-font-large");
    } else if (state.fontSize === "x-large") {
      html.classList.add("a11y-font-xlarge");
    }

    localStorage.setItem("CrisisOne-a11y", JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<AccessibilityState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(defaultState);
  };

  return (
    <AccessibilityContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}
