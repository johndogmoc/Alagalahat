"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconHome, IconPaw, IconAlertTriangle, IconUser, IconClipboard, IconSearch, IconSyringe, IconMenu } from "@/components/icons";
import type { SidebarRole } from "@/components/Sidebar";

const ownerItems = [
  { href: "/home", label: "Feed", icon: IconHome },
  { href: "/pets", label: "My Pets", icon: IconPaw },
  { href: "/lost-pets", label: "Lost Pets", icon: IconAlertTriangle },
  { href: "/owner/settings", label: "More", icon: IconMenu }
] as const;

const staffItems = [
  { href: "/staff", label: "Home", icon: IconHome },
  { href: "/staff/pets", label: "Queue", icon: IconClipboard },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/lost-pets", label: "Lost", icon: IconAlertTriangle }
] as const;

const adminItems = [
  { href: "/admin", label: "Home", icon: IconHome },
  { href: "/staff/pets", label: "Queue", icon: IconClipboard },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/profile", label: "Profile", icon: IconUser }
] as const;

import { useState, useRef, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export function MobileBottomNav({ role, userName = "User" }: { role: SidebarRole; userName?: string }) {
  const pathname = usePathname();
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  const items = role === "Admin" ? adminItems : role === "Staff" ? staffItems : ownerItems;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node)) {
        setIsDropupOpen(false);
      }
    }
    if (isDropupOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropupOpen]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* DropUp Overlay */}
      {isDropupOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", zIndex: 99
        }} onClick={() => setIsDropupOpen(false)} />
      )}

      {/* DropUp Menu */}
      <div ref={dropupRef} style={{
        position: "fixed",
        bottom: isDropupOpen ? "80px" : "-200px",
        left: "16px",
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        padding: "12px 0",
        width: "240px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        zIndex: 100,
        opacity: isDropupOpen ? 1 : 0,
        pointerEvents: isDropupOpen ? "auto" : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}>
        {/* Header */}
        <div style={{ padding: "8px 20px 12px", borderBottom: "1px solid var(--color-border)", marginBottom: "4px" }}>
          <p style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--color-text)" }}>{userName}</p>
        </div>
        
        <Link href="/profile" onClick={() => setIsDropupOpen(false)} style={{
          padding: "12px 20px", textDecoration: "none", color: "var(--color-text)", fontSize: "14px", fontWeight: 600,
          display: "flex", alignItems: "center", transition: "background 0.2s"
        }}>
          Dashboard / My Profile
        </Link>
        <Link href="/owner/settings" onClick={() => setIsDropupOpen(false)} style={{
          padding: "12px 20px", textDecoration: "none", color: "var(--color-text)", fontSize: "14px", fontWeight: 600,
          display: "flex", alignItems: "center", transition: "background 0.2s"
        }}>
          Settings & Privacy
        </Link>
        
        <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 0" }} />
        
        <button onClick={handleLogout} style={{
          padding: "12px 20px", border: "none", background: "transparent", color: "var(--color-text)", fontSize: "14px", fontWeight: 600,
          textAlign: "left", cursor: "pointer", transition: "background 0.2s"
        }}>
          Log Out
        </button>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.label === "More") {
            const isActive = isDropupOpen || pathname === "/owner/settings" || pathname === "/profile";
            return (
              <button 
                key={item.label} 
                onClick={() => setIsDropupOpen(!isDropupOpen)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  background: "transparent", border: "none", color: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: "4px", flex: 1, padding: "8px 0", cursor: "pointer", fontFamily: "inherit"
                }}
              >
                <Icon size={20} />
                <span style={{ fontSize: "10px", fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              </button>
            );
          }

          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} aria-current={isActive ? "page" : undefined}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
