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
  IconSpinner,
} from "@/components/icons";

export default function AdminLoginPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const canSubmit = useMemo(
    () => Boolean(email.trim()) && Boolean(password),
    [email, password]
  );

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
      password,
    });
    setIsLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("email")) {
        setEmailError(error.message);
      } else if (error.message.toLowerCase().includes("password")) {
        setPasswordError(error.message);
      } else {
        setEmailError(error.message);
      }
      return;
    }

    // Verify user has admin role
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const role = user?.user_metadata?.role as string | undefined;

    if (role !== "Admin" && role !== "SuperAdmin") {
      toast.error("Access denied. This login is for administrators only.");
      await supabase.auth.signOut();
      return;
    }

    toast.success("Welcome back, Admin!");
    router.replace("/admin");
  }

  return (
    <div style={styles.page}>
      {/* Background decoration */}
      <div style={styles.bgGlow1} aria-hidden="true" />
      <div style={styles.bgGlow2} aria-hidden="true" />

      <div style={styles.card}>
        {/* Shield icon */}
        <div style={styles.shieldWrap}>
          <IconShield size={32} />
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>
              <IconPaw size={20} />
            </div>
            <span style={styles.logoText}>AlagaLahat</span>
          </div>
          <h1 style={styles.heading}>Admin Portal</h1>
          <p style={styles.subtext}>
            Sign in with your administrator credentials
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} noValidate style={styles.form}>
          {/* Email */}
          <div style={styles.fieldGroup}>
            <Label htmlFor="admin-email" style={styles.label}>
              Admin Email
            </Label>
            <Input
              ref={emailRef}
              id="admin-email"
              name="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              placeholder="admin@barangay.gov"
              error={emailError}
              leftIcon={<IconMail size={18} />}
              aria-required="true"
            />
            {emailError && (
              <p role="alert" aria-live="polite" style={styles.errorMsg}>
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={styles.fieldGroup}>
            <Label htmlFor="admin-password" style={styles.label}>
              Password
            </Label>
            <Input
              id="admin-password"
              name="admin-password"
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
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              }
            />
            {passwordError && (
              <p role="alert" aria-live="polite" style={styles.errorMsg}>
                {passwordError}
              </p>
            )}
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!canSubmit || isLoading}
            style={{
              width: "100%",
              height: 48,
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              background: "linear-gradient(135deg, #1B4F8A 0%, #0f2d52 100%)",
            }}
            aria-label="Sign in as Admin"
          >
            {isLoading ? (
              <>
                <IconSpinner size={20} />
                <span>Authenticating…</span>
              </>
            ) : (
              <>
                <IconShield size={18} style={{ marginRight: 6 }} />
                Sign In as Admin
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        {/* Back to regular login */}
        <p style={styles.bottomLink}>
          <Link href="/login" style={styles.backLink}>
            ← Back to regular sign in
          </Link>
        </p>

        {/* Security notice */}
        <div style={styles.securityNotice}>
          <IconShield size={14} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            This portal is restricted to authorized Barangay administrators.
            Unauthorized access attempts are logged.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================
   Styles
   ============================================ */
const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(165deg, #0a1929 0%, #0f2d52 40%, #153d6b 100%)",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  },
  bgGlow1: {
    position: "absolute",
    top: "15%",
    left: "20%",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(27,79,138,0.3) 0%, transparent 70%)",
    filter: "blur(60px)",
    pointerEvents: "none",
  },
  bgGlow2: {
    position: "absolute",
    bottom: "10%",
    right: "15%",
    width: 350,
    height: 350,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(233,196,106,0.15) 0%, transparent 70%)",
    filter: "blur(50px)",
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: "40px 36px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
  },
  shieldWrap: {
    position: "absolute",
    top: -24,
    left: "50%",
    transform: "translateX(-50%)",
    width: 56,
    height: 56,
    borderRadius: 16,
    background: "linear-gradient(135deg, #1B4F8A 0%, #E9C46A 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    boxShadow: "0 8px 24px rgba(27,79,138,0.4)",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "rgba(255,255,255,0.1)",
    color: "#E9C46A",
  },
  logoText: {
    fontWeight: 700,
    fontSize: 18,
    color: "#fff",
    letterSpacing: "-0.01em",
  },
  heading: {
    fontSize: 26,
    fontWeight: 800,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    margin: "8px 0 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255,255,255,0.8)",
  },
  errorMsg: {
    margin: 0,
    fontSize: 13,
    color: "#ff6b6b",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  togglePasswordBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    borderRadius: 8,
  },
  divider: {
    position: "relative",
    textAlign: "center",
    margin: "24px 0",
    height: 1,
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(15,45,82,0.9)",
    padding: "0 12px",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    fontWeight: 600,
  },
  bottomLink: {
    textAlign: "center",
    margin: 0,
    fontSize: 14,
  },
  backLink: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: 600,
    textDecoration: "none",
  },
  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 24,
    padding: "12px 14px",
    borderRadius: 10,
    background: "rgba(233,196,106,0.08)",
    border: "1px solid rgba(233,196,106,0.15)",
    fontSize: 11,
    color: "rgba(233,196,106,0.7)",
    lineHeight: 1.5,
  },
};
