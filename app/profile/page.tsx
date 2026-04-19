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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Profile</h1>
        <p style={{ margin: "0 0 0", color: "var(--color-text-muted)", fontSize: "var(--font-size-base)" }}>
          Account details from your registration. To change role or legal name, contact an administrator.
        </p>
      </div>

      {/* Main Profile Card */}
      <div
        className="card-base card-hover"
        style={{
          maxWidth: 540,
          display: "grid",
          gap: 0,
          overflow: "visible"
        }}
      >
        {/* Card Header with Gradient */}
        <div style={{
          background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
          color: "#fff",
          padding: 32,
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0"
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: "50%", 
            background: "rgba(255, 255, 255, 0.2)",
            border: "2px solid rgba(255, 255, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 16
          }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#fff" }}>{userName || "—"}</h2>
          <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-sm)", opacity: 0.9 }}>{role}</p>
        </div>

        {/* Card Content */}
        <div style={{ padding: 32, display: "grid", gap: 24 }}>
          {/* Email Field */}
          <div>
            <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
            <p style={{ margin: "8px 0 0", fontWeight: 500, fontSize: "var(--font-size-base)", color: "var(--color-text)" }}>{email}</p>
          </div>

          {/* Barangay Field */}
          <div>
            <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Barangay</label>
            <p style={{ margin: "8px 0 0", fontWeight: 500, fontSize: "var(--font-size-base)", color: "var(--color-text)" }}>{barangay || "—"}</p>
          </div>

          {/* Phone Field */}
          <div>
            <label style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Phone Number</label>
            <p style={{ margin: "8px 0 0", fontWeight: 500, fontSize: "var(--font-size-base)", color: "var(--color-text)" }}>{phone || "—"}</p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--color-border)", margin: "8px 0" }} />

          {/* Action Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
            <Button variant="outline" asChild href="/help" style={{ width: "100%", justifyContent: "center" }}>
              <span>Get Help & Support</span>
            </Button>
            <Button variant="destructive" type="button" onClick={() => void signOut()} style={{ width: "100%", justifyContent: "center" }}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
