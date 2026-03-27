"use client";

import type { ReactNode } from "react";
import { Sidebar, type SidebarRole } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

interface DashboardShellProps {
  role: SidebarRole;
  userName?: string;
  children: ReactNode;
}

export function DashboardShell({ role, userName, children }: DashboardShellProps) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
      <Sidebar role={role} userName={userName} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main style={{ flex: 1, padding: "24px 24px 0", maxWidth: 1200, width: "100%", marginInline: "auto" }}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
