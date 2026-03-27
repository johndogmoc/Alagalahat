"use client";

import { useEffect, useState, useMemo } from "react";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconAlertTriangle, IconCheck, IconX,
  IconSearch, IconChevronRight, IconChevronDown, IconUser, IconClipboard
} from "@/components/icons";

interface Report {
  id: string;
  report_id: string;
  pet_name: string;
  species: string;
  breed: string | null;
  color: string | null;
  size: string | null;
  photo_url: string | null;
  registration_number: string | null;
  owner_name: string;
  owner_contact: string | null;
  last_seen_location: string;
  missing_since: string | null;
  created_at: string;
  status: string;
  notes: string | null;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "Active": return { bg: "var(--color-coral)18", color: "var(--color-coral)" };
    case "Resolved": case "Found": return { bg: "var(--color-success)18", color: "var(--color-success)" };
    case "Archived": return { bg: "var(--color-text-muted)18", color: "var(--color-text-muted)" };
    case "Rejected": return { bg: "var(--color-coral)18", color: "var(--color-coral)" };
    default: return { bg: "var(--color-amber)18", color: "var(--color-amber)" };
  }
}

export default function AdminLostPetReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  /* Filters */
  const [statusFilter, setStatusFilter] = useState("All");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserName(userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "Admin");
      }

      const { data } = await supabase
        .from("lost_pet_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (mounted) {
        setReports((data as Report[]) ?? []);
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...reports];
    if (statusFilter !== "All") list = list.filter((r) => r.status === statusFilter);
    if (speciesFilter !== "All") list = list.filter((r) => r.species === speciesFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) =>
        r.pet_name?.toLowerCase().includes(q) ||
        r.owner_name?.toLowerCase().includes(q) ||
        r.report_id?.toLowerCase().includes(q)
      );
    }
    if (dateFrom) list = list.filter((r) => new Date(r.created_at) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      list = list.filter((r) => new Date(r.created_at) < to);
    }
    return list;
  }, [reports, statusFilter, speciesFilter, searchQuery, dateFrom, dateTo]);

  async function updateStatus(id: string, newStatus: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("lost_pet_reports").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    toast.success(`Report ${newStatus.toLowerCase()} successfully`);
  }

  function renderActions(report: Report) {
    switch (report.status) {
      case "Pending":
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="primary" size="sm" onClick={() => updateStatus(report.id, "Active")} style={{ gap: 4 }}>
              <IconCheck size={14} /> Approve
            </Button>
            <Button variant="outline" size="sm">Edit</Button>
            <button type="button" onClick={() => updateStatus(report.id, "Rejected")} style={{
              background: "none", border: "none", color: "var(--color-coral)", fontWeight: 600,
              fontSize: "var(--font-size-xs)", cursor: "pointer", fontFamily: "inherit", minHeight: 36, padding: "0 8px"
            }}>Reject</button>
          </div>
        );
      case "Active":
        return (
          <div style={{ display: "flex", gap: 6 }}>
            <Button variant="primary" size="sm" onClick={() => updateStatus(report.id, "Resolved")} style={{ gap: 4 }}>
              Mark as Resolved
            </Button>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
        );
      case "Resolved": case "Found":
        return (
          <Button variant="ghost" size="sm" onClick={() => updateStatus(report.id, "Archived")} style={{ color: "var(--color-text-muted)" }}>
            Archive
          </Button>
        );
      default:
        return <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Archived</span>;
    }
  }

  const statusPills = ["All", "Pending", "Active", "Resolved", "Archived"];
  const speciesPills = ["All", "Dog", "Cat", "Other"];

  return (
    <DashboardShell role="Admin" userName={userName}>
      <div className="page-fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>Lost Pet Reports</h1>
          <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Review, approve, and manage community lost pet reports
          </p>
        </div>

        {/* Filter bar */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 20, boxShadow: "var(--shadow-sm)"
        }}>
          <div className="filter-bar">
            <div className="pill-group">
              {statusPills.map((s) => (
                <button key={s} className="pill-btn" aria-pressed={statusFilter === s} onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
            <div className="pill-group">
              {speciesPills.map((s) => (
                <button key={s} className="pill-btn" aria-pressed={speciesFilter === s} onClick={() => setSpeciesFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by pet name, owner, or report ID…"
                leftIcon={<IconSearch size={16} />}
              />
            </div>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ maxWidth: 160 }} aria-label="From date" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ maxWidth: 160 }} aria-label="To date" />
          </div>
        </div>

        {/* Report table */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {loading ? (
            <div style={{ padding: 24, display: "grid", gap: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: 48, width: "100%" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--color-text-muted)" }}>
              <IconAlertTriangle size={40} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>No reports found</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)", background: "var(--color-background)" }}>
                    <th style={thStyle}></th>
                    <th style={thStyle}>Report ID</th>
                    <th style={thStyle}>Pet</th>
                    <th style={thStyle}>Owner</th>
                    <th style={thStyle}>Species</th>
                    <th style={thStyle}>Date Reported</th>
                    <th style={thStyle}>Last Location</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((report) => {
                    const st = getStatusStyle(report.status);
                    const isExpanded = expandedId === report.id;
                    return (
                      <>
                        <tr
                          key={report.id}
                          onClick={() => setExpandedId(isExpanded ? null : report.id)}
                          style={{ borderBottom: "1px solid var(--color-border)", cursor: "pointer", transition: "background var(--transition-fast)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                        >
                          <td style={tdStyle}>
                            <IconChevronRight size={14} style={{
                              color: "var(--color-text-muted)",
                              transform: isExpanded ? "rotate(90deg)" : "none",
                              transition: "transform var(--transition-fast)"
                            }} />
                          </td>
                          <td style={{ ...tdStyle, fontFamily: "monospace", fontWeight: 600, fontSize: "var(--font-size-xs)" }}>
                            {report.report_id || report.id.slice(0, 8)}
                          </td>
                          <td style={tdStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: "var(--radius-sm)",
                                background: "var(--color-background)", flexShrink: 0,
                                display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                              }}>
                                {report.photo_url ? (
                                  <img src={report.photo_url} alt={report.pet_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <IconPaw size={14} style={{ color: "var(--color-text-light)" }} />
                                )}
                              </div>
                              <span style={{ fontWeight: 600 }}>{report.pet_name}</span>
                            </div>
                          </td>
                          <td style={tdStyle}>{report.owner_name}</td>
                          <td style={tdStyle}>{report.species}</td>
                          <td style={{ ...tdStyle, color: "var(--color-text-muted)" }}>
                            {new Date(report.created_at).toLocaleDateString("en-PH")}
                          </td>
                          <td style={{ ...tdStyle, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {report.last_seen_location}
                          </td>
                          <td style={tdStyle}>
                            <span className="status-badge" style={{
                              padding: "2px 10px", borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)", fontWeight: 700,
                              background: st.bg, color: st.color
                            }}>{report.status}</span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            {renderActions(report)}
                          </td>
                        </tr>

                        {/* Expanded detail */}
                        {isExpanded && (
                          <tr key={`${report.id}-detail`}>
                            <td colSpan={9} style={{ padding: 0, borderBottom: "2px solid var(--color-primary)" }}>
                              <div style={{
                                padding: 20, background: "var(--color-background)",
                                animation: "fadeIn 200ms ease"
                              }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                                  <div className="info-item"><span className="info-label">Pet Name</span><span className="info-value">{report.pet_name}</span></div>
                                  <div className="info-item"><span className="info-label">Species</span><span className="info-value">{report.species}</span></div>
                                  <div className="info-item"><span className="info-label">Breed</span><span className="info-value">{report.breed || "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Color</span><span className="info-value">{report.color || "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Size</span><span className="info-value">{report.size || "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Reg#</span><span className="info-value" style={{ fontFamily: "monospace" }}>{report.registration_number || "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Owner</span><span className="info-value">{report.owner_name}</span></div>
                                  <div className="info-item"><span className="info-label">Contact</span><span className="info-value">{report.owner_contact || "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Last Location</span><span className="info-value">{report.last_seen_location}</span></div>
                                  <div className="info-item"><span className="info-label">Missing Since</span><span className="info-value">{report.missing_since ? new Date(report.missing_since).toLocaleString("en-PH") : "—"}</span></div>
                                  <div className="info-item"><span className="info-label">Reported</span><span className="info-value">{new Date(report.created_at).toLocaleString("en-PH")}</span></div>
                                  <div className="info-item"><span className="info-label">Status</span><span className="info-value">{report.status}</span></div>
                                </div>
                                {report.notes && (
                                  <div style={{ marginTop: 16, padding: 12, background: "var(--color-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                                    <p className="info-label" style={{ marginBottom: 4 }}>Notes</p>
                                    <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>{report.notes}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        <p style={{ marginTop: 12, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Showing {filtered.length} of {reports.length} total reports
        </p>
      </div>
    </DashboardShell>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "12px 16px", fontWeight: 600,
  color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)",
  whiteSpace: "nowrap"
};
const tdStyle: React.CSSProperties = {
  padding: "12px 16px", verticalAlign: "middle"
};
