"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { IconMail, IconSpinner, IconPaw, IconCheck } from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset link sent!");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  }

  /* ---- Success Screen ---- */
  if (isSuccess) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successContainer}>
            {/* Animated check circle */}
            <div style={styles.successCircle}>
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
                <circle cx="28" cy="28" r="26" stroke="var(--color-success)" strokeWidth="4" fill="var(--color-success)" opacity="0.12" />
                <path
                  d="M18 29l7 7 13-15"
                  stroke="var(--color-success)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "drawCheck 0.6s ease forwards 0.2s", strokeDasharray: 50, strokeDashoffset: 50 }}
                />
              </svg>
            </div>

            <h1 style={styles.heading}>Check your email</h1>
            <p style={styles.subtext}>
              We&apos;ve sent a password reset link to
            </p>
            <p style={{ ...styles.subtext, fontWeight: 600, color: "var(--color-text)", marginBottom: 32 }}>
              {email}
            </p>
            <p style={{ ...styles.subtext, fontSize: "var(--font-size-sm)", marginBottom: 32 }}>
              Click the link in the email to set a new password. If you don&apos;t see it, check your spam folder.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push("/login")}
              style={{ width: "100%" }}
            >
              Back to Login
            </Button>

            <button
              type="button"
              onClick={() => { setIsSuccess(false); setEmail(""); }}
              style={styles.resendBtn}
            >
              Didn&apos;t receive email? Try again
            </button>
          </div>

          <style>{`
            @keyframes drawCheck {
              to { stroke-dashoffset: 0; }
            }
          `}</style>
        </div>
      </div>
    );
  }

  /* ---- Form Screen ---- */
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoBlock}>
          <div style={styles.logoIcon}>
            <IconPaw size={24} />
          </div>
          <span style={styles.logoText}>AlagaLahat</span>
        </div>

        {/* Header */}
        <div style={styles.headerIcon}>
          <IconMail size={32} style={{ color: "var(--color-primary)" }} />
        </div>
        <h1 style={styles.heading}>Reset your password</h1>
        <p style={styles.subtext}>
          Enter the email address linked to your account and we&apos;ll send you a link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={onSubmit} noValidate style={styles.form}>
          <div style={styles.fieldGroup}>
            <Label htmlFor="forgot-email" style={styles.label}>Email address</Label>
            <Input
              ref={emailRef}
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              placeholder="you@barangay.gov"
              leftIcon={<IconMail size={18} />}
              error={error}
              disabled={isLoading}
              aria-required="true"
            />
            {error && (
              <p role="alert" aria-live="polite" style={styles.errorText}>{error}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!email.trim() || isLoading}
            style={{ width: "100%" }}
          >
            {isLoading ? (
              <>
                <IconSpinner size={20} />
                <span>Sending link…</span>
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>

        {/* Back to login */}
        <div style={styles.backRow}>
          <Link href="/login" style={styles.backLink}>
            ← Back to Login
          </Link>
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
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--color-background)",
    padding: "var(--space-4)"
  },
  card: {
    width: "100%",
    maxWidth: 440,
    background: "var(--color-card)",
    borderRadius: "var(--radius-xl)",
    border: "1px solid var(--color-border)",
    padding: "40px 36px",
    boxShadow: "var(--shadow-md)"
  },
  logoBlock: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
    justifyContent: "center"
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "var(--color-primary)",
    color: "#fff"
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: "var(--color-primary)"
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto"
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text)",
    margin: 0,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: "-0.01em"
  },
  subtext: {
    fontSize: "var(--font-size-base)",
    color: "var(--color-text-muted)",
    margin: 0,
    marginBottom: 28,
    textAlign: "center",
    lineHeight: 1.6
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
  errorText: {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-error)",
    margin: 0,
    marginTop: 4
  },
  backRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: 24
  },
  backLink: {
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    color: "var(--color-primary)",
    textDecoration: "none",
    padding: "8px 0",
    transition: "opacity 200ms ease"
  },
  successContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center"
  },
  successCircle: {
    marginBottom: 20
  },
  resendBtn: {
    marginTop: 16,
    background: "none",
    border: "none",
    color: "var(--color-primary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "8px 0",
    textDecoration: "underline",
    textUnderlineOffset: 3
  }
};
