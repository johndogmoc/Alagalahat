"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconClipboard, IconAlertTriangle, IconSyringe,
  IconChevronRight, IconCheck, IconUser
} from "@/components/icons";

/* ---- Types ---- */
interface PetData {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  color_markings: string | null;
  size: string | null;
  photo_url: string | null;
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  owner_name: string;
  owner_contact_number: string | null;
  date_of_birth: string | null;
  sex: string | null;
  spayed_neutered: boolean | null;
  microchip_number: string | null;
  created_at: string;
}

interface VaxRow {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_at: string | null;
  administered_by: string | null;
}

interface LostReport {
  id: string;
  last_seen_location: string;
  created_at: string;
  status: string;
  notes: string | null;
}

/* ---- Tab names ---- */
const TABS = ["Overview", "Vaccination History", "Lost Reports", "Activity Log"] as const;
type TabName = typeof TABS[number];

/* ---- Status badge helper ---- */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Approved: { bg: "var(--color-success)18", color: "var(--color-success)" },
    Pending: { bg: "var(--color-amber)18", color: "var(--color-amber)" },
    Rejected: { bg: "var(--color-coral)18", color: "var(--color-coral)" }
  };
  const s = map[status] ?? map.Pending;
  return (
    <span className="status-badge" style={{
      padding: "4px 14px", borderRadius: "var(--radius-full)",
      fontSize: "var(--font-size-xs)", fontWeight: 700,
      background: s.bg, color: s.color
    }}>
      {status}
    </span>
  );
}

/* ============================================ */
export default function PetProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [pet, setPet] = useState<PetData | null>(null);
  const [vaccinations, setVaccinations] = useState<VaxRow[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabName>("Overview");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserName(userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "User");
      }

      const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
      if (!mounted) return;
      if (error || !data) { setPet(null); setLoading(false); return; }
      setPet(data as PetData);

      // Fetch vaccinations
      const { data: vaxData } = await supabase
        .from("vaccinations")
        .select("id, vaccine_name, date_given, next_due_at, administered_by")
        .eq("pet_id", id)
        .order("date_given", { ascending: false });
      if (mounted) setVaccinations((vaxData as VaxRow[]) ?? []);

      // Fetch lost reports
      const { data: lostData } = await supabase
        .from("lost_pet_reports")
        .select("id, last_seen_location, created_at, status, notes")
        .eq("pet_id", id)
        .order("created_at", { ascending: false });
      if (mounted) setLostReports((lostData as LostReport[]) ?? []);

      setLoading(false);
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  const petAge = pet?.date_of_birth ? (() => {
    const d = new Date(pet.date_of_birth!);
    const now = new Date();
    const totalMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
    const y = Math.floor(totalMonths / 12);
    return `${y} year${y !== 1 ? "s" : ""}`;
  })() : null;

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <DashboardShell role="Owner" userName={userName}>
        <div style={{ padding: 24 }}>
          <div className="skeleton" style={{ width: "100%", height: 200, marginBottom: 24 }} />
          <div className="skeleton" style={{ width: "60%", height: 24, marginBottom: 12 }} />
          <div className="skeleton" style={{ width: "40%", height: 16 }} />
        </div>
      </DashboardShell>
    );
  }

  /* ---- Not found ---- */
  if (!pet) {
    return (
      <DashboardShell role="Owner" userName={userName}>
        <div style={{ textAlign: "center", padding: 64 }}>
          <IconPaw size={64} style={{ color: "var(--color-text-light)", marginBottom: 16 }} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Pet Not Found</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 8 }}>This pet profile doesn&apos;t exist or you don&apos;t have access.</p>
          <Button variant="primary" onClick={() => router.push("/owner")} style={{ marginTop: 24 }}>Back to Dashboard</Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Owner" userName={userName}>
      <div className="page-fade-in">
        {/* ===== HERO SECTION ===== */}
        <div style={{
          display: "flex", gap: 24, flexWrap: "wrap", padding: 24,
          background: "var(--color-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)",
          marginBottom: 24, alignItems: "flex-start"
        }}>
          {/* Pet photo */}
          <div style={{
            width: 200, height: 200, borderRadius: "var(--radius-lg)",
            background: "var(--color-background)", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", border: "3px solid var(--color-border)"
          }}>
            {pet.photo_url ? (
              <img src={pet.photo_url} alt={pet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <IconPaw size={72} style={{ color: "var(--color-text-light)" }} />
            )}
          </div>

          {/* Pet info */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>{pet.name}</h1>
              <StatusBadge status={pet.status} />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{
                padding: "4px 12px", borderRadius: "var(--radius-full)",
                fontSize: "var(--font-size-xs)", fontWeight: 600,
                background: "var(--color-primary)" + "18", color: "var(--color-primary)"
              }}>{pet.species}</span>
              {pet.breed && (
                <span style={{
                  padding: "4px 12px", borderRadius: "var(--radius-full)",
                  fontSize: "var(--font-size-xs)", fontWeight: 600,
                  background: "var(--color-secondary)" + "18", color: "var(--color-secondary)"
                }}>{pet.breed}</span>
              )}
            </div>

            {/* Registration number */}
            <div style={{
              display: "inline-block", padding: "8px 16px",
              background: "var(--color-background)", borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)", marginBottom: 16
            }}>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Registration #</span>
              <div style={{ fontFamily: "monospace", fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.05em" }}>
                {pet.registration_number || "—"}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button variant="primary" size="sm">
                <IconClipboard size={14} /> Edit Pet Info
              </Button>
              <Button variant="destructive" size="sm" asChild href="/lost-pets/report">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><IconAlertTriangle size={14} /> Report as Lost</span>
              </Button>
              <Button variant="outline" size="sm">
                Download Certificate
              </Button>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div className="tab-list" role="tablist" aria-label="Pet profile sections" style={{ overflowX: "auto" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className="tab-button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ===== TAB PANELS ===== */}
        <div className="tab-panel" role="tabpanel" key={activeTab}>
          {activeTab === "Overview" && (
            <div className="info-grid" style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: 24, boxShadow: "var(--shadow-sm)" }}>
              <div className="info-item"><span className="info-label">Name</span><span className="info-value">{pet.name}</span></div>
              <div className="info-item"><span className="info-label">Species</span><span className="info-value">{pet.species}</span></div>
              <div className="info-item"><span className="info-label">Breed</span><span className="info-value">{pet.breed || "—"}</span></div>
              <div className="info-item"><span className="info-label">Color / Markings</span><span className="info-value">{pet.color_markings || "—"}</span></div>
              <div className="info-item"><span className="info-label">Size</span><span className="info-value">{pet.size || "—"}</span></div>
              <div className="info-item"><span className="info-label">Sex</span><span className="info-value">{pet.sex || "—"}</span></div>
              <div className="info-item"><span className="info-label">Age</span><span className="info-value">{petAge || "—"}</span></div>
              <div className="info-item"><span className="info-label">Spayed / Neutered</span><span className="info-value">{pet.spayed_neutered === true ? "Yes" : pet.spayed_neutered === false ? "No" : "—"}</span></div>
              <div className="info-item"><span className="info-label">Microchip</span><span className="info-value" style={{ fontFamily: "monospace" }}>{pet.microchip_number || "—"}</span></div>
              <div className="info-item"><span className="info-label">Registration #</span><span className="info-value" style={{ fontFamily: "monospace" }}>{pet.registration_number || "—"}</span></div>
              <div className="info-item"><span className="info-label">Owner</span><span className="info-value">{pet.owner_name}</span></div>
              <div className="info-item"><span className="info-label">Registered</span><span className="info-value">{new Date(pet.created_at).toLocaleDateString("en-PH")}</span></div>
            </div>
          )}

          {activeTab === "Vaccination History" && (
            <div style={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
              {vaccinations.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--color-text-muted)" }}>
                  <IconSyringe size={40} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No vaccination records yet.</p>
                </div>
              ) : (
                <div style={{ padding: 20 }}>
                  {vaccinations.map((v, i) => {
                    const now = new Date();
                    const due = v.next_due_at ? new Date(v.next_due_at) : null;
                    const isOverdue = due ? due < now : false;
                    const isUpcoming = due ? (due > now && due < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) : false;
                    const vaxStatus = isOverdue ? "Overdue" : isUpcoming ? "Upcoming" : "Complete";
                    const vaxColor = isOverdue ? "var(--color-coral)" : isUpcoming ? "var(--color-amber)" : "var(--color-success)";

                    return (
                      <div key={v.id} style={{
                        display: "flex", gap: 16, padding: "16px 0",
                        borderBottom: i < vaccinations.length - 1 ? "1px solid var(--color-border)" : "none"
                      }}>
                        {/* Timeline dot */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <div style={{
                            width: 12, height: 12, borderRadius: "50%",
                            background: vaxColor, border: `3px solid ${vaxColor}18`
                          }} />
                          {i < vaccinations.length - 1 && (
                            <div style={{ width: 2, flex: 1, background: "var(--color-border)" }} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{v.vaccine_name}</p>
                            <span className="status-badge" style={{
                              padding: "2px 10px", borderRadius: "var(--radius-full)",
                              fontSize: "var(--font-size-xs)", fontWeight: 700,
                              background: vaxColor + "18", color: vaxColor
                            }}>{vaxStatus}</span>
                          </div>
                          <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                            Given: {new Date(v.date_given).toLocaleDateString("en-PH")}
                            {due ? ` • Next due: ${due.toLocaleDateString("en-PH")}` : ""}
                            {v.administered_by ? ` • By: ${v.administered_by}` : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "Lost Reports" && (
            <div style={{ display: "grid", gap: 12 }}>
              {lostReports.length === 0 ? (
                <div style={{
                  background: "var(--color-card)", border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center",
                  color: "var(--color-text-muted)"
                }}>
                  <IconCheck size={40} style={{ color: "var(--color-success)", marginBottom: 8 }} />
                  <p style={{ margin: 0 }}>No lost reports have been filed for this pet.</p>
                </div>
              ) : (
                lostReports.map((r) => (
                  <div key={r.id} style={{
                    background: "var(--color-card)", border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-lg)", padding: 16, boxShadow: "var(--shadow-sm)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>Report #{r.id.slice(0, 8)}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      📍 Last seen: {r.last_seen_location} • 📅 {new Date(r.created_at).toLocaleDateString("en-PH")}
                    </p>
                    {r.notes && <p style={{ margin: 0, marginTop: 8, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>{r.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "Activity Log" && (
            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", padding: 32, textAlign: "center",
              color: "var(--color-text-muted)"
            }}>
              <IconClipboard size={40} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
              <p style={{ margin: 0 }}>Activity log will be available once changes are tracked.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
