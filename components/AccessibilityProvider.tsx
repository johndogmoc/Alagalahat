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
export type ThemeMode = "light" | "dark" | "system";

interface AccessibilityContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  contrastMode: ContrastMode;
  toggleContrast: () => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: "light" | "dark";
}

const AccessibilityContext = createContext<AccessibilityContextValue>({
  fontSize: "medium",
  setFontSize: () => {},
  contrastMode: "normal",
  toggleContrast: () => {},
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light"
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

const FONT_KEY = "alagalahat-font-size";
const CONTRAST_KEY = "alagalahat-contrast";
const THEME_KEY = "alagalahat-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");
  const [contrastMode, setContrastMode] = useState<ContrastMode>("normal");
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [ready, setReady] = useState(false);

  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem(FONT_KEY) as FontSize | null;
      const savedContrast = localStorage.getItem(CONTRAST_KEY) as ContrastMode | null;
      const savedTheme = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (savedFont && ["small", "medium", "large"].includes(savedFont)) {
        setFontSizeState(savedFont);
      }
      if (savedContrast && ["normal", "high"].includes(savedContrast)) {
        setContrastMode(savedContrast);
      }
      if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    } catch {
      // storage not available
    }
    setSystemTheme(getSystemTheme());
    setReady(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync data attributes to <html>
  useEffect(() => {
    if (!ready) return;
    const html = document.documentElement;
    html.setAttribute("data-fontsize", fontSize);
    html.setAttribute("data-contrast", contrastMode);
    html.setAttribute("data-theme", resolvedTheme);
  }, [fontSize, contrastMode, resolvedTheme, ready]);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    try { localStorage.setItem(FONT_KEY, size); } catch { /* ignore */ }
  }, []);

  const toggleContrast = useCallback(() => {
    setContrastMode((prev) => {
      const next = prev === "normal" ? "high" : "normal";
      try { localStorage.setItem(CONTRAST_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{ fontSize, setFontSize, contrastMode, toggleContrast, theme, setTheme, resolvedTheme }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}
