"use client";

import React, { useState } from "react";
import { SectionCard, PasswordInput, ConfirmModal } from "./shared";
import { IconLock, IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

function getStrength(pw: string) {
  let score = 0;
  const checks = {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  if (checks.length) score++;
  if (checks.upper) score++;
  if (checks.number) score++;
  if (checks.special) score++;
  const labels = ["", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "#EF4444", "#F59E0B", "#22C55E", "#10B981"];
  return { score, checks, label: labels[score], color: colors[score] };
}

const MOCK_LOGIN_ACTIVITY = [
  { date: "Apr 17, 2026 2:30 PM", device: "Chrome on Windows", location: "Bunawan, Agusan", ip: "192.168.x.x", status: "success" as const },
  { date: "Apr 16, 2026 9:00 AM", device: "Mobile Safari", location: "Unknown", ip: "103.x.x.x", status: "warning" as const },
  { date: "Apr 15, 2026 11:20 AM", device: "Chrome on Windows", location: "Bunawan, Agusan", ip: "192.168.x.x", status: "success" as const },
  { date: "Apr 14, 2026 3:45 PM", device: "Firefox on Mac", location: "Manila", ip: "110.x.x.x", status: "warning" as const },
];

export function SecuritySection({ userEmail }: { userEmail: string }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const strength = getStrength(newPw);
  const backupCodes = ["A1B2-C3D4", "E5F6-G7H8", "J9K0-L1M2", "N3P4-Q5R6", "S7T8-U9V0", "W1X2-Y3Z4", "A5B6-C7D8", "E9F0-G1H2"];

  async function handleChangePassword() {
    if (!currentPw) { toast.error("Enter current password"); return; }
    if (strength.score < 3) { toast.error("Password is too weak"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    toast.success("Password updated successfully!");
  }

  return (
    <SectionCard id="security" icon={<IconLock size={20} />}
      iconBg="rgba(239, 68, 68, 0.12)" iconColor="#EF4444"
      title="Security & Password" desc="Protect your account with strong credentials.">

      {/* Change Password */}
      <div className="settings-subsection" style={{ borderTop: "none", paddingTop: 0 }}>
        <h3 className="settings-subsection-title">🔑 Change Password</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="settings-form-group">
            <label htmlFor="current-pw">Current Password</label>
            <PasswordInput id="current-pw" value={currentPw} onChange={setCurrentPw} placeholder="Enter current password" />
          </div>
          <div className="settings-form-group">
            <label htmlFor="new-pw">New Password</label>
            <PasswordInput id="new-pw" value={newPw} onChange={setNewPw} placeholder="Enter new password" />
            {newPw && (
              <>
                <div className="strength-meter">
                  <div className="strength-meter-bar" style={{ width: `${strength.score * 25}%`, background: strength.color }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                </div>
                <div className="strength-checklist">
                  {[
                    { key: "length", label: "At least 8 characters" },
                    { key: "upper", label: "One uppercase letter" },
                    { key: "number", label: "One number" },
                    { key: "special", label: "One special character" },
                  ].map(c => (
                    <div key={c.key} className={`strength-check${strength.checks[c.key as keyof typeof strength.checks] ? " pass" : ""}`}>
                      <div className="strength-check-icon">{strength.checks[c.key as keyof typeof strength.checks] ? "✓" : ""}</div>
                      {c.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="settings-form-group">
            <label htmlFor="confirm-pw">Confirm New Password</label>
            <PasswordInput id="confirm-pw" value={confirmPw} onChange={setConfirmPw} placeholder="Confirm new password" />
            {confirmPw && newPw !== confirmPw && <p style={{ color: "var(--color-error)", fontSize: 12, margin: "4px 0 0" }}>Passwords don&apos;t match</p>}
          </div>
          <Button variant="primary" disabled={saving} onClick={handleChangePassword} style={{ alignSelf: "flex-start" }}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* 2FA */}
      <div className="settings-subsection">
        <h3 className="settings-subsection-title">🛡️ Two-Factor Authentication</h3>
        <div className="settings-toggle-row" style={{ borderBottom: "none" }}>
          <div className="settings-toggle-label">
            <h4>Enable 2FA</h4>
            <p>Add an extra layer of security using Email OTP or an Authenticator App.</p>
          </div>
          <button type="button" onClick={() => { setTwoFA(!twoFA); if (!twoFA) toast.success("2FA Enabled — check backup codes below"); else toast.info("2FA Disabled"); }}
            style={{
              padding: "8px 16px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              background: twoFA ? "var(--color-success)" : "var(--color-primary)", color: "#fff",
              transition: "all 0.2s ease"
            }}>
            {twoFA ? "✓ Enabled" : "Enable"}
          </button>
        </div>
        {twoFA && (
          <div style={{ marginTop: 12, padding: 16, background: "var(--color-background)", borderRadius: 12, border: "1px solid var(--color-border)" }}>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px" }}>Your backup codes (save these somewhere safe):</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {backupCodes.map(code => (
                <code key={code} style={{ padding: "6px 10px", background: "var(--color-card)", borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: "center", color: "var(--color-text)", border: "1px solid var(--color-border)" }}>{code}</code>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => toast.info("Backup codes regenerated")} style={{ marginTop: 12 }}>Regenerate Backup Codes</Button>
          </div>
        )}
      </div>

      {/* Email Verification */}
      <div className="settings-subsection">
        <h3 className="settings-subsection-title">📧 Email Verification</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, color: "var(--color-text)" }}>{userEmail}</span>
          <span className="verified-badge success"><IconCheck size={12} /> Verified</span>
        </div>
      </div>

      {/* Login Activity */}
      <div className="settings-subsection">
        <h3 className="settings-subsection-title">📋 Login Activity</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="settings-table">
            <thead>
              <tr><th>Date & Time</th><th>Device</th><th>Location</th><th>IP Address</th><th>Status</th></tr>
            </thead>
            <tbody>
              {MOCK_LOGIN_ACTIVITY.map((row, i) => (
                <tr key={i}>
                  <td style={{ whiteSpace: "nowrap" }}>{row.date}</td>
                  <td>{row.device}</td>
                  <td>{row.location}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{row.ip}</td>
                  <td className={row.status === "success" ? "status-success" : "status-warning"}>
                    {row.status === "success" ? "✅ Success" : "⚠️ New Device"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => setShowSignOutModal(true)}
          style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid var(--color-coral)", background: "transparent", color: "var(--color-coral)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Sign out all other devices
        </button>
      </div>

      <ConfirmModal open={showSignOutModal} onClose={() => setShowSignOutModal(false)} title="Sign out all devices?" danger>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 20px" }}>This will sign you out of all other browser sessions. You&apos;ll remain logged in on this device.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={() => setShowSignOutModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={() => { setShowSignOutModal(false); toast.success("All other sessions ended"); }}>Sign Out All</Button>
        </div>
      </ConfirmModal>
    </SectionCard>
  );
}
