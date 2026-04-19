"use client";

import React, { useState } from "react";
import { SectionCard, SettingRow, ToggleSwitch } from "./shared";
import { IconPaw } from "@/components/icons";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function PetPreferencesSection() {
  const [defaultSpecies, setDefaultSpecies] = useState("Dog");
  const [defaultVis, setDefaultVis] = useState("public");
  const [autoQr, setAutoQr] = useState(true);
  const [autoNotify, setAutoNotify] = useState(true);
  const [reminderDays, setReminderDays] = useState("7");
  const [remindAll, setRemindAll] = useState(true);
  const [showCompliance, setShowCompliance] = useState(false);
  const [alertRadius, setAlertRadius] = useState(2);
  const [saving, setSaving] = useState(false);

  const radiusLabels: Record<number, string> = { 0: "500m", 1: "1km", 2: "3km", 3: "5km", 4: "Entire Barangay" };

  async function handleSave() {
    setSaving(true); await new Promise(r => setTimeout(r, 500)); setSaving(false);
    toast.success("Pet preferences saved!");
  }

  return (
    <SectionCard id="pet-preferences" icon={<IconPaw size={20} />}
      iconBg="rgba(233, 196, 106, 0.15)" iconColor="#D4A843"
      title="Pet Preferences" desc="Default settings for pet registration and alerts.">

      {/* Default Registration */}
      <div>
        <h4 className="settings-subsection-title" style={{ marginTop: 0 }}>📋 Default Pet Registration Settings</h4>
        <div className="settings-form-row">
          <div className="settings-form-group">
            <label htmlFor="default-species">Default species when adding a pet</label>
            <Select id="default-species" value={defaultSpecies} onChange={e => setDefaultSpecies(e.target.value)} style={{ background: "var(--color-background)" }}>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div className="settings-form-group">
            <label htmlFor="default-vis">Default visibility for new pet profiles</label>
            <Select id="default-vis" value={defaultVis} onChange={e => setDefaultVis(e.target.value)} style={{ background: "var(--color-background)" }}>
              <option value="public">Public</option>
              <option value="barangay">Barangay Only</option>
              <option value="private">Private</option>
            </Select>
          </div>
        </div>
        <SettingRow title="Auto-generate QR tag when pet is registered"><ToggleSwitch id="pref-qr" checked={autoQr} onChange={setAutoQr} /></SettingRow>
        <SettingRow title="Notify me when registration is approved"><ToggleSwitch id="pref-notify" checked={autoNotify} onChange={setAutoNotify} /></SettingRow>
      </div>

      {/* Vaccination Reminders */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">💉 Vaccination Reminder Preferences</h4>
        <div className="settings-form-group">
          <label htmlFor="reminder-days">Days before due date to receive first reminder</label>
          <Select id="reminder-days" value={reminderDays} onChange={e => setReminderDays(e.target.value)} style={{ background: "var(--color-background)", maxWidth: 200 }}>
            <option value="14">14 days</option>
            <option value="7">7 days</option>
            <option value="3">3 days</option>
            <option value="1">1 day</option>
          </Select>
        </div>
        <SettingRow title="Send reminders for all pets" desc="vs individual pet toggles"><ToggleSwitch id="pref-remindall" checked={remindAll} onChange={setRemindAll} /></SettingRow>
        <SettingRow title="Show vaccination compliance score on my profile"><ToggleSwitch id="pref-compliance" checked={showCompliance} onChange={setShowCompliance} /></SettingRow>
      </div>

      {/* Lost Pet Alert Radius */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">📍 Lost Pet Alert Radius</h4>
        <div className="settings-range-container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>Current: {radiusLabels[alertRadius]}</span>
          </div>
          <input type="range" className="settings-range" min={0} max={4} step={1} value={alertRadius}
            onChange={e => setAlertRadius(Number(e.target.value))} />
          <div className="settings-range-labels">
            <span>500m</span><span>1km</span><span>3km</span><span>5km</span><span>Full</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: 0 }}>
            You&apos;ll receive alerts for lost pets reported within this radius of your registered address.
          </p>
        </div>
      </div>

      <div className="settings-save-btn">
        <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </SectionCard>
  );
}
