"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconClipboard, IconPaw, IconAlertTriangle, IconUser,
  IconSyringe, IconShield, IconSearch
} from "@/components/icons";

/* ---- Types ---- */
interface LogRow {
  id: string;
  action: string;
  details: string | null;
  user_id: string | null;
  created_at: string;
}

type ActionFilter = "All" | "pet" | "lost" | "user" | "system";

/* ---- Helpers ---- */
function getActionConfig(action: string): { icon: typeof IconPaw; color: string; bg: string; label: string } {
  const a = action.toLowerCase();
  if (a.includes("pet") || a.includes("registration") || a.includes("approved") || a.includes("reject")) {
    return { icon: IconPaw, color: "var(--color-primary)", bg: "rgba(27,79,138,0.1)", label: "Pet" };
  }
  if (a.includes("lost") || a.includes("found") || a.includes("report") || a.includes("qr")) {
    return { icon: IconAlertTriangle, color: "var(--color-coral)", bg: "rgba(231,111,81,0.1)", label: "Lost Pet" };
  }
  if (a.includes("user") || a.includes("login") || a.includes("signup") || a.includes("profile")) {
    return { icon: IconUser, color: "var(--color-secondary)", bg: "rgba(42,157,143,0.1)", label: "User" };
  }
  if (a.includes("vaccin") || a.includes("vax")) {
    return { icon: IconSyringe, color: "var(--color-success)", bg: "rgba(82,183,136,0.1)", label: "Vaccination" };
  }
  return { icon: IconShield, color: "var(--color-text-muted)", bg: "rgba(107,114,128,0.08)", label: "System" };
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function matchesFilter(action: string, filter: ActionFilter): boolean {
  if (filter === "All") return true;
  const cfg = getActionConfig(action);
  if (filter === "pet") return cfg.label === "Pet";
  if (filter === "lost") return cfg.label === "Lost Pet";
  if (filter === "user") return cfg.label === "User";
  if (filter === "system") return cfg.label === "System" || cfg.label === "Vaccination";
  return true;
}

export default function AdminLogsPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActionFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  async function load() {
    setLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("id, action, details, user_id, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data as LogRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    const filterOk = matchesFilter(r.action, filter);
    const searchOk = !searchQuery.trim() ||
      r.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details?.toLowerCase().includes(searchQuery.toLowerCase());
    return filterOk && searchOk;
  });

  const filterBtns: { key: ActionFilter; label: string; icon: typeof IconPaw }[] = [
    { key: "All", label: "All", icon: IconClipboard },
    { key: "pet", label: "Pets", icon: IconPaw },
    { key: "lost", label: "Lost", icon: IconAlertTriangle },
    { key: "user", label: "Users", icon: IconUser },
    { key: "system", label: "System", icon: IconShield }
  ];

  return (
    <>
      <div className="page-fade-in">
        {/* Premium Header Section */}
        <div style={{
          marginBottom: 40,
          background: "linear-gradient(135deg, #FF6B6B 0%, #E84C3D 100%)",
          padding: "40px 32px",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(255, 107, 107, 0.15)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              Activity Logs
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              Monitor all system activity — pet registrations, lost reports, user actions, and more.
            </p>
          </div>
        </div>

        {/* Premium Filter Bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 32, flexWrap: "wrap", background: "var(--color-card)", padding: "20px 24px", borderRadius: 16, border: "1.5px solid var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {filterBtns.map((f) => {
              const FI = f.icon;
              return (
                <button
                  key={f.key}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 16px", borderRadius: 12,
                    border: filter === f.key ? "2px solid #FF6B6B" : "1.5px solid var(--color-border)",
                    background: filter === f.key ? "#FEF2F2" : "var(--color-background)",
                    color: filter === f.key ? "#FF6B6B" : "var(--color-text-muted)",
                    fontWeight: 600, fontSize: 13, cursor: "pointer",
                    transition: "all var(--transition-base)"
                  }}
                  aria-pressed={filter === f.key}
                  onMouseEnter={(e) => {
                    if (filter !== f.key) {
                      e.currentTarget.style.borderColor = "#FF6B6B";
                      e.currentTarget.style.color = "#FF6B6B";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f.key) {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }
                  }}
                  onClick={() => setFilter(f.key)}
                >
                  <FI size={16} /> {f.label}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <IconSearch size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input
              type="text"
              placeholder="Search logs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                paddingLeft: 44,
                paddingRight: 16,
                padding: "10px 14px 10px 44px",
                borderRadius: 12,
                border: "1.5px solid var(--color-border)",
                background: "var(--color-background)",
                fontSize: 14,
                transition: "all var(--transition-base)",
                outline: "none"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#FF6B6B";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            />
          </div>

          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </Button>
        </div>

        {/* Log Count Display */}
        <p style={{ margin: "0 0 20px", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Showing {filtered.length} of {rows.length} log entries
        </p>

        {/* Premium Logs Container */}
        <div style={{
          background: "var(--color-card)", border: "1.5px solid var(--color-border)",
          borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-sm)",
          transition: "all var(--transition-base)"
        }}>
          {loading ? (
            <div style={{ padding: 24, display: "grid", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <IconClipboard size={48} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>No activity logs found</h3>
              <p style={{ margin: "8px 0 0", color: "var(--color-text-muted)", fontSize: 14 }}>
                {searchQuery ? "Try a different search." : "Activity will appear here as actions are performed."}
              </p>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {filtered.map((log, i) => {
                const cfg = getActionConfig(log.action);
                const LogIcon = cfg.icon;
                return (
                  <div
                    key={log.id}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 14,
                      padding: "14px 24px",
                      borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                      transition: "background var(--transition-fast)"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-background)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "var(--radius-md)",
                      background: cfg.bg, color: cfg.color,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2
                    }}>
                      <LogIcon size={16} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                          {log.action}
                        </p>
                        <span style={{
                          padding: "1px 8px", borderRadius: "var(--radius-full)",
                          fontSize: 10, fontWeight: 700,
                          background: cfg.bg, color: cfg.color
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                      {log.details && (
                        <p style={{
                          margin: "4px 0 0", fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)", lineHeight: 1.5,
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                          maxWidth: 600
                        }}>
                          {log.details}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                        {timeAgo(log.created_at)}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--color-text-light)" }}>
                        {new Date(log.created_at).toLocaleDateString("en-PH")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
