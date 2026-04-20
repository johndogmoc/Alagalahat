"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconClipboard, IconPaw, IconAlertTriangle, IconSyringe,
  IconSearch, IconChevronRight, IconCheck, IconX, IconUser
} from "@/components/icons";

interface PetRow {
  id: string;
  name: string;
  species: string;
  registration_number: string;
  status: "Pending" | "Approved" | "Rejected";
  owner_name: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  user_name: string;
  created_at: string;
  details: string;
}

export default function StaffDashboardPage() {
  const [userName, setUserName] = useState("Staff");
  const [stats, setStats] = useState({ pending: 0, thisMonth: 0, lostPending: 0, vaxWeek: 0 });
  const [pendingQueue, setPendingQueue] = useState<PetRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PetRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Staff");

      // Pending registrations
      const { data: pendingData, count: pendingCount } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status, owner_name, created_at", { count: "exact" })
        .eq("status", "Pending")
        .order("created_at", { ascending: true })
        .limit(10);

      if (mounted) setPendingQueue((pendingData as PetRow[]) ?? []);

      // Stats
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { count: monthCount } = await supabase
        .from("pets")
        .select("count", { count: "exact", head: true })
        .gte("created_at", monthStart)
        .eq("status", "Approved");

      const { count: lostCount } = await supabase
        .from("lost_pet_reports")
        .select("count", { count: "exact", head: true })
        .eq("status", "Pending");

      const { count: vaxCount } = await supabase
        .from("vaccinations")
        .select("count", { count: "exact", head: true })
        .gte("created_at", weekStart);

      if (mounted) {
        setStats({
          pending: pendingCount ?? 0,
          thisMonth: monthCount ?? 0,
          lostPending: lostCount ?? 0,
          vaxWeek: vaxCount ?? 0
        });
      }

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setShowResults(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("pets")
      .select("id, name, species, registration_number, status, owner_name, created_at")
      .or(`registration_number.ilike.%${q}%,owner_name.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(25);
    setSearchResults((data as PetRow[]) ?? []);
    setIsSearching(false);
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const statCards = [
    { label: "Pending Registrations", value: stats.pending, color: "var(--color-amber)", icon: IconClipboard },
    { label: "Pets Registered This Month", value: stats.thisMonth, color: "var(--color-success)", icon: IconPaw },
    { label: "Lost Reports Pending", value: stats.lostPending, color: "var(--color-coral)", icon: IconAlertTriangle },
    { label: "Vaccinations This Week", value: stats.vaxWeek, color: "var(--color-secondary)", icon: IconSyringe }
  ];

  function getStatusStyle(status: string) {
    switch (status) {
      case "Approved": return { bg: "var(--color-success)" + "18", color: "var(--color-success)" };
      case "Rejected": return { bg: "var(--color-coral)" + "18", color: "var(--color-coral)" };
      default: return { bg: "var(--color-amber)" + "18", color: "var(--color-amber)" };
    }
  }

  return (
    <DashboardShell role="Staff" userName={userName}>
      {/* Welcome bar */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>
          {greeting}, {userName}! 
        </h1>
        <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          Barangay Staff Dashboard — Managing community pet records
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
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

      {/* Search bar */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0, marginBottom: 12 }}>Search Pet Records</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by registration number, owner name, or pet name…"
              leftIcon={<IconSearch size={18} />}
              aria-label="Search pet records"
            />
          </div>
          <Button variant="primary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "Searching…" : "Search"}
          </Button>
        </div>

        {showResults && (
          <div style={{ marginTop: 16 }}>
            {searchResults.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>No results found.</p>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {searchResults.map((pet) => {
                  const st = getStatusStyle(pet.status);
                  return (
                    <div key={pet.id} style={{
                      background: "var(--color-card)", border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)", padding: 16, display: "flex",
                      alignItems: "center", justifyContent: "space-between", gap: 12
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{pet.name} <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>({pet.species})</span></p>
                        <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                          Reg#: {pet.registration_number || "—"} • Owner: {pet.owner_name}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ padding: "2px 10px", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 700, background: st.bg, color: st.color }}>{pet.status}</span>
                        <Button variant="outline" size="sm" asChild href={`/pets/${pet.id}`}>View</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Pending Registrations Queue */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0 }}>Pending Registrations</h2>
          <Link href="/staff/pets" style={{ fontSize: "var(--font-size-sm)", color: "var(--color-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, minHeight: 44 }}>
            Open Full Queue <IconChevronRight size={14} />
          </Link>
        </div>
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {pendingQueue.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              <IconCheck size={32} style={{ color: "var(--color-success)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>All caught up! No pending registrations.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-background)" }}>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Owner</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Pet Name</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Species</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Submitted</th>
                    <th style={{ textAlign: "left", padding: "12px 16px", fontWeight: 600, color: "var(--color-text-muted)" }}>Status</th>
                    <th style={{ textAlign: "right", padding: "12px 16px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQueue.map((pet) => (
                    <tr key={pet.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 500 }}>{pet.owner_name}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{pet.name}</td>
                      <td style={{ padding: "12px 16px" }}>{pet.species}</td>
                      <td style={{ padding: "12px 16px", color: "var(--color-text-muted)" }}>
                        {new Date(pet.created_at).toLocaleDateString("en-PH")}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "2px 10px", borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)", fontWeight: 700,
                          background: "var(--color-amber)" + "18", color: "var(--color-amber)"
                        }}>
                          Pending
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <Button variant="primary" size="sm" asChild href={`/pets/${pet.id}`}>Review</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 700, margin: 0, marginBottom: 16 }}>Recent Activity</h2>
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)"
        }}>
          {activities.length === 0 ? (
            <div style={{ textAlign: "center", padding: 16, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              <p style={{ margin: 0 }}>Activity feed will appear here as actions are performed.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {activities.map((act, i) => (
                <div key={act.id} style={{
                  display: "flex", gap: 12, padding: "12px 0",
                  borderBottom: i < activities.length - 1 ? "1px solid var(--color-border)" : "none"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--color-primary)" + "18", color: "var(--color-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <IconUser size={14} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "var(--font-size-sm)" }}>
                      <strong>{act.user_name}</strong> {act.action}
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                      {new Date(act.created_at).toLocaleString("en-PH")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
