"use client";


import { AuthShell } from "@/components/AuthShell";
import { LostPetAnnouncementBoard } from "@/components/lost-pets/LostPetAnnouncementBoard";

export default function LostPetsPage() {
  return (
    <AuthShell>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em", fontFamily: "'Playfair Display', serif" }}>
          Lost & Found Pet Reports
        </h1>
        <p style={{ marginTop: 8, marginBottom: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-base)", fontFamily: "'DM Sans', sans-serif" }}>
          Community alerts for missing and found pets in Butuan City. Help reunite them with their families.
        </p>
      </div>
      <LostPetAnnouncementBoard />
    </AuthShell>
  );
}
