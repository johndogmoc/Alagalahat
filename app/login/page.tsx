"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import {
  IconPaw,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconShield,
  IconSyringe,
  IconAlertTriangle,
  IconGoogle,
  IconBarangaySeal,
  IconSpinner,
  IconCheck
} from "@/components/icons";

/* ---- Feature cards shown on left panel ---- */
const features = [
  {
    icon: IconPaw,
    title: "Pet Registration",
    desc: "Register and track your household pets"
  },
  {
    icon: IconSyringe,
    title: "Vaccination Tracking",
    desc: "Monitor vaccination schedules & records"
  },
  {
    icon: IconAlertTriangle,
    title: "Lost Pet Alerts",
    desc: "Community-wide lost & found notifications"
  }
];

export default function LoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Per-field error state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const canSubmit = useMemo(
    () => Boolean(email.trim()) && Boolean(password),
    [email, password]
  );

  // Autofocus on email field
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  function clearErrors() {
    setEmailError("");
    setPasswordError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearErrors();

    // Client-side validation
    if (!email.trim()) {
      setEmailError("Email address is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setIsLoading(false);

    if (error) {
      // Map common errors to specific fields
      if (error.message.toLowerCase().includes("email")) {
        setEmailError(error.message);
      } else if (error.message.toLowerCase().includes("password")) {
        setPasswordError(error.message);
      } else {
        // Generic — show on both
        setEmailError(error.message);
      }
      return;
    }

    toast.success("Welcome back!");
    router.replace("/");
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` }
    });
    if (error) toast.error(error.message);
  }

  return (
    <div style={styles.page}>
      {/* ====== LEFT PANEL — Brand ====== */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          {/* Decorative background shapes */}
          <div style={styles.bgCircle1} aria-hidden="true" />
          <div style={styles.bgCircle2} aria-hidden="true" />

          {/* Logo */}
          <div style={styles.logoBlock} className="animate-fade-in">
            <div style={styles.logoIcon}>
              <IconPaw size={40} />
            </div>
            <h1 style={styles.logoText}>AlagaLahat</h1>
          </div>

          {/* Tagline */}
          <p style={styles.tagline} className="animate-fade-in stagger-1">
            Protecting your pets,
            <br />
            serving your barangay
          </p>

          {/* Features */}
          <div style={styles.featureList}>
            {features.map((feat, i) => {
              const FeatIcon = feat.icon;
              return (
                <div
                  key={feat.title}
                  style={styles.featureCard}
                  className={`animate-fade-in stagger-${i + 2}`}
                >
                  <div style={styles.featureIconWrap}>
                    <FeatIcon size={20} />
                  </div>
                  <div>
                    <p style={styles.featureTitle}>{feat.title}</p>
                    <p style={styles.featureDesc}>{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Barangay seal */}
          <div style={styles.sealRow} className="animate-fade-in stagger-5">
            <IconBarangaySeal size={20} style={{ opacity: 0.6 }} />
            <span style={styles.sealText}>
              Official Barangay Pet Management System
            </span>
          </div>
        </div>
      </div>

      {/* ====== RIGHT PANEL — Form ====== */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrapper}>
          {/* Mobile logo (shown only on small screens) */}
          <div className="mobile-logo" style={styles.mobileLogo}>
            <div style={{ ...styles.logoIcon, background: "var(--color-primary)" }}>
              <IconPaw size={28} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "var(--font-size-xl)", color: "var(--color-primary)" }}>
              AlagaLahat
            </span>
          </div>

          <div className="animate-fade-in">
            <h2 style={styles.formHeading}>Welcome back</h2>
            <p style={styles.formSubtext}>
              Sign in to your AlagaLahat account
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            style={styles.form}
            className="animate-fade-in stagger-1"
          >
            {/* Email */}
            <div style={styles.fieldGroup}>
              <Label htmlFor="login-email" style={styles.label}>
                Email address
              </Label>
              <Input
                ref={emailRef}
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                placeholder="you@barangay.gov"
                error={emailError}
                leftIcon={<IconMail size={18} />}
                aria-required="true"
              />
              {emailError && (
                <p
                  id="login-email-error"
                  role="alert"
                  aria-live="polite"
                  style={styles.errorMsg}
                >
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={styles.fieldGroup}>
              <Label htmlFor="login-password" style={styles.label}>
                Password
              </Label>
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Enter your password"
                error={passwordError}
                leftIcon={<IconLock size={18} />}
                aria-required="true"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={styles.togglePasswordBtn}
                  >
                    {showPassword ? (
                      <IconEyeOff size={18} />
                    ) : (
                      <IconEye size={18} />
                    )}
                  </button>
                }
              />
              {passwordError && (
                <p
                  id="login-password-error"
                  role="alert"
                  aria-live="polite"
                  style={styles.errorMsg}
                >
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div style={styles.rememberRow}>
              <label
                htmlFor="remember-me"
                style={styles.checkboxLabel}
              >
                <span style={styles.checkboxOuter}>
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={styles.checkboxHidden}
                  />
                  <span
                    style={{
                      ...styles.checkboxVisual,
                      background: rememberMe
                        ? "var(--color-primary)"
                        : "var(--color-card)",
                      borderColor: rememberMe
                        ? "var(--color-primary)"
                        : "var(--color-input-border)"
                    }}
                  >
                    {rememberMe && <IconCheck size={14} style={{ color: "#fff" }} />}
                  </span>
                </span>
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                style={styles.forgotLink}
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!canSubmit || isLoading}
              style={{ width: "100%", height: 48, fontSize: "var(--font-size-base)", fontWeight: 600 }}
              aria-label="Sign in to your account"
            >
              {isLoading ? (
                <>
                  <IconSpinner size={20} />
                  <span>Signing in…</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            {/* Google Sign-In */}
            <button
              type="button"
              onClick={signInWithGoogle}
              style={styles.googleBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <IconGoogle size={20} />
              <span>Sign in with Google</span>
            </button>
          </form>

          {/* Bottom link */}
          <p style={styles.bottomLink} className="animate-fade-in stagger-3">
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.registerLink}>
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { width: 100% !important; }
          .mobile-logo { display: flex !important; }
        }
        @media (min-width: 901px) {
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ============================================
   Inline Styles (typed for Next.js)
   ============================================ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--color-background)"
  },

  /* --- Left Panel --- */
  leftPanel: {
    position: "relative",
    width: "45%",
    background: "linear-gradient(165deg, #1B4F8A 0%, #153d6b 50%, #0f2d52 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    padding: "var(--space-8)"
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    maxWidth: 420,
    width: "100%"
  },
  bgCircle1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.04)",
    zIndex: 0
  },
  bgCircle2: {
    position: "absolute",
    bottom: -120,
    left: -60,
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    zIndex: 0
  },
  logoBlock: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 32
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 64,
    height: 64,
    borderRadius: 16,
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(8px)",
    color: "#fff"
  },
  logoText: {
    fontSize: 32,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    margin: 0,
    color: "#fff"
  },
  tagline: {
    fontSize: 22,
    fontWeight: 500,
    lineHeight: 1.5,
    opacity: 0.9,
    marginBottom: 48,
    margin: 0,
    paddingBottom: 48,
    color: "#fff"
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginBottom: 48
  },
  featureCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: "12px 16px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(4px)",
    transition: "background 250ms ease"
  },
  featureIconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    flexShrink: 0
  },
  featureTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 15,
    color: "#fff"
  },
  featureDesc: {
    margin: 0,
    marginTop: 2,
    fontSize: 13,
    opacity: 0.7,
    color: "#fff"
  },
  sealRow: {
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  sealText: {
    fontSize: 12,
    opacity: 0.5,
    color: "#fff"
  },

  /* --- Right Panel --- */
  rightPanel: {
    width: "55%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-8)"
  },
  formWrapper: {
    width: "100%",
    maxWidth: 440
  },
  mobileLogo: {
    display: "none",
    alignItems: "center",
    gap: 10,
    marginBottom: 32
  },
  formHeading: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--color-text)",
    margin: 0,
    marginBottom: 8,
    letterSpacing: "-0.01em"
  },
  formSubtext: {
    fontSize: "var(--font-size-base)",
    color: "var(--color-text-muted)",
    margin: 0,
    marginBottom: 32
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20
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
  errorMsg: {
    margin: 0,
    fontSize: "var(--font-size-sm)",
    color: "var(--color-error)",
    display: "flex",
    alignItems: "center",
    gap: 4
  },
  rememberRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    minHeight: 44
  },
  checkboxOuter: {
    position: "relative",
    display: "inline-flex"
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
  forgotLink: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 500,
    color: "var(--color-secondary)",
    textDecoration: "none",
    minHeight: 44,
    display: "flex",
    alignItems: "center"
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    margin: "4px 0"
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "var(--color-border)"
  },
  dividerText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)",
    fontWeight: 500
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
    height: 48,
    border: "2px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    background: "var(--color-card)",
    color: "var(--color-text)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 200ms ease",
    fontFamily: "inherit"
  },
  bottomLink: {
    textAlign: "center",
    marginTop: 28,
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-muted)"
  },
  registerLink: {
    color: "var(--color-secondary)",
    fontWeight: 600,
    textDecoration: "none"
  },
  togglePasswordBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    border: "none",
    background: "transparent",
    color: "var(--color-text-muted)",
    cursor: "pointer",
    borderRadius: "var(--radius-md)",
    transition: "color var(--transition-fast)"
  }
};
