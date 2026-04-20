"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { getSupabaseClient } from "@/lib/supabase";
import { IconSyringe, IconSearch, IconCheck, IconAlertTriangle, IconPaw } from "@/components/icons";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";

/* ───── Types ───── */
interface VacRecord {
  id: string;
  pet_id: string;
  pet_name: string;
  owner_name: string;
  species: string;
  vaccine_name: string | null;
  date_given: string | null;
  next_due_at: string | null;
}

type VacStatus = "Completed" | "Due Soon" | "Overdue" | "Not Recorded";

/* ───── Helpers ───── */
function getVacStatus(nextDue: string | null, dateGiven: string | null): VacStatus {
  if (!dateGiven && !nextDue) return "Not Recorded";
  if (!nextDue) return "Completed";
  const due = new Date(nextDue);
  const now = new Date();
  if (due < now) return "Overdue";
  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() + 30);
  if (due <= thirtyDays) return "Due Soon";
  return "Completed";
}



export default function StaffVaccinationsPage() {
  const [userName, setUserName] = useState("Staff");
  const [records, setRecords] = useState<VacRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [speciesFilter, setSpeciesFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  /* Mark Vaccinated modal state */
  const [markingPet, setMarkingPet] = useState<VacRecord | null>(null);
  const [markVaxName, setMarkVaxName] = useState("");
  const [markVaxDate, setMarkVaxDate] = useState(new Date().toISOString().split("T")[0]);
  const [markLoading, setMarkLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        setUserName(
          (userData.user.user_metadata?.full_name as string) ||
          userData.user.email?.split("@")[0] || "Staff"
        );
      }

      /* Fetch all pets with their latest vaccination */
      const { data: pets, error: petErr } = await supabase
        .from("pets")
        .select("id, name, species, owner_user_id")
        .order("name");

      if (petErr) throw petErr;
      if (!pets || pets.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }

      /* Fetch all vaccinations */
      const { data: vaxData } = await supabase
        .from("vaccinations")
        .select("id, pet_id, vaccine_name, date_given, next_due_at")
        .in("pet_id", pets.map((p: { id: string }) => p.id))
        .order("date_given", { ascending: false });

      /* Fetch owner names */
      const ownerIds = [...new Set(pets.map((p: { owner_user_id: string | null }) => p.owner_user_id).filter(Boolean))];
      const ownerMap: Record<string, string> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", ownerIds);
        if (profiles) {
          profiles.forEach((p: { id: string; full_name: string | null; email: string }) => {
            ownerMap[p.id] = p.full_name || p.email || "Unknown";
          });
        }
      }

      /* Build records: each pet gets one row (latest vax) */
      const vaxMap: Record<string, { vaccine_name: string | null; date_given: string | null; next_due_at: string | null }> = {};
      if (vaxData) {
        for (const v of vaxData) {
          if (!vaxMap[v.pet_id]) vaxMap[v.pet_id] = v;
        }
      }

      const rows: VacRecord[] = pets.map((pet: { id: string; name: string; species: string | null; owner_user_id: string }) => {
        const latest = vaxMap[pet.id];
        return {
          id: pet.id,
          pet_id: pet.id,
          pet_name: pet.name,
          owner_name: ownerMap[pet.owner_user_id] || "Unknown",
          species: pet.species || "Other",
          vaccine_name: latest?.vaccine_name ?? null,
          date_given: latest?.date_given ?? null,
          next_due_at: latest?.next_due_at ?? null,
        };
      });

      setRecords(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load vaccination data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ───── Mark Vaccinated ───── */
  async function handleMarkVaccinated() {
    if (!markingPet || !markVaxName.trim()) return;
    setMarkLoading(true);
    try {
      const supabase = getSupabaseClient();
      const nextDue = new Date(markVaxDate);
      nextDue.setFullYear(nextDue.getFullYear() + 1);

      await supabase.from("vaccinations").insert({
        pet_id: markingPet.pet_id,
        vaccine_name: markVaxName.trim(),
        date_given: markVaxDate,
        next_due_at: nextDue.toISOString().split("T")[0],
      });

      setMarkingPet(null);
      setMarkVaxName("");
      fetchData();
    } catch {
      /* swallow */
    } finally {
      setMarkLoading(false);
    }
  }

  /* ───── Filtering ───── */
  const filtered = records.filter((r) => {
    const status = getVacStatus(r.next_due_at, r.date_given);
    if (speciesFilter !== "All" && r.species !== speciesFilter) return false;
    if (statusFilter !== "All" && status !== statusFilter) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return r.pet_name.toLowerCase().includes(q) || r.owner_name.toLowerCase().includes(q);
    }
    return true;
  });

  /* ───── Stats ───── */
  const totalPets = records.length;
  const vaccinated = records.filter((r) => getVacStatus(r.next_due_at, r.date_given) === "Completed").length;
  const overdue = records.filter((r) => getVacStatus(r.next_due_at, r.date_given) === "Overdue").length;
  const notRecorded = records.filter((r) => getVacStatus(r.next_due_at, r.date_given) === "Not Recorded").length;

  const today = new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <DashboardShell role="Staff" userName={userName}>
      {/* ────── Header ────── */}
      <header style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, margin: "0 0 var(--space-2)", letterSpacing: "-0.02em" }}>
          Vaccination Management
        </h1>
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", fontWeight: 500 }}>
          {today}
        </p>
      </header>

      {/* ────── Stat Cards ────── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "var(--space-4)",
        marginBottom: "var(--space-8)",
      }}>
        {[
          { label: "Total Pets", value: totalPets, color: "var(--color-primary)", icon: IconPaw },
          { label: "Vaccinated", value: vaccinated, color: "var(--color-success)", icon: IconCheck },
          { label: "Not Recorded", value: notRecorded, color: "var(--color-text-light)", icon: IconSyringe },
          { label: "Overdue", value: overdue, color: "var(--color-coral)", icon: IconAlertTriangle },
        ].map((stat) => {
          const StatIcon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "var(--radius-md)",
                background: `color-mix(in srgb, ${stat.color} 12%, transparent)`,
                color: stat.color,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <StatIcon size={22} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>{stat.label}</p>
                <p style={{ margin: 0, fontSize: "var(--font-size-2xl)", fontWeight: 800, color: "var(--color-text)", lineHeight: 1.1 }}>{loading ? "—" : stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ────── Filter Bar ────── */}
      <div style={{
        display: "flex", gap: "var(--space-3)", flexWrap: "wrap", alignItems: "center",
        marginBottom: "var(--space-6)", padding: "var(--space-4)",
        background: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 220px", minWidth: 180 }}>
          <IconSearch size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-light)", pointerEvents: "none" }} />
          <input
            type="search"
            className="input-base input-has-left-icon"
            placeholder="Search pet or owner…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            style={{ height: 44, fontSize: "var(--font-size-sm)" }}
            aria-label="Search pets or owners"
          />
        </div>

        {/* Species Filter */}
        <div>
          <label htmlFor="species-filter" className="sr-only">Filter by species</label>
          <select
            id="species-filter"
            className="input-base"
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            style={{ height: 44, fontSize: "var(--font-size-sm)", minWidth: 110 }}
          >
            <option value="All">All Species</option>
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="sr-only">Filter by status</label>
          <select
            id="status-filter"
            className="input-base"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: 44, fontSize: "var(--font-size-sm)", minWidth: 130 }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Due Soon">Due Soon</option>
            <option value="Overdue">Overdue</option>
            <option value="Not Recorded">Not Recorded</option>
          </select>
        </div>
      </div>

      {/* ────── Error State ────── */}
      {error && (
        <div style={{
          background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)",
          borderRadius: "var(--radius-lg)", padding: "var(--space-5)",
          marginBottom: "var(--space-6)", textAlign: "center",
        }}>
          <p style={{ margin: "0 0 var(--space-3)", color: "var(--color-error)", fontWeight: 600 }}>{error}</p>
          <button className="btn btn-outline btn-size-sm" onClick={fetchData}>Try Again</button>
        </div>
      )}

      {/* ────── Loading Skeleton ────── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
      )}

      {/* ────── Data Table (Desktop) / Card Stack (Mobile) ────── */}
      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<IconSyringe size={40} />}
              title="No records found matching your filters."
            />
          ) : (
            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)",
            }}>
              {/* Table Header — hidden on mobile */}
              <div
                className="vax-table-header"
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1.5fr 1fr 120px",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-background-hover)",
                  borderBottom: "1px solid var(--color-border)",
                  fontSize: "var(--font-size-xs)",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                <span>Pet Name</span>
                <span>Owner</span>
                <span>Species</span>
                <span>Last Vaccine</span>
                <span>Next Due</span>
                <span>Status</span>
                <span>Action</span>
              </div>

              {/* Rows */}
              {filtered.map((r) => {
                const status = getVacStatus(r.next_due_at, r.date_given);
                return (
                  <div
                    key={r.id}
                    className="vax-table-row"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 2fr 1fr 1.5fr 1.5fr 1fr 120px",
                      padding: "var(--space-3) var(--space-4)",
                      borderBottom: "1px solid var(--color-border)",
                      alignItems: "center",
                      fontSize: "var(--font-size-sm)",
                      transition: "background var(--transition-fast)",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--color-text)" }}>{r.pet_name}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{r.owner_name}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{r.species}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>{r.vaccine_name || "—"}</span>
                    <span style={{ color: "var(--color-text-muted)" }}>
                      {r.next_due_at ? new Date(r.next_due_at).toLocaleDateString("en-PH") : "—"}
                    </span>
                    <StatusBadge status={status} />
                    <button
                      className="btn btn-secondary btn-size-sm"
                      style={{ fontSize: "var(--font-size-xs)", height: 34 }}
                      onClick={() => { setMarkingPet(r); setMarkVaxName(""); setMarkVaxDate(new Date().toISOString().split("T")[0]); }}
                    >
                      <IconCheck size={14} /> Vaccinate
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ────── Mark Vaccinated Modal ────── */}
      {markingPet && (
        <>
          <div
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "var(--backdrop-blur)", zIndex: 300,
            }}
            onClick={() => setMarkingPet(null)}
          />
          <div
            role="dialog"
            aria-label={`Mark ${markingPet.pet_name} as vaccinated`}
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              width: "min(420px, calc(100vw - var(--space-8)))",
              boxShadow: "var(--shadow-xl)",
              zIndex: 400,
            }}
          >
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: 700, margin: "0 0 var(--space-4)" }}>
              Mark Vaccinated
            </h3>
            <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: "0 0 var(--space-5)" }}>
              Record a vaccination for <strong>{markingPet.pet_name}</strong> (Owner: {markingPet.owner_name})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-6)" }}>
              <div>
                <label htmlFor="vax-name" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--color-text)" }}>
                  Vaccine Name
                </label>
                <input
                  id="vax-name"
                  className="input-base"
                  type="text"
                  placeholder="e.g. Anti-Rabies"
                  value={markVaxName}
                  onChange={(e) => setMarkVaxName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="vax-date" style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: 600, marginBottom: "var(--space-2)", color: "var(--color-text)" }}>
                  Date Given
                </label>
                <input
                  id="vax-date"
                  className="input-base"
                  type="date"
                  value={markVaxDate}
                  onChange={(e) => setMarkVaxDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost btn-size-default" onClick={() => setMarkingPet(null)}>
                Cancel
              </button>
              <button
                className="btn btn-primary btn-size-default"
                onClick={handleMarkVaccinated}
                disabled={!markVaxName.trim() || markLoading}
              >
                {markLoading ? "Saving…" : "Confirm Vaccination"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ────── Responsive CSS ────── */}
      <style>{`
        @media (max-width: 768px) {
          .vax-table-header { display: none !important; }
          .vax-table-row {
            display: flex !important;
            flex-direction: column !important;
            gap: var(--space-2) !important;
            padding: var(--space-4) !important;
          }
          .vax-table-row span::before {
            font-weight: 700;
            color: var(--color-text-muted);
            font-size: var(--font-size-xs);
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
        }
      `}</style>
    </DashboardShell>
  );
}
