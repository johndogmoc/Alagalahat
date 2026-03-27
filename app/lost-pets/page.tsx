"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconAlertTriangle, IconSearch, IconUser, IconChevronRight
} from "@/components/icons";

interface LostPet {
  id: string;
  pet_name: string;
  breed: string | null;
  color: string | null;
  size: string | null;
  species: string;
  photo_url: string | null;
  registration_number: string | null;
  vaccination_status: string | null;
  last_seen_location: string;
  created_at: string;
  status: string;
  owner_name: string;
  owner_contact: string | null;
}

export default function LostPetsPage() {
  const [reports, setReports] = useState<LostPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserName(userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "User");
      }

      const { data } = await supabase
        .from("lost_pet_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted) {
        const all = (data as LostPet[]) ?? [];
        setReports(all);

        // Count reports in last 24h
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        setRecentCount(all.filter((r) => new Date(r.created_at) > oneDayAgo).length);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (statusFilter !== "All") {
      list = list.filter((r) => {
        if (statusFilter === "Active") return r.status !== "Found" && r.status !== "Resolved";
        return r.status === "Found" || r.status === "Resolved";
      });
    }
    if (speciesFilter !== "All") {
      list = list.filter((r) => r.species === speciesFilter);
    }
    if (locationSearch.trim()) {
      const q = locationSearch.toLowerCase();
      list = list.filter((r) => r.last_seen_location?.toLowerCase().includes(q) || r.pet_name?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
    return list;
  }, [reports, statusFilter, speciesFilter, locationSearch, sortOrder]);

  const statusPills = ["All", "Active", "Resolved"];
  const speciesPills = ["All", "Dog", "Cat", "Other"];

  return (
    <DashboardShell role="Owner" userName={userName}>
      <div className="page-fade-in">
        {/* Page header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
                Community Lost Pet Board
              </h1>
              <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                Help reunite pets with their families
              </p>
            </div>
            <Button variant="destructive" asChild href="/lost-pets/report">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <IconAlertTriangle size={16} /> Report Lost Pet
              </span>
            </Button>
          </div>

          {/* Urgent banner */}
          {recentCount > 0 && (
            <div style={{
              marginTop: 16, padding: "12px 20px", borderRadius: "var(--radius-lg)",
              background: "var(--color-coral)" + "12", border: "1px solid var(--color-coral)",
              display: "flex", alignItems: "center", gap: 10
            }}>
              <IconAlertTriangle size={18} style={{ color: "var(--color-coral)", flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-coral)", fontWeight: 600 }}>
                {recentCount} new report{recentCount > 1 ? "s" : ""} in the last 24 hours
              </p>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10, background: "var(--color-background)",
          borderBottom: "1px solid var(--color-border)", paddingBottom: 12, marginBottom: 20
        }}>
          <div className="filter-bar">
            {/* Status pills */}
            <div className="pill-group">
              {statusPills.map((s) => (
                <button
                  key={s}
                  className="pill-btn"
                  aria-pressed={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Species pills */}
            <div className="pill-group">
              {speciesPills.map((s) => (
                <button
                  key={s}
                  className="pill-btn"
                  aria-pressed={speciesFilter === s}
                  onClick={() => setSpeciesFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Location search */}
            <div style={{ flex: 1, minWidth: 200 }}>
              <Input
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search by location or name…"
                leftIcon={<IconSearch size={16} />}
                aria-label="Search by location"
              />
            </div>

            {/* Sort */}
            <Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")} style={{ minWidth: 150 }} aria-label="Sort order">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </Select>
          </div>
        </div>

        {/* Card grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: 48, background: "var(--color-card)",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)"
          }}>
            <IconPaw size={48} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
            <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: 700 }}>No reports found</h3>
            <p style={{ margin: 0, marginTop: 8, color: "var(--color-text-muted)" }}>
              {reports.length === 0 ? "There are no lost pet reports in your community." : "No reports match your current filters."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((report) => {
              const isResolved = report.status === "Found" || report.status === "Resolved";
              return (
                <div
                  key={report.id}
                  className={`card-hover ${isResolved ? "lost-card-resolved" : "lost-card-active"}`}
                  style={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)",
                    overflow: "hidden",
                    boxShadow: "var(--shadow-sm)"
                  }}
                >
                  {/* Photo */}
                  <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "var(--color-background)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    {report.photo_url ? (
                      <img src={report.photo_url} alt={report.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <IconPaw size={48} style={{ color: "var(--color-text-light)" }} />
                    )}
                    {/* Status badge */}
                    <span className="status-badge" style={{
                      position: "absolute", top: 12, right: 12,
                      padding: "4px 12px", borderRadius: "var(--radius-full)",
                      fontSize: "var(--font-size-xs)", fontWeight: 700,
                      background: isResolved ? "var(--color-success)" : "var(--color-coral)",
                      color: "#fff", boxShadow: "var(--shadow-sm)"
                    }}>
                      {isResolved ? "FOUND" : report.status}
                    </span>
                    {/* FOUND overlay */}
                    {isResolved && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <span style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                          FOUND
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: 16 }}>
                    <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)" }}>
                      {report.pet_name}
                    </h3>
                    <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {[report.breed, report.color, report.size].filter(Boolean).join(" · ") || report.species}
                    </p>

                    {report.registration_number && (
                      <p style={{ margin: 0, marginTop: 6, fontFamily: "monospace", fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>
                        Reg# {report.registration_number}
                      </p>
                    )}

                    {report.vaccination_status && (
                      <span className="status-badge" style={{
                        display: "inline-block", marginTop: 8,
                        padding: "2px 10px", borderRadius: "var(--radius-full)",
                        fontSize: "var(--font-size-xs)", fontWeight: 600,
                        background: report.vaccination_status === "Complete" ? "var(--color-success)18" : "var(--color-amber)18",
                        color: report.vaccination_status === "Complete" ? "var(--color-success)" : "var(--color-amber)"
                      }}>
                        Vax: {report.vaccination_status}
                      </span>
                    )}

                    {/* Location & date */}
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        📍 Last seen: {report.last_seen_location || "Unknown"}
                      </p>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                        📅 Reported: {new Date(report.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "var(--color-border)", margin: "12px 0" }} />

                    {/* Owner info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "var(--color-primary)" + "18", color: "var(--color-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                      }}>
                        <IconUser size={14} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-xs)" }}>{report.owner_name}</p>
                        {report.owner_contact && (
                          <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                            📞 {report.owner_contact}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
