"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/components/DashboardShell";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconSettings, IconUser, IconLock, IconBell, IconEye, IconPaw,
  IconSmartphone, IconDatabase, IconAlertTriangle, IconMenu
} from "@/components/icons";

import "./settings.css";

import { AccountProfileSection } from "./components/AccountProfile";
import { SecuritySection } from "./components/Security";
import { NotificationsSection } from "./components/Notifications";
import { PrivacySection } from "./components/Privacy";
import { PetPreferencesSection } from "./components/PetPreferences";
import { AppearanceSection } from "./components/Appearance";
import { DevicesSection } from "./components/Devices";
import { DataSection } from "./components/DataDownload";
import { DangerZoneSection } from "./components/DangerZone";

/* Sidebar navigation items */
const NAV_ITEMS = [
  { id: "account-profile", label: "Account Profile", icon: IconUser, emoji: "👤" },
  { id: "security", label: "Security & Password", icon: IconLock, emoji: "🔒" },
  { id: "notifications", label: "Notifications", icon: IconBell, emoji: "🔔" },
  { id: "privacy", label: "Privacy & Visibility", icon: IconEye, emoji: "👁️" },
  { id: "pet-preferences", label: "Pet Preferences", icon: IconPaw, emoji: "🐾" },
  { id: "appearance", label: "Appearance", icon: IconSettings, emoji: "🎨" },
  { id: "devices", label: "Connected Devices", icon: IconSmartphone, emoji: "📱" },
  { id: "data", label: "Data & Download", icon: IconDatabase, emoji: "📄" },
  { id: "danger-zone", label: "Danger Zone", icon: IconAlertTriangle, emoji: "⚠️", danger: true },
];

export default function OwnerSettingsPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [initials, setInitials] = useState("U");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("account-profile");
  const [petCount, setPetCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) { router.replace("/login"); return; }
      if (!mounted) return;

      const name = (data.user.user_metadata?.full_name as string) || data.user.email?.split("@")[0] || "User";
      setUserName(name);
      setUserEmail(data.user.email || "");
      const parts = name.trim().split(" ");
      setInitials(parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase());

      // Fetch stats
      const [petsRes, reportsRes] = await Promise.all([
        supabase.from("pets").select("id", { count: "exact", head: true }).eq("owner_user_id", data.user.id),
        supabase.from("lost_pet_reports").select("id", { count: "exact", head: true }).eq("reporter_user_id", data.user.id),
      ]);
      if (mounted) {
        setPetCount(petsRes.count || 0);
        setReportCount(reportsRes.count || 0);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  /* Scroll-spy: observe which section is in view */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(item => {
      const el = document.getElementById(item.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(item.id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [loading]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setIsMobileMenuOpen(false); // Close mobile menu when an item is clicked
    }
  }, []);

  if (loading) {
    return (
      <DashboardShell role="Owner" userName={userName}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Settings & Privacy</h1>
          <p style={{ margin: "8px 0 0", fontSize: "var(--font-size-base)", color: "var(--color-text-muted)" }}>Loading your preferences...</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />)}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Owner" userName={userName}>
      {/* Header Section */}
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>Settings & Privacy</h1>
          <p style={{ margin: "8px 0 0", fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", maxWidth: 300 }}>
            Manage your account, security, notifications, and preferences.
          </p>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="settings-hamburger-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle settings menu"
        >
          <IconMenu size={24} />
        </button>
      </div>

      {/* Layout: Sidebar + Content */}
      <div className="settings-layout" style={{ position: "relative", display: "flex", gap: 32 }}>
        {/* Mobile Background Overlay */}
        {isMobileMenuOpen && (
          <div className="settings-sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Sidebar Nav */}
        <nav className={`settings-sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
          width: 260,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }} aria-label="Settings categories">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: isActive ? "var(--color-primary)" : "transparent",
                  color: isActive ? "#fff" : "var(--color-text)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: isActive ? 700 : 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 200ms cubic-bezier(0.2, 0.9, 0.2, 1)",
                  textAlign: "left"
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--color-background-hover)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Panel */}
        <div className="settings-content" ref={contentRef} style={{ flex: 1, minWidth: 0 }}>
          <AccountProfileSection userName={userName} userEmail={userEmail} initials={initials} />
          <SecuritySection userEmail={userEmail} />
          <NotificationsSection />
          <PrivacySection />
          <PetPreferencesSection />
          <AppearanceSection />
          <DevicesSection />
          <DataSection stats={{ memberSince: "2026", pets: petCount, vaccinations: 0, posts: 0, reports: reportCount }} />
          <DangerZoneSection />
        </div>
      </div>
    </DashboardShell>
  );
}
