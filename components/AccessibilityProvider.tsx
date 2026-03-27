"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

export type FontSize = "small" | "medium" | "large";
export type ContrastMode = "normal" | "high";

interface AccessibilityContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  contrastMode: ContrastMode;
  toggleContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  fontSize: "medium",
  setFontSize: () => {},
  contrastMode: "normal",
  toggleContrast: () => {}
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

const FONT_KEY = "alagalahat-font-size";
const CONTRAST_KEY = "alagalahat-contrast";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [contrastMode, setContrastMode] = useState<ContrastMode>("normal");
  const [ready, setReady] = useState(false);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const savedFont = sessionStorage.getItem(FONT_KEY) as FontSize | null;
      const savedContrast = sessionStorage.getItem(CONTRAST_KEY) as ContrastMode | null;
      if (savedFont && ["small", "medium", "large"].includes(savedFont)) {
        setFontSizeState(savedFont);
      }
      if (savedContrast && ["normal", "high"].includes(savedContrast)) {
        setContrastMode(savedContrast);
      }
    } catch {
      // sessionStorage not available
    }
    setReady(true);
  }, []);

  // Sync data attributes to <html>
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.setAttribute("data-fontsize", fontSize);
    html.setAttribute("data-contrast", contrastMode);
  }, [fontSize, contrastMode, ready]);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    try {
      sessionStorage.setItem(FONT_KEY, size);
    } catch {
      // ignore
    }
  }, []);

  const toggleContrast = useCallback(() => {
    setContrastMode((prev) => {
      const next = prev === "normal" ? "high" : "normal";
      try {
        sessionStorage.setItem(CONTRAST_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{ fontSize, setFontSize, contrastMode, toggleContrast }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
