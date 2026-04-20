"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

function isAbortError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const name = "name" in error ? String(error.name) : "";
  const message = "message" in error ? String(error.message) : "";

  return name === "AbortError" || message.toLowerCase().includes("aborted");
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0, totalPets: 0, pendingApprovals: 0,
    activeLost: 0, vaxMonth: 0, activeStaff: 0
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleAction(id: string, type: "pet" | "lost_report" | "staff_account", action: "approve" | "reject") {
    const supabase = getSupabaseClient();
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
    try {
      if (type === "pet") {
        await supabase.from("pets").update({ status: action === "approve" ? "Approved" : "Rejected" }).eq("id", id);
      } else if (type === "lost_report") {
        await supabase.from("lost_pet_reports").update({ status: action === "approve" ? "Active" : "Resolved" }).eq("id", id);
      }
      setStats((prev) => ({
        ...prev,
        pendingApprovals: Math.max(0, prev.pendingApprovals - 1)
      }));
    } catch (err) {
      console.error(err);
    }
  }

  const [monthlyRegistrations, setMonthlyRegistrations] = useState<{month: string, count: number}[]>([]);
  const [speciesData, setSpeciesData] = useState<{label: string, count: number, color: string}[]>([]);
  
  const maxMonthly = Math.max(...monthlyRegistrations.map((m) => m.count), 1);
  const totalSpecies = speciesData.reduce((a, b) => a + b.count, 0) || 1;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const user = userData.user;
        if (!user || !mounted) return;

        const [pets, pendingPets, lostActive, pendingLost, usersCount, staffCount, petRaw, vaxRaw] = await Promise.all([
          supabase.from("pets").select("count", { count: "exact", head: true }).abortSignal(controller.signal),
          supabase.from("pets").select("count", { count: "exact", head: true }).eq("status", "Pending").abortSignal(controller.signal),
          supabase.from("lost_pet_reports").select("count", { count: "exact", head: true }).neq("status", "Found").abortSignal(controller.signal),
          supabase.from("lost_pet_reports").select("count", { count: "exact", head: true }).eq("status", "Pending").abortSignal(controller.signal),
          supabase.from("profiles").select("count", { count: "exact", head: true }).abortSignal(controller.signal),
          supabase.from("profiles").select("count", { count: "exact", head: true }).eq("role", "Staff").abortSignal(controller.signal),
          supabase.from("pets").select("species, created_at").abortSignal(controller.signal),
          supabase.from("vaccinations").select("count", { count: "exact", head: true }).gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()).abortSignal(controller.signal)
        ]);

        if (mounted) {
          setStats({
            totalUsers: usersCount.count ?? 0,
            totalPets: pets.count ?? 0,
            pendingApprovals: (pendingPets.count ?? 0) + (pendingLost.count ?? 0),
            activeLost: lostActive.count ?? 0,
            vaxMonth: vaxRaw.count ?? 0,
            activeStaff: staffCount.count ?? 0
          });

          const speciesCounts = { Dogs: 0, Cats: 0, Other: 0 };
          const now = new Date();
          const months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            return { month: d.toLocaleString("en-US", { month: "short" }), monthNum: d.getMonth(), year: d.getFullYear(), count: 0 };
          });

          if (petRaw.data) {
            petRaw.data.forEach((p: { species?: string; created_at?: string }) => {
              const sp = (p.species || "").toLowerCase();
              if (sp.includes("dog")) speciesCounts.Dogs++;
              else if (sp.includes("cat")) speciesCounts.Cats++;
              else speciesCounts.Other++;

              if (p.created_at) {
                const d = new Date(p.created_at);
                const match = months.find((m) => m.monthNum === d.getMonth() && m.year === d.getFullYear());
                if (match) match.count++;
              }
            });
          }

          setSpeciesData([
            { label: "Dogs", count: speciesCounts.Dogs, color: "#1B4F8A" },
            { label: "Cats", count: speciesCounts.Cats, color: "#2A9D8F" },
            { label: "Other", count: speciesCounts.Other, color: "#E9C46A" }
          ]);
          setMonthlyRegistrations(months.map((m) => ({ month: m.month, count: m.count })));
        }

        const [pendingPetResult, pendingLostResult, recentUserResult] = await Promise.all([
          supabase
            .from("pets")
            .select("id, name, owner_name, created_at")
            .eq("status", "Pending")
            .order("created_at", { ascending: true })
            .limit(5)
            .abortSignal(controller.signal),
          supabase
            .from("lost_pet_reports")
            .select(`
              id, 
              created_at,
              pets ( name ),
              profiles ( full_name )
            `)
            .eq("status", "Pending")
            .order("created_at", { ascending: true })
            .limit(5)
            .abortSignal(controller.signal),
          supabase
            .from("profiles")
            .select("id, email, full_name, role, created_at, is_active")
            .order("created_at", { ascending: false })
            .limit(5)
            .abortSignal(controller.signal)
        ]);

        if (!mounted) return;

        const pendingPetData = pendingPetResult.data;
        const pendingLostData = pendingLostResult.data;
        const recentUserData = recentUserResult.data;

        const items: PendingItem[] = [
          ...((pendingPetData ?? []) as { id: string; name: string; owner_name: string; created_at: string }[]).map((p) => ({
            id: p.id, type: "pet" as const, title: `Pet: ${p.name}`,
            subtitle: `Submitted by ${p.owner_name}`, created_at: p.created_at
          })),
          ...((pendingLostData as { id: string; created_at: string; pets?: { name?: string }; profiles?: { full_name?: string } }[] | null | undefined) ?? []).map((r) => ({
            id: r.id, type: "lost_report" as const, title: `Lost: ${r.pets?.name || "Unknown Pet"}`,
            subtitle: `Reported by ${r.profiles?.full_name || "Unknown"}`, created_at: r.created_at
          }))
        ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        setPendingItems(items);
        setRecentUsers(((recentUserData ?? []) as { id: string; email: string; full_name: string; role: string; created_at: string; is_active: boolean }[]).map((u) => ({
          ...u,
          status: u.is_active ? "Active" : "Inactive"
        })));
      } catch (error) {
        if (isAbortError(error)) return;
        console.error("Failed to load super admin dashboard data.", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const statCards = [
    { label: "Total Registered Users", value: stats.totalUsers, color: "#1B4F8A", bgColor: "#EFF6FF", icon: IconUser },
    { label: "Total Registered Pets", value: stats.totalPets, color: "#059669", bgColor: "#ECFDF5", icon: IconPaw },
    { label: "Pending Approvals", value: stats.pendingApprovals, color: "#D97706", bgColor: "#FFFBEB", icon: IconClipboard },
    { label: "Active Lost Reports", value: stats.activeLost, color: "#DC2626", bgColor: "#FEF2F2", icon: IconAlertTriangle },
    { label: "Vaccinations This Month", value: stats.vaxMonth, color: "#2A9D8F", bgColor: "#F0FDFA", icon: IconSyringe },
  ];

  return (
    <>
      <div className="page-fade-in">
        {/* Premium Header Section with Gradient */}
        <div style={{
          marginBottom: 40,
          background: "linear-gradient(135deg, var(--color-primary) 0%, #003FA1 100%)",
          padding: "40px 32px",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0, 82, 204, 0.15)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Super Admin Dashboard
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Premium Stats Grid: 5 cards with hover effects */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 32 }}>
          {statCards.map((card) => {
            const StatIcon = card.icon;
            return (
              <div key={card.label} role="region" aria-label={`${card.label}: ${card.value}`} style={{
                background: "var(--color-card)", border: "1.5px solid var(--color-border)",
                borderRadius: 16, padding: "28px 20px", boxShadow: "var(--shadow-sm)",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
                transition: "all var(--transition-base)",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = card.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
              >
                <div style={{ position: "absolute", top: -10, right: -10, width: 100, height: 100, background: card.bgColor, borderRadius: "50%", opacity: 0.4 }} aria-hidden="true" />
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: card.bgColor, color: card.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  position: "relative", zIndex: 1, boxShadow: `0 2px 8px ${card.color}20`
                }}>
                  <StatIcon size={26} />
                </div>
                <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{card.label}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 800, color: card.color, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Premium Staff Accounts Card */}
        <div style={{
          marginBottom: 40
        }}>
          <div role="region" aria-label={`Staff Accounts Active: ${stats.activeStaff}`} style={{
            background: "var(--color-card)", border: "1.5px solid #DDD6FE",
            borderRadius: 16, padding: "32px 28px", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.08)",
            display: "flex", alignItems: "center", gap: 20, maxWidth: 380,
            transition: "all var(--transition-base)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.12)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(124, 58, 237, 0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          >
            <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "#EDE9FE", borderRadius: "50%", opacity: 0.3 }} aria-hidden="true" />
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: "#EDE9FE", color: "#7C3AED",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              position: "relative", zIndex: 1, boxShadow: "0 2px 8px rgba(124, 58, 237, 0.15)"
            }}>
              <IconShield size={28} />
            </div>
            <div style={{ position: "relative", zIndex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Staff Accounts Active</p>
              <p style={{ margin: "8px 0 0", fontSize: 36, fontWeight: 800, color: "#7C3AED", lineHeight: 1.2, letterSpacing: "-0.02em" }}>{stats.activeStaff}</p>
            </div>
          </div>
        </div>

        {/* Premium Charts Section */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, marginBottom: 40 }}>
          {/* Bar Chart: Monthly Registrations */}
          <div style={{
            background: "var(--color-card)", border: "1.5px solid var(--color-border)",
            borderRadius: 18, padding: "32px 32px", boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition-base)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 28, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 5, height: 24, borderRadius: 3, background: "linear-gradient(180deg, #3B82F6 0%, #1B4F8A 100%)" }} />
              Pet Registrations (Last 6 Months)
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 180, padding: "0 8px" }} role="img" aria-label="Bar chart of pet registrations per month">
              {monthlyRegistrations.map((m) => (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)" }}>{m.count}</span>
                  <div style={{
                    width: "100%", maxWidth: 44,
                    height: `${(m.count / maxMonthly) * 140}px`,
                    background: "linear-gradient(180deg, #3B82F6 0%, #1B4F8A 100%)",
                    borderRadius: "8px 8px 4px 4px",
                    transition: "height 600ms cubic-bezier(0.4, 0, 0.2, 1)",
                    minHeight: 8,
                    boxShadow: "0 2px 8px rgba(59,130,246,0.15)"
                  }} />
                  <span style={{ fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>{m.month}</span>
                </div>
              ))}
            </div>
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
            background: "var(--color-card)", border: "1.5px solid var(--color-border)",
            borderRadius: 18, padding: "32px 32px", boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition-base)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 28, color: "var(--color-text)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ display: "inline-block", width: 5, height: 24, borderRadius: 3, background: "linear-gradient(180deg, #2A9D8F 0%, #00A67E 100%)" }} />
              Pet Species Breakdown
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }} role="img" aria-label="Donut chart of pet species">
              <div style={{ position: "relative", width: 140, height: 140, flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" width="140" height="140" aria-hidden="true">
                  {(() => {
                    let offset = 0;
                    return speciesData.map((s) => {
                      const pct = (s.count / totalSpecies) * 100;
                      const dashArray = `${pct} ${100 - pct}`;
                      const currentOffset = offset;
                      offset += pct;
                      return (
                        <circle
                          key={s.label}
                          cx="18" cy="18" r="14"
                          fill="none"
                          stroke={s.color}
                          strokeWidth="4.5"
                          strokeDasharray={dashArray}
                          strokeDashoffset={-currentOffset}
                          strokeLinecap="round"
                          style={{ transition: "all 600ms cubic-bezier(0.4, 0, 0.2, 1)" }}
                        />
                      );
                    });
                  })()}
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center"
                }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-text)", lineHeight: 1 }}>{totalSpecies}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500, marginTop: 2 }}>total</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {speciesData.map((s) => (
                  <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: "var(--color-text)", fontWeight: 500 }}>
                      {s.label}: <strong>{s.count}</strong> <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>({Math.round((s.count / totalSpecies) * 100)}%)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <table className="sr-only" aria-label="Species breakdown data">
              <thead><tr><th>Species</th><th>Count</th><th>Percentage</th></tr></thead>
              <tbody>
                {speciesData.map((s) => (
                  <tr key={s.label}><td>{s.label}</td><td>{s.count}</td><td>{Math.round((s.count / totalSpecies) * 100)}%</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts responsive */}
        <style>{`
          @media (max-width: 900px) {
            div[style*="grid-template-columns: 1.2fr 1fr"] { grid-template-columns: 1fr !important; }
            div[style*="grid-template-columns: repeat(5"] { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 600px) {
            div[style*="grid-template-columns: repeat(2, 1fr)"] { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* Quick Approvals Premium Section */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, marginBottom: 20, color: "var(--color-text)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 5, height: 28, borderRadius: 3, background: "linear-gradient(180deg, #FF6B6B 0%, #E84C3D 100%)" }} />
            Quick Approvals
          </h2>
          <div style={{
            background: "var(--color-card)", border: "1.5px solid var(--color-border)",
            borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition-base)"
          }}>
            {pendingItems.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <IconCheck size={28} />
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>No pending approvals</p>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>Everything is up to date!</p>
              </div>
            ) : (
              <div>
                {pendingItems.map((item, i) => (
                  <div key={`${item.type}-${item.id}`} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 24px", gap: 16,
                    borderBottom: i < pendingItems.length - 1 ? "1px solid var(--color-border)" : "none",
                    transition: "background 150ms ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: item.type === "pet" ? "#EFF6FF" : "#FEF2F2",
                        color: item.type === "pet" ? "#1B4F8A" : "#DC2626",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        {item.type === "pet" ? <IconPaw size={18} /> : <IconAlertTriangle size={18} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "var(--color-text)" }}>{item.title}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>{item.subtitle}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Button variant="primary" size="sm" style={{ gap: 4, borderRadius: 10, fontWeight: 700, fontSize: 12, padding: "0 14px" }} onClick={() => handleAction(item.id, item.type, "approve")}>
                        <IconCheck size={14} /> Approve
                      </Button>
                      <Button variant="outline" size="sm" style={{ gap: 4, color: "#DC2626", borderColor: "#FECACA", borderRadius: 10, fontWeight: 700, fontSize: 12, padding: "0 14px" }} onClick={() => handleAction(item.id, item.type, "reject")}>
                        <IconX size={14} /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent User Signups Premium Section */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: "var(--color-text)", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 5, height: 28, borderRadius: 3, background: "linear-gradient(180deg, #3B82F6 0%, #1B4F8A 100%)" }} />
              Recent User Signups
            </h2>
            <Link href="/admin/users" style={{ fontSize: 13, color: "#1B4F8A", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, minHeight: 44, textDecoration: "none", transition: "all var(--transition-base)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#0052CC";
              e.currentTarget.style.gap = "10px";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#1B4F8A";
              e.currentTarget.style.gap = "6px";
            }}
            >
              Manage Users <IconChevronRight size={14} />
            </Link>
          </div>
          <div style={{
            background: "var(--color-card)", border: "1.5px solid var(--color-border)",
            borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition-base)"
          }}>
            {recentUsers.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#EFF6FF", color: "#1B4F8A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <IconUser size={28} />
                </div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>No users yet</p>
                <p style={{ margin: "4px 0 0", fontSize: 13 }}>User signup data will appear here as new users register.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((u) => {
                      const initials = u.full_name
                        ? u.full_name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
                        : "?";
                      return (
                        <tr key={u.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "background 150ms ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 20px", fontWeight: 600 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "50%", background: "#1B4F8A",
                                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, flexShrink: 0
                              }}>{initials}</div>
                              {u.full_name}
                            </div>
                          </td>
                          <td style={{ padding: "14px 20px", color: "var(--color-text-muted)" }}>{u.email}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              padding: "3px 12px", borderRadius: 20,
                              fontSize: 11, fontWeight: 700,
                              background: "#EFF6FF", color: "#1B4F8A"
                            }}>{u.role}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{
                              padding: "3px 12px", borderRadius: 20,
                              fontSize: 11, fontWeight: 700,
                              background: u.status === "Active" ? "#ECFDF5" : "#FFFBEB",
                              color: u.status === "Active" ? "#059669" : "#D97706"
                            }}>{u.status}</span>
                          </td>
                          <td style={{ padding: "14px 20px", color: "var(--color-text-muted)" }}>
                            {new Date(u.created_at).toLocaleDateString("en-PH")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
