"use client";

import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { LostPetReportForm } from "@/components/lost-pets/LostPetReportForm";
import { FoundPetReportForm } from "@/components/lost-pets/FoundPetReportForm";

type ReportType = "lost" | "found";

export default function LostPetReportPage() {
  const [reportType, setReportType] = useState<ReportType>("lost");

  return (
    <AuthShell>
      {/* Tab Selector */}
      <div style={{
        display: "flex",
        gap: 0,
        marginBottom: 24,
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        maxWidth: 460,
        background: "var(--color-card)"
      }}>
        <button
          onClick={() => setReportType("lost")}
          style={{
            flex: 1,
            padding: "14px 20px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.25s ease",
            background: reportType === "lost"
              ? "linear-gradient(135deg, #DC2626, #E76F51)"
              : "transparent",
            color: reportType === "lost" ? "#fff" : "var(--color-text-muted)"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Report Lost Pet
        </button>
        <button
          onClick={() => setReportType("found")}
          style={{
            flex: 1,
            padding: "14px 20px",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.25s ease",
            background: reportType === "found"
              ? "linear-gradient(135deg, #22c55e, #2a9d8f)"
              : "transparent",
            color: reportType === "found" ? "#fff" : "var(--color-text-muted)"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Report Found Pet
        </button>
      </div>

      {/* Form */}
      {reportType === "lost" ? <LostPetReportForm /> : <FoundPetReportForm />}
    </AuthShell>
  );
}
