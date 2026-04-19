"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { useSession } from "@/components/SessionProvider";

interface AuthShellProps {
  children: ReactNode;
  /** If true, redirects to /login when not authenticated. Default: true */
  requireAuth?: boolean;
}

export function AuthShell({ children, requireAuth = true }: AuthShellProps) {
  const router = useRouter();
  const { role, userName } = useSession();

  // If no user context & auth is required, forcefully redirect to login.
  // Wait is technically handled by middleware, but fallback here.
  if (!role && requireAuth) {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return <div style={{ padding: 48, textAlign: "center", color: "var(--color-text-muted)" }}>Redirecting…</div>;
  }

  // The very first render frame has the exact role and userName pre-fetched from the server!
  return (
    <DashboardShell role={role || "Owner"} userName={userName || "Guest"}>
      {children}
    </DashboardShell>
  );
}
