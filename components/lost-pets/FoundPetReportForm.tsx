"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { LocationPicker } from "@/components/LocationPicker";

import "./LostPetReportForm.css";

type PetSpecies = "Dog" | "Cat" | "Bird" | "Rabbit" | "Other";
type PetCondition = "Good" | "Injured" | "Sick" | "Malnourished" | "Unknown";

const STEP_LABELS = ["Pet Details", "Location & Situation", "Contact & Review"];

/* ─── Icons ─── */
const IconFound = () => (
  <svg width="22" height="22" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconPaw = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="8" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="6" rx="2" ry="2.5"/><ellipse cx="5" cy="11" rx="2" ry="2.5"/><ellipse cx="19" cy="11" rx="2" ry="2.5"/>
    <path d="M12 18c-2.5 0-4.5-1.5-5-3.5 0-1 1-2 2-2.5.6-.3 1.3-.5 2-.5h2c.7 0 1.4.2 2 .5 1 .5 2 1.5 2 2.5-.5 2-2.5 3.5-5 3.5z"/>
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);

export function FoundPetReportForm() {
  const router = useRouter();

  /* ── auth ── */
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  /* ── pet description ── */
  const [species, setSpecies] = useState<PetSpecies>("Dog");
  const [breedGuess, setBreedGuess] = useState("");
  const [colorMarkings, setColorMarkings] = useState("");
  const [size, setSize] = useState("Medium");
  const [condition, setCondition] = useState<PetCondition>("Good");
  const [hasCollar, setHasCollar] = useState(false);
  const [collarDetails, setCollarDetails] = useState("");
  const [petBehavior, setPetBehavior] = useState("Friendly");

  /* ── photo ── */
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── location ── */
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [foundLocation, setFoundLocation] = useState("");
  const [foundAt, setFoundAt] = useState("");
  const [specificPurok, setSpecificPurok] = useState("");

  /* ── contact ── */
  const [finderName, setFinderName] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [currentlyWithFinder, setCurrentlyWithFinder] = useState(true);
  const [temporaryShelter, setTemporaryShelter] = useState("");
  const [notes, setNotes] = useState("");

  /* ── form ── */
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canGoStep1 = Boolean(species) && Boolean(colorMarkings.trim());
  const canGoStep2 = Boolean(foundLocation.trim()) && Boolean(foundAt);
  const canSubmit = canGoStep1 && canGoStep2 && Boolean(finderName.trim()) && Boolean(finderContact.trim()) && confirmed;

  /* ── init ── */
  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsAuthLoading(true);
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const user = data.user;
      if (!user) { router.replace("/login"); return; }

      setUserId(user.id);
      const name = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "";
      setUserName(name);
      setFinderName(name);
      setUserEmail(user.email || "");
      setFinderContact(user.user_metadata?.phone || user.email || "");
      setIsAuthLoading(false);
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
        
        if (desc) setFoundLocation(desc);
        if (suburb) setSpecificPurok(suburb);
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    }
    const timer = setTimeout(reverseGeocode, 500);
    return () => clearTimeout(timer);
  }, [mapPosition]);

  /* ── photo handler ── */
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  /* ── submit ── */
  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const supabase = getSupabaseClient();

    let uploadedPhotoUrl: string | null = null;
    if (photoFile) {
      const ext = photoFile.name.split(".").pop();
      const path = `found-pets/${userId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("pet-photos").upload(path, photoFile);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("pet-photos").getPublicUrl(path);
        uploadedPhotoUrl = urlData.publicUrl;
      }
    }

    const payload = {
      reporter_id: userId,
      pet_photo_url: uploadedPhotoUrl,
      species,
      breed_guess: breedGuess.trim() || null,
      color_markings: colorMarkings.trim(),
      size,
      pet_condition: condition,
      has_collar: hasCollar,
      collar_details: hasCollar ? collarDetails.trim() || null : null,
      found_location: foundLocation.trim(),
      found_at: new Date(foundAt).toISOString(),
      latitude: mapPosition ? mapPosition[0] : null,
      longitude: mapPosition ? mapPosition[1] : null,
      specific_purok: specificPurok.trim() || null,
      finder_name: finderName.trim(),
      finder_contact: finderContact.trim(),
      finder_email: userEmail,
      pet_behavior: petBehavior,
      notes: notes.trim() || null,
      currently_with_finder: currentlyWithFinder,
      temporary_shelter: !currentlyWithFinder ? temporaryShelter.trim() || null : null,
      status: "Active"
    };

    const { error } = await supabase.from("found_pet_reports").insert(payload as never);
    setIsSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Found pet report submitted! Thank you for helping.");
    router.replace("/lost-pets");
  }

  /* ═══ RENDER ═══ */

  if (isAuthLoading) {
    return (
      <div className="lpr-wrapper">
        <div className="lpr-header" style={{ borderRadius: 16 }}>
          <div className="lpr-header-row">
            <IconFound /><h2 className="lpr-title">Report a Found Pet</h2>
          </div>
          <p className="lpr-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lpr-wrapper">
      {/* ── Header ── */}
      <div className="lpr-header">
        <div className="lpr-header-row">
          <IconFound />
          <h2 className="lpr-title">Report a Found Pet</h2>
        </div>
        <p className="lpr-subtitle">Help reunite a found pet with its owner.</p>
      </div>

      {/* ── Stepper ── */}
      <div className="lpr-stepper">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className={`lpr-step${step === i ? " lpr-step-active" : ""}${step > i ? " lpr-step-done" : ""}`}>
            <div className="lpr-step-circle">{step > i ? <IconCheck /> : i + 1}</div>
            <span className="lpr-step-label">{label}</span>
            {i < STEP_LABELS.length - 1 && <div className="lpr-step-line" />}
          </div>
        ))}
      </div>

      {/* ═══ STEP 0: Pet Details ═══ */}
      {step === 0 && (
        <div className="lpr-body lpr-fade-in">
          <div className="lpr-section">
            <h3 className="lpr-section-title"><IconPaw /> Describe the Found Pet</h3>

            {/* Photo upload */}
            <div className="lpr-field">
              <label className="lpr-label">Photo of the Found Pet</label>
              <div
                className="lpr-photo-drop"
                onClick={() => fileRef.current?.click()}
                style={photoPreview ? { backgroundImage: `url(${photoPreview})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
              >
                {!photoPreview && (
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--color-text)" }}>Click to upload a photo</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>Helps owners identify their pet</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              </div>
              {photoPreview && (
                <button type="button" className="lpr-btn-ghost" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}>
                  <IconX /> Remove photo
                </button>
              )}
            </div>

            {/* Species */}
            <div className="lpr-field">
              <label className="lpr-label">Species *</label>
              <div className="lpr-radio-row">
                {(["Dog", "Cat", "Bird", "Rabbit", "Other"] as PetSpecies[]).map((s) => (
                  <label key={s} className={`lpr-radio${species === s ? " selected" : ""}`}>
                    <input type="radio" name="species" value={s} checked={species === s} onChange={() => setSpecies(s)} style={{ display: "none" }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Breed guess */}
            <div className="lpr-field">
              <label className="lpr-label">Breed (best guess)</label>
              <input className="lpr-input" placeholder="e.g. Aspin, Poodle mix, Siamese..." value={breedGuess} onChange={(e) => setBreedGuess(e.target.value)} />
            </div>

            {/* Color */}
            <div className="lpr-grid-2">
              <div className="lpr-field">
                <label className="lpr-label">Color / Markings *</label>
                <input className="lpr-input" placeholder="e.g. Brown with white chest" value={colorMarkings} onChange={(e) => setColorMarkings(e.target.value)} />
              </div>
              <div className="lpr-field">
                <label className="lpr-label">Size</label>
                <select className="lpr-input" value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                </select>
              </div>
            </div>

            {/* Condition */}
            <div className="lpr-field">
              <label className="lpr-label">Pet Condition</label>
              <div className="lpr-radio-row">
                {(["Good", "Injured", "Sick", "Malnourished", "Unknown"] as PetCondition[]).map((c) => (
                  <label key={c} className={`lpr-radio${condition === c ? " selected" : ""}`}>
                    <input type="radio" name="condition" value={c} checked={condition === c} onChange={() => setCondition(c)} style={{ display: "none" }} />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            {/* Collar */}
            <div className="lpr-field">
              <label className="lpr-label">Does the pet have a collar or tag?</label>
              <div className="lpr-radio-row">
                <label className={`lpr-radio${hasCollar ? " selected" : ""}`}>
                  <input type="radio" name="collar" checked={hasCollar} onChange={() => setHasCollar(true)} style={{ display: "none" }} />
                  Yes
                </label>
                <label className={`lpr-radio${!hasCollar ? " selected" : ""}`}>
                  <input type="radio" name="collar" checked={!hasCollar} onChange={() => setHasCollar(false)} style={{ display: "none" }} />
                  No
                </label>
              </div>
              {hasCollar && (
                <input className="lpr-input" placeholder="Describe the collar/tag (color, text, etc.)" value={collarDetails} onChange={(e) => setCollarDetails(e.target.value)} style={{ marginTop: 10 }} />
              )}
            </div>

            {/* Behavior */}
            <div className="lpr-field">
              <label className="lpr-label">Pet Behavior When Found</label>
              <select className="lpr-input" value={petBehavior} onChange={(e) => setPetBehavior(e.target.value)}>
                <option value="Friendly">Friendly / Approachable</option>
                <option value="Timid / Scared">Timid / Scared</option>
                <option value="Aggressive">Aggressive</option>
                <option value="Hurt / Limping">Hurt / Limping</option>
                <option value="Calm">Calm / Docile</option>
              </select>
            </div>
          </div>

          <div className="lpr-nav-row">
            <button className="lpr-btn-ghost" onClick={() => router.back()}>Cancel</button>
            <button className="lpr-btn-primary" disabled={!canGoStep1} onClick={() => setStep(1)}>Next: Location →</button>
          </div>
        </div>
      )}

      {/* ═══ STEP 1: Location & Situation ═══ */}
      {step === 1 && (
        <div className="lpr-body lpr-fade-in">
          <div className="lpr-section">
            <h3 className="lpr-section-title"><IconMapPin /> Where Did You Find the Pet?</h3>

            <div className="lpr-field">
              <label className="lpr-label">Location Description *</label>
              <input className="lpr-input" placeholder="e.g. Near Sports Complex, Butuan City" value={foundLocation} onChange={(e) => setFoundLocation(e.target.value)} />
            </div>

            <div className="lpr-grid-2">
              <div className="lpr-field">
                <label className="lpr-label">Specific Purok / Area</label>
                <input className="lpr-input" placeholder="e.g. Purok 3" value={specificPurok} onChange={(e) => setSpecificPurok(e.target.value)} />
              </div>
              <div className="lpr-field">
                <label className="lpr-label">Date & Time Found *</label>
                <input className="lpr-input" type="datetime-local" value={foundAt} onChange={(e) => setFoundAt(e.target.value)} />
              </div>
            </div>

            <div className="lpr-field">
              <label className="lpr-label">Pin location on map (Butuan City)</label>
              <div style={{ height: 300, borderRadius: 12, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                <LocationPicker position={mapPosition} onChangePosition={setMapPosition} />
              </div>
              {mapPosition && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
                  📍 {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                </p>
              )}
            </div>

            {/* Currently with finder? */}
            <div className="lpr-field">
              <label className="lpr-label">Is the pet currently with you?</label>
              <div className="lpr-radio-row">
                <label className={`lpr-radio${currentlyWithFinder ? " selected" : ""}`}>
                  <input type="radio" name="withFinder" checked={currentlyWithFinder} onChange={() => setCurrentlyWithFinder(true)} style={{ display: "none" }} />
                  Yes, with me now
                </label>
                <label className={`lpr-radio${!currentlyWithFinder ? " selected" : ""}`}>
                  <input type="radio" name="withFinder" checked={!currentlyWithFinder} onChange={() => setCurrentlyWithFinder(false)} style={{ display: "none" }} />
                  No
                </label>
              </div>
              {!currentlyWithFinder && (
                <input className="lpr-input" placeholder="Where is the pet now? (e.g. Barangay Hall, neighbor's house)" value={temporaryShelter} onChange={(e) => setTemporaryShelter(e.target.value)} style={{ marginTop: 10 }} />
              )}
            </div>
          </div>

          <div className="lpr-nav-row">
            <button className="lpr-btn-ghost" onClick={() => setStep(0)}>← Back</button>
            <button className="lpr-btn-primary" disabled={!canGoStep2} onClick={() => setStep(2)}>Next: Contact & Review →</button>
          </div>
        </div>
      )}

      {/* ═══ STEP 2: Contact & Review ═══ */}
      {step === 2 && (
        <div className="lpr-body lpr-fade-in">
          <div className="lpr-section">
            <h3 className="lpr-section-title">Your Contact Info</h3>

            <div className="lpr-grid-2">
              <div className="lpr-field">
                <label className="lpr-label">Your Name *</label>
                <input className="lpr-input" value={finderName} onChange={(e) => setFinderName(e.target.value)} />
              </div>
              <div className="lpr-field">
                <label className="lpr-label">Contact Number / Email *</label>
                <input className="lpr-input" value={finderContact} onChange={(e) => setFinderContact(e.target.value)} placeholder="+639..." />
              </div>
            </div>

            <div className="lpr-field">
              <label className="lpr-label">Additional Notes</label>
              <textarea className="lpr-textarea" rows={3} placeholder="Any other details that could help identify the pet or its owner..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Review summary */}
          <div className="lpr-section" style={{ background: "var(--color-background-hover)", borderRadius: 12, padding: 20 }}>
            <h3 className="lpr-section-title" style={{ marginBottom: 12 }}>📋 Report Summary</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
              {photoPreview && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <img src={photoPreview} alt="Found pet" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 10, border: "2px solid var(--color-border)" }} />
                </div>
              )}
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Species</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{species}</p>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Color</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{colorMarkings || "—"}</p>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Size</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{size}</p>
              </div>
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Condition</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{condition}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Found At</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{foundLocation}{specificPurok ? ` (${specificPurok})` : ""}</p>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Finder</span>
                <p style={{ margin: "2px 0 0", fontWeight: 600 }}>{finderName} • {finderContact}</p>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <label className="lpr-confirm" onClick={() => setConfirmed(!confirmed)}>
            <span className={`lpr-checkbox${confirmed ? " checked" : ""}`}>{confirmed && <IconCheck />}</span>
            I confirm that this information is accurate and I found this pet in Butuan City.
          </label>

          <div className="lpr-nav-row">
            <button className="lpr-btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="lpr-btn-primary lpr-btn-submit" disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? "Submitting..." : "✓ Submit Found Pet Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
