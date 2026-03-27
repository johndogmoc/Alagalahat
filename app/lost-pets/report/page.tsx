"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconAlertTriangle, IconCheck, IconSpinner,
  IconSearch, IconUser, IconSyringe
} from "@/components/icons";

interface MyPet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  color_markings: string | null;
  size: string | null;
  photo_url: string | null;
  registration_number: string | null;
  vaccination_status?: string;
}

export default function LostPetReportPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState<"Owner" | "Staff">("Owner");
  const [userContact, setUserContact] = useState("");

  /* Pets */
  const [myPets, setMyPets] = useState<MyPet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffResults, setStaffResults] = useState<MyPet[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /* Report details */
  const [lastLocation, setLastLocation] = useState("");
  const [missingDate, setMissingDate] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  /* State */
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reportId, setReportId] = useState("");
  const [loadingPets, setLoadingPets] = useState(true);

  const selectedPet = useMemo(() => {
    return myPets.find((p) => p.id === selectedPetId) || staffResults.find((p) => p.id === selectedPetId);
  }, [selectedPetId, myPets, staffResults]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const role = user.user_metadata?.role || "Owner";
      setUserRole(role as "Owner" | "Staff");
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
      setUserContact(user.user_metadata?.phone || "");

      if (role === "Owner" || role === "owner") {
        const { data: pets } = await supabase
          .from("pets")
          .select("id, name, species, breed, color_markings, size, photo_url, registration_number")
          .eq("owner_user_id", user.id)
          .order("name");

        if (mounted) setMyPets((pets as MyPet[]) ?? []);
      }

      setLoadingPets(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleStaffSearch() {
    const q = staffSearch.trim();
    if (!q) return;
    setIsSearching(true);
    const supabase = getSupabaseClient();
    const { data } = await supabase
      .from("pets")
      .select("id, name, species, breed, color_markings, size, photo_url, registration_number")
      .or(`registration_number.ilike.%${q}%,owner_name.ilike.%${q}%,name.ilike.%${q}%`)
      .limit(10);
    setStaffResults((data as MyPet[]) ?? []);
    setIsSearching(false);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!selectedPetId) errs.pet = "Select a pet";
    if (!lastLocation.trim()) errs.location = "Last known location is required";
    if (!missingDate) errs.date = "Date and time missing is required";
    if (!confirmed) errs.confirmed = "You must confirm the report is accurate";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const pet = selectedPet;
      const rid = `LPR-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      const { error } = await supabase.from("lost_pet_reports").insert({
        pet_id: selectedPetId,
        pet_name: pet?.name ?? "",
        species: pet?.species ?? "",
        breed: pet?.breed ?? "",
        color: pet?.color_markings ?? "",
        size: pet?.size ?? "",
        photo_url: pet?.photo_url ?? null,
        registration_number: pet?.registration_number ?? null,
        last_seen_location: lastLocation.trim(),
        missing_since: missingDate,
        notes: notes.trim() || null,
        reporter_name: userName,
        owner_name: userName,
        owner_contact: userContact,
        status: "Pending",
        report_id: rid
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setReportId(rid);
      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  }

  const clearErr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  /* ---- Success ---- */
  if (success) {
    return (
      <DashboardShell role={userRole} userName={userName}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, padding: 32, textAlign: "center" }}>
          <div style={{ animation: "scaleIn 0.4s ease forwards" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="40" cy="40" r="38" stroke="var(--color-coral)" strokeWidth="4" fill="var(--color-coral)" opacity="0.1" />
              <path d="M24 42l10 10 22-24" stroke="var(--color-coral)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "drawCheck 0.6s ease forwards 0.3s", strokeDasharray: 60, strokeDashoffset: 60 }} />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 24, color: "var(--color-text)" }}>Report Submitted</h1>
          <p style={{ margin: 0, marginTop: 8, color: "var(--color-text-muted)", maxWidth: 400 }}>
            Your lost pet report has been submitted and will be reviewed by an Admin before appearing publicly.
          </p>
          <div style={{ marginTop: 16, padding: "12px 24px", background: "var(--color-background)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Report ID</span>
            <div style={{ fontFamily: "monospace", fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-coral)", letterSpacing: "0.05em" }}>{reportId}</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <Button variant="outline" onClick={() => router.push("/lost-pets")}>View My Reports</Button>
            <Button variant="primary" onClick={() => router.push(userRole === "Staff" ? "/staff" : "/owner")}>Return to Dashboard</Button>
          </div>
          <style>{`@keyframes drawCheck { to { stroke-dashoffset: 0; } }`}</style>
        </div>
      </DashboardShell>
    );
  }

  /* ---- Form ---- */
  return (
    <DashboardShell role={userRole} userName={userName}>
      <div className="page-fade-in" style={{ maxWidth: 640, marginInline: "auto", paddingBottom: 48 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>Report a Lost Pet</h1>
          <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            File a report to alert the community and help find your pet
          </p>
        </div>

        {/* ===== SECTION 1: Select Pet ===== */}
        <section style={secStyle}>
          <h2 style={secTitle}>Section 1 — Select Pet</h2>

          {userRole === "Owner" ? (
            <div style={fieldGroup}>
              <Label htmlFor="sel-pet" style={labelStyle}>Select one of your registered pets</Label>
              {loadingPets ? (
                <div className="skeleton" style={{ height: 48, width: "100%" }} />
              ) : myPets.length === 0 ? (
                <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                  You have no registered pets. <Link href="/owner/register-pet" style={{ color: "var(--color-secondary)", fontWeight: 600 }}>Register a pet first</Link>.
                </p>
              ) : (
                <Select id="sel-pet" value={selectedPetId} onChange={(e) => { setSelectedPetId(e.target.value); clearErr("pet"); }} error={errors.pet}>
                  <option value="">Choose a pet…</option>
                  {myPets.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.species})</option>
                  ))}
                </Select>
              )}
              {errors.pet && <p style={errStyle} role="alert">{errors.pet}</p>}
            </div>
          ) : (
            <div style={fieldGroup}>
              <Label style={labelStyle}>Search for a pet</Label>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Input
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStaffSearch()}
                    placeholder="Search by reg#, owner name, or pet name"
                    leftIcon={<IconSearch size={16} />}
                  />
                </div>
                <Button variant="primary" onClick={handleStaffSearch} disabled={isSearching}>
                  {isSearching ? "…" : "Search"}
                </Button>
              </div>
              {staffResults.length > 0 && (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {staffResults.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => { setSelectedPetId(p.id); clearErr("pet"); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: 12,
                        border: `2px solid ${selectedPetId === p.id ? "var(--color-primary)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-lg)", background: selectedPetId === p.id ? "rgba(27,79,138,0.04)" : "var(--color-card)",
                        cursor: "pointer", fontFamily: "inherit", textAlign: "left", minHeight: 44
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: "var(--radius-md)",
                        background: "var(--color-background)", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
                      }}>
                        {p.photo_url ? <img src={p.photo_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <IconPaw size={18} style={{ color: "var(--color-text-light)" }} />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{p.name} ({p.species})</p>
                        <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Reg# {p.registration_number || "—"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pet preview */}
          {selectedPet && (
            <div style={{
              padding: 16, background: "var(--color-background)",
              borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)",
              display: "flex", gap: 16, alignItems: "center", marginTop: 8
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "var(--radius-md)",
                background: "var(--color-card)", flexShrink: 0, overflow: "hidden",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2px solid var(--color-border)"
              }}>
                {selectedPet.photo_url ? (
                  <img src={selectedPet.photo_url} alt={selectedPet.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <IconPaw size={28} style={{ color: "var(--color-text-light)" }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--font-size-sm)" }}>{selectedPet.name}</p>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>
                  {selectedPet.species} · {selectedPet.breed || "Unknown breed"} · {selectedPet.color_markings || "—"} · {selectedPet.size || "—"}
                </p>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "monospace", marginTop: 2 }}>
                  Reg# {selectedPet.registration_number || "—"}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ===== SECTION 2: Report Details ===== */}
        <section style={secStyle}>
          <h2 style={secTitle}>Section 2 — Report Details</h2>

          <div style={fieldGroup}>
            <Label htmlFor="rep-location" style={labelStyle}>Last Known Location</Label>
            <Input
              id="rep-location"
              value={lastLocation}
              onChange={(e) => { setLastLocation(e.target.value); clearErr("location"); }}
              placeholder="e.g. Near the barangay hall, Purok 3"
              error={errors.location}
              leftIcon={<span style={{ fontSize: 16 }}>📍</span>}
              aria-required="true"
            />
            {errors.location && <p style={errStyle} role="alert">{errors.location}</p>}
          </div>

          <div style={fieldGroup}>
            <Label htmlFor="rep-date" style={labelStyle}>Date and Time Pet Went Missing</Label>
            <Input
              id="rep-date"
              type="datetime-local"
              value={missingDate}
              onChange={(e) => { setMissingDate(e.target.value); clearErr("date"); }}
              error={errors.date}
              aria-required="true"
            />
            {errors.date && <p style={errStyle} role="alert">{errors.date}</p>}
          </div>

          <div style={fieldGroup}>
            <Label htmlFor="rep-notes" style={labelStyle}>
              Additional Notes <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional, max 500 chars)</span>
            </Label>
            <Textarea
              id="rep-notes"
              value={notes}
              onChange={(e) => { if (e.target.value.length <= 500) setNotes(e.target.value); }}
              placeholder="Any additional details that might help find this pet…"
              style={{ minHeight: 100 }}
            />
            <p style={{ margin: 0, textAlign: "right", fontSize: "var(--font-size-xs)", color: notes.length > 450 ? "var(--color-coral)" : "var(--color-text-muted)" }}>
              {notes.length}/500
            </p>
          </div>
        </section>

        {/* ===== SECTION 3: Confirmation ===== */}
        <section style={secStyle}>
          <h2 style={secTitle}>Section 3 — Confirmation</h2>

          {/* Summary */}
          {selectedPet && (
            <div style={{
              border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden"
            }}>
              <div style={{ padding: "12px 16px", background: "var(--color-background)", borderBottom: "1px solid var(--color-border)", fontWeight: 600, fontSize: "var(--font-size-sm)" }}>
                Report Summary
              </div>
              <div style={{ padding: "12px 16px" }}>
                {[
                  { l: "Pet", v: `${selectedPet.name} (${selectedPet.species})` },
                  { l: "Reg#", v: selectedPet.registration_number || "—" },
                  { l: "Last Location", v: lastLocation || "—" },
                  { l: "Missing Since", v: missingDate ? new Date(missingDate).toLocaleString("en-PH") : "—" },
                  { l: "Notes", v: notes || "None" },
                  { l: "Reporter", v: userName }
                ].map((r) => (
                  <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--color-border)", gap: 12 }}>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{r.l}</span>
                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 500, textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm checkbox */}
          <label htmlFor="rep-confirm" style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            cursor: "pointer", minHeight: 44, marginTop: 12
          }}>
            <span style={{ position: "relative", display: "inline-flex", flexShrink: 0, marginTop: 2 }}>
              <input id="rep-confirm" type="checkbox" checked={confirmed} onChange={(e) => { setConfirmed(e.target.checked); clearErr("confirmed"); }}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} />
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 6,
                border: `2px solid ${errors.confirmed ? "var(--color-error)" : confirmed ? "var(--color-coral)" : "var(--color-input-border)"}`,
                background: confirmed ? "var(--color-coral)" : "var(--color-card)",
                transition: "all 200ms ease"
              }}>
                {confirmed && <IconCheck size={14} style={{ color: "#fff" }} />}
              </span>
            </span>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.5 }}>
              I confirm this report is accurate and the pet is genuinely missing
            </span>
          </label>
          {errors.confirmed && <p style={errStyle} role="alert">{errors.confirmed}</p>}

          <p style={{ margin: 0, marginTop: 8, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontStyle: "italic" }}>
            Your report will be reviewed by the Admin before it appears publicly on the community board.
          </p>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !confirmed}
            style={{ width: "100%", marginTop: 16 }}
          >
            {isLoading ? <><IconSpinner size={20} /> Submitting…</> : "Submit Report"}
          </Button>
        </section>
      </div>
    </DashboardShell>
  );
}

/* ---- Shared styles ---- */
const secStyle: React.CSSProperties = {
  background: "var(--color-card)", border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 20,
  display: "flex", flexDirection: "column", gap: 20, boxShadow: "var(--shadow-sm)"
};
const secTitle: React.CSSProperties = {
  fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)",
  margin: 0, paddingBottom: 12, borderBottom: "1px solid var(--color-border)"
};
const fieldGroup: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
const labelStyle: React.CSSProperties = { fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" };
const errStyle: React.CSSProperties = { margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-error)" };
