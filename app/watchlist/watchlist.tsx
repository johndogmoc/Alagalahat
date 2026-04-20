"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { IconPaw, IconBell, IconX } from "@/components/icons";

interface WatchCriteria {
  species: string[];
  breeds: string[];
  barangays: string[];
}

interface MatchedAlert {
  id: string;
  pet_name: string;
  species: string;
  breed: string;
  location: string;
  status: string;
  created_at: string;
  photo_url?: string;
}

const SPECIES_OPTIONS = ["Dog", "Cat", "Bird", "Fish", "Other"];
const BREED_OPTIONS = ["Aspin", "Puspin", "Shih Tzu", "Labrador", "Persian", "Siamese", "Poodle", "Golden Retriever", "Pomeranian", "Chihuahua"];
const BARANGAY_OPTIONS = ["Barangay 1", "Barangay 2", "Barangay 3", "Poblacion", "San Jose", "San Miguel", "Santa Cruz", "Santo Niño", "Zone 4", "Zone 5"];

export default function WatchlistPage() {
  const [criteria, setCriteria] = useState<WatchCriteria>({
    species: [], breeds: [], barangays: []
  });
  const [alerts, setAlerts] = useState<MatchedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"alerts" | "settings">("alerts");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      // Load saved criteria from localStorage
      const saved = localStorage.getItem(`watchlist_${user.id}`);
      if (saved) {
        try { setCriteria(JSON.parse(saved)); } catch { /* ignore */ }
      }

      // Load recent lost/found reports as alerts
      const { data: reports } = await supabase
        .from("lost_pet_reports")
        .select("id, pet_name, species, breed, last_seen_location, status, created_at, photo_url")
        .order("created_at", { ascending: false })
        .limit(20);

      if (mounted && reports) {
        setAlerts(reports.map((r: Record<string, unknown>) => ({
          id: r.id as string,
          pet_name: r.pet_name as string,
          species: (r.species as string) || "Unknown",
          breed: (r.breed as string) || "Unknown",
          location: (r.last_seen_location as string) || "Unknown",
          status: (r.status as string) || "Active",
          created_at: r.created_at as string,
          photo_url: r.photo_url as string | undefined
        })));
      }

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Save criteria when changed
  useEffect(() => {
    async function save() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        localStorage.setItem(`watchlist_${data.user.id}`, JSON.stringify(criteria));
      }
    }
    save();
  }, [criteria]);

  // Filter alerts based on criteria
  const matchedAlerts = useMemo(() => {
    if (criteria.species.length === 0 && criteria.breeds.length === 0 && criteria.barangays.length === 0) {
      return alerts;
    }
    return alerts.filter((a) => {
      const speciesMatch = criteria.species.length === 0 || criteria.species.some((s) => a.species.toLowerCase().includes(s.toLowerCase()));
      const breedMatch = criteria.breeds.length === 0 || criteria.breeds.some((b) => a.breed.toLowerCase().includes(b.toLowerCase()));
      const barangayMatch = criteria.barangays.length === 0 || criteria.barangays.some((bg) => a.location.toLowerCase().includes(bg.toLowerCase()));
      return speciesMatch || breedMatch || barangayMatch;
    });
  }, [alerts, criteria]);

  function toggleItem(field: keyof WatchCriteria, value: string) {
    setCriteria((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
      };
    });
  }

  const activeFilters = criteria.species.length + criteria.breeds.length + criteria.barangays.length;

  return (
    <AuthShell>
      <div className="post-card" style={{ marginBottom: 20, padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--color-text)", letterSpacing: "-0.01em" }}>
          Watchlist ️
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
          Monitor specific breeds, species, or barangay areas for lost pet reports.
          {activeFilters > 0 && <span style={{ color: "var(--color-primary)", fontWeight: 600 }}> ({activeFilters} active filters)</span>}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Matched Reports</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-primary)", lineHeight: 1.3 }}>{matchedAlerts.length}</p>
        </div>
        <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>Active Filters</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-secondary)", lineHeight: 1.3 }}>{activeFilters}</p>
        </div>
        <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)" }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase" }}>New This Week</p>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--color-coral)", lineHeight: 1.3 }}>
            {matchedAlerts.filter((a) => Date.now() - new Date(a.created_at).getTime() < 7 * 24 * 60 * 60 * 1000).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--color-border)", marginBottom: 24 }}>
        {([
          { id: "alerts" as const, label: "Matched Alerts", icon: "" },
          { id: "settings" as const, label: "Watch Preferences", icon: "️" },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 20px", fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? "var(--color-primary)" : "var(--color-text-muted)",
              background: "none", border: "none",
              borderBottom: `2px solid ${tab === t.id ? "var(--color-primary)" : "transparent"}`,
              marginBottom: -2, cursor: "pointer", fontFamily: "inherit", minHeight: 44
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Alerts tab */}
      {tab === "alerts" && (
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>Loading watchlist…</div>
          ) : matchedAlerts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <IconBell size={36} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
              <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text)" }}>No matching reports</p>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-muted)" }}>
                {activeFilters === 0 ? "Set up your watch preferences to get matched alerts." : "No recent reports match your criteria."}
              </p>
              {activeFilters === 0 && (
                <Button variant="primary" size="sm" onClick={() => setTab("settings")} style={{ marginTop: 16 }}>
                  Set Up Watchlist
                </Button>
              )}
            </div>
          ) : (
            matchedAlerts.map((alert, i) => (
              <Link key={alert.id} href={`/lost-pets`} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px", textDecoration: "none", color: "inherit",
                borderBottom: i < matchedAlerts.length - 1 ? "1px solid var(--color-border)" : "none",
                transition: "background 200ms ease"
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)", flexShrink: 0,
                  background: "var(--color-background)", display: "flex", alignItems: "center",
                  justifyContent: "center", overflow: "hidden"
                }}>
                  {alert.photo_url ? (
                    <img src={alert.photo_url} alt={alert.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <IconPaw size={20} style={{ color: "var(--color-text-light)" }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>{alert.pet_name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>
                    {alert.breed} · {alert.species} · {alert.location}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <span style={{
                    padding: "2px 8px", borderRadius: 8, fontSize: 10, fontWeight: 700,
                    background: alert.status === "Found" ? "#52B78818" : "#E76F5118",
                    color: alert.status === "Found" ? "#52B788" : "#E76F51"
                  }}>
                    {alert.status}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--color-text-light)" }}>
                    {new Date(alert.created_at).toLocaleDateString("en-PH")}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Settings tab */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Species */}
          <section style={{
            background: "var(--color-card)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}> Species to Watch</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SPECIES_OPTIONS.map((s) => {
                const active = criteria.species.includes(s);
                return (
                  <button key={s} onClick={() => toggleItem("species", s)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                    background: active ? "var(--color-primary)" : "var(--color-card)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms ease", minHeight: 36
                  }}>
                    {active && "✓ "}{s}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Breeds */}
          <section style={{
            background: "var(--color-card)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}> Breeds to Watch</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BREED_OPTIONS.map((b) => {
                const active = criteria.breeds.includes(b);
                return (
                  <button key={b} onClick={() => toggleItem("breeds", b)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: active ? "var(--color-secondary)" : "var(--color-border)",
                    background: active ? "var(--color-secondary)" : "var(--color-card)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms ease", minHeight: 36
                  }}>
                    {active && "✓ "}{b}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Barangays */}
          <section style={{
            background: "var(--color-card)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)"
          }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700 }}> Barangay Areas</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BARANGAY_OPTIONS.map((bg) => {
                const active = criteria.barangays.includes(bg);
                return (
                  <button key={bg} onClick={() => toggleItem("barangays", bg)} style={{
                    padding: "6px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: active ? "#2A9D8F" : "var(--color-border)",
                    background: active ? "#2A9D8F" : "var(--color-card)",
                    color: active ? "#fff" : "var(--color-text-muted)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms ease", minHeight: 36
                  }}>
                    {active && "✓ "}{bg}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Clear all */}
          {activeFilters > 0 && (
            <Button
              variant="outline"
              onClick={() => setCriteria({ species: [], breeds: [], barangays: [] })}
              style={{ width: "fit-content" }}
            >
              <IconX size={14} /> Clear All Filters
            </Button>
          )}
        </div>
      )}
    </AuthShell>
  );
}
