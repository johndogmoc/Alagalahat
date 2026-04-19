"use client";

import React, { useState } from "react";
import { SectionCard, SettingRow, ToggleSwitch, RadioGroup } from "./shared";
import { IconEye, IconSearch } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const MOCK_BLOCKED = [
  { name: "Juan Garcia", email: "juan@mail.com", initials: "JG" },
  { name: "Maria Santos", email: "maria@mail.com", initials: "MS" },
];

export function PrivacySection() {
  const [profileVis, setProfileVis] = useState("public");
  const [petVis, setPetVis] = useState("public");
  const [showVaxPublic, setShowVaxPublic] = useState(true);
  const [showQrPublic, setShowQrPublic] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [dmPolicy, setDmPolicy] = useState("followers");
  const [showBarangay, setShowBarangay] = useState(true);
  const [autoAddress, setAutoAddress] = useState(true);
  const [allowShare, setAllowShare] = useState(true);
  const [searchProfile, setSearchProfile] = useState(true);
  const [searchPhone, setSearchPhone] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState(MOCK_BLOCKED);
  const [blockSearch, setBlockSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const visOptions = [
    { value: "public", label: "Public", emoji: "🌐", desc: "Anyone can see" },
    { value: "barangay", label: "Barangay members only", emoji: "🏘️" },
    { value: "followers", label: "Followers only", emoji: "👥" },
    { value: "private", label: "Only me", emoji: "🔒" },
  ];

  async function handleSave() {
    setSaving(true); await new Promise(r => setTimeout(r, 500)); setSaving(false);
    toast.success("Privacy settings saved!");
  }

  return (
    <SectionCard id="privacy" icon={<IconEye size={20} />}
      iconBg="rgba(139, 92, 246, 0.12)" iconColor="#8B5CF6"
      title="Privacy & Visibility" desc="Control who sees your information.">

      {/* Profile Visibility */}
      <div>
        <h4 className="settings-subsection-title">👤 Who can see your profile?</h4>
        <RadioGroup value={profileVis} onChange={setProfileVis} options={visOptions} />
      </div>

      {/* Pet Visibility */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🐾 Who can see your registered pets?</h4>
        <RadioGroup value={petVis} onChange={setPetVis} options={visOptions} />
        <div style={{ marginTop: 12 }}>
          <SettingRow title="Show vaccination records publicly" desc="Visible on pet profiles"><ToggleSwitch id="priv-vax" checked={showVaxPublic} onChange={setShowVaxPublic} /></SettingRow>
          <SettingRow title="Show QR profile when scanned by anyone"><ToggleSwitch id="priv-qr" checked={showQrPublic} onChange={setShowQrPublic} /></SettingRow>
        </div>
      </div>

      {/* Contact Privacy */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">📞 Contact Privacy</h4>
        <SettingRow title="Show contact number to other pet owners"><ToggleSwitch id="priv-contact" checked={showContact} onChange={setShowContact} /></SettingRow>
        <SettingRow title="Allow strangers to send direct messages" desc={`Current: ${dmPolicy === "everyone" ? "Everyone" : dmPolicy === "followers" ? "Followers Only" : "Nobody"}`}>
          <select value={dmPolicy} onChange={e => setDmPolicy(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid var(--color-border)", background: "var(--color-background)", color: "var(--color-text)", fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
            <option value="everyone">Everyone</option>
            <option value="followers">Followers Only</option>
            <option value="nobody">Nobody</option>
          </select>
        </SettingRow>
        <SettingRow title="Show barangay/zone on public profile"><ToggleSwitch id="priv-zone" checked={showBarangay} onChange={setShowBarangay} /></SettingRow>
      </div>

      {/* Lost Pet Reports */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🔍 Lost Pet Reports</h4>
        <SettingRow title="Automatically show address on lost pet reports" desc="⚠️ Disabling may reduce chances of recovery">
          <ToggleSwitch id="priv-address" checked={autoAddress} onChange={setAutoAddress} />
        </SettingRow>
        <SettingRow title="Allow sharing lost pet posts to Facebook/Viber"><ToggleSwitch id="priv-share" checked={allowShare} onChange={setAllowShare} /></SettingRow>
      </div>

      {/* Search Visibility */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🔎 Search Visibility</h4>
        <SettingRow title="Allow profile to appear in search results"><ToggleSwitch id="priv-search" checked={searchProfile} onChange={setSearchProfile} /></SettingRow>
        <SettingRow title="Allow staff to find me by phone number"><ToggleSwitch id="priv-phone" checked={searchPhone} onChange={setSearchPhone} /></SettingRow>
      </div>

      {/* Blocked Users */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🚫 Blocked Users</h4>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 12px" }}>Blocked users cannot see your posts, pets, or contact you.</p>
        <div style={{ marginBottom: 12 }}>
          <Input id="block-search" name="block-search" placeholder="Search user to block..." value={blockSearch} onChange={e => setBlockSearch(e.target.value)} leftIcon={<IconSearch size={16} />} style={{ background: "var(--color-background)" }} />
        </div>
        {blockedUsers.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>No blocked users.</p>
        ) : (
          blockedUsers.map((u, i) => (
            <div key={i} className="blocked-user-item">
              <div className="blocked-user-avatar">{u.initials}</div>
              <div className="blocked-user-info"><h4>{u.name}</h4><p>{u.email}</p></div>
              <button type="button" onClick={() => { setBlockedUsers(prev => prev.filter((_, idx) => idx !== i)); toast.info(`${u.name} unblocked`); }}
                style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Unblock
              </button>
            </div>
          ))
        )}
      </div>

      <div className="settings-save-btn">
        <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </SectionCard>
  );
}
