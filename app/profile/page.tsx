"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import type { SidebarRole } from "@/components/Sidebar";

function roleFromMetadata(user: { user_metadata?: Record<string, unknown> } | null): SidebarRole {
  const r = user?.user_metadata?.role;
  if (r === "Staff" || r === "Admin" || r === "Owner") return r;
  return "Owner";
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [barangay, setBarangay] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [role, setRole] = useState<SidebarRole>("Owner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      if (!user) {
        router.replace("/login");
        return;
      }
      const meta = user.user_metadata ?? {};
      setUserName((meta.full_name as string | undefined) || user.email?.split("@")[0] || "");
      setEmail(user.email ?? "");
      setBarangay((meta.barangay as string | undefined) ?? null);
      setPhone((meta.contact_number as string | undefined) ?? (meta.phone as string | undefined) ?? null);
      setRole(roleFromMetadata(user));
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <DashboardShell role="Owner" userName="…">
        <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={role} userName={userName}>
      <div style={{ marginBottom: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 8px", letterSpacing: "-0.02em", color: "var(--color-primary-dark)" }}>My Profile</h1>
        <p style={{ margin: "0", color: "var(--color-text-muted)", fontSize: "var(--font-size-base)", maxWidth: 400 }}>
          Manage your personal details. To change your role or legal name, please contact an administrator.
        </p>
      </div>

      <div style={{
        maxWidth: 800,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 32
      }}>
        {/* Banner and Avatar Profile Card */}
        <div style={{
          background: "var(--color-card)",
          borderRadius: "24px",
          border: "1px solid var(--color-border)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.05)",
          overflow: "hidden",
          position: "relative"
        }}>
          {/* Banner */}
          <div style={{
            height: 140,
            background: "linear-gradient(135deg, var(--color-primary) 0%, #3B82F6 100%)",
            position: "relative"
          }}>
            <div style={{ position: "absolute", top: 16, right: 16 }}>
              <span style={{ 
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", padding: "6px 12px", 
                borderRadius: "100px", color: "#fff", fontSize: 13, fontWeight: 700 
              }}>
                {role} Account
              </span>
            </div>
          </div>
          
          {/* Avatar & Basic Info */}
          <div style={{ padding: "0 32px 32px", display: "flex", flexDirection: "column", alignItems: "center", marginTop: -50 }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "var(--color-background)",
              border: "4px solid var(--color-card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "var(--color-primary)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
              marginBottom: 16
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", color: "var(--color-text)", letterSpacing: "-0.01em" }}>{userName || "—"}</h2>
            <p style={{ margin: 0, fontSize: 15, color: "var(--color-text-muted)", fontWeight: 500 }}>{email}</p>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24
        }}>
          {/* Contact Details */}
          <div style={{
            background: "var(--color-card)",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            padding: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>Contact Information</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Phone Number</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-hover)", padding: "12px 16px", borderRadius: "12px" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>{phone || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div style={{
            background: "var(--color-card)",
            borderRadius: "20px",
            border: "1px solid var(--color-border)",
            padding: 24,
            boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
          }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>Location Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>Barangay</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-hover)", padding: "12px 16px", borderRadius: "12px" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>{barangay || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div style={{
          background: "var(--color-card)",
          borderRadius: "20px",
          border: "1px solid var(--color-border)",
          padding: 24,
          display: "flex",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
          <Button variant="outline" asChild href="/help" style={{ flex: 1, minWidth: 200, padding: "24px 16px", borderRadius: "12px", fontSize: 15, fontWeight: 700 }}>
            <span>Get Help & Support</span>
          </Button>
          <Button variant="destructive" onClick={() => void signOut()} style={{ flex: 1, minWidth: 200, padding: "24px 16px", borderRadius: "12px", fontSize: 15, fontWeight: 700 }}>
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
