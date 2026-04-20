"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { getSupabaseClient } from "@/lib/supabase";
import { IconPaw, IconBell, IconHome, IconHelpCircle, IconUser, IconSpinner } from "@/components/icons";

const navShortcuts = [
  { icon: <IconHome size={18} />, label: "My Barangay Feed", href: "/home" },
  { icon: <IconPaw size={18} />, label: "My Pets", href: "/pets" },
  { icon: <IconBell size={18} />, label: "Lost & Found Reports", href: "/lost-pets" },
  { icon: <IconHelpCircle size={18} />, label: "Care Guide", href: "/care-guide" },
  { icon: <IconUser size={18} />, label: "Watchlist / Saved Posts", href: "/watchlist" },
];

interface SidebarPet {
  id: string;
  name: string;
  breed: string;
  species: string;
  photo_url: string | null;
  status: string;
}

interface LeftSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function LeftSidebar({ isOpen = false, onClose }: LeftSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");

  const [pets, setPets] = useState<SidebarPet[]>([]);
  const [loading, setLoading] = useState(true);
  const { userName, initials, barangay } = useSession();

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Load user's pets
        const { data: petsData } = await supabase
          .from("pets")
          .select("id, name, breed, species, photo_url, status")
          .eq("owner_user_id", user.id)
          .order("created_at", { ascending: false });

        if (petsData) setPets(petsData);
      } catch (err) {
        console.error("Sidebar load error:", err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  function getStatusColor(status: string) {
    if (status === "Approved") return "#22C55E";
    if (status === "Pending") return "#EAB308";
    return "#6B7280";
  }

  function getStatusLabel(status: string) {
    if (status === "Approved") return "Registered";
    if (status === "Pending") return "Pending Approval";
    return status;
  }

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? "open" : ""}`} 
        onClick={onClose} 
      />
      
      <aside className={`home-left-sidebar ${isOpen ? "open" : ""}`} aria-label="Navigation shortcuts">
        {/* Profile Heading Section */}
        <Link href="/owner" style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 10px 16px", marginBottom: 8, borderBottom: "1px solid var(--color-border)", textDecoration: "none" }} onClick={onClose}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", background: "#2A9D8F",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, flexShrink: 0
          }}>
            {initials || "U"}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {userName || "User"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
              {barangay || "Barangay"}
            </p>
          </div>
        </Link>

        {/* Navigation Shortcuts */}
        <nav>
          {navShortcuts.map((item, i) => {
            let isActive = false;
            
            if (item.label === "My Pets") {
              isActive = (pathname === "/pets" && !tab) || (pathname.startsWith("/pets") && !tab);
            } else if (item.href === "/home") {
              isActive = pathname === "/home";
            } else {
              isActive = pathname === item.href || pathname.startsWith(item.href);
            }

            return (
              <Link key={i} href={item.href} className={`sidebar-nav-link ${isActive ? "active" : ""}`} onClick={onClose}>
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-divider" />

        {/* Your Pets Section */}
        <p className="sidebar-section-title">Your Pets</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "16px 10px", color: "var(--color-text-muted)", fontSize: 13 }}>
              <IconSpinner size={16} /> Loading pets…
            </div>
          ) : pets.length === 0 ? (
            <div style={{ padding: "12px 10px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>No pets registered yet</p>
              <Link
                href="/owner/register-pet"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  marginTop: 8, padding: "6px 14px", borderRadius: 8,
                  background: "#1B4F8A", color: "#fff", fontSize: 12,
                  fontWeight: 700, textDecoration: "none"
                }}
              >
                <IconPaw size={14} /> Register a Pet
              </Link>
            </div>
          ) : (
            pets.map((pet) => (
              <Link key={pet.id} href={`/pets/${pet.id}`} className="sidebar-pet-card" onClick={onClose}>
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="sidebar-pet-avatar"
                  />
                ) : (
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#E8F0FE", color: "#1B4F8A",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, border: "2px solid var(--color-border)"
                  }}>
                    <IconPaw size={16} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>{pet.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)" }}>{pet.breed || pet.species}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span
                    className="sidebar-pet-status"
                    style={{ background: getStatusColor(pet.status) }}
                    title={getStatusLabel(pet.status)}
                  />
                </div>
              </Link>
            ))
          )}
        </div>

        <div style={{ flexGrow: 1, minHeight: 24 }} />

        {/* Footer info at the absolute bottom */}
        <div className="sidebar-divider" />
        <div style={{ padding: "12px 10px", fontSize: 11, color: "var(--color-text-light)", lineHeight: 1.6 }}>
          <span>Privacy · Terms · About · Cookies · Ad Choices</span>
          <br />
          <span> 2026 AlagaLahat Inc.</span>
        </div>
      </aside>
    </>
  );
}
