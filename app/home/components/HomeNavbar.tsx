"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconPaw, IconSearch, IconHome, IconBell, IconAlertTriangle } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/AccessibilityControls";
import { useSession } from "@/components/SessionProvider";

    import { useNotifications } from "@/lib/hooks/useNotifications";

export function HomeNavbar() {
  const { userName, initials } = useSession();
  const { notifications, unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="home-navbar">
      <div className="home-navbar-inner">
        {/* Left — Logo */}
        <Link href="/home" className="home-navbar-logo">
          <span className="home-navbar-logo-icon">
            <IconPaw size={20} />
          </span>
          <span>AlagaLahat</span>
        </Link>

        {/* Center — Search */}
        <div className="home-search-wrapper">
          <span className="home-search-icon">
            <IconSearch size={16} />
          </span>
          <input
            id="home-search"
            name="home-search"
            type="text"
            className="home-search-input"
            placeholder="Search pets, people, or barangays…"
            aria-label="Search"
          />
        </div>

        {/* Right — Actions */}
        <div className="home-nav-actions">
          <Link href="/home" className="home-nav-btn active" aria-label="Home" title="Home">
            <IconHome size={20} />
          </Link>

          <Link href="/lost-pets" className="home-nav-btn" aria-label="Lost Pets" title="Lost Pets">
            <IconAlertTriangle size={20} />
          </Link>

          <div style={{ position: "relative" }}>
            <button 
              type="button" 
              className={`home-nav-btn ${showNotifs ? "active" : ""}`} 
              aria-label="Notifications" 
              title="Notifications"
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowProfileMenu(false);
              }}
            >
              <IconBell size={20} />
              {unreadCount > 0 && (
                <span style={{ 
                  position: "absolute", top: 4, right: 4, background: "#E76F51", color: "#fff", 
                  fontSize: 10, fontWeight: 800, minWidth: 16, height: 16, borderRadius: 8, 
                  display: "flex", alignItems: "center", justifyContent: "center" 
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown UI */}
            {showNotifs && (
              <div style={{
                position: "absolute", top: "110%", right: 0, width: 340,
                background: "var(--color-card)", borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--color-border)",
                zIndex: 200, padding: 16, maxHeight: 400, overflowY: "auto"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em" }}>Notifications</h3>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-text-muted)" }}>
                    <IconBell size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>All caught up!</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12 }}>You have no new notifications.</p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {notifications.map((notif) => (
                      <Link 
                        key={notif.id} 
                        href={notif.link || "#"} 
                        style={{
                           display: "block", background: notif.read ? "transparent" : "rgba(38,70,83,0.05)",
                           padding: 12, borderRadius: 8, textDecoration: "none", color: "var(--color-text)",
                           borderLeft: notif.read ? "3px solid transparent" : "3px solid #264653"
                        }}
                      >
                         <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: notif.read ? 500 : 700 }}>{notif.message}</p>
                         <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{new Date(notif.created_at).toLocaleString()}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link href="/messages" className="home-nav-btn" aria-label="Messages" title="Messages">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle variant="dark" />

          {/* Profile Dropdown */}
          <div style={{ position: "relative" }}>
            <button 
              type="button" 
              className="home-nav-avatar" 
              style={{ padding: 0, cursor: "pointer", outline: "none" }}
              aria-label={`Profile: ${userName || "User"}`} 
              title={userName || undefined}
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifs(false);
              }}
            >
              {initials || "U"}
            </button>

            {/* Profile Dropdown UI */}
            {showProfileMenu && (
              <div style={{
                position: "absolute", top: "110%", right: 0, width: 260,
                background: "var(--color-card)", borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)", border: "1px solid var(--color-border)",
                zIndex: 200, padding: 8
              }}>
                <div style={{ padding: "12px", borderBottom: "1px solid var(--color-border)", marginBottom: 8 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>{userName}</p>
                </div>
                
                <Link 
                  href="/owner" 
                  onClick={() => setShowProfileMenu(false)}
                  style={{ display: "block", padding: "10px 12px", borderRadius: 8, color: "var(--color-text)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Dashboard / My Profile
                </Link>
                
                <Link 
                  href="/owner/settings" 
                  onClick={() => setShowProfileMenu(false)}
                  style={{ display: "block", padding: "10px 12px", borderRadius: 8, color: "var(--color-text)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Settings & Privacy
                </Link>
                
                <div style={{ height: 1, backgroundColor: "var(--color-border)", margin: "8px 0" }}></div>
                
                <button 
                  onClick={handleLogout}
                  style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 8, color: "var(--color-text)", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
