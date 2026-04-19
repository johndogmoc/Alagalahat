"use client";

import React, { useState } from "react";
import { SectionCard, SettingRow, ToggleSwitch, RadioGroup } from "./shared";
import { IconSettings, IconCheck } from "@/components/icons";
import { ThemeToggle } from "@/components/AccessibilityControls";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const ACCENT_COLORS = [
  { value: "navy", color: "#1B4F8A", label: "Navy Blue" },
  { value: "teal", color: "#2A9D8F", label: "Teal" },
  { value: "green", color: "#22C55E", label: "Green" },
  { value: "purple", color: "#8B5CF6", label: "Purple" },
  { value: "red", color: "#EF4444", label: "Red" },
  { value: "orange", color: "#F97316", label: "Orange" },
];

export function AppearanceSection() {
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState("medium");
  const [feedLayout, setFeedLayout] = useState("comfortable");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("mm/dd/yyyy");
  const [timeFormat, setTimeFormat] = useState("12h");
  const [accent, setAccent] = useState("navy");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true); await new Promise(r => setTimeout(r, 500)); setSaving(false);
    toast.success("Appearance settings saved!");
  }

  return (
    <SectionCard id="appearance" icon={<IconSettings size={20} />}
      iconBg="rgba(16, 185, 129, 0.12)" iconColor="#10B981"
      title="Appearance" desc="Customize how AlagaLahat looks and feels.">

      {/* Theme */}
      <SettingRow title="Theme Preference" desc="Choose between light, dark, or system default.">
        <ThemeToggle />
      </SettingRow>

      <SettingRow title="High Contrast Mode" desc="Increased contrast for better accessibility.">
        <ToggleSwitch id="app-contrast" checked={highContrast} onChange={setHighContrast} />
      </SettingRow>

      {/* Font Size */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🔤 Font Size</h4>
        <RadioGroup value={fontSize} onChange={setFontSize} options={[
          { value: "small", label: "Small", desc: "Compact text for more content" },
          { value: "medium", label: "Medium", desc: "Default size (recommended)" },
          { value: "large", label: "Large", desc: "Easier to read" },
        ]} />
        <div style={{ marginTop: 12, padding: 16, background: "var(--color-background)", borderRadius: 10, border: "1px solid var(--color-border)" }}>
          <p style={{ margin: 0, fontSize: fontSize === "small" ? 13 : fontSize === "large" ? 18 : 15, color: "var(--color-text)" }}>
            Preview: This is how text will look with your selected size.
          </p>
        </div>
      </div>

      {/* Feed Layout */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">📰 Feed Layout</h4>
        <RadioGroup value={feedLayout} onChange={setFeedLayout} options={[
          { value: "comfortable", label: "Comfortable", emoji: "📰", desc: "More spacing, larger images" },
          { value: "compact", label: "Compact", emoji: "📋", desc: "Denser view, more posts visible" },
        ]} />
      </div>

      {/* Language & Region */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🌐 Language & Region</h4>
        <div className="settings-form-row">
          <div className="settings-form-group">
            <label htmlFor="language">Language</label>
            <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="input-base" style={{ background: "var(--color-background)", cursor: "pointer" }}>
              <option value="en">English</option>
              <option value="tl">Filipino (Tagalog)</option>
              <option value="ceb">Bisaya</option>
            </select>
          </div>
          <div className="settings-form-group">
            <label htmlFor="date-format">Date Format</label>
            <select id="date-format" value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="input-base" style={{ background: "var(--color-background)", cursor: "pointer" }}>
              <option value="mm/dd/yyyy">MM/DD/YYYY</option>
              <option value="dd/mm/yyyy">DD/MM/YYYY</option>
            </select>
          </div>
        </div>
        <div className="settings-form-group" style={{ maxWidth: 280, marginTop: 4 }}>
          <label htmlFor="time-format">Time Format</label>
          <select id="time-format" value={timeFormat} onChange={e => setTimeFormat(e.target.value)} className="input-base" style={{ background: "var(--color-background)", cursor: "pointer" }}>
            <option value="12h">12-hour</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>

      {/* Color Accent */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🎨 Color Accent</h4>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 12px" }}>Choose your navigation highlight color.</p>
        <div className="accent-picker">
          {ACCENT_COLORS.map(c => (
            <button key={c.value} type="button" className={`accent-swatch${accent === c.value ? " selected" : ""}`}
              style={{ background: c.color }} title={c.label}
              onClick={() => setAccent(c.value)}>
              {accent === c.value && <span className="accent-check"><IconCheck size={16} /></span>}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-save-btn">
        <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </SectionCard>
  );
}
