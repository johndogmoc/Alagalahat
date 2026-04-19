"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { IconLock, IconSpinner, IconPaw, IconEye, IconEyeOff } from "@/components/icons";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        setIsLoading(false);
        return;
      }

      toast.success("Password updated successfully!");
      router.replace("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  }

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

        {/* Header icon */}
        <div style={styles.headerIcon}>
          <IconLock size={32} style={{ color: "var(--color-primary)" }} />
        </div>

        <h1 style={styles.heading}>Set new password</h1>
        <p style={styles.subtext}>
          Your new password must be at least 6 characters long.
        </p>

        <form onSubmit={onSubmit} noValidate style={styles.form}>
          {/* Password */}
          <div style={styles.fieldGroup}>
            <Label htmlFor="new-password" style={styles.label}>New Password</Label>
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter new password"
              leftIcon={<IconLock size={18} />}
              disabled={isLoading}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"} style={styles.toggleBtn}>
                  {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              }
              aria-required="true"
            />
          </div>

          {/* Confirm Password */}
          <div style={styles.fieldGroup}>
            <Label htmlFor="confirm-new-password" style={styles.label}>Confirm Password</Label>
            <Input
              id="confirm-new-password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Re-enter new password"
              leftIcon={<IconLock size={18} />}
              disabled={isLoading}
              rightIcon={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Hide password" : "Show password"} style={styles.toggleBtn}>
                  {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                </button>
              }
              aria-required="true"
            />
          </div>

          {error && <p role="alert" style={styles.errorText}>{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!password || !confirmPassword || isLoading}
            style={{ width: "100%" }}
          >
            {isLoading ? (
              <>
                <IconSpinner size={20} />
                <span>Updating…</span>
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

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
    textAlign: "center"
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
    borderRadius: "var(--radius-md)",
    transition: "color var(--transition-fast)"
  }
};
