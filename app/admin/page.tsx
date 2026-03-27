"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconUser, IconPaw, IconClipboard, IconAlertTriangle,
  IconSyringe, IconShield, IconCheck, IconX, IconChevronRight
} from "@/components/icons";

interface PendingItem {
  id: string;
  type: "pet" | "lost_report" | "staff_account";
  title: string;
  subtitle: string;
  created_at: string;
}

interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  status: string;
}

export default function AdminDashboardPage() {
  const [userName, setUserName] = useState("Admin");
  const [stats, setStats] = useState({
    totalUsers: 0, totalPets: 0, pendingApprovals: 0,
    activeLost: 0, vaxMonth: 0, activeStaff: 0
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock chart data (real charts would use a lib like recharts)
  const monthlyRegistrations = [
    { month: "Oct", count: 12 }, { month: "Nov", count: 18 },
    { month: "Dec", count: 8 }, { month: "Jan", count: 22 },
    { month: "Feb", count: 15 }, { month: "Mar", count: 28 }
  ];
  const speciesData = [
    { label: "Dogs", count: 65, color: "var(--color-primary)" },
    { label: "Cats", count: 28, color: "var(--color-secondary)" },
    { label: "Other", count: 7, color: "var(--color-amber)" }
  ];
  const maxMonthly = Math.max(...monthlyRegistrations.map((m) => m.count));

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin");

      // Fetch counts
      const [pets, pendingPets, lostActive, pendingLost] = await Promise.all([
        supabase.from("pets").select("count", { count: "exact", head: true }),
        supabase.from("pets").select("count", { count: "exact", head: true }).eq("status", "Pending"),
        supabase.from("lost_pet_reports").select("count", { count: "exact", head: true }).neq("status", "Found"),
        supabase.from("lost_pet_reports").select("count", { count: "exact", head: true }).eq("status", "Pending")
      ]);

      if (mounted) {
        setStats({
          totalUsers: 0, // Would come from admin API
          totalPets: pets.count ?? 0,
          pendingApprovals: (pendingPets.count ?? 0) + (pendingLost.count ?? 0),
          activeLost: lostActive.count ?? 0,
          vaxMonth: 0,
          activeStaff: 0
        });
      }

      // Pending items
      const { data: pendingPetData } = await supabase
        .from("pets")
        .select("id, name, owner_name, created_at")
        .eq("status", "Pending")
        .order("created_at", { ascending: true })
        .limit(5);

      const { data: pendingLostData } = await supabase
        .from("lost_pet_reports")
        .select("id, pet_name, reporter_name, created_at")
        .eq("status", "Pending")
        .order("created_at", { ascending: true })
        .limit(5);

      if (mounted) {
        const items: PendingItem[] = [
          ...((pendingPetData ?? []) as { id: string; name: string; owner_name: string; created_at: string }[]).map((p) => ({
            id: p.id, type: "pet" as const, title: `Pet: ${p.name}`,
            subtitle: `Submitted by ${p.owner_name}`, created_at: p.created_at
          })),
          ...((pendingLostData ?? []) as { id: string; pet_name: string; reporter_name: string; created_at: string }[]).map((r) => ({
            id: r.id, type: "lost_report" as const, title: `Lost: ${r.pet_name}`,
            subtitle: `Reported by ${r.reporter_name}`, created_at: r.created_at
          }))
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setPendingItems(items);
      }

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { label: "Total Registered Users", value: stats.totalUsers, color: "var(--color-primary)", icon: IconUser },
    { label: "Total Registered Pets", value: stats.totalPets, color: "var(--color-success)", icon: IconPaw },
    { label: "Pending Approvals", value: stats.pendingApprovals, color: "var(--color-amber)", icon: IconClipboard },
    { label: "Active Lost Reports", value: stats.activeLost, color: "var(--color-coral)", icon: IconAlertTriangle },
    { label: "Vaccinations This Month", value: stats.vaxMonth, color: "var(--color-secondary)", icon: IconSyringe },
    { label: "Staff Accounts Active", value: stats.activeStaff, color: "var(--color-primary)", icon: IconShield }
  ];

  return (
    <DashboardShell role="Admin" userName={userName}>
      {/* Welcome */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
          Admin Dashboard 🛡️
        </h1>
        <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          System-wide overview — {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats: 6 cards, 3 per row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => {
          const StatIcon = card.icon;
          return (
            <div key={card.label} role="region" aria-label={`${card.label}: ${card.value}`} style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)",
              display: "flex", alignItems: "flex-start", gap: 14
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: card.color + "18", color: card.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <StatIcon size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500 }}>{card.label}</p>
                <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "var(--color-text)", lineHeight: 1.2, marginTop: 2 }}>{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
        {/* Bar Chart: Monthly Registrations */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)"
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: 0, marginBottom: 20 }}>
            Pet Registrations (Last 6 Months)
          </h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }} role="img" aria-label="Bar chart of pet registrations per month">
            {monthlyRegistrations.map((m) => (
              <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text)" }}>{m.count}</span>
                <div style={{
                  width: "100%", maxWidth: 40,
                  height: `${(m.count / maxMonthly) * 120}px`,
                  background: "var(--color-primary)",
                  borderRadius: "var(--radius-sm) var(--radius-sm) 0 0",
                  transition: "height var(--transition-base)",
                  minHeight: 4
                }} />
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{m.month}</span>
              </div>
            ))}
          </div>
          {/* Data table fallback for screen readers */}
          <table className="sr-only" aria-label="Pet registrations data">
            <thead><tr><th>Month</th><th>Count</th></tr></thead>
            <tbody>
              {monthlyRegistrations.map((m) => (
                <tr key={m.month}><td>{m.month}</td><td>{m.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Donut Chart: Species Breakdown */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)"
        }}>
          <h3 style={{ fontSize: "var(--font-size-base)", fontWeight: 700, margin: 0, marginBottom: 20 }}>
            Pet Species Breakdown
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }} role="img" aria-label="Donut chart of pet species">
            {/* Simple CSS donut */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" width="120" height="120" aria-hidden="true">
                {(() => {
                  const total = speciesData.reduce((a, b) => a + b.count, 0);
                  let offset = 0;
                  return speciesData.map((s) => {
                    const pct = (s.count / total) * 100;
                    const dashArray = `${pct} ${100 - pct}`;
                    const currentOffset = offset;
                    offset += pct;
                    return (
                      <circle
                        key={s.label}
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="5"
                        strokeDasharray={dashArray}
                        strokeDashoffset={-currentOffset}
                        style={{ transition: "all var(--transition-base)" }}
                      />
                    );
                  });
                })()}
              </svg>
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text)"
              }}>
                {speciesData.reduce((a, b) => a + b.count, 0)} total
              </div>
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {speciesData.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                    {s.label}: <strong>{s.count}</strong> ({Math.round((s.count / speciesData.reduce((a, b) => a + b.count, 0)) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Data table fallback */}
          <table className="sr-only" aria-label="Species breakdown data">
            <thead><tr><th>Species</th><th>Count</th><th>Percentage</th></tr></thead>
            <tbody>
              {speciesData.map((s) => (
                <tr key={s.label}><td>{s.label}</td><td>{s.count}</td><td>{Math.round((s.count / speciesData.reduce((a, b) => a + b.count, 0)) * 100)}%</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts responsive override */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Quick Approvals */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0, marginBottom: 16 }}>Quick Approvals</h2>
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {pendingItems.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              <IconCheck size={32} style={{ color: "var(--color-success)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>No pending approvals. Everything is up to date!</p>
            </div>
          ) : (
            <div>
              {pendingItems.map((item, i) => (
                <div key={`${item.type}-${item.id}`} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", gap: 12,
                  borderBottom: i < pendingItems.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--radius-md)",
                      background: item.type === "pet" ? "var(--color-primary)" + "18" : "var(--color-coral)" + "18",
                      color: item.type === "pet" ? "var(--color-primary)" : "var(--color-coral)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                    }}>
                      {item.type === "pet" ? <IconPaw size={16} /> : <IconAlertTriangle size={16} />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{item.subtitle}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <Button variant="primary" size="sm" style={{ gap: 4 }}>
                      <IconCheck size={14} /> Approve
                    </Button>
                    <Button variant="outline" size="sm" style={{ gap: 4, color: "var(--color-coral)", borderColor: "var(--color-coral)" }}>
                      <IconX size={14} /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* User Management Shortcut */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>Recent User Signups</h2>
          <Link href="/admin/users" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>
            Manage Users <IconChevronRight size={14} />
          </Link>
        </div>
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {recentUsers.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              <IconUser size={32} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>User signup data will appear here as new users register.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-background)" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Name</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Email</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Role</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Status</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)", fontWeight: 700,
                          background: "var(--color-primary)" + "18", color: "var(--color-primary)"
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)", fontWeight: 700,
                          background: u.status === "Active" ? "var(--color-success)" + "18" : "var(--color-amber)" + "18",
                          color: u.status === "Active" ? "var(--color-success)" : "var(--color-amber)"
                        }}>{u.status}</span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>
                        {new Date(u.created_at).toLocaleDateString("en-PH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
