"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import type { SidebarRole } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconSyringe, IconChevronRight, IconCheck, IconAlertTriangle,
  IconClock
} from "@/components/icons";

/* ---- Types ---- */
interface VaccinationRow {
  id: string;
  vaccine_name: string;
  date_given: string;
  next_due_at: string | null;
  administered_by: string | null;
  created_at: string;
}

interface PetInfo {
  id: string;
  name: string;
  species: string;
}

function roleFromUser(user: { user_metadata?: Record<string, unknown> } | null): SidebarRole {
  const r = user?.user_metadata?.role;
  if (r === "Admin" || r === "Staff" || r === "Owner") return r;
  return "Owner";
}

/* ---- Status helpers ---- */
function getVaxStatus(nextDue: string | null): { label: string; color: string; bg: string } {
  if (!nextDue) return { label: "Complete", color: "var(--color-success)", bg: "rgba(82,183,136,0.12)" };
  const now = new Date();
  const due = new Date(nextDue);
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return { label: "Overdue", color: "var(--color-coral)", bg: "rgba(231,111,81,0.12)" };
  if (daysUntil <= 30) return { label: "Due Soon", color: "var(--color-amber)", bg: "rgba(233,196,106,0.15)" };
  return { label: "Up to Date", color: "var(--color-success)", bg: "rgba(82,183,136,0.12)" };
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export default function VaccinationsPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? "";

  const [shellRole, setShellRole] = useState<SidebarRole>("Owner");
  const [userName, setUserName] = useState("User");
  const [pet, setPet] = useState<PetInfo | null>(null);
  const [rows, setRows] = useState<VaccinationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [vaccineName, setVaccineName] = useState("");
  const [dateGiven, setDateGiven] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [administeredBy, setAdministeredBy] = useState("");

  const canSubmit = useMemo(() => Boolean(vaccineName.trim()) && Boolean(dateGiven), [vaccineName, dateGiven]);

  async function loadData() {
    setLoading(true);
    const supabase = getSupabaseClient();
    
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      setShellRole(roleFromUser(user));
    }

    // Load pet info
    const { data: petData } = await supabase
      .from("pets")
      .select("id, name, species")
      .eq("id", petId)
      .single();
    if (petData) setPet(petData as PetInfo);

    // Load vaccinations
    const { data, error } = await supabase
      .from("vaccinations")
      .select("id, vaccine_name, date_given, next_due_at, administered_by, created_at")
      .eq("pet_id", petId)
      .order("date_given", { ascending: false });

    if (error) {
      toast.error(error.message);
      setRows([]);
    } else {
      setRows((data as VaccinationRow[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!petId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("vaccinations").insert({
      pet_id: petId,
      vaccine_name: vaccineName.trim(),
      date_given: dateGiven,
      next_due_at: nextDueAt || null,
      administered_by: administeredBy.trim() || null
    } as never);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Vaccination record added successfully!");
    setVaccineName("");
    setDateGiven("");
    setNextDueAt("");
    setAdministeredBy("");
    setShowForm(false);
    await loadData();
  }

  // Stats
  const overdueCount = rows.filter((r) => r.next_due_at && new Date(r.next_due_at) < new Date()).length;
  const upcomingCount = rows.filter((r) => {
    if (!r.next_due_at) return false;
    const due = new Date(r.next_due_at);
    const now = new Date();
    return due > now && due < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <DashboardShell role={shellRole} userName={userName}>
      <div className="page-fade-in">
        {/* Breadcrumb */}
        <div style={{ marginBottom: 16 }}>
          <Link
            href={`/pets/${petId}`}
            style={{
              fontSize: "var(--font-size-sm)", fontWeight: 600,
              color: "var(--color-secondary)", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 4
            }}
          >
            <IconChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            Back to {pet?.name || "Pet Profile"}
          </Link>
        </div>

        {/* Hero Banner */}
        <div style={{
          background: "linear-gradient(135deg, #2A9D8F 0%, #1f7a6f 100%)",
          borderRadius: "var(--radius-xl)", padding: "32px 40px",
          color: "#fff", marginBottom: 32,
          boxShadow: "0 12px 32px rgba(42,157,143,0.2)",
          position: "relative", overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: -30, right: -10, opacity: 0.06, transform: "rotate(-15deg)" }}>
            <IconSyringe size={200} />
          </div>
          <div style={{ position: "relative", zIndex: 2, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: "#fff" }}>
                Vaccination Records
              </h1>
              <p style={{ margin: "8px 0 0", fontSize: 15, opacity: 0.85, maxWidth: 420 }}>
                {pet ? `Tracking health records for ${pet.name} (${pet.species})` : "Loading pet info…"}
              </p>
            </div>
            {shellRole !== "Owner" && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowForm(!showForm)}
                style={{ background: "#E9C46A", color: "#1A1A2E" }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
                  <IconSyringe size={18} />
                  {showForm ? "Hide Form" : "Add Record"}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Records", value: rows.length, color: "var(--color-primary)", icon: IconSyringe },
            { label: "Overdue", value: overdueCount, color: "var(--color-coral)", icon: IconAlertTriangle },
            { label: "Due Within 30 Days", value: upcomingCount, color: "var(--color-amber)", icon: IconClock },
            { label: "Up to Date", value: rows.length - overdueCount - upcomingCount, color: "var(--color-success)", icon: IconCheck }
          ].map((card) => {
            const CI = card.icon;
            return (
              <div key={card.label} style={{
                background: "var(--color-card)", border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)", padding: 20, boxShadow: "var(--shadow-sm)",
                display: "flex", alignItems: "center", gap: 14
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "var(--radius-md)",
                  background: card.color + "15", color: card.color,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <CI size={20} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 500 }}>{card.label}</p>
                  <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--color-text)" }}>{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Record Form */}
        {showForm && (
          <div className="animate-fade-in" style={{
            background: "var(--color-card)", border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)", padding: 28, marginBottom: 32,
            boxShadow: "var(--shadow-md)"
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px", color: "var(--color-text)" }}>
              Add Vaccination Record
            </h3>
            <form onSubmit={submit} style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="vaccineName">Vaccine Name *</Label>
                  <Input id="vaccineName" value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} placeholder="e.g. Rabies, DHPP, FVRCP" />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="dateGiven">Date Administered *</Label>
                  <Input id="dateGiven" type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="nextDueAt">Next Due Date (optional)</Label>
                  <Input id="nextDueAt" type="date" value={nextDueAt} onChange={(e) => setNextDueAt(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="administeredBy">Administered By (optional)</Label>
                  <Input id="administeredBy" value={administeredBy} onChange={(e) => setAdministeredBy(e.target.value)} placeholder="Vet name or clinic" />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save Record"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
            background: "rgba(231,111,81,0.08)", border: "1px solid rgba(231,111,81,0.2)",
            borderRadius: "var(--radius-lg)", marginBottom: 24
          }}>
            <IconAlertTriangle size={20} style={{ color: "var(--color-coral)", flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-coral)", fontWeight: 600 }}>
              {overdueCount} vaccination{overdueCount > 1 ? "s are" : " is"} overdue. Please schedule an appointment with your veterinarian.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div style={{
          background: "var(--color-card)", border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          <div style={{
            padding: "20px 24px", borderBottom: "1px solid var(--color-border)",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Vaccination Timeline</h3>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </Button>
          </div>

          {loading ? (
            <div style={{ padding: 24, display: "grid", gap: 16 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--color-secondary)" + "12", color: "var(--color-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <IconSyringe size={32} />
              </div>
              <h4 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text)" }}>No vaccination records yet</h4>
              <p style={{ margin: "8px 0 20px", color: "var(--color-text-muted)", fontSize: 14, maxWidth: 360, marginInline: "auto" }}>
                Start tracking your pet&apos;s vaccinations by adding the first record above.
              </p>
              {shellRole !== "Owner" && (
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  <IconSyringe size={16} /> Add First Record
                </Button>
              )}
            </div>
          ) : (
            <div style={{ padding: "20px 24px" }}>
              {rows.map((v, i) => {
                const status = getVaxStatus(v.next_due_at);
                return (
                  <div key={v.id} style={{ display: "flex", gap: 16, paddingBottom: i < rows.length - 1 ? 20 : 0, marginBottom: i < rows.length - 1 ? 20 : 0, borderBottom: i < rows.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    {/* Timeline indicator */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 4 }}>
                      <div style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: status.color, border: `3px solid ${status.bg}`,
                        boxShadow: `0 0 0 2px var(--color-card)`
                      }} />
                      {i < rows.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: "var(--color-border)", marginTop: 4 }} />
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-text)" }}>
                          {v.vaccine_name}
                        </h4>
                        <span style={{
                          padding: "2px 10px", borderRadius: "var(--radius-full)",
                          fontSize: "var(--font-size-xs)", fontWeight: 700,
                          background: status.bg, color: status.color
                        }}>
                          {status.label}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        <span> Given: {relativeDate(v.date_given)}</span>
                        {v.next_due_at && <span> Next due: {relativeDate(v.next_due_at)}</span>}
                        {v.administered_by && <span> By: {v.administered_by}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
