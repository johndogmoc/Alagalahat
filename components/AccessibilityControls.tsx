"use client";

import { useAccessibility, type ThemeMode } from "./AccessibilityProvider";

/* ---- SVG icons for the theme toggle ---- */
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
  { label: "Light", value: "light", icon: <SunIcon /> },
  { label: "Dark", value: "dark", icon: <MoonIcon /> },
  { label: "Auto", value: "system", icon: <MonitorIcon /> },
];

/**
 * A compact theme toggle (Light/Dark/Auto) designed for the dark navbar.
 * Used in: Landing page Navbar, HomeNavbar, Admin Sidebar.
 */
export function ThemeToggle({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { theme, setTheme } = useAccessibility();

  const isDark = variant === "dark";

  return (
    <div
      role="group"
      aria-label="Theme selection"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        background: "var(--color-border)",
        borderRadius: 10,
        padding: 3,
        border: "1px solid var(--color-border)",
      }}
    >
      {themeOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          aria-label={`${opt.label} theme`}
          aria-pressed={theme === opt.value}
          title={`${opt.label} theme`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            minWidth: 36,
            height: 30,
            padding: "0 8px",
            border: "none",
            borderRadius: 8,
            background: theme === opt.value ? "var(--color-primary)" : "transparent",
            color: theme === opt.value ? "#fff" : "var(--color-text-muted)",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
            transition: "all 150ms ease",
            lineHeight: 1,
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

/**
 * @deprecated Use ThemeToggle instead. Kept for backward compatibility.
 */
export function AccessibilityControls() {
  return <ThemeToggle variant="dark" />;
}
