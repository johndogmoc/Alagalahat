"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

import { IconHome, IconPaw, IconAlertTriangle, IconUser, IconClipboard, IconMenu, IconLogOut } from "@/components/icons";
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
  { href: "/lost-pets", label: "Lost", icon: IconAlertTriangle }
] as const;

const adminItems = [
  { href: "/admin", label: "Home", icon: IconHome },
  { href: "/staff/pets", label: "Queue", icon: IconClipboard },
  { href: "/profile", label: "Profile", icon: IconUser }
] as const;

export function MobileBottomNav({ role, userName = "User" }: { role: SidebarRole; userName?: string }) {
  const pathname = usePathname();
  const [isDropupOpen, setIsDropupOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  
  const dropupRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const items = role === "Admin" ? adminItems : role === "Staff" ? staffItems : ownerItems;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isDropupOpen) return;

      // Close on Escape
      if (e.key === "Escape") {
        setIsDropupOpen(false);
        menuBtnRef.current?.focus();
        return;
      }

      // Basic Focus Trap inside DropUp
      if (e.key === "Tab" && dropupRef.current) {
        const focusableElements = dropupRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node) && !menuBtnRef.current?.contains(e.target as Node)) {
        setIsDropupOpen(false);
      }
    }

    if (isDropupOpen) {
      // Body Scroll Lock
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      
      // Focus first element on open
      setTimeout(() => {
        const first = dropupRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])');
        first?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
      setConfirmLogout(false); // Reset logout confirmation state when closed
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropupOpen]);

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <>
      {/* DropUp Overlay */}
      <div 
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "var(--backdrop-blur)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          zIndex: "calc(var(--z-dropdown) - 1)",
          opacity: isDropupOpen ? 1 : 0,
          pointerEvents: isDropupOpen ? "auto" : "none",
          transition: "opacity var(--transition-base)"
        }} 
        onClick={() => setIsDropupOpen(false)} 
        aria-hidden="true"
      />

      {/* DropUp Menu */}
      <div 
        ref={dropupRef} 
        role="dialog"
        aria-modal="true"
        aria-label="User Menu"
        style={{
          position: "fixed",
          bottom: "calc(env(safe-area-inset-bottom) + 84px)", // 84px allows spacing above the nav bar safely
          left: "var(--space-4)",
          right: "var(--space-4)",
          maxWidth: "360px",
          margin: "0 auto",
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-3) 0",
          boxShadow: "var(--shadow-xl)",
          zIndex: "var(--z-dropdown)",
          opacity: isDropupOpen ? 1 : 0,
          transform: isDropupOpen ? "translateY(0)" : "translateY(16px) scale(0.98)",
          pointerEvents: isDropupOpen ? "auto" : "none",
          transition: "all var(--transition-base)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "var(--space-2) var(--space-5) var(--space-4)", borderBottom: "1px solid var(--color-border)", marginBottom: "var(--space-2)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 800, color: "var(--color-text)" }}>{userName}</p>
          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{role}</p>
        </div>
        
        {confirmLogout ? (
          <div style={{ padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>
              Are you sure you want to log out?
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)" }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: "var(--space-2)" }}
                onClick={() => setConfirmLogout(false)}
              >
                No
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, padding: "var(--space-2)", background: "var(--color-coral)", borderColor: "var(--color-coral)" }}
                onClick={handleLogout}
              >
                Yes, log out
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link href="/profile" prefetch={false} onClick={() => setIsDropupOpen(false)} style={{
              padding: "var(--space-3) var(--space-5)", textDecoration: "none", color: "var(--color-text)", fontSize: "var(--font-size-sm)", fontWeight: 600,
              display: "flex", alignItems: "center", transition: "background var(--transition-fast)"
            }}>
              Dashboard / My Profile
            </Link>
            <Link href="/owner/settings" prefetch={false} onClick={() => setIsDropupOpen(false)} style={{
              padding: "var(--space-3) var(--space-5)", textDecoration: "none", color: "var(--color-text)", fontSize: "var(--font-size-sm)", fontWeight: 600,
              display: "flex", alignItems: "center", transition: "background var(--transition-fast)"
            }}>
              Settings & Privacy
            </Link>
            
            <div style={{ height: "1px", background: "var(--color-border)", margin: "var(--space-2) 0" }} />
            
            <button onClick={() => setConfirmLogout(true)} style={{
              padding: "var(--space-3) var(--space-5)", border: "none", background: "transparent", color: "var(--color-coral)", fontSize: "var(--font-size-sm)", fontWeight: 700,
              display: "flex", alignItems: "center", gap: "var(--space-2)", cursor: "pointer", transition: "background var(--transition-fast)"
            }}>
              <IconLogOut size={16} /> Log Out
            </button>
          </>
        )}
      </div>

      {/* Actual Mobile Nav */}
      <nav 
        className="mobile-bottom-nav" 
        aria-label="Mobile navigation"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)", // Modern safe area support
          zIndex: "var(--z-fixed, 20)", // Standardize above regular content but below modals
        }}
      >
        {items.map((item) => {
          const Icon = item.icon;
          if (item.label === "More") {
            const isActive = isDropupOpen || pathname === "/owner/settings" || pathname === "/profile";
            return (
              <button 
                key={item.label} 
                ref={menuBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropupOpen(!isDropupOpen);
                }}
                aria-current={isActive ? "page" : undefined}
                aria-expanded={isDropupOpen}
                aria-haspopup="dialog"
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
            <Link key={item.href} href={item.href} prefetch={false} aria-current={isActive ? "page" : undefined}>
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
