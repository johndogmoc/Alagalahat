"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import {
  IconHome, IconPaw, IconAlertTriangle, IconClipboard,
  IconUser, IconSettings, IconHelpCircle, IconChevronRight,
  IconMenu, IconX, IconBarangaySeal, IconSearch
} from "@/components/icons";

export type SidebarRole = "Owner" | "Staff" | "Admin";

interface SidebarItem {
  href: string;
  label: string;
  icon: typeof IconHome;
  roles: SidebarRole[];
}

const sidebarItems: SidebarItem[] = [
  { href: "/owner", label: "Dashboard", icon: IconHome, roles: ["Owner"] },
  { href: "/staff", label: "Dashboard", icon: IconHome, roles: ["Staff"] },
  { href: "/admin", label: "Dashboard", icon: IconHome, roles: ["Admin"] },
  { href: "/pets", label: "My Pets", icon: IconPaw, roles: ["Owner"] },
  { href: "/owner/register-pet", label: "Register Pet", icon: IconClipboard, roles: ["Owner"] },
  { href: "/lost-pets", label: "Lost Pets", icon: IconAlertTriangle, roles: ["Owner", "Staff", "Admin"] },
  { href: "/staff/pets", label: "Pet Queue", icon: IconClipboard, roles: ["Staff", "Admin"] },
  { href: "/search", label: "Search", icon: IconSearch, roles: ["Staff", "Admin"] },
  { href: "/admin/users", label: "User Management", icon: IconUser, roles: ["Admin"] },
  { href: "/admin/logs", label: "Reports & Logs", icon: IconClipboard, roles: ["Admin"] },
  { href: "/admin/settings", label: "System Settings", icon: IconSettings, roles: ["Admin"] },
];

interface SidebarProps {
  role: SidebarRole;
  userName?: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = sidebarItems.filter((item) => item.roles.includes(role));

  // Close mobile sidebar on nav
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body on mobile open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const sidebarContent = (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      paddingTop: 8
    }}>
      {/* Logo area */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: collapsed ? "12px 8px" : "12px 20px",
        justifyContent: collapsed ? "center" : "flex-start",
        marginBottom: 8
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "var(--radius-md)",
          background: "var(--color-primary)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0
        }}>
          <IconPaw size={18} />
        </div>
        {!collapsed && (
          <span style={{ fontWeight: 700, fontSize: "var(--font-size-base)", color: "var(--color-primary)" }}>
            AlagaLahat
          </span>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{
          margin: "0 16px 16px",
          padding: "8px 12px",
          borderRadius: "var(--radius-md)",
          background: "var(--color-background)",
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
          fontWeight: 500
        }}>
          {userName && <div style={{ fontWeight: 600, color: "var(--color-text)", marginBottom: 2 }}>{userName}</div>}
          Logged in as <strong style={{ color: "var(--color-primary)" }}>{role}</strong>
        </div>
      )}

      {/* Nav items */}
      <nav aria-label="Sidebar navigation" style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: collapsed ? "10px" : "10px 14px",
                borderRadius: "var(--radius-md)",
                fontWeight: isActive ? 600 : 500,
                fontSize: "var(--font-size-sm)",
                color: isActive ? "#fff" : "var(--color-text-muted)",
                background: isActive ? "var(--color-primary)" : "transparent",
                borderLeft: isActive ? "3px solid var(--color-secondary)" : "3px solid transparent",
                textDecoration: "none",
                transition: "all var(--transition-fast)",
                justifyContent: collapsed ? "center" : "flex-start",
                minHeight: 44
              }}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ borderTop: "1px solid var(--color-border)", padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        <Link
          href="/help"
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: collapsed ? "10px" : "10px 14px",
            borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)", textDecoration: "none",
            justifyContent: collapsed ? "center" : "flex-start", minHeight: 44
          }}
          title={collapsed ? "Help & Support" : undefined}
        >
          <IconHelpCircle size={18} />
          {!collapsed && <span>Help & Support</span>}
        </Link>
      </div>

      {/* Collapse button (desktop only) */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="sidebar-collapse-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 40,
          border: "none",
          borderTop: "1px solid var(--color-border)",
          background: "transparent",
          color: "var(--color-text-muted)",
          cursor: "pointer",
          transition: "all var(--transition-fast)"
        }}
      >
        <IconChevronRight
          size={16}
          style={{ transform: collapsed ? "rotate(0)" : "rotate(180deg)", transition: "transform var(--transition-fast)" }}
        />
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        type="button"
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        style={{
          position: "fixed", top: 12, left: 12, zIndex: 200,
          display: "none", alignItems: "center", justifyContent: "center",
          width: 44, height: 44, borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)", background: "var(--color-card)",
          boxShadow: "var(--shadow-md)", cursor: "pointer", color: "var(--color-text)"
        }}
      >
        <IconMenu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 998, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="sidebar-mobile-drawer"
        role="navigation"
        aria-label="Mobile sidebar"
        style={{
          position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 999,
          background: "var(--color-card)", boxShadow: "var(--shadow-xl)",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform var(--transition-base)",
          display: "none"
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", padding: 8 }}>
          <button onClick={() => setMobileOpen(false)} aria-label="Close sidebar" style={{
            width: 44, height: 44, border: "none", background: "transparent",
            color: "var(--color-text)", cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)"
          }}>
            <IconX size={20} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="sidebar-desktop"
        role="navigation"
        aria-label="Main sidebar"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: collapsed ? 72 : 260,
          minWidth: collapsed ? 72 : 260,
          background: "var(--color-card)",
          borderRight: "1px solid var(--color-border)",
          transition: "width var(--transition-base), min-width var(--transition-base)",
          overflowX: "hidden",
          overflowY: "auto",
          flexShrink: 0
        }}
      >
        {sidebarContent}
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-toggle { display: flex !important; }
          .sidebar-mobile-drawer { display: block !important; }
          .sidebar-collapse-btn { display: none !important; }
        }
        @media (min-width: 901px) {
          .sidebar-mobile-toggle { display: none !important; }
          .sidebar-mobile-drawer { display: none !important; }
        }
      `}</style>
    </>
  );
}
