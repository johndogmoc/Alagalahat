"use client";

import React, { useState } from "react";
import { SectionCard, SettingRow, ToggleSwitch, RadioGroup } from "./shared";
import { IconBell } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function NotificationsSection() {
  const [emailToggles, setEmailToggles] = useState({
    vaxReminder: true, petApproval: true, lostPet: true,
    comment: true, like: false, follow: true, communityPost: false, system: true
  });
  const [pushToggles, setPushToggles] = useState({
    urgentLost: true, vaxOverdue: true, certExpiring: true, dm: true
  });
  const [smsToggles, setSmsToggles] = useState({ lostNearby: true, vaxFinal: true });
  const [frequency, setFrequency] = useState("realtime");
  const [quietHours, setQuietHours] = useState(false);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("07:00");
  const [saving, setSaving] = useState(false);

  function toggleEmail(key: keyof typeof emailToggles) {
    setEmailToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function togglePush(key: keyof typeof pushToggles) {
    setPushToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleSms(key: keyof typeof smsToggles) {
    setSmsToggles(prev => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSave() {
    setSaving(true); await new Promise(r => setTimeout(r, 500)); setSaving(false);
    toast.success("Notification preferences saved!");
  }

  return (
    <SectionCard id="notifications" icon={<IconBell size={20} />}
      iconBg="rgba(245, 158, 11, 0.12)" iconColor="#F59E0B"
      title="Notifications" desc="Control how and when you receive updates.">

      {/* Email */}
      <div className="notif-category">
        <h4 className="notif-category-title"><span className="emoji">📧</span> Email Notifications</h4>
        <SettingRow title="Vaccination due date reminders" desc="Get reminded before due dates"><ToggleSwitch id="notif-vax" checked={emailToggles.vaxReminder} onChange={() => toggleEmail("vaxReminder")} /></SettingRow>
        <SettingRow title="Pet registration approved/rejected" desc="Status updates on your pets"><ToggleSwitch id="notif-approval" checked={emailToggles.petApproval} onChange={() => toggleEmail("petApproval")} /></SettingRow>
        <SettingRow title="Lost pet alerts in your barangay" desc="When someone reports a lost pet nearby"><ToggleSwitch id="notif-lost" checked={emailToggles.lostPet} onChange={() => toggleEmail("lostPet")} /></SettingRow>
        <SettingRow title="Someone comments on your post"><ToggleSwitch id="notif-comment" checked={emailToggles.comment} onChange={() => toggleEmail("comment")} /></SettingRow>
        <SettingRow title="Someone likes your post"><ToggleSwitch id="notif-like" checked={emailToggles.like} onChange={() => toggleEmail("like")} /></SettingRow>
        <SettingRow title="Someone follows you"><ToggleSwitch id="notif-follow" checked={emailToggles.follow} onChange={() => toggleEmail("follow")} /></SettingRow>
        <SettingRow title="New community post in your barangay"><ToggleSwitch id="notif-community" checked={emailToggles.communityPost} onChange={() => toggleEmail("communityPost")} /></SettingRow>
        <SettingRow title="System announcements" desc="Important platform updates"><ToggleSwitch id="notif-system" checked={emailToggles.system} onChange={() => toggleEmail("system")} /></SettingRow>
      </div>

      {/* Push */}
      <div className="notif-category">
        <h4 className="notif-category-title"><span className="emoji">🔔</span> Push Notifications (Browser/PWA)</h4>
        <SettingRow title="Urgent lost pet alerts nearby"><ToggleSwitch id="push-lost" checked={pushToggles.urgentLost} onChange={() => togglePush("urgentLost")} /></SettingRow>
        <SettingRow title="Vaccination overdue warning"><ToggleSwitch id="push-vax" checked={pushToggles.vaxOverdue} onChange={() => togglePush("vaxOverdue")} /></SettingRow>
        <SettingRow title="Certification expiring soon"><ToggleSwitch id="push-cert" checked={pushToggles.certExpiring} onChange={() => togglePush("certExpiring")} /></SettingRow>
        <SettingRow title="Direct messages received"><ToggleSwitch id="push-dm" checked={pushToggles.dm} onChange={() => togglePush("dm")} /></SettingRow>
      </div>

      {/* SMS */}
      <div className="notif-category">
        <h4 className="notif-category-title"><span className="emoji">📱</span> SMS Notifications</h4>
        <SettingRow title="Lost pet alert within 1km" desc="Requires contact number"><ToggleSwitch id="sms-lost" checked={smsToggles.lostNearby} onChange={() => toggleSms("lostNearby")} /></SettingRow>
        <SettingRow title="Vaccination overdue (final reminder)"><ToggleSwitch id="sms-vax" checked={smsToggles.vaxFinal} onChange={() => toggleSms("vaxFinal")} /></SettingRow>
      </div>

      {/* Frequency */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">⏱️ Notification Frequency</h4>
        <RadioGroup value={frequency} onChange={setFrequency} options={[
          { value: "realtime", label: "Real-time (instant)", emoji: "🔴" },
          { value: "daily", label: "Daily digest", desc: "One summary per day", emoji: "🟡" },
          { value: "weekly", label: "Weekly digest", desc: "One summary per week", emoji: "🟢" },
          { value: "muted", label: "Muted", desc: "No notifications", emoji: "⬜" },
        ]} />
      </div>

      {/* Quiet Hours */}
      <div className="settings-subsection">
        <SettingRow title="Mute notifications during quiet hours" desc="Urgent lost pet alerts will still come through">
          <ToggleSwitch id="quiet-hours" checked={quietHours} onChange={setQuietHours} />
        </SettingRow>
        {quietHours && (
          <div className="quiet-hours-range" style={{ marginTop: 12 }}>
            <span className="separator">From</span>
            <input type="time" className="time-input" value={quietFrom} onChange={e => setQuietFrom(e.target.value)} />
            <span className="separator">To</span>
            <input type="time" className="time-input" value={quietTo} onChange={e => setQuietTo(e.target.value)} />
          </div>
        )}
      </div>

      <div className="settings-save-btn">
        <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </SectionCard>
  );
}
