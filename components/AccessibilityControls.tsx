"use client";

import { useAccessibility, type FontSize } from "./AccessibilityProvider";
import { IconContrast, IconType } from "./icons";

const fontOptions: { label: string; value: FontSize }[] = [
  { label: "S", value: "small" },
  { label: "M", value: "medium" },
  { label: "L", value: "large" }
];

export function AccessibilityControls() {
  const { fontSize, setFontSize, contrastMode, toggleContrast } = useAccessibility();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Font Size Control */}
      <div
        role="group"
        aria-label="Font size adjustment"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          background: "var(--color-background)",
          borderRadius: "var(--radius-md)",
          padding: 2,
          border: "1px solid var(--color-border)"
        }}
      >
        <IconType size={14} style={{ marginLeft: 6, marginRight: 2, color: "var(--color-text-muted)", flexShrink: 0 }} />
        {fontOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFontSize(opt.value)}
            aria-label={`Font size ${opt.value}`}
            aria-pressed={fontSize === opt.value}
            style={{
              minWidth: 32,
              minHeight: 32,
              padding: "4px 8px",
              border: "none",
              borderRadius: "var(--radius-sm)",
              background: fontSize === opt.value ? "var(--color-primary)" : "transparent",
              color: fontSize === opt.value ? "#fff" : "var(--color-text-muted)",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              lineHeight: 1
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Contrast Toggle */}
      <button
        type="button"
        onClick={toggleContrast}
        aria-label={contrastMode === "high" ? "Switch to normal contrast" : "Switch to high contrast"}
        aria-pressed={contrastMode === "high"}
        title={contrastMode === "high" ? "Normal contrast" : "High contrast"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          minWidth: 44,
          minHeight: 44,
          padding: "8px 10px",
          border: `1px solid ${contrastMode === "high" ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          background: contrastMode === "high" ? "var(--color-primary)" : "transparent",
          color: contrastMode === "high" ? "#fff" : "var(--color-text-muted)",
          cursor: "pointer",
          transition: "all var(--transition-fast)",
          fontWeight: 500,
          fontSize: 12
        }}
      >
        <IconContrast size={16} />
      </button>
    </div>
  );
}
