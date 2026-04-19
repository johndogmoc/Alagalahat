"use client";

import { useEffect, useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import {
  IconAlertTriangle, IconCheck, IconX, IconSearch,
  IconPaw, IconClock, IconFilter, IconChevronRight
} from "@/components/icons";

/* ---- Types ---- */
interface LostReportRow {
  id: string;
  pet_name: string;
  species: string | null;
  breed: string | null;
  last_seen_location: string | null;
  last_seen_date: string | null;
  description: string | null;
  status: "Pending" | "Active" | "Found" | "Resolved";
  photo_url: string | null;
  created_at: string;
  reporter_id: string | null;
}

type StatusFilter = "All" | "Pending" | "Active" | "Found" | "Resolved";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  Pending: { color: "var(--color-amber)", bg: "rgba(233,196,106,0.15)", label: "Pending Review" },
  Active: { color: "var(--color-coral)", bg: "rgba(231,111,81,0.12)", label: "Active Alert" },
  Found: { color: "var(--color-success)", bg: "rgba(82,183,136,0.12)", label: "Found" },
  Resolved: { color: "var(--color-text-muted)", bg: "rgba(107,114,128,0.1)", label: "Resolved" }
};

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export default function LostPetsAdminPage() {
  const [reports, setReports] = useState<LostReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadReports() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("lost_pet_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setReports([]);
    } else {
      setReports((data as LostReportRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadReports(); }, []);

  async function updateStatus(id: string, newStatus: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("lost_pet_reports")
      .update({ status: newStatus } as never)
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Report status updated to ${newStatus}`);
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus as LostReportRow["status"] } : r));
  }

  // Filtering
  const filtered = reports.filter((r) => {
    const statusOk = statusFilter === "All" || r.status === statusFilter;
    const searchOk = !searchQuery.trim() || 
      r.pet_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.last_seen_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusOk && searchOk;
  });

  // Stats
  const counts = {
    Pending: reports.filter((r) => r.status === "Pending").length,
    Active: reports.filter((r) => r.status === "Active").length,
    Found: reports.filter((r) => r.status === "Found").length,
    Resolved: reports.filter((r) => r.status === "Resolved").length
  };

  return (
    <AuthShell>
      <div className="page-fade-in">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "var(--color-text)" }}>
            Lost Pet Reports Management 
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Review, approve, and manage all lost pet reports across the barangay.
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          {(["Pending", "Active", "Found", "Resolved"] as const).map((s) => {
            const cfg = STATUS_CONFIG[s];
            const isActive = statusFilter === s;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? "All" : s)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "16px 18px", borderRadius: "var(--radius-lg)",
                  background: isActive ? cfg.bg : "var(--color-card)",
                  border: isActive ? `2px solid ${cfg.color}` : "1px solid var(--color-border)",
                  cursor: "pointer", transition: "all var(--transition-fast)",
                  textAlign: "left", fontFamily: "inherit"
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: "var(--radius-md)",
                  background: cfg.bg, color: cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {s === "Pending" ? <IconClock size={18} /> : s === "Active" ? <IconAlertTriangle size={18} /> : s === "Found" ? <IconCheck size={18} /> : <IconX size={18} />}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500 }}>{cfg.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--color-text)" }}>{counts[s]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap"
        }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <IconSearch size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input
              type="text"
              className="input-base input-has-left-icon"
              placeholder="Search by pet name, location, or breed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
          <Button variant="outline" onClick={loadReports} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </div>

        {/* Reports List */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {loading ? (
            <div style={{ padding: 24, display: "grid", gap: 12 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <IconPaw size={48} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>No reports found</h3>
              <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
                {searchQuery ? "Try a different search query." : "No lost pet reports have been filed yet."}
              </p>
            </div>
          ) : (
            <div>
              {filtered.map((report, i) => {
                const cfg = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.Pending;
                const isExpanded = expandedId === report.id;
                return (
                  <div key={report.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    {/* Main Row */}
                    <div
                      style={{
                        display: "flex", alignItems: "center", padding: "16px 24px",
                        gap: 16, cursor: "pointer", transition: "background var(--transition-fast)"
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-background)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {/* Photo / Icon */}
                      <div style={{
                        width: 48, height: 48, borderRadius: "var(--radius-md)",
                        background: "var(--color-background)", flexShrink: 0, overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "1px solid var(--color-border)"
                      }}>
                        {report.photo_url ? (
                          <img src={report.photo_url} alt={report.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <IconPaw size={22} style={{ color: "var(--color-text-light)" }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {report.pet_name}
                          </p>
                          <span style={{
                            padding: "2px 10px", borderRadius: "var(--radius-full)",
                            fontSize: 11, fontWeight: 700,
                            background: cfg.bg, color: cfg.color
                          }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                          {report.species}{report.breed ? ` • ${report.breed}` : ""}
                          {report.last_seen_location ? ` •  ${report.last_seen_location}` : ""}
                        </p>
                      </div>

                      {/* Time */}
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", flexShrink: 0, whiteSpace: "nowrap" }}>
                        {timeAgo(report.created_at)}
                      </span>

                      {/* Expand arrow */}
                      <IconChevronRight size={16} style={{
                        color: "var(--color-text-muted)", flexShrink: 0,
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0)",
                        transition: "transform var(--transition-fast)"
                      }} />
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="animate-fade-in" style={{
                        padding: "0 24px 20px", marginLeft: 64
                      }}>
                        <div style={{
                          background: "var(--color-background)", borderRadius: "var(--radius-lg)",
                          padding: 20, border: "1px solid var(--color-border)"
                        }}>
                          <div className="info-grid" style={{ marginBottom: 16 }}>
                            <div className="info-item">
                              <span className="info-label">Pet Name</span>
                              <span className="info-value">{report.pet_name}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Species</span>
                              <span className="info-value">{report.species || "—"}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Breed</span>
                              <span className="info-value">{report.breed || "—"}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Last Seen</span>
                              <span className="info-value">{report.last_seen_location || "—"}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Last Seen Date</span>
                              <span className="info-value">{report.last_seen_date ? new Date(report.last_seen_date).toLocaleDateString("en-PH") : "—"}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Filed</span>
                              <span className="info-value">{new Date(report.created_at).toLocaleString("en-PH")}</span>
                            </div>
                          </div>

                          {report.description && (
                            <div style={{ marginBottom: 16 }}>
                              <p className="info-label" style={{ marginBottom: 4 }}>Description</p>
                              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.6 }}>
                                {report.description}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                            {report.status === "Pending" && (
                              <>
                                <Button variant="primary" size="sm" onClick={() => updateStatus(report.id, "Active")} style={{ gap: 6 }}>
                                  <IconCheck size={14} /> Approve & Broadcast
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => updateStatus(report.id, "Resolved")} style={{ gap: 6, color: "var(--color-text-muted)" }}>
                                  <IconX size={14} /> Dismiss
                                </Button>
                              </>
                            )}
                            {report.status === "Active" && (
                              <>
                                <Button variant="primary" size="sm" onClick={() => updateStatus(report.id, "Found")} style={{ gap: 6, background: "var(--color-success)" }}>
                                  <IconCheck size={14} /> Mark as Found
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => updateStatus(report.id, "Resolved")} style={{ gap: 6 }}>
                                  Resolve
                                </Button>
                              </>
                            )}
                            {report.status === "Found" && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(report.id, "Resolved")} style={{ gap: 6 }}>
                                <IconCheck size={14} /> Close Report
                              </Button>
                            )}
                            {report.status === "Resolved" && (
                              <Button variant="outline" size="sm" onClick={() => updateStatus(report.id, "Active")} style={{ gap: 6 }}>
                                Reopen
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
