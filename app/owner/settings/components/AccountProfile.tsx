"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { SectionCard, SettingRow, ToggleSwitch } from "./shared";
import { IconUser, IconCamera } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const BARANGAYS = [
  "Bunawan", "Libertad", "San Francisco", "Rosario", "Prosperidad",
  "Trento", "Veruela", "San Luis", "Santa Josefa", "Talacogon",
  "Bayugan", "Esperanza", "La Paz", "Loreto", "Sibagat"
];

export function AccountProfileSection({ userName, userEmail, initials }: {
  userName: string; userEmail: string; initials: string;
}) {
  const [fullName, setFullName] = useState(userName);
  const [displayName, setDisplayName] = useState("");
  const [barangay, setBarangay] = useState("");
  const [contact, setContact] = useState("");
  const [contactPublic, setContactPublic] = useState(false);
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    if (!["image/jpeg", "image/png"].includes(file.type)) { toast.error("Only JPG/PNG allowed"); return; }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    toast.success("Profile updated successfully!");
  }

  return (
    <SectionCard id="account-profile" icon={<IconUser size={20} />}
      iconBg="var(--color-primary-light)" iconColor="#fff"
      title="Account Profile" desc="Your personal information and public identity.">
      {/* Avatar */}
      <div className="avatar-upload">
        <div className="avatar-circle">
          {avatarPreview ? <img src={avatarPreview} alt="Avatar" /> : initials}
        </div>
        <div className="avatar-actions">
          <label className="btn-small" style={{ cursor: "pointer" }}>
            <IconCamera size={14} /> Change Photo
            <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} style={{ display: "none" }} />
          </label>
          {avatarPreview && (
            <button type="button" className="btn-small remove" onClick={() => setAvatarPreview(null)}>Remove Photo</button>
          )}
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>JPG or PNG, max 2MB</span>
        </div>
      </div>

      {/* Name Fields */}
      <div className="settings-form-row">
        <div className="settings-form-group">
          <label htmlFor="full-name">Full Name</label>
          <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ background: "var(--color-background)" }} />
          <p className="hint">Used in official records</p>
        </div>
        <div className="settings-form-group">
          <label htmlFor="display-name">Display Name / Nickname</label>
          <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How should the community see you?" style={{ background: "var(--color-background)" }} />
        </div>
      </div>

      {/* Barangay & Contact */}
      <div className="settings-form-row">
        <div className="settings-form-group">
          <label htmlFor="barangay">Barangay / Zone</label>
          <Select id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} style={{ background: "var(--color-background)" }}>
            <option value="">— Select your Barangay —</option>
            {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
          </Select>
          <p className="hint">Controls which community feed you see</p>
        </div>
        <div className="settings-form-group">
          <label htmlFor="contact">Contact Number</label>
          <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+63 9XX XXX XXXX" style={{ background: "var(--color-background)" }} />
        </div>
      </div>

      <SettingRow title="Allow other pet owners to contact me via this number" desc="Your number will be visible on your profile">
        <ToggleSwitch id="contact-public" checked={contactPublic} onChange={setContactPublic} />
      </SettingRow>

      {/* Bio */}
      <div className="settings-form-group">
        <label htmlFor="bio">Bio / About</label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} placeholder="Tell your barangay about yourself and your pets…" style={{ background: "var(--color-background)", minHeight: 72 }} />
        <p className="hint">{bio.length}/160 characters</p>
      </div>

      {/* Gender & DOB */}
      <div className="settings-form-row">
        <div className="settings-form-group">
          <label htmlFor="gender">Gender</label>
          <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} style={{ background: "var(--color-background)" }}>
            <option value="">— Optional —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="na">Prefer not to say</option>
          </Select>
        </div>
        <div className="settings-form-group">
          <label htmlFor="dob">Date of Birth</label>
          <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} style={{ background: "var(--color-background)" }} />
          <p className="hint">Optional, not publicly visible</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div className="settings-form-group">
        <label>Email Address</label>
        <Input type="email" value={userEmail} disabled style={{ background: "var(--color-background)", opacity: 0.7 }} />
        <p className="hint">Managed via authentication provider</p>
      </div>

      <div className="settings-save-btn">
        <Button variant="primary" disabled={saving} onClick={handleSave}>{saving ? "Saving..." : "Save Changes"}</Button>
      </div>
    </SectionCard>
  );
}
