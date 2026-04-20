"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { getRegions, getProvinces, getCities, getBarangays } from "@/lib/barangayApi";
import "@/app/register/register.css";
import {
  IconPaw, IconCheck, IconSpinner, IconUser, IconCamera, IconUpload, IconTrash
} from "@/components/icons";

/* ============================================ */
const SPECIES = [
  { value: "Dog", label: "Dog", emoji: "🐶" },
  { value: "Cat", label: "Cat", emoji: "🐱" },
  { value: "Other", label: "Other", emoji: "🐾" }
];

const SIZES = ["Small", "Medium", "Large", "Extra Large"];

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

  // Location (Barangay API)
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [barangay, setBarangay] = useState("");
  const [regions, setRegions] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [barangays, setBarangays] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState<string>("");

  // Section 2: Identity
  const [dob, setDob] = useState("");
  const [sex, setSex] = useState("");
  const [spayedNeutered, setSpayedNeutered] = useState<boolean | null>(null);
  const [microchip, setMicrochip] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Section 3: Confirmation
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
    if (totalMonths < 0) return "";
    if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? "s" : ""} old`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y} year${y !== 1 ? "s" : ""}${m > 0 ? `, ${m} month${m !== 1 ? "s" : ""}` : ""} old`;
  }, [dob]);

  // Track whether we've auto-filled location from profile
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);

  // Track if we should skip the reset on auto-fill
  const skipResetRef = useRef(false);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase.auth.getUser().then(({ data }: { data: { user: { id: string; email?: string; user_metadata?: Record<string, string> } | null } | null }) => {
      const u = data?.user;
      if (u) {
        setUserName(u.user_metadata?.full_name || u.email?.split("@")[0] || "Pet Owner");
        setUserId(u.id);
        setUserEmail(u.email || "");

        // Auto-fill location from user profile
        const meta = u.user_metadata;
        if (meta?.region) {
          skipResetRef.current = true;
          setRegion(meta.region);
          if (meta.province) setProvince(meta.province);
          if (meta.city) setCity(meta.city);
          if (meta.barangay) setBarangay(meta.barangay);
          setLocationAutoFilled(true);
        }
      }
    });
  }, []);

  // Fetch regions on mount
  useEffect(() => {
    setLocationLoading("regions");
    getRegions()
      .then(setRegions)
      .catch(() => setRegions([]))
      .finally(() => setLocationLoading(""));
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    if (skipResetRef.current) {
      // Don't reset — just fetch
    } else {
      setProvince(""); setCity(""); setBarangay("");
      setProvinces([]); setCities([]); setBarangays([]);
    }
    if (!region) return;
    setLocationLoading("provinces");
    getProvinces(region)
      .then(setProvinces)
      .catch(() => setProvinces([]))
      .finally(() => setLocationLoading(""));
  }, [region]);

  // Fetch cities when province changes
  useEffect(() => {
    if (skipResetRef.current) {
      // Don't reset — just fetch
    } else {
      setCity(""); setBarangay("");
      setCities([]); setBarangays([]);
    }
    if (!region || !province) return;
    setLocationLoading("cities");
    getCities(region, province)
      .then(setCities)
      .catch(() => setCities([]))
      .finally(() => setLocationLoading(""));
  }, [region, province]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (skipResetRef.current) {
      skipResetRef.current = false; // Last in cascade — allow resets next time
    } else {
      setBarangay("");
      setBarangays([]);
    }
    if (!region || !province || !city) return;
    setLocationLoading("barangays");
    getBarangays(region, province, city)
      .then(setBarangays)
      .catch(() => setBarangays([]))
      .finally(() => setLocationLoading(""));
  }, [region, province, city]);

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

  const removePhoto = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  /* ---------- Progress tracker ---------- */
  const completion = useMemo(() => {
    const checks = [
      !!petName.trim(),
      !!species,
      !!breed.trim(),
      !!size,
      !!region,
      !!province,
      !!city,
      !!barangay,
      !!sex,
      confirmed
    ];
    const done = checks.filter(Boolean).length;
    return { done, total: checks.length, pct: Math.round((done / checks.length) * 100) };
  }, [petName, species, breed, size, region, province, city, barangay, sex, confirmed]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!petName.trim()) errs.petName = "Pet name is required";
    if (!species) errs.species = "Select a species";
    if (!breed.trim()) errs.breed = "Breed is required";
    if (!size) errs.size = "Select a size";
    if (!region) errs.region = "Select a region";
    if (!province) errs.province = "Select a province";
    if (!city) errs.city = "Select a city / municipality";
    if (!barangay) errs.barangay = "Select a barangay";
    if (!sex) errs.sex = "Select sex";
    if (!confirmed) errs.confirmed = "You must confirm the information is accurate";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please complete all required fields before submitting.");
    }
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

      const { data: insertedPet, error } = await supabase
        .from("pets")
        .insert({
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
          status: "Pending",
          barangay: barangay || null,
          city: city || null,
          province: province || null,
          region: region || null
        } as never)
        .select("id")
        .single();

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      // Result used only to confirm creation succeeded
      void (insertedPet as { id: string } | null)?.id;

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
        <div className="reg-success">
          <div className="reg-success-icon-wrap">
            <svg width="88" height="88" viewBox="0 0 80 80" fill="none" aria-hidden="true">
              <circle cx="40" cy="40" r="38" stroke="var(--color-success)" strokeWidth="4" fill="var(--color-success)" opacity="0.1" />
              <path d="M24 42l10 10 22-24" stroke="var(--color-success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="reg-check-path" />
            </svg>
          </div>
          <h1 className="reg-success-title">Pet Registered Successfully!</h1>
          <p className="reg-success-sub">
            Your pet registration has been submitted for review by your barangay.
            You&apos;ll be notified once it&apos;s approved.
          </p>
          <div className="reg-success-card">
            <p className="reg-success-card-label">Registration Number</p>
            <p className="reg-success-card-value">{regNumber}</p>
          </div>
          <div className="reg-success-actions">
            <Button variant="outline" onClick={() => {
              // Reset form
              setPetName(""); setSpecies(""); setBreed(""); setColorMarkings("");
              setSize(""); setDob(""); setSex(""); setSpayedNeutered(null);
              setMicrochip(""); setPhotoFile(null); setPhotoPreview(null);
              setConfirmed(false); setSuccess(false); setRegNumber("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}>
              Register Another Pet
            </Button>
            <Button variant="primary" onClick={() => router.push("/home")}>
              Back to Home
            </Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  /* ============================================
     FORM
     ============================================ */
  return (
    <DashboardShell role="Owner" userName={userName}>
      <div className="reg-container">
        {/* Header */}
        <div className="reg-header">
          <Link href="/home" className="reg-back-link" aria-label="Back to home">
            <span aria-hidden="true">←</span> Back to home
          </Link>
          <h1 className="reg-page-title">Register a Pet</h1>
          <p className="reg-page-sub">
            Fill in your pet&apos;s information to receive an official barangay registration.
          </p>

          {/* Progress bar */}
          <div className="reg-progress" aria-label={`Form progress: ${completion.pct}%`}>
            <div className="reg-progress-row">
              <span className="reg-progress-label">
                Progress — {completion.done} of {completion.total} fields completed
              </span>
              <span className="reg-progress-pct">{completion.pct}%</span>
            </div>
            <div className="reg-progress-track" role="progressbar" aria-valuenow={completion.pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="reg-progress-fill" style={{ width: `${completion.pct}%` }} />
            </div>
          </div>
        </div>

        {/* ====== SECTION 1: Basic Info ====== */}
        <section className="reg-section">
          <h2 className="reg-section-title">
            <span className="reg-section-badge">1</span>
            Basic Information
          </h2>

          <div style={fieldGroup}>
            <Label htmlFor="pet-name" style={labelStyle}>Pet Name <span className="reg-required">*</span></Label>
            <Input id="pet-name" value={petName} onChange={(e) => { setPetName(e.target.value); clearErr("petName"); }} placeholder="e.g. Bantay, Mingming" error={errors.petName} leftIcon={<IconPaw size={18} />} aria-required="true" />
            {errors.petName && <p style={errStyle} role="alert">{errors.petName}</p>}
          </div>

          {/* Species — icon radio cards */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>Species <span className="reg-required">*</span></Label>
            <div className="reg-species-grid" role="radiogroup" aria-label="Pet species">
              {SPECIES.map((s) => {
                const selected = species === s.value;
                return (
                  <button
                    key={s.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => { setSpecies(s.value); clearErr("species"); }}
                    className={`reg-species-card${selected ? " is-selected" : ""}`}
                  >
                    <span className="reg-species-emoji" aria-hidden="true">{s.emoji}</span>
                    <span className="reg-species-label">{s.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.species && <p style={errStyle} role="alert">{errors.species}</p>}
          </div>

          <div className="reg-grid-2col">
            <div style={fieldGroup}>
              <Label htmlFor="pet-breed" style={labelStyle}>Breed <span className="reg-required">*</span></Label>
              <Input id="pet-breed" value={breed} onChange={(e) => { setBreed(e.target.value); clearErr("breed"); }} placeholder="e.g. Aspin, Persian" error={errors.breed} aria-required="true" />
              {errors.breed && <p style={errStyle} role="alert">{errors.breed}</p>}
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="pet-color" style={labelStyle}>
                Color / Markings <span className="reg-optional">(optional)</span>
              </Label>
              <Input id="pet-color" value={colorMarkings} onChange={(e) => setColorMarkings(e.target.value)} placeholder="e.g. Brown with white spots" />
            </div>
          </div>

          {/* Size — radio group */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>Size <span className="reg-required">*</span></Label>
            <div className="reg-pill-group" role="radiogroup" aria-label="Pet size">
              {SIZES.map((s) => {
                const selected = size === s;
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => { setSize(s); clearErr("size"); }}
                    className={`reg-pill${selected ? " is-selected" : ""}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {errors.size && <p style={errStyle} role="alert">{errors.size}</p>}
          </div>
        </section>

        {/* ====== SECTION 2: Location ====== */}
        <section className="reg-section">
          <h2 className="reg-section-title">
            <span className="reg-section-badge">2</span>
            Barangay Address
          </h2>
          <p className="reg-section-hint">
            Data sourced from the official Philippine Standard Geographic Code (PSGC).
            {locationAutoFilled && (
              <span className="reg-autofill-badge" title="Auto-filled from your profile">
                <IconCheck size={12} /> Auto-filled from profile
              </span>
            )}
          </p>

          <div className="reg-grid-2col">
            <div style={fieldGroup}>
              <Label htmlFor="loc-region" style={labelStyle}>Region <span className="reg-required">*</span></Label>
              <Select
                id="loc-region"
                value={region}
                onChange={(e) => { setRegion(e.target.value); clearErr("region"); }}
              >
                <option value="">{locationLoading === "regions" ? "Loading regions..." : "Select region"}</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
              {errors.region && <p style={errStyle} role="alert">{errors.region}</p>}
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="loc-province" style={labelStyle}>Province <span className="reg-required">*</span></Label>
              <Select
                id="loc-province"
                value={province}
                onChange={(e) => { setProvince(e.target.value); clearErr("province"); }}
                disabled={!region || provinces.length === 0}
              >
                <option value="">{locationLoading === "provinces" ? "Loading..." : !region ? "Select region first" : "Select province"}</option>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
              {errors.province && <p style={errStyle} role="alert">{errors.province}</p>}
            </div>
          </div>

          <div className="reg-grid-2col">
            <div style={fieldGroup}>
              <Label htmlFor="loc-city" style={labelStyle}>City / Municipality <span className="reg-required">*</span></Label>
              <Select
                id="loc-city"
                value={city}
                onChange={(e) => { setCity(e.target.value); clearErr("city"); }}
                disabled={!province || cities.length === 0}
              >
                <option value="">{locationLoading === "cities" ? "Loading..." : !province ? "Select province first" : "Select city"}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
              {errors.city && <p style={errStyle} role="alert">{errors.city}</p>}
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="loc-barangay" style={labelStyle}>Barangay <span className="reg-required">*</span></Label>
              <Select
                id="loc-barangay"
                value={barangay}
                onChange={(e) => { setBarangay(e.target.value); clearErr("barangay"); }}
                disabled={!city || barangays.length === 0}
              >
                <option value="">{locationLoading === "barangays" ? "Loading..." : !city ? "Select city first" : "Select barangay"}</option>
                {barangays.map((b) => <option key={b} value={b}>{b}</option>)}
              </Select>
              {errors.barangay && <p style={errStyle} role="alert">{errors.barangay}</p>}
            </div>
          </div>
        </section>

        {/* ====== SECTION 3: Identity ====== */}
        <section className="reg-section">
          <h2 className="reg-section-title">
            <span className="reg-section-badge">3</span>
            Identity &amp; Documentation
          </h2>

          <div className="reg-grid-2col">
            <div style={fieldGroup}>
              <Label htmlFor="pet-dob" style={labelStyle}>
                Date of Birth <span className="reg-optional">(optional)</span>
              </Label>
              <Input id="pet-dob" type="date" value={dob} max={new Date().toISOString().split("T")[0]} onChange={(e) => setDob(e.target.value)} />
              {petAge && <p className="reg-age-display">🎂 Age: {petAge}</p>}
            </div>
            <div style={fieldGroup}>
              <Label style={labelStyle}>Sex <span className="reg-required">*</span></Label>
              <div className="reg-segment-group" role="radiogroup" aria-label="Pet sex">
                {["Male", "Female", "Unknown"].map((s) => {
                  const selected = sex === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => { setSex(s); clearErr("sex"); }}
                      className={`reg-segment${selected ? " is-selected" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {errors.sex && <p style={errStyle} role="alert">{errors.sex}</p>}
            </div>
          </div>

          <div className="reg-grid-2col">
            <div style={fieldGroup}>
              <Label style={labelStyle}>
                Spayed / Neutered? <span className="reg-optional">(optional)</span>
              </Label>
              <div className="reg-segment-group">
                {[{ label: "Yes", value: true }, { label: "No", value: false }].map((opt) => {
                  const selected = spayedNeutered === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setSpayedNeutered(selected ? null : opt.value)}
                      className={`reg-segment${selected ? " is-selected" : ""}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={fieldGroup}>
              <Label htmlFor="pet-microchip" style={labelStyle}>
                Microchip Number <span className="reg-optional">(optional)</span>
              </Label>
              <Input id="pet-microchip" value={microchip} onChange={(e) => setMicrochip(e.target.value)} placeholder="e.g. 900123456789012" />
            </div>
          </div>

          {/* Photo upload */}
          <div style={fieldGroup}>
            <Label style={labelStyle}>
              Pet Photo <span className="reg-optional">(JPEG/PNG, max 5MB)</span>
            </Label>
            <div
              className={`reg-photo-drop${dragOver ? " is-dragover" : ""}${photoPreview ? " has-photo" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePhoto(e.dataTransfer.files?.[0] ?? null); }}
              onClick={() => fileRef.current?.click()}
              role="button" tabIndex={0} aria-label="Upload pet photo"
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
            >
              {photoPreview ? (
                <div className="reg-photo-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Pet preview" className="reg-photo-thumb" />
                  <div className="reg-photo-meta">
                    <p className="reg-photo-meta-title">
                      <IconCheck size={16} style={{ color: "var(--color-success)" }} /> Photo ready
                    </p>
                    <p className="reg-photo-meta-sub">
                      {photoFile?.name}
                      {photoFile && ` · ${(photoFile.size / 1024).toFixed(0)} KB`}
                    </p>
                    <div className="reg-photo-actions">
                      <button
                        type="button"
                        className="reg-photo-btn"
                        onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                      >
                        <IconUpload size={14} /> Replace
                      </button>
                      <button
                        type="button"
                        className="reg-photo-btn is-danger"
                        onClick={removePhoto}
                      >
                        <IconTrash size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="reg-photo-icon-wrap">
                    <IconCamera size={32} />
                  </div>
                  <p className="reg-photo-title">
                    <strong>Click to upload</strong> or drag &amp; drop
                  </p>
                  <p className="reg-photo-hint">A clear front-facing photo helps with identification</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)} />
            {errors.photo && <p style={errStyle} role="alert">{errors.photo}</p>}
          </div>
        </section>

        {/* ====== SECTION 4: Owner Confirmation ====== */}
        <section className="reg-section">
          <h2 className="reg-section-title">
            <span className="reg-section-badge">4</span>
            Owner Confirmation
          </h2>

          <div className="reg-owner-card">
            <div className="reg-owner-avatar">
              <IconUser size={20} />
            </div>
            <div className="reg-owner-meta">
              <p className="reg-owner-name">{userName}</p>
              <p className="reg-owner-email">{userEmail || "No email on file"}</p>
            </div>
            <span className="reg-owner-badge">Read-only</span>
          </div>
          <p className="reg-section-hint" style={{ marginTop: -8 }}>
            Owner details are auto-filled from your profile.
          </p>

          <label htmlFor="confirm-check" className="reg-checkbox-row">
            <span className="reg-checkbox-wrap">
              <input
                id="confirm-check"
                type="checkbox"
                checked={confirmed}
                onChange={(e) => { setConfirmed(e.target.checked); clearErr("confirmed"); }}
                className="reg-checkbox-native"
                aria-required="true"
              />
              <span
                className={`reg-checkbox-box${confirmed ? " is-checked" : ""}${errors.confirmed ? " has-error" : ""}`}
              >
                {confirmed && <IconCheck size={14} style={{ color: "#fff" }} />}
              </span>
            </span>
            <span className="reg-checkbox-text">
              I confirm that the information provided above is{" "}
              <strong>accurate and complete</strong> to the best of my knowledge.
              I understand that providing false information may lead to rejection of this registration.
            </span>
          </label>
          {errors.confirmed && <p style={errStyle} role="alert">{errors.confirmed}</p>}
        </section>

        {/* Sticky submit bar */}
        <div className="reg-submit-bar">
          <div className="reg-submit-bar-inner">
            <div className="reg-submit-meta">
              <p className="reg-submit-title">
                {completion.pct === 100 ? "All set! Ready to submit." : `${completion.done}/${completion.total} fields completed`}
              </p>
              <p className="reg-submit-sub">
                Your pet will be reviewed by your barangay staff before being approved.
              </p>
            </div>
            <div className="reg-submit-actions">
              <Button variant="outline" onClick={() => router.push("/home")} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading}
                type="button"
              >
                {isLoading ? (
                  <><IconSpinner size={20} /> Submitting…</>
                ) : (
                  <><IconCheck size={18} /> Submit Registration</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

/* ---- Inline style fallbacks (for labels / field groups / error text) ---- */
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
