"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { LocationPicker } from "@/components/LocationPicker";
import type { FilingUserRole, LostPetRegistrationSnapshot, LostPetReportStatus } from "@/lib/types/lostPet";

import "./LostPetReportForm.css";

type PetSpecies = "Dog" | "Cat" | "Other";

interface PetRegistrationRow {
  id: string;
  photo_url: string | null;
  name: string;
  species: PetSpecies;
  breed: string | null;
  color_markings: string | null;
  size: string | null;
  registration_number: string;
  owner_name: string;
  profiles?: { phone: string | null };
}

function mapPetRow(row: PetRegistrationRow): LostPetRegistrationSnapshot {
  return {
    petPhotoUrl: row.photo_url,
    petName: row.name,
    species: row.species,
    breed: row.breed,
    color: row.color_markings,
    size: row.size,
    vaccinationDetails: null,
    registrationNumber: row.registration_number,
    ownerName: row.owner_name,
    ownerContactNumber: row.profiles?.phone || null
  };
}

/* ─── SVG Icons (inline tiny) ─── */
const IconAlert = () => (
  <svg width="22" height="22" fill="none" stroke="#E76F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const IconPaw = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="8" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="6" rx="2" ry="2.5"/><ellipse cx="5" cy="11" rx="2" ry="2.5"/><ellipse cx="19" cy="11" rx="2" ry="2.5"/>
    <path d="M12 18c-2.5 0-4.5-1.5-5-3.5 0-1 1-2 2-2.5.6-.3 1.3-.5 2-.5h2c.7 0 1.4.2 2 .5 1 .5 2 1.5 2 2.5-.5 2-2.5 3.5-5 3.5z"/>
  </svg>
);

const STEP_LABELS = ["Select Pet", "Location & Details", "Contact & Review"];

/* ═══════════════════════════════════════ COMPONENT ═══════════════════════════════════════ */

export function LostPetReportForm() {
  const router = useRouter();

  /* ── auth / role ── */
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [role, setRole] = useState<FilingUserRole | null>(null);

  /* ── pet selection ── */
  const [ownerPets, setOwnerPets] = useState<PetRegistrationRow[]>([]);
  const [selectedPetRegNumber, setSelectedPetRegNumber] = useState<string>("");

  /* ── custom (unregistered) pet ── */
  const [customPetName, setCustomPetName] = useState("");
  const [customSpecies, setCustomSpecies] = useState<PetSpecies>("Dog");
  const [customBreed, setCustomBreed] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [userName, setUserName] = useState("Owner");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const [customPhotoFile, setCustomPhotoFile] = useState<File | null>(null);
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── barangay fields ── */
  const [petBehavior, setPetBehavior] = useState<string>("Friendly");
  const [rewardOffered, setRewardOffered] = useState<string>("");
  const [specificPurok, setSpecificPurok] = useState<string>("");
  const [alternateContact, setAlternateContact] = useState<string>("");

  const isOther = selectedPetRegNumber === "OTHER";

  const selectedPet = useMemo(() => {
    if (isOther) return null;
    const row = ownerPets.find((p) => p.registration_number === selectedPetRegNumber);
    return row ? mapPetRow(row) : null;
  }, [ownerPets, selectedPetRegNumber, isOther]);

  /* ── staff search ── */
  const [staffSearch, setStaffSearch] = useState("");
  const [staffSearchResults, setStaffSearchResults] = useState<PetRegistrationRow[]>([]);
  const [selectedStaffPetId, setSelectedStaffPetId] = useState<string>("");
  const selectedStaffPet = useMemo(() => {
    const row = staffSearchResults.find((p) => p.id === selectedStaffPetId);
    return row ? mapPetRow(row) : null;
  }, [selectedStaffPetId, staffSearchResults]);

  const petSnapshot = role === "Staff" ? selectedStaffPet : selectedPet;

  /* ── location & details ── */
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [lastKnownLocation, setLastKnownLocation] = useState("");
  const [missingAt, setMissingAt] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  /* ── MULTI-STEP ── */
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const canSubmit = useMemo(() => {
    const hasPet = isOther ? Boolean(customPetName.trim()) : Boolean(petSnapshot);
    return hasPet && Boolean(lastKnownLocation.trim()) && Boolean(missingAt) && confirmed;
  }, [lastKnownLocation, missingAt, petSnapshot, isOther, customPetName, confirmed]);

  const canGoStep1 = isOther ? Boolean(customPetName.trim()) : Boolean(petSnapshot);
  const canGoStep2 = Boolean(lastKnownLocation.trim()) && Boolean(missingAt);

  /* ── init ── */
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsAuthLoading(true);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const user = data.user;
      if (!user) {
        router.replace("/login");
        return;
      }

      const userRole = (user.user_metadata?.role as FilingUserRole | undefined) ?? "Owner";
      if (userRole !== "Owner" && userRole !== "Staff" && userRole !== "Admin" && userRole !== "SuperAdmin") {
        router.replace("/");
        return;
      }

      setRole(userRole);
      setUserName((user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Pet Owner");
      setUserId(user.id);
      setUserEmail(user.email || "");
      setIsAuthLoading(false);

      if (userRole === "Owner") {
        const { data: rows, error } = await supabase
          .from("pets")
          .select(`
            id, name, species, breed, color_markings, size, registration_number, owner_name, photo_url,
            profiles!pets_owner_user_id_fkey ( phone )
          `)
          .eq("owner_user_id", user.id)
          .eq("status", "Approved")
          .order("name", { ascending: true });

        if (!mounted) return;
        if (!error && rows) {
          const mapped = (rows as any[]).map(r => ({
             ...r,
             profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
          }));
          setOwnerPets(mapped as PetRegistrationRow[]);
        }
      }
    }

    init();
    return () => { mounted = false; };
  }, [router]);

  /* ── reverse geocoding ── */
  useEffect(() => {
    async function reverseGeocode() {
      if (!mapPosition) return;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition[0]}&lon=${mapPosition[1]}&zoom=18&addressdetails=1`);
        if (!res.ok) return;
        const data = await res.json();
        const address = data.address || {};
        const road = address.road || address.pedestrian || "";
        const suburb = address.suburb || address.village || address.neighbourhood || "";
        const city = address.city || address.town || "";
        
        const desc = [road, city].filter(Boolean).join(", ");
        
        if (desc) setLastKnownLocation(desc);
        if (suburb) setSpecificPurok(suburb);
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    }
    const timer = setTimeout(reverseGeocode, 500);
    return () => clearTimeout(timer);
  }, [mapPosition]);

  /* ── staff search ── */
  async function runStaffSearch() {
    const q = staffSearch.trim();
    if (!q) return;
    setIsSearching(true);
    const supabase = getSupabaseClient();
    const { data: rows, error } = await supabase
      .from("pets")
      .select(`
        id, name, species, breed, color_markings, size, registration_number, owner_name, photo_url,
        profiles!pets_owner_user_id_fkey ( phone )
      `)
      .or(`registration_number.ilike.%${q}%,owner_name.ilike.%${q}%`)
      .limit(25);
    setIsSearching(false);
    if (error) { toast.error(error.message); return; }
    setSelectedStaffPetId("");
    if (rows) {
      const mapped = (rows as any[]).map(r => ({
         ...r,
         profiles: Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
      }));
      setStaffSearchResults(mapped as PetRegistrationRow[]);
    }
  }

  /* ── submit ── */
  async function handleSubmit() {
    if (!role || (!isOther && !petSnapshot) || !canSubmit) return;
    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    let uploadedPhotoUrl: string | null = null;
    if (isOther && customPhotoFile) {
      const ext = customPhotoFile.name.split(".").pop();
      const path = `lost-pets/${userId || "anon"}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, customPhotoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
        uploadedPhotoUrl = urlData.publicUrl;
      }
    }

    const payload = {
      reporter_id: userId,
      status: "Pending" as LostPetReportStatus,
      filing_user_role: role,
      last_known_location: lastKnownLocation.trim(),
      missing_at: new Date(missingAt).toISOString(),
      notes: notes.trim() ? notes.trim() : null,
      pet_photo_url: isOther ? uploadedPhotoUrl : petSnapshot?.petPhotoUrl,
      pet_name: isOther ? customPetName.trim() : petSnapshot?.petName,
      species: isOther ? customSpecies : petSnapshot?.species,
      breed: isOther ? (customBreed.trim() || null) : petSnapshot?.breed,
      color: isOther ? (customColor.trim() || null) : petSnapshot?.color,
      size: isOther ? null : petSnapshot?.size,
      vaccination_details: isOther ? null : petSnapshot?.vaccinationDetails,
      registration_number: isOther ? null : petSnapshot?.registrationNumber,
      latitude: mapPosition ? mapPosition[0] : null,
      longitude: mapPosition ? mapPosition[1] : null,
      pet_behavior: petBehavior,
      reward_amount: rewardOffered.trim() || null,
      specific_purok: specificPurok.trim() || null,
      contact_info: alternateContact.trim() || (isOther ? userEmail : petSnapshot?.ownerContactNumber),
      owner_name: isOther ? userName : petSnapshot?.ownerName,
      owner_contact_number: isOther ? userEmail : petSnapshot?.ownerContactNumber
    };

    const { error } = await supabase.from("lost_pet_reports").insert(payload as never);
    setIsSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Lost pet report submitted for review.");
    router.replace("/lost-pets");
  }

  /* ═══ RENDER ═══ */

  if (isAuthLoading) {
    return (
      <div className="lpr-wrapper">
        <div className="lpr-header" style={{ borderRadius: 16 }}>
          <div className="lpr-header-row">
            <div className="lpr-header-left">
              <div className="lpr-header-icon"><IconAlert /></div>
              <div><h1>Report a Lost Pet</h1><p>Preparing your report form…</p></div>
            </div>
          </div>
        </div>
        <div className="lpr-body" style={{ borderRadius: "0 0 16px 16px" }}>
          <div className="lpr-loading">
            <div className="spinner" />
            <p>Loading your registered pets…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ─── pet display name for summary ─── */
  const displayPetName = isOther ? customPetName : petSnapshot?.petName || "—";
  const displaySpecies = isOther ? customSpecies : petSnapshot?.species || "—";
  const displayBreed = isOther ? customBreed : petSnapshot?.breed || "";
  const displayColor = isOther ? customColor : petSnapshot?.color || "";
  const displaySize = isOther ? "—" : petSnapshot?.size || "";
  const displayRegNum = isOther ? "Unregistered" : petSnapshot?.registrationNumber || "—";
  const displayContact = alternateContact.trim() || (isOther ? userEmail : petSnapshot?.ownerContactNumber) || "—";

  return (
    <div className="lpr-wrapper">
      {/* ═══ HEADER ═══ */}
      <div className="lpr-header">
        <div className="lpr-header-row">
          <div className="lpr-header-left">
            <div className="lpr-header-icon"><IconAlert /></div>
            <div>
              <h1>Report a Lost Pet</h1>
              <p>File an official lost pet report with your barangay</p>
            </div>
          </div>
          <button className="lpr-close-btn" onClick={() => router.back()} aria-label="Close" title="Go back">
            <IconX />
          </button>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="lpr-body">

        {/* ─── Step Indicator ─── */}
        <div className="lpr-stepper">
          {STEP_LABELS.map((label, i) => {
            const isCompleted = i < step;
            const isActive = i === step;
            return (
              <div key={label} className={`lpr-step ${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}>
                <div className={`lpr-step-circle ${isCompleted ? "completed" : isActive ? "active" : "inactive"}`}>
                  {isCompleted ? <IconCheck /> : i + 1}
                </div>
                <span className="lpr-step-label">{label}</span>
              </div>
            );
          })}
          {/* connector lines */}
          <div className="lpr-step-line" style={{ left: "calc(16.66% + 20px)", width: "calc(33.33% - 40px)" , ...(step > 0 ? { background: "#22c55e" } : {}) }} />
          <div className="lpr-step-line" style={{ left: "calc(50% + 20px)", width: "calc(33.33% - 40px)", ...(step > 1 ? { background: "#22c55e" } : {}) }} />
        </div>

        {/* ═══════════ STEP 1: Select Pet ═══════════ */}
        {step === 0 && (
          <div className="lpr-step-content">
            <div className="lpr-section">
              <div className="lpr-section-title">
                <span className="accent-bar" />
                <IconPaw />
                {role === "Owner" ? "Select Your Registered Pet" : "Search & Select Pet"}
              </div>
              <p className="lpr-section-subtitle">
                {role === "Owner"
                  ? "Choose from your certified registered pets, or select 'Other' for an unregistered pet."
                  : "Search by registration number or owner name to locate a pet."}
              </p>

              {role === "Owner" ? (
                <div className="lpr-form-group">
                  <label className="lpr-label">Registered Pet <span className="required">*</span></label>
                  <select
                    className="lpr-select"
                    value={selectedPetRegNumber}
                    onChange={(e) => setSelectedPetRegNumber(e.target.value)}
                  >
                    <option value="">— Select a pet —</option>
                    {ownerPets.length > 0 && (
                      <optgroup label="Your Registered Pets">
                        {ownerPets.map((p) => (
                          <option key={p.id} value={p.registration_number}>
                            {p.name} — {p.registration_number}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="Other">
                      <option value="OTHER">Other / Unregistered Pet…</option>
                    </optgroup>
                  </select>
                </div>
              ) : (
                /* Staff search */
                <>
                  <div className="lpr-form-group">
                    <label className="lpr-label">Search Pet <span className="required">*</span></label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        className="lpr-input"
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="e.g. BRGY-000123 or Juan Dela Cruz"
                      />
                      <button type="button" className="lpr-btn lpr-btn-primary" disabled={isSearching} onClick={runStaffSearch} style={{ flexShrink: 0 }}>
                        {isSearching ? "…" : "Search"}
                      </button>
                    </div>
                  </div>
                  <div className="lpr-form-group">
                    <label className="lpr-label">Select from results</label>
                    <select
                      className="lpr-select"
                      value={selectedStaffPetId}
                      onChange={(e) => setSelectedStaffPetId(e.target.value)}
                      disabled={staffSearchResults.length === 0}
                    >
                      <option value="">
                        {staffSearchResults.length === 0 ? "Search first…" : "Select a pet…"}
                      </option>
                      {staffSearchResults.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.registration_number} — {p.owner_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* ── Selected pet card ── */}
              {!isOther && petSnapshot && (
                <div className="lpr-pet-card">
                  <div className="lpr-pet-avatar">
                    {petSnapshot.petPhotoUrl ? (
                      <img src={petSnapshot.petPhotoUrl} alt={petSnapshot.petName} />
                    ) : (
                      <span className="fallback">{petSnapshot.petName.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="lpr-pet-info">
                    <h3>{petSnapshot.petName}</h3>
                    <p className="species-breed">
                      {petSnapshot.species}{petSnapshot.breed ? ` • ${petSnapshot.breed}` : ""}
                    </p>
                    <p className="reg-number">{petSnapshot.registrationNumber}</p>
                    <div className="lpr-pet-pills">
                      {petSnapshot.color && <span className="lpr-pet-pill">{petSnapshot.color}</span>}
                      {petSnapshot.size && <span className="lpr-pet-pill">{petSnapshot.size}</span>}
                      <span className="lpr-pet-pill">{petSnapshot.species}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Unregistered pet form ── */}
              {isOther && role === "Owner" && (
                <div style={{ marginTop: 16 }}>
                  <div className="lpr-form-group">
                    <label className="lpr-label">Pet Photo <span className="required">*</span></label>
                    <input
                      type="file" accept="image/*" ref={fileRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { toast.error("File is too large (max 5MB)"); return; }
                          setCustomPhotoFile(file);
                          const reader = new FileReader();
                          reader.onload = (ev) => setCustomPhotoPreview(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: "none" }}
                    />
                    <div className="lpr-photo-upload">
                      <div className="lpr-photo-preview">
                        {customPhotoPreview
                          ? <img src={customPhotoPreview} alt="Preview" />
                          : <span>No image</span>
                        }
                      </div>
                      <button type="button" className="lpr-btn lpr-btn-outline" onClick={() => fileRef.current?.click()}>
                        Choose Image
                      </button>
                    </div>
                  </div>

                  <div className="lpr-form-group">
                    <label className="lpr-label">Pet Name <span className="required">*</span></label>
                    <input className="lpr-input" value={customPetName} onChange={e => setCustomPetName(e.target.value)} placeholder="Enter pet name" />
                  </div>

                  <div className="lpr-form-row">
                    <div className="lpr-form-group">
                      <label className="lpr-label">Species <span className="required">*</span></label>
                      <select className="lpr-select" value={customSpecies} onChange={e => setCustomSpecies(e.target.value as PetSpecies)}>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="lpr-form-group">
                      <label className="lpr-label">Breed</label>
                      <input className="lpr-input" value={customBreed} onChange={e => setCustomBreed(e.target.value)} placeholder="e.g. Aspin, Poodle" />
                    </div>
                    <div className="lpr-form-group">
                      <label className="lpr-label">Color</label>
                      <input className="lpr-input" value={customColor} onChange={e => setCustomColor(e.target.value)} placeholder="e.g. Black, White" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ STEP 2: Location & Details ═══════════ */}
        {step === 1 && (
          <div className="lpr-step-content">
            {/* Where */}
            <div className="lpr-section">
              <div className="lpr-section-title">
                <span className="accent-bar coral" />
                <IconMapPin />
                Where was your pet last seen?
              </div>

              <div className="lpr-form-row">
                <div className="lpr-form-group">
                  <label className="lpr-label">Last Known Location <span className="required">*</span></label>
                  <div className="lpr-input-icon-wrapper">
                    <span className="icon"><IconMapPin /></span>
                    <input
                      className="lpr-input with-icon"
                      value={lastKnownLocation}
                      onChange={(e) => setLastKnownLocation(e.target.value)}
                      placeholder="e.g. Near corner Rizal St."
                    />
                  </div>
                </div>
                <div className="lpr-form-group">
                  <label className="lpr-label">Specific Purok / Block / Zone <span className="required">*</span></label>
                  <input
                    className="lpr-input"
                    value={specificPurok}
                    onChange={(e) => setSpecificPurok(e.target.value)}
                    placeholder="e.g. Purok 4, Zone 2"
                  />
                </div>
              </div>

              <div className="lpr-form-row">
                <div className="lpr-form-group">
                  <label className="lpr-label">Date & Time Pet Went Missing <span className="required">*</span></label>
                  <input
                    className="lpr-input"
                    type="datetime-local"
                    value={missingAt}
                    onChange={(e) => setMissingAt(e.target.value)}
                  />
                </div>
                <div className="lpr-form-group">
                  <label className="lpr-label">Pet Behavior State</label>
                  <select className="lpr-select" value={petBehavior} onChange={(e) => setPetBehavior(e.target.value)}>
                    <option value="Friendly">🟢 Friendly / Approachable</option>
                    <option value="Timid / Scared">🟡 Timid / Scared (Might run away)</option>
                    <option value="Aggressive / Bites">🔴 Aggressive / Bites</option>
                    <option value="Needs Medication">💊 Needs Medication Urgently</option>
                  </select>
                </div>
              </div>

              {/* Map */}
              <div className="lpr-form-group" style={{ marginTop: 4 }}>
                <label className="lpr-label">Pin the exact location on the map (optional)</label>
                <div className="lpr-map-container">
                  <LocationPicker position={mapPosition} onChangePosition={setMapPosition} />
                </div>
                <p className="lpr-map-hint">Click anywhere on the map to drop a pin. This helps Barangay Tanods locate the area faster.</p>
              </div>
            </div>

            {/* Additional Details */}
            <div className="lpr-section">
              <div className="lpr-section-title">
                <span className="accent-bar amber" />
                Additional Details
              </div>

              <div className="lpr-form-row">
                <div className="lpr-form-group">
                  <label className="lpr-label">Reward Offered</label>
                  <div className="lpr-peso-wrapper">
                    <span className="prefix">₱</span>
                    <input
                      className="lpr-input"
                      value={rewardOffered}
                      onChange={(e) => setRewardOffered(e.target.value)}
                      placeholder="2,000"
                    />
                  </div>
                </div>
              </div>

              <div className="lpr-form-group">
                <label className="lpr-label">Notes</label>
                <textarea
                  className="lpr-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Distinguishing marks, last seen wearing collar, behavior, preferred treats, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ STEP 3: Contact & Review ═══════════ */}
        {step === 2 && (
          <div className="lpr-step-content">
            {/* Contact */}
            <div className="lpr-section">
              <div className="lpr-section-title">
                <span className="accent-bar green" />
                Contact Information
              </div>

              <div className="lpr-form-row">
                <div className="lpr-form-group">
                  <label className="lpr-label">Primary Contact (from profile)</label>
                  <input className="lpr-input" readOnly value={isOther ? userEmail : petSnapshot?.ownerContactNumber || userName} />
                </div>
                <div className="lpr-form-group">
                  <label className="lpr-label">Alternate Contact Info</label>
                  <input
                    className="lpr-input"
                    value={alternateContact}
                    onChange={(e) => setAlternateContact(e.target.value)}
                    placeholder="Phone or alternative email"
                  />
                </div>
              </div>
            </div>

            {/* Report Summary */}
            <div className="lpr-section">
              <div className="lpr-section-title">
                <span className="accent-bar" />
                Report Summary
              </div>

              <div className="lpr-summary-card">
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Pet Name</span>
                  <span className="lpr-summary-value">{displayPetName}</span>
                </div>
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Species / Breed</span>
                  <span className="lpr-summary-value">{displaySpecies}{displayBreed ? ` / ${displayBreed}` : ""}</span>
                </div>
                {displayColor && (
                  <div className="lpr-summary-row">
                    <span className="lpr-summary-label">Color</span>
                    <span className="lpr-summary-value">{displayColor}</span>
                  </div>
                )}
                {displaySize && (
                  <div className="lpr-summary-row">
                    <span className="lpr-summary-label">Size</span>
                    <span className="lpr-summary-value">{displaySize}</span>
                  </div>
                )}
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Registration #</span>
                  <span className="lpr-summary-value" style={{ fontFamily: "monospace", color: "#3b82f6" }}>{displayRegNum}</span>
                </div>
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Location</span>
                  <span className="lpr-summary-value">{lastKnownLocation}{specificPurok ? ` (${specificPurok})` : ""}</span>
                </div>
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Date / Time</span>
                  <span className="lpr-summary-value">{missingAt ? new Date(missingAt).toLocaleString() : "—"}</span>
                </div>
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Behavior</span>
                  <span className="lpr-summary-value">{petBehavior}</span>
                </div>
                {rewardOffered.trim() && (
                  <div className="lpr-summary-row">
                    <span className="lpr-summary-label">Reward</span>
                    <span className="lpr-summary-value" style={{ color: "#22c55e" }}>₱{rewardOffered}</span>
                  </div>
                )}
                <div className="lpr-summary-row">
                  <span className="lpr-summary-label">Contact</span>
                  <span className="lpr-summary-value">{displayContact}</span>
                </div>
                {notes.trim() && (
                  <div className="lpr-summary-row">
                    <span className="lpr-summary-label">Notes</span>
                    <span className="lpr-summary-value">{notes}</span>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="lpr-confirm-row">
                <input type="checkbox" id="lprConfirm" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                <label htmlFor="lprConfirm">
                  I confirm that the information provided is accurate and I am the registered owner of this pet.
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Navigation Footer ═══ */}
        <div className="lpr-footer">
          <div>
            {step === 0 ? (
              <button type="button" className="lpr-btn-text" onClick={() => router.back()}>Cancel</button>
            ) : (
              <button type="button" className="lpr-btn lpr-btn-outline" onClick={() => setStep(step - 1)}>
                ← Previous
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {step === 0 && (
              <button type="button" className="lpr-btn lpr-btn-primary" disabled={!canGoStep1} onClick={() => setStep(1)}>
                Next →
              </button>
            )}
            {step === 1 && (
              <button type="button" className="lpr-btn lpr-btn-primary" disabled={!canGoStep2} onClick={() => setStep(2)}>
                Next →
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                className="lpr-btn lpr-btn-danger"
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
              >
                <IconAlert />
                {isSubmitting ? "Submitting…" : "Submit Report"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
