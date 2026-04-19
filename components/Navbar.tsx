"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  IconPaw,
  IconBell,
  IconUser,
  IconMenu,
  IconX,
  IconHome,
  IconSearch,
  IconAlertTriangle,
  IconLogOut,
  IconSettings,
  IconChevronDown,
  IconHelpCircle
} from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabase";

const navLinks = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/pets", label: "My Pets", icon: IconPaw },
  { href: "/lost-pets", label: "Lost Pets", icon: IconAlertTriangle },
  { href: "/search", label: "Search", icon: IconSearch },
  { href: "/care-guide", label: "Care Guide", icon: IconHelpCircle },
  { href: "/watchlist", label: "Watchlist", icon: IconBell }
];

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string } | null } }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event: string, session: { user?: { email?: string } } | null) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Scroll detection
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // Focus trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'a, button, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length) focusable[0].focus();
  }, [mobileOpen]);

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
  }

  const initials = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <>
      <header
        role="banner"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#1c2536",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
          transition: "background var(--transition-fast), border-color var(--transition-fast)"
        }}
      >
        <div
          className="navbar-content"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "var(--navbar-height)",
            gap: 16,
            width: "100%",
            maxWidth: 1200,
            marginInline: "auto",
            padding: "0 40px"
          }}
        >
          {/* Left — Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontWeight: 700,
              fontSize: "var(--font-size-lg)",
              color: "#fff",
              textDecoration: "none",
              flexShrink: 0,
              minHeight: 44,
              minWidth: 44
            }}
            aria-label="AlagaLahat — Home"
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: "#3B82F6",
              color: "#fff"
            }}>
              <IconPaw size={20} />
            </span>
            <span style={{ letterSpacing: "-0.01em" }}>AlagaLahat</span>
          </Link>

          {/* Center — Desktop Nav */}
          <nav
            aria-label="Main navigation"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.7)",
                    transition: "all var(--transition-fast)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right — Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>

            {email ? (
              <>
                {/* User Avatar + Dropdown */}
                <div ref={dropdownRef} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="User menu"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "4px 8px 4px 4px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-card)",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      minHeight: 44,
                      minWidth: 44
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "var(--color-secondary)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "var(--font-size-sm)"
                      }}
                    >
                      {initials}
                    </span>
                    <IconChevronDown
                      size={14}
                      style={{
                        color: "var(--color-text-muted)",
                        transition: "transform var(--transition-fast)",
                        transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)"
                      }}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      role="menu"
                      aria-label="User actions"
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        right: 0,
                        width: 220,
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-lg)",
                        boxShadow: "var(--shadow-lg)",
                        padding: 4,
                        zIndex: 200,
                        animation: "scaleIn var(--transition-fast) ease"
                      }}
                    >
                      <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", marginBottom: 4 }}>
                        <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)", margin: 0 }}>
                          Account
                        </p>
                        <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", margin: 0, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {email}
                        </p>
                      </div>
                      {[
                        { href: "/owner", label: "Profile", icon: IconUser },
                        { href: "/settings", label: "Settings", icon: IconSettings }
                      ].map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              borderRadius: "var(--radius-md)",
                              color: "var(--color-text)",
                              fontSize: "var(--font-size-sm)",
                              textDecoration: "none",
                              transition: "background var(--transition-fast)",
                              minHeight: 44
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--color-background)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <ItemIcon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 4, paddingTop: 4 }}>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={signOut}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            width: "100%",
                            padding: "10px 12px",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            background: "transparent",
                            color: "var(--color-coral)",
                            fontSize: "var(--font-size-sm)",
                            cursor: "pointer",
                            transition: "background var(--transition-fast)",
                            textAlign: "left",
                            minHeight: 44
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--color-error-bg)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <IconLogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="desktop-nav" style={{ alignItems: "center", gap: 12 }}>
                <Button size="sm" asChild href="/login" style={{ fontWeight: 600, background: "transparent", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "0 16px" }}>
                  <span>Log in</span>
                </Button>
                <Button size="sm" asChild href="/register" style={{ fontWeight: 600, background: "#3B82F6", color: "#fff", borderRadius: "8px", padding: "0 16px", border: "none" }}>
                  <span>Sign up</span>
                </Button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              className="mobile-nav-toggle"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                border: "none",
                borderRadius: "var(--radius-md)",
                background: "transparent",
                color: "var(--color-text)",
                cursor: "pointer"
              }}
            >
              <IconMenu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)"
          }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Mobile navigation"
        aria-modal={mobileOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(320px, 85vw)",
          zIndex: 1000,
          background: "var(--color-card)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--transition-base)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <span style={{ fontWeight: 700, fontSize: "var(--font-size-lg)", color: "var(--color-primary)" }}>
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              border: "none",
              borderRadius: "var(--radius-md)",
              background: "transparent",
              color: "var(--color-text)",
              cursor: "pointer"
            }}
          >
            <IconX size={24} />
          </button>
        </div>

        <nav aria-label="Mobile navigation" style={{ flex: 1, padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
          {navLinks.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text)",
                  fontSize: "var(--font-size-base)",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "background var(--transition-fast)",
                  minHeight: 48
                }}
              >
                <LinkIcon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--color-border)" }}>
          <div>
            {email ? (
              <Button variant="outline" onClick={signOut} style={{ width: "100%", justifyContent: "center" }}>
                <IconLogOut size={16} />
                <span>Sign out</span>
              </Button>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Button variant="primary" asChild href="/register" style={{ width: "100%", justifyContent: "center" }}>
                  <span>Sign Up</span>
                </Button>
                <Button variant="outline" asChild href="/login" style={{ width: "100%", justifyContent: "center" }}>
                  <span>Log In</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 769px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav-toggle { display: none !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
          .navbar-content { padding: 0 20px !important; }
        }
      `}</style>
    </>
  );
}
