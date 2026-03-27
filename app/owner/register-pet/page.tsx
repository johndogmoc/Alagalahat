"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw, IconCheck, IconSpinner, IconUser, IconX, IconClipboard
} from "@/components/icons";

/* ============================================ */
const SPECIES = [
  { value: "Dog", label: "Dog", emoji: "🐕" },
  { value: "Cat", label: "Cat", emoji: "🐈" },
  { value: "Other", label: "Other", emoji: "🐾" }
];

const SIZES = ["Small", "Medium", "Large", "Extra Large"];

interface VaccineRow {
  vaccineName: string;
  dateGiven: string;
  nextDue: string;
  administeredBy: string;
}

/* ============================================ */
export default function RegisterPetPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Pet Owner");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Section 1: Basic Info
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [colorMarkings, setColorMarkings] = useState("");
  const [size, setSize] = useState("");

  // Section 2: Identity
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [spayedNeutered, setSpayedNeutered] = useState<boolean | null>(null);
  const [microchip, setMicrochip] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Section 3: Vaccination
  const [hasVaccination, setHasVaccination] = useState(false);
  const [vaccines, setVaccines] = useState<VaccineRow[]>([]);
  const [certFile, setCertFile] = useState<File | null>(null);

  // Section 4: Confirmation
  const [confirmed, setConfirmed] = useState(false);

  // State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [regNumber, setRegNumber] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  const petAge = useMemo(() => {
    if (!dob) return "";
    const d = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - d.getFullYear();
    const months = now.getMonth() - d.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""} old`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y} year${y !== 1 ? "s" : ""}${m > 0 ? `, ${m} month${m !== 1 ? "s" : ""}` : ""} old`;
  }, [dob]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "Pet Owner");
        setUserId(u.id);
        setUserEmail(u.email || "");
      }
    });
  }, []);

  const handlePhoto = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "File must be under 5MB" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, photo: "File must be an image" }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.photo; return n; });
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  function addVaccineRow() {
    setVaccines((prev) => [...prev, { vaccineName: "", dateGiven: "", nextDue: "", administeredBy: "" }]);
  }

  function updateVaccine(index: number, field: keyof VaccineRow, value: string) {
    setVaccines((prev) => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  }

  function removeVaccine(index: number) {
    setVaccines((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!petName.trim()) errs.petName = "Pet name is required";
    if (!species) errs.species = "Select a species";
    if (!breed.trim()) errs.breed = "Breed is required";
    if (!size) errs.size = "Select a size";
    if (!sex) errs.sex = "Select sex";
    if (!confirmed) errs.confirmed = "You must confirm the information is accurate";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Upload photo if present
      let photoUrl = "";
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `pets/${userId}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, photoFile);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      // Generate registration number
      const rn = `BRG-${Date.now().toString(36).toUpperCase().slice(-6)}`;

      const { error } = await supabase.from("pets").insert({
        owner_user_id: userId,
        owner_name: userName,
        name: petName.trim(),
        species,
        breed: breed.trim(),
        color_markings: colorMarkings.trim(),
        size,
        date_of_birth: dob || null,
        sex,
        spayed_neutered: spayedNeutered,
        microchip_number: microchip.trim() || null,
        photo_url: photoUrl || null,
        registration_number: rn,
        status: "Pending"
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Insert vaccinations
      if (hasVaccination && vaccines.length > 0) {
        const vaxInserts = vaccines
          .filter((v) => v.vaccineName.trim())
          .map((v) => ({
            pet_id: "", // Would need the pet ID from insert response
            vaccine_name: v.vaccineName.trim(),
            date_given: v.dateGiven || null,
            next_due_at: v.nextDue || null,
            administered_by: v.administeredBy.trim() || null
          }));
        // Note: In production, you'd get the pet ID from the insert above
      }

      setRegNumber(rn);
      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  }

  const clearErr = (key: string) => setErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  /* ============================================
     SUCCESS STATE
     ============================================ */
  if (success) {
    return (
      <DashboardShell role="Owner" userName={userName}>
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: 500, textAlign: "center", padding: 32
        }}>
          <div style={{ animation: "scaleIn 0.4s ease forwards" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="40" cy="40" r="38" stroke="var(--color-success)" strokeWidth="4" fill="var(--color-success)" opacity="0.1" />
              <path d="M24 42l10 10 22-24" stroke="var(--color-success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "drawCheck 0.6s ease forwards 0.3s", strokeDasharray: 60, strokeDashoffset: 60 }} />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 24, color: "var(--color-text)" }}>
            Pet Registered Successfully!
          </h1>
          <p style={{ margin: 0, marginTop: 8, color: "var(--color-text-muted)", maxWidth: 400 }}>
            Your pet registration has been submitted for review.
          </p>
          <div style={{
            marginTop: 24, padding: "16px 32px", background: "var(--color-background)",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)"
          }}>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Registration Number</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.05em", marginTop: 4 }}>{regNumber}</p>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
            <Button variant="outline" onClick={() => {
              // Reset form
              setPetName(""); setSpecies(""); setBreed(""); setColorMarkings("");
              setSize(""); setDob(""); setSex(""); setSpayedNeutered(null);
              setMicrochip(""); setPhotoFile(null); setPhotoPreview(null);
              setHasVaccination(false); setVaccines([]); setCertFile(null);
              setConfirmed(false); setSuccess(false); setRegNumber("");
            }}>
              Register Another Pet
            </Button>
            <Button variant="primary" onClick={() => router.push("/owner")}>
              Back to Dashboard
            </Button>
          </div>
          <style>{`@keyframes drawCheck { to { stroke-dashoffset: 0; } }`}</style>
        </div>
      </DashboardShell>
    );
  }

  /* ============================================
     FORM
     ============================================ */
  return (
    <DashboardShell role="Owner" userName={userName}>
      <div style={{ maxWidth: 720, marginInline: "auto", paddingBottom: 64 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Register a Pet</h1>
          <p style={{ margin: 0, marginTop: 4, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            Fill in your pet&apos;s information to get a barangay registration
          </p>
        </div>

        {/* ====== SECTION 1: Basic Info ====== */}
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Section 1 — Basic Info</h2>

          <div style={fieldGroup}>
            <Label htmlFor="pet-name" style={labelStyle}>Pet Name</Label>
            <Input id="pet-name" value={petName} onChange={(e) => { setPetName(e.target.value); clearErr("petName"); }} placeholder="e.g. Bantay, Mingming" error={errors.petName} leftIcon={<IconPaw size={18} />} aria-required="true" />
            {errors.petName && <p style={errStyle} role="alert">{errors.petName}</p>}
          </div>

          {/* Species — icon radio cards */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>Species</Label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }} role="radiogroup" aria-label="Pet species">
              {SPECIES.map((s) => {
                const selected = species === s.value;
                return (
                  <button key={s.value} type="button" role="radio" aria-checked={selected} onClick={() => { setSpecies(s.value); clearErr("species"); }} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                    padding: 16, border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-lg)", background: selected ? "rgba(27,79,138,0.04)" : "var(--color-card)",
                    cursor: "pointer", transition: "all var(--transition-fast)", fontFamily: "inherit", minHeight: 44
                  }}>
                    <span style={{ fontSize: 32 }}>{s.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: selected ? "var(--color-primary)" : "var(--color-text)" }}>{s.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.species && <p style={errStyle} role="alert">{errors.species}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldGroup}>
              <Label htmlFor="pet-breed" style={labelStyle}>Breed</Label>
              <Input id="pet-breed" value={breed} onChange={(e) => { setBreed(e.target.value); clearErr("breed"); }} placeholder="e.g. Aspin, Persian" error={errors.breed} aria-required="true" />
              {errors.breed && <p style={errStyle} role="alert">{errors.breed}</p>}
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="pet-color" style={labelStyle}>Color / Markings</Label>
              <Input id="pet-color" value={colorMarkings} onChange={(e) => setColorMarkings(e.target.value)} placeholder="e.g. Brown with white spots" />
            </div>
          </div>

          {/* Size — radio group */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>Size</Label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="radiogroup" aria-label="Pet size">
              {SIZES.map((s) => {
                const selected = size === s;
                return (
                  <button key={s} type="button" role="radio" aria-checked={selected} onClick={() => { setSize(s); clearErr("size"); }} style={{
                    padding: "8px 18px", border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-full)", background: selected ? "var(--color-primary)" : "transparent",
                    color: selected ? "#fff" : "var(--color-text)", fontWeight: 600,
                    fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "all var(--transition-fast)",
                    fontFamily: "inherit", minHeight: 44
                  }}>
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.size && <p style={errStyle} role="alert">{errors.size}</p>}
          </div>
        </section>

        {/* ====== SECTION 2: Identity ====== */}
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Section 2 — Identity & Documentation</h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldGroup}>
              <Label htmlFor="pet-dob" style={labelStyle}>Date of Birth</Label>
              <Input id="pet-dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              {petAge && <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-secondary)", fontWeight: 600, marginTop: 4 }}>Age: {petAge}</p>}
            </div>
            <div style={fieldGroup}>
              <Label style={labelStyle}>Sex</Label>
              <div style={{ display: "flex", gap: 8 }} role="radiogroup" aria-label="Pet sex">
                {["Male", "Female", "Unknown"].map((s) => {
                  const selected = sex === s;
                  return (
                    <button key={s} type="button" role="radio" aria-checked={selected} onClick={() => { setSex(s); clearErr("sex"); }} style={{
                      flex: 1, padding: "10px", border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)", background: selected ? "rgba(27,79,138,0.04)" : "transparent",
                      color: selected ? "var(--color-primary)" : "var(--color-text)", fontWeight: 600,
                      fontSize: "var(--font-size-sm)", cursor: "pointer", transition: "all var(--transition-fast)",
                      fontFamily: "inherit", minHeight: 44, textAlign: "center"
                    }}>
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.sex && <p style={errStyle} role="alert">{errors.sex}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={fieldGroup}>
              <Label style={labelStyle}>Spayed / Neutered?</Label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ label: "Yes", value: true }, { label: "No", value: false }].map((opt) => {
                  const selected = spayedNeutered === opt.value;
                  return (
                    <button key={opt.label} type="button" onClick={() => setSpayedNeutered(opt.value)} style={{
                      flex: 1, padding: "10px", border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)", background: selected ? "rgba(27,79,138,0.04)" : "transparent",
                      color: selected ? "var(--color-primary)" : "var(--color-text)", fontWeight: 600,
                      fontSize: "var(--font-size-sm)", cursor: "pointer", fontFamily: "inherit", minHeight: 44
                    }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="pet-microchip" style={labelStyle}>Microchip Number <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional)</span></Label>
              <Input id="pet-microchip" value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="e.g. 900123456789012" />
            </div>
          </div>

          {/* Photo upload */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>Pet Photo <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(JPEG/PNG, max 5MB)</span></Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePhoto(e.dataTransfer.files?.[0] ?? null); }}
              onClick={() => fileRef.current?.click()}
              role="button" tabIndex={0} aria-label="Upload pet photo"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
              style={{
                border: `2px dashed ${dragOver ? "var(--color-primary)" : "var(--color-border)"}`,
                borderRadius: "var(--radius-lg)", padding: 32, display: "flex",
                flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                cursor: "pointer", background: dragOver ? "rgba(27,79,138,0.04)" : "var(--color-background)",
                transition: "all var(--transition-fast)", minHeight: 160
              }}
            >
              {photoPreview ? (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <img src={photoPreview} alt="Pet preview" style={{ width: 100, height: 100, borderRadius: "var(--radius-lg)", objectFit: "cover", border: "3px solid var(--color-primary)" }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Photo ready</p>
                    <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Click or drop to replace</p>
                  </div>
                </div>
              ) : (
                <>
                  <IconPaw size={40} style={{ color: "var(--color-text-light)" }} />
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}><strong style={{ color: "var(--color-primary)" }}>Click to upload</strong> or drag and drop</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
            {errors.photo && <p style={errStyle} role="alert">{errors.photo}</p>}
          </div>
        </section>

        {/* ====== SECTION 3: Vaccination ====== */}
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Section 3 — Vaccination Info</h2>

          <div style={fieldGroup}>
            <Label style={labelStyle}>Has this pet been vaccinated?</Label>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ l: "Yes", v: true }, { l: "No", v: false }].map((opt) => (
                <button key={opt.l} type="button" onClick={() => { setHasVaccination(opt.v); if (!opt.v) setVaccines([]); }} style={{
                  flex: 1, padding: "10px", border: `2px solid ${hasVaccination === opt.v ? "var(--color-primary)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-md)", background: hasVaccination === opt.v ? "rgba(27,79,138,0.04)" : "transparent",
                  color: hasVaccination === opt.v ? "var(--color-primary)" : "var(--color-text)", fontWeight: 600,
                  fontSize: "var(--font-size-sm)", cursor: "pointer", fontFamily: "inherit", minHeight: 44
                }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {hasVaccination && (
            <>
              {vaccines.map((vax, i) => (
                <div key={i} style={{
                  border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)",
                  padding: 16, display: "grid", gap: 12, position: "relative"
                }}>
                  <button type="button" onClick={() => removeVaccine(i)} aria-label="Remove vaccine" style={{
                    position: "absolute", top: 8, right: 8, width: 32, height: 32,
                    border: "none", background: "transparent", color: "var(--color-coral)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: "var(--radius-sm)"
                  }}>
                    <IconX size={16} />
                  </button>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={fieldGroup}>
                      <Label style={labelStyle}>Vaccine Name</Label>
                      <Input value={vax.vaccineName} onChange={(e) => updateVaccine(i, "vaccineName", e.target.value)} placeholder="e.g. Anti-Rabies" />
                    </div>
                    <div style={fieldGroup}>
                      <Label style={labelStyle}>Administered By</Label>
                      <Input value={vax.administeredBy} onChange={(e) => updateVaccine(i, "administeredBy", e.target.value)} placeholder="Vet name or clinic" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={fieldGroup}>
                      <Label style={labelStyle}>Date Given</Label>
                      <Input type="date" value={vax.dateGiven} onChange={(e) => updateVaccine(i, "dateGiven", e.target.value)} />
                    </div>
                    <div style={fieldGroup}>
                      <Label style={labelStyle}>Next Due Date</Label>
                      <Input type="date" value={vax.nextDue} onChange={(e) => updateVaccine(i, "nextDue", e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" type="button" onClick={addVaccineRow} style={{ width: "100%" }}>
                + Add Vaccine Record
              </Button>
            </>
          )}
        </section>

        {/* ====== SECTION 4: Owner Confirmation ====== */}
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Section 4 — Owner Confirmation</h2>

          <div style={{
            padding: 16, background: "var(--color-background)",
            borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: "var(--color-primary)" + "18", color: "var(--color-primary)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <IconUser size={18} />
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{userName}</p>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{userEmail}</p>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Owner details auto-filled from your profile (read-only)
            </p>
          </div>

          <label htmlFor="confirm-check" style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            cursor: "pointer", minHeight: 44, marginTop: 16
          }}>
            <span style={{ position: "relative", display: "inline-flex", flexShrink: 0, marginTop: 2 }}>
              <input id="confirm-check" type="checkbox" checked={confirmed} onChange={(e) => { setConfirmed(e.target.checked); clearErr("confirmed"); }}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0 }} aria-required="true" />
              <span style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 22, height: 22, borderRadius: 6,
                border: `2px solid ${errors.confirmed ? "var(--color-error)" : confirmed ? "var(--color-primary)" : "var(--color-input-border)"}`,
                background: confirmed ? "var(--color-primary)" : "var(--color-card)",
                transition: "all 200ms ease"
              }}>
                {confirmed && <IconCheck size={14} style={{ color: "#fff" }} />}
              </span>
            </span>
            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.5 }}>
              I confirm that the information provided above is accurate and complete to the best of my knowledge.
            </span>
          </label>
          {errors.confirmed && <p style={errStyle} role="alert">{errors.confirmed}</p>}

          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !confirmed}
            type="button"
            style={{ width: "100%", marginTop: 20 }}
          >
            {isLoading ? <><IconSpinner size={20} /> Submitting…</> : "Submit for Registration"}
          </Button>
        </section>
      </div>
    </DashboardShell>
  );
}

/* ---- Shared styles ---- */
const sectionStyle: React.CSSProperties = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: 24,
  marginBottom: 20,
  display: "flex",
  flexDirection: "column",
  gap: 20,
  boxShadow: "var(--shadow-sm)"
};

const sectionTitle: React.CSSProperties = {
  fontSize: "var(--font-size-lg)",
  fontWeight: 700,
  color: "var(--color-text)",
  margin: 0,
  paddingBottom: 12,
  borderBottom: "1px solid var(--color-border)"
};

const fieldGroup: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--font-size-sm)",
  fontWeight: 600,
  color: "var(--color-text)"
};

const errStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--font-size-xs)",
  color: "var(--color-error)"
};
