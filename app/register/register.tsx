"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { getRegions, getProvinces, getCities, getBarangays as fetchBarangays } from "@/lib/barangayApi";
import "./register.css";
import {
  IconPaw,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconUser,
  IconClipboard,
  IconCheck,
  IconChevronRight,
  IconSpinner,
  IconBarangaySeal
} from "@/components/icons";

/* ============================================
   Constants
   ============================================ */
const STEPS = ["Account Info", "Personal Details", "Confirmation"] as const;

/* ============================================
   Password strength util
   ============================================ */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "var(--color-coral)" };
  if (score <= 3) return { score: 2, label: "Fair", color: "var(--color-amber)" };
  return { score: 3, label: "Strong", color: "var(--color-success)" };
}

/* ============================================
   Component
   ============================================ */
export default function RegisterPage() {
  const router = useRouter();

  /* --- Step state --- */
  const [step, setStep] = useState(0);
  const liveRef = useRef<HTMLDivElement>(null);

  /* --- Step 1: Account Info --- */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  /* --- Step 2: Personal Details --- */
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [barangay, setBarangay] = useState("");
  const [role, setRole] = useState<"Owner" | "Staff" | "">("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Location API state
  const [locRegion, setLocRegion] = useState("");
  const [locProvince, setLocProvince] = useState("");
  const [locCity, setLocCity] = useState("");
  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [provincesList, setProvincesList] = useState<string[]>([]);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [barangaysList, setBarangaysList] = useState<string[]>([]);
  const [locLoading, setLocLoading] = useState("");

  /* --- Errors --- */
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* --- Submit state --- */
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* --- Email validation --- */
  const emailValid = useMemo(() => {
    if (!email) return true; // don't show error when empty
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  /* --- Announce step changes --- */
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = `Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`;
    }
  }, [step]);

  // Fetch regions on mount
  useEffect(() => {
    setLocLoading("regions");
    getRegions().then(setRegionsList).catch(() => setRegionsList([])).finally(() => setLocLoading(""));
  }, []);

  // Fetch provinces when region changes
  useEffect(() => {
    setLocProvince(""); setLocCity(""); setBarangay("");
    setProvincesList([]); setCitiesList([]); setBarangaysList([]);
    if (!locRegion) return;
    setLocLoading("provinces");
    getProvinces(locRegion).then(setProvincesList).catch(() => setProvincesList([])).finally(() => setLocLoading(""));
  }, [locRegion]);

  // Fetch cities when province changes
  useEffect(() => {
    setLocCity(""); setBarangay("");
    setCitiesList([]); setBarangaysList([]);
    if (!locRegion || !locProvince) return;
    setLocLoading("cities");
    getCities(locRegion, locProvince).then(setCitiesList).catch(() => setCitiesList([])).finally(() => setLocLoading(""));
  }, [locRegion, locProvince]);

  // Fetch barangays when city changes
  useEffect(() => {
    setBarangay("");
    setBarangaysList([]);
    if (!locRegion || !locProvince || !locCity) return;
    setLocLoading("barangays");
    fetchBarangays(locRegion, locProvince, locCity).then(setBarangaysList).catch(() => setBarangaysList([])).finally(() => setLocLoading(""));
  }, [locRegion, locProvince, locCity]);

  /* --- Photo handler --- */
  const handlePhoto = useCallback((file: File | null) => {
    if (!file) {
      setPhotoPreview(null);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: "File must be under 2MB" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, photo: "File must be an image" }));
      return;
    }
    setErrors((p) => { const n = { ...p }; delete n.photo; return n; });
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  /* --- Validation --- */
  function validateStep1(): boolean {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!emailValid) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!confirmPassword) errs.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (!agreeTerms) errs.agreeTerms = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (!phone.trim()) errs.phone = "Contact number is required";
    if (!address.trim()) errs.address = "Address is required";
    if (!barangay) errs.barangay = "Select your barangay";
    if (!role) errs.role = "Select your role";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (step === 0 && !validateStep1()) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* --- Submit --- */
  async function handleSubmit() {
    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: `+63${phone.replace(/^0/, "")}`,
            address: address.trim(),
            barangay,
            region: locRegion,
            province: locProvince,
            city: locCity,
            role
          }
        }
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  }

  /* ============================================
     SUCCESS SCREEN
     ============================================ */
  if (success) {
    return (
      <div style={S.page}>
        <div style={S.successContainer}>
          {/* Animated checkmark */}
          <div style={S.successCircle}>
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <circle cx="32" cy="32" r="30" stroke="var(--color-success)" strokeWidth="4" fill="var(--color-success)" opacity="0.1" />
              <path
                d="M20 33l8 8 16-18"
                stroke="var(--color-success)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "drawCheck 0.6s ease forwards 0.3s", strokeDasharray: 50, strokeDashoffset: 50 }}
              />
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--color-text)", marginTop: 24, textAlign: "center" }}>
            Registration Successful!
          </h1>
          <p style={{ fontSize: "var(--font-size-base)", color: "var(--color-text-muted)", marginTop: 8, textAlign: "center", maxWidth: 400 }}>
            {role === "Staff"
              ? "Your account has been created. An admin will review and approve your staff access before you can log in."
              : "Your account has been created successfully. You can now sign in to start managing your pets."}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/login")}
            style={{ marginTop: 32, minWidth: 200 }}
          >
            Go to Login
          </Button>
          <style>{`
            @keyframes drawCheck {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  /* ============================================
     MAIN FORM
     ============================================ */
  return (
    <div style={S.page}>
      {/* Screen-reader live region */}
      <div ref={liveRef} aria-live="polite" className="sr-only" />

      <div style={S.card} className="reg-card">
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.logoIcon}>
              <IconPaw size={22} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "var(--font-size-lg)", color: "var(--color-primary)" }}>
              AlagaLahat
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--color-text)", marginTop: 16, marginBottom: 4 }}>
            Create your account
          </h1>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: 0 }}>
            Join AlagaLahat and protect your community&apos;s pets
          </p>
        </div>

        {/* Progress Pills */}
        <div style={S.progressRow} role="navigation" aria-label="Registration steps">
          {STEPS.map((label, i) => {
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
                <button
                  type="button"
                  onClick={() => { if (isComplete) { setErrors({}); setStep(i); } }}
                  disabled={!isComplete && !isActive}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${label}${isComplete ? " (completed)" : isActive ? " (current)" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: "var(--radius-full)",
                    border: "2px solid",
                    borderColor: isComplete ? "var(--color-success)" : isActive ? "var(--color-primary)" : "var(--color-border)",
                    background: isComplete ? "var(--color-success)" : isActive ? "var(--color-primary)" : "transparent",
                    color: isComplete || isActive ? "#fff" : "var(--color-text-muted)",
                    fontWeight: 600,
                    fontSize: "var(--font-size-xs)",
                    cursor: isComplete ? "pointer" : "default",
                    transition: "all var(--transition-fast)",
                    whiteSpace: "nowrap",
                    minHeight: 36,
                    fontFamily: "inherit"
                  }}
                >
                  <span style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: isComplete || isActive ? "rgba(255,255,255,0.2)" : "var(--color-background)",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {isComplete ? <IconCheck size={13} /> : i + 1}
                  </span>
                  <span className="step-label">{label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: 2,
                    background: i < step ? "var(--color-success)" : "var(--color-border)",
                    margin: "0 4px",
                    borderRadius: 1,
                    transition: "background var(--transition-base)",
                    minWidth: 16
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div style={S.content} className="animate-fade-in" key={step}>
          {step === 0 && (
            <StepAccountInfo
              fullName={fullName} setFullName={setFullName}
              email={email} setEmail={setEmail} emailValid={emailValid}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              showPassword={showPassword} setShowPassword={setShowPassword}
              showConfirm={showConfirm} setShowConfirm={setShowConfirm}
              agreeTerms={agreeTerms} setAgreeTerms={setAgreeTerms}
              pwStrength={pwStrength}
              errors={errors} setErrors={setErrors}
            />
          )}
          {step === 1 && (
            <StepPersonalDetails
              phone={phone} setPhone={setPhone}
              address={address} setAddress={setAddress}
              barangay={barangay} setBarangay={setBarangay}
              locRegion={locRegion} setLocRegion={setLocRegion}
              locProvince={locProvince} setLocProvince={setLocProvince}
              locCity={locCity} setLocCity={setLocCity}
              regionsList={regionsList}
              provincesList={provincesList}
              citiesList={citiesList}
              barangaysList={barangaysList}
              locLoading={locLoading}
              role={role} setRole={setRole}
              photoPreview={photoPreview}
              dragOver={dragOver} setDragOver={setDragOver}
              handlePhoto={handlePhoto}
              errors={errors} setErrors={setErrors}
            />
          )}
          {step === 2 && (
            <StepConfirmation
              fullName={fullName} email={email} phone={phone}
              address={address} barangay={barangay} role={role}
              photoPreview={photoPreview}
              goToStep={(s: number) => { setErrors({}); setStep(s); }}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={S.navRow}>
          {step > 0 ? (
            <Button variant="outline" onClick={goBack} type="button" aria-label="Go back to previous step">
              ← Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={goNext} type="button">
              Continue <IconChevronRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              disabled={isLoading}
              type="button"
              aria-label="Submit registration"
            >
              {isLoading ? (
                <><IconSpinner size={20} /> Submitting…</>
              ) : (
                "Submit Registration"
              )}
            </Button>
          )}
        </div>

        {/* Bottom link */}
        <p style={{ textAlign: "center", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", marginTop: 20 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--color-secondary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 600px) {
          .step-label { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ============================================
   STEP 1 — Account Info
   ============================================ */
interface Step1Props {
  fullName: string; setFullName: (v: string) => void;
  email: string; setEmail: (v: string) => void; emailValid: boolean;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  showConfirm: boolean; setShowConfirm: (v: boolean) => void;
  agreeTerms: boolean; setAgreeTerms: (v: boolean) => void;
  pwStrength: { score: number; label: string; color: string };
  errors: Record<string, string>; setErrors: (v: Record<string, string>) => void;
}

function StepAccountInfo(p: Step1Props) {
  const clearErr = (key: string) => p.setErrors({ ...p.errors, [key]: "" });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Full Name */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-name" style={S.label}>Full Name</Label>
        <Input
          id="reg-name"
          value={p.fullName}
          onChange={(e) => { p.setFullName(e.target.value); clearErr("fullName"); }}
          placeholder="Juan Dela Cruz"
          error={p.errors.fullName}
          leftIcon={<IconUser size={18} />}
          aria-required="true"
        />
        {p.errors.fullName && <p style={S.errMsg} role="alert">{p.errors.fullName}</p>}
      </div>

      {/* Email */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-email" style={S.label}>Email Address</Label>
        <Input
          id="reg-email"
          type="email"
          value={p.email}
          onChange={(e) => { p.setEmail(e.target.value); clearErr("email"); }}
          placeholder="you@barangay.gov"
          error={p.errors.email || (!p.emailValid && p.email ? "Enter a valid email address" : "")}
          leftIcon={<IconMail size={18} />}
          aria-required="true"
        />
        {(p.errors.email || (!p.emailValid && p.email)) && (
          <p style={S.errMsg} role="alert">{p.errors.email || "Enter a valid email address"}</p>
        )}
      </div>

      {/* Password */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-password" style={S.label}>Password</Label>
        <Input
          id="reg-password"
          type={p.showPassword ? "text" : "password"}
          value={p.password}
          onChange={(e) => { p.setPassword(e.target.value); clearErr("password"); }}
          placeholder="Minimum 6 characters"
          error={p.errors.password}
          leftIcon={<IconLock size={18} />}
          rightIcon={
            <button type="button" onClick={() => p.setShowPassword(!p.showPassword)} aria-label={p.showPassword ? "Hide password" : "Show password"} style={S.toggleBtn}>
              {p.showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          }
          aria-required="true"
        />
        {/* Strength meter */}
        {p.password && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--color-border)", overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(p.pwStrength.score / 3) * 100}%`,
                background: p.pwStrength.color,
                borderRadius: 2,
                transition: "all var(--transition-base)"
              }} />
            </div>
            <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: p.pwStrength.color, whiteSpace: "nowrap" }}>
              {p.pwStrength.label}
            </span>
          </div>
        )}
        {p.errors.password && <p style={S.errMsg} role="alert">{p.errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-confirm" style={S.label}>Confirm Password</Label>
        <Input
          id="reg-confirm"
          type={p.showConfirm ? "text" : "password"}
          value={p.confirmPassword}
          onChange={(e) => { p.setConfirmPassword(e.target.value); clearErr("confirmPassword"); }}
          placeholder="Re-enter your password"
          error={p.errors.confirmPassword}
          leftIcon={<IconLock size={18} />}
          rightIcon={
            <button type="button" onClick={() => p.setShowConfirm(!p.showConfirm)} aria-label={p.showConfirm ? "Hide password" : "Show password"} style={S.toggleBtn}>
              {p.showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          }
          aria-required="true"
        />
        {p.errors.confirmPassword && <p style={S.errMsg} role="alert">{p.errors.confirmPassword}</p>}
      </div>

      {/* Terms checkbox */}
      <div style={S.fieldGroup}>
        <label htmlFor="reg-terms" style={S.checkboxLabel}>
          <span style={S.checkboxOuter}>
            <input
              id="reg-terms"
              type="checkbox"
              checked={p.agreeTerms}
              onChange={(e) => { p.setAgreeTerms(e.target.checked); clearErr("agreeTerms"); }}
              style={S.checkboxHidden}
              aria-required="true"
            />
            <span style={{
              ...S.checkboxVisual,
              background: p.agreeTerms ? "var(--color-primary)" : "var(--color-card)",
              borderColor: p.errors.agreeTerms ? "var(--color-error)" : p.agreeTerms ? "var(--color-primary)" : "var(--color-input-border)"
            }}>
              {p.agreeTerms && <IconCheck size={14} style={{ color: "#fff" }} />}
            </span>
          </span>
          <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.5 }}>
            I agree to the{" "}
            <Link href="/terms" style={{ color: "var(--color-secondary)", fontWeight: 600 }}>Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" style={{ color: "var(--color-secondary)", fontWeight: 600 }}>Privacy Policy</Link>
          </span>
        </label>
        {p.errors.agreeTerms && <p style={S.errMsg} role="alert">{p.errors.agreeTerms}</p>}
      </div>
    </div>
  );
}

/* ============================================
   STEP 2 — Personal Details
   ============================================ */
interface Step2Props {
  phone: string; setPhone: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  barangay: string; setBarangay: (v: string) => void;
  locRegion: string; setLocRegion: (v: string) => void;
  locProvince: string; setLocProvince: (v: string) => void;
  locCity: string; setLocCity: (v: string) => void;
  regionsList: string[];
  provincesList: string[];
  citiesList: string[];
  barangaysList: string[];
  locLoading: string;
  role: "Owner" | "Staff" | ""; setRole: (v: "Owner" | "Staff" | "") => void;
  photoPreview: string | null;
  dragOver: boolean; setDragOver: (v: boolean) => void;
  handlePhoto: (f: File | null) => void;
  errors: Record<string, string>; setErrors: (v: Record<string, string>) => void;
}

function StepPersonalDetails(p: Step2Props) {
  const clearErr = (key: string) => p.setErrors({ ...p.errors, [key]: "" });
  const fileRef = useRef<HTMLInputElement>(null);
  const [geoLocating, setGeoLocating] = useState(false);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data?.display_name) {
            p.setAddress(data.display_name);
            clearErr("address");
            toast.success("Address auto-filled from your location!");
          } else {
            toast.error("Could not determine address from your location.");
          }
        } catch {
          toast.error("Failed to fetch address. Please enter it manually.");
        }
        setGeoLocating(false);
      },
      (err) => {
        setGeoLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location access denied. Please allow location access or enter your address manually.");
        } else {
          toast.error("Could not get your location. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Contact Number */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-phone" style={S.label}>Contact Number</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
            background: "var(--color-background)",
            border: "1px solid var(--color-input-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-text-muted)",
            whiteSpace: "nowrap",
            minHeight: 48,
            userSelect: "none"
          }}>
             +63
          </div>
          <Input
            id="reg-phone"
            type="tel"
            value={p.phone}
            onChange={(e) => { p.setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); clearErr("phone"); }}
            placeholder="9XX XXX XXXX"
            error={p.errors.phone}
            aria-required="true"
          />
        </div>
        {p.errors.phone && <p style={S.errMsg} role="alert">{p.errors.phone}</p>}
      </div>

      {/* Address */}
      <div style={S.fieldGroup}>
        <Label htmlFor="reg-address" style={S.label}>Complete Address</Label>
        <Textarea
          id="reg-address"
          value={p.address}
          onChange={(e) => { p.setAddress(e.target.value); clearErr("address"); }}
          placeholder="House/Block/Lot No., Street, Subdivision, City"
          error={p.errors.address}
          aria-required="true"
        />
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={geoLocating}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            background: "var(--color-background)",
            color: "var(--color-secondary)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 600,
            cursor: geoLocating ? "wait" : "pointer",
            transition: "all var(--transition-fast)",
            fontFamily: "inherit",
            width: "fit-content",
            marginTop: 4,
            opacity: geoLocating ? 0.7 : 1
          }}
          onMouseOver={(e) => { if (!geoLocating) (e.currentTarget.style.background = "var(--color-secondary)"); if (!geoLocating) (e.currentTarget.style.color = "#fff"); }}
          onMouseOut={(e) => { e.currentTarget.style.background = "var(--color-background)"; e.currentTarget.style.color = "var(--color-secondary)"; }}
          aria-label="Auto-fill address using your current location"
        >
          {geoLocating ? (
            <>
              <IconSpinner size={14} />
              Detecting location…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Use my current location
            </>
          )}
        </button>
        {p.errors.address && <p style={S.errMsg} role="alert">{p.errors.address}</p>}
      </div>

      {/* Barangay — Cascading Selects */}
      <div style={S.fieldGroup}>
        <Label style={S.label}>Location (PSGC Official Data)</Label>
        <div className="reg-loc-grid">
          <Select
            value={p.locRegion}
            onChange={(e) => { p.setLocRegion(e.target.value); clearErr("barangay"); }}
          >
            <option value="">{p.locLoading === "regions" ? "Loading regions..." : "Select region"}</option>
            {p.regionsList.map((r) => <option key={r} value={r}>{r}</option>)}
          </Select>
          <Select
            value={p.locProvince}
            onChange={(e) => { p.setLocProvince(e.target.value); clearErr("barangay"); }}
            disabled={!p.locRegion || p.provincesList.length === 0}
          >
            <option value="">{p.locLoading === "provinces" ? "Loading..." : !p.locRegion ? "Select region first" : "Select province"}</option>
            {p.provincesList.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
          </Select>
        </div>
        <div className="reg-loc-grid" style={{ marginTop: 12 }}>
          <Select
            value={p.locCity}
            onChange={(e) => { p.setLocCity(e.target.value); clearErr("barangay"); }}
            disabled={!p.locProvince || p.citiesList.length === 0}
          >
            <option value="">{p.locLoading === "cities" ? "Loading..." : !p.locProvince ? "Select province first" : "Select city"}</option>
            {p.citiesList.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select
            id="reg-barangay"
            value={p.barangay}
            onChange={(e) => { p.setBarangay(e.target.value); clearErr("barangay"); }}
            error={p.errors.barangay}
            aria-required="true"
            disabled={!p.locCity || p.barangaysList.length === 0}
          >
            <option value="">{p.locLoading === "barangays" ? "Loading..." : !p.locCity ? "Select city first" : "Select barangay"}</option>
            {p.barangaysList.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
        </div>
        {p.errors.barangay && <p style={S.errMsg} role="alert">{p.errors.barangay}</p>}
      </div>

      {/* Profile Photo Upload */}
      <div style={S.fieldGroup}>
        <Label style={S.label}>Profile Photo <span style={{ fontWeight: 400, color: "var(--color-text-muted)" }}>(optional, 2MB max)</span></Label>
        <div
          onDragOver={(e) => { e.preventDefault(); p.setDragOver(true); }}
          onDragLeave={() => p.setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            p.setDragOver(false);
            p.handlePhoto(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload profile photo"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          style={{
            border: `2px dashed ${p.dragOver ? "var(--color-primary)" : p.errors.photo ? "var(--color-error)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-lg)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            background: p.dragOver ? "rgba(27,79,138,0.04)" : "var(--color-background)",
            transition: "all var(--transition-fast)",
            minHeight: 120
          }}
        >
          {p.photoPreview ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src={p.photoPreview}
                alt="Photo preview"
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--color-primary)" }}
              />
              <div>
                <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>Photo uploaded</p>
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 2 }}>Click or drop to replace</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-background)", border: "2px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconUser size={24} style={{ color: "var(--color-text-muted)" }} />
              </div>
              <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", textAlign: "center" }}>
                <strong style={{ color: "var(--color-primary)" }}>Click to upload</strong> or drag and drop
              </p>
              <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-light)" }}>JPG, PNG, GIF up to 2MB</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => p.handlePhoto(e.target.files?.[0] ?? null)} />
        {p.errors.photo && <p style={S.errMsg} role="alert">{p.errors.photo}</p>}
      </div>

      {/* Role Selection */}
      <div style={S.fieldGroup}>
        <Label style={S.label}>I am registering as a…</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {([
            { value: "Owner" as const, label: "Pet Owner", desc: "Register and manage your pets", icon: IconPaw },
            { value: "Staff" as const, label: "Barangay Staff", desc: "Manage community pet records", icon: IconClipboard }
          ]).map((opt) => {
            const OptIcon = opt.icon;
            const selected = p.role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { p.setRole(opt.value); clearErr("role"); }}
                role="radio"
                aria-checked={selected}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: 20,
                  border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                  borderRadius: "var(--radius-lg)",
                  background: selected ? "rgba(27,79,138,0.04)" : "var(--color-card)",
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                  textAlign: "center",
                  fontFamily: "inherit",
                  minHeight: 44
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  background: selected ? "var(--color-primary)" : "var(--color-background)",
                  color: selected ? "#fff" : "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--transition-fast)"
                }}>
                  <OptIcon size={24} />
                </div>
                <strong style={{ fontSize: "var(--font-size-sm)", color: selected ? "var(--color-primary)" : "var(--color-text)" }}>
                  {opt.label}
                </strong>
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                  {opt.desc}
                </span>
              </button>
            );
          })}
        </div>
        {p.errors.role && <p style={S.errMsg} role="alert">{p.errors.role}</p>}
      </div>
    </div>
  );
}

/* ============================================
   STEP 3 — Confirmation
   ============================================ */
interface Step3Props {
  fullName: string; email: string; phone: string;
  address: string; barangay: string; role: string;
  photoPreview: string | null;
  goToStep: (s: number) => void;
}

function StepConfirmation(p: Step3Props) {
  const sections = [
    {
      title: "Account Info",
      step: 0,
      rows: [
        { label: "Full Name", value: p.fullName },
        { label: "Email", value: p.email }
      ]
    },
    {
      title: "Personal Details",
      step: 1,
      rows: [
        { label: "Contact", value: `+63 ${p.phone}` },
        { label: "Address", value: p.address },
        { label: "Barangay", value: p.barangay },
        { label: "Role", value: p.role === "Owner" ? "Pet Owner" : "Barangay Staff" }
      ]
    }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", margin: 0 }}>
        Please review your information before submitting.
      </p>

      {/* Photo preview */}
      {p.photoPreview && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={p.photoPreview} alt="Profile preview" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--color-primary)" }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Profile Photo</p>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Will be visible on your profile</p>
          </div>
        </div>
      )}

      {sections.map((sec) => (
        <div key={sec.title} style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "var(--color-background)",
            borderBottom: "1px solid var(--color-border)"
          }}>
            <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>{sec.title}</span>
            <button
              type="button"
              onClick={() => p.goToStep(sec.step)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-secondary)",
                fontWeight: 600,
                fontSize: "var(--font-size-xs)",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: "4px 8px",
                borderRadius: "var(--radius-sm)",
                minHeight: 32,
                minWidth: 44,
                transition: "background var(--transition-fast)"
              }}
              aria-label={`Edit ${sec.title}`}
            >
              Edit
            </button>
          </div>
          <div style={{ padding: "12px 16px" }}>
            {sec.rows.map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-border)" }}>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{row.label}</span>
                <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--color-text)", textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Staff notice */}
      {p.role === "Staff" && (
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          padding: 16,
          borderRadius: "var(--radius-lg)",
          background: "rgba(233,196,106,0.12)",
          border: "1px solid var(--color-amber)"
        }}>
          <IconBarangaySeal size={20} style={{ color: "var(--color-amber-dark)", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
              Admin Approval Required
            </p>
            <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: 4, lineHeight: 1.5 }}>
              Your account will require Admin approval before access is granted.
              You will receive an email notification once your account has been reviewed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   Styles
   ============================================ */
const S: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "32px 16px",
    background: "var(--color-background)"
  },
  card: {
    width: "100%",
    maxWidth: 560,
    background: "var(--color-card)",
    borderRadius: "var(--radius-xl)",
    border: "1px solid var(--color-border)",
    boxShadow: "var(--shadow-lg)",
  },
  header: {
    marginBottom: 24
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: "var(--radius-md)",
    background: "var(--color-primary)",
    color: "#fff"
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    marginBottom: 28,
    padding: "0 4px"
  },
  content: {
    minHeight: 200
  },
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    paddingTop: 20,
    borderTop: "1px solid var(--color-border)"
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6
  },
  label: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--color-text)"
  },
  errMsg: {
    margin: 0,
    fontSize: "var(--font-size-xs)",
    color: "var(--color-error)",
    marginTop: 2
  },
  toggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    border: "none",
    background: "transparent",
    color: "var(--color-text-muted)",
    cursor: "pointer",
    borderRadius: "var(--radius-md)"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    cursor: "pointer",
    minHeight: 44,
    paddingTop: 4
  },
  checkboxOuter: {
    position: "relative",
    display: "inline-flex",
    flexShrink: 0,
    marginTop: 2
  },
  checkboxHidden: {
    position: "absolute",
    opacity: 0,
    width: 0,
    height: 0,
    pointerEvents: "none"
  },
  checkboxVisual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    borderRadius: 6,
    border: "2px solid",
    transition: "all 200ms ease"
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 32
  },
  successCircle: {
    animation: "scaleIn 0.4s ease forwards"
  }
};
