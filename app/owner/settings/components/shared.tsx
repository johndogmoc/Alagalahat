"use client";

import React from "react";

/* === Toggle Switch === */
export function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      type="button" id={id} role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 72, height: 44, borderRadius: 44, flexShrink: 0,
        background: checked ? "#BFEFBC" : "#EDEDED",
        position: "relative", border: "none", cursor: "pointer",
        transition: "background 0.25s ease"
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%", background: "#fff",
        position: "absolute", top: 4, left: checked ? 32 : 4,
        transition: "left 0.28s cubic-bezier(.2,.9,.2,1), top 0.12s ease", boxShadow: "0 3px 10px rgba(0,0,0,0.18)"
      }} />
    </button>
  );
}

/* === Setting Row === */
export function SettingRow({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-label">
        <h4>{title}</h4>
        {desc && <p>{desc}</p>}
      </div>
      {children}
    </div>
  );
}

/* === Section Card === */
export function SectionCard({ id, icon, iconBg, iconColor, title, desc, danger, children }: {
  id: string; icon: React.ReactNode; iconBg: string; iconColor: string;
  title: string; desc?: string; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <div id={id} className={`settings-section${danger ? " danger-zone" : ""}`}>
      <div className="settings-section-header">
        <div className="settings-section-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
        <div>
          <h2 className="settings-section-title">{title}</h2>
          {desc && <p className="settings-section-desc">{desc}</p>}
        </div>
      </div>
      <div className="settings-section-body">{children}</div>
    </div>
  );
}

/* === Confirm Modal === */
export function ConfirmModal({ open, onClose, title, danger, children }: {
  open: boolean; onClose: () => void; title: string; danger?: boolean; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card${danger ? " danger" : ""}`} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: danger ? "var(--color-coral)" : "var(--color-text)" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

/* === Radio Group === */
export function RadioGroup({ options, value, onChange }: {
  options: { value: string; label: string; desc?: string; emoji?: string }[];
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="settings-radio-group">
      {options.map((opt) => (
        <div key={opt.value} className={`settings-radio-item${value === opt.value ? " selected" : ""}`} onClick={() => onChange(opt.value)}>
          <div className="settings-radio-dot"><div className="settings-radio-dot-inner" /></div>
          <div>
            <div className="settings-radio-label">{opt.emoji && <span style={{ marginRight: 6 }}>{opt.emoji}</span>}{opt.label}</div>
            {opt.desc && <div className="settings-radio-desc">{opt.desc}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* === Password Input === */
export function PasswordInput({ value, onChange, placeholder, id }: {
  value: string; onChange: (v: string) => void; placeholder?: string; id: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} className="input-base"
        style={{ background: "var(--color-background)", paddingRight: 44 }}
      />
      <button type="button" onClick={() => setShow(!show)}
        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 8, color: "var(--color-text-muted)" }}
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M1 1l22 22" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        )}
      </button>
    </div>
  );
}
