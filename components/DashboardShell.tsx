"use client";

import type { ReactNode } from "react";
import { Sidebar, type SidebarRole } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Navbar } from "@/components/Navbar";

// Social UI Components for Owner
import { HomeNavbar } from "@/app/home/components/HomeNavbar";
import { LeftSidebar } from "@/app/home/components/LeftSidebar";
import { RightSidebar } from "@/app/home/components/RightSidebar";
import "@/app/home/home.css";

interface DashboardShellProps {
  role: SidebarRole;
  userName?: string;
  children: ReactNode;
}

export function DashboardShell({ role, userName, children }: DashboardShellProps) {
  if (role === "Owner") {
    // Generate initials for the new UI's avatar
    const initials = userName
      ? userName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
      : "JC";

    return (
      <div className="home-page" style={{ paddingBottom: "80px" }}> {/* pb for mobile nav */}
        {/* Top Navigation */}
        <HomeNavbar />

        {/* 3-Column Layout */}
        <div className="home-layout">
          {/* Left Sidebar */}
          <LeftSidebar />

          {/* Center Feed (Existing Owner Pages inject here) */}
          <main className="home-feed" role="main" style={{ marginTop: 24, paddingBottom: 40 }}>
            {children}
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>

        <MobileBottomNav role={role} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background)" }}>
      <Sidebar role={role} userName={userName} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <main className="has-bottom-nav" style={{ flex: 1, padding: "24px 32px 0", maxWidth: 1200, width: "100%", marginInline: "auto" }}>
          {children}
        </main>
        <Footer />
        <MobileBottomNav role={role} />
      </div>
    </div>
  );
}

