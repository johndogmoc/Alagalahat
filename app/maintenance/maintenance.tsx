"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface MaintenanceSettings {
  maintenance_mode: boolean;
  estimated_downtime?: string;
  contact_email?: string;
  contact_phone?: string;
}

export default function MaintenancePage() {
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("system_settings")
          .select("maintenance_mode, estimated_downtime, contact_email, contact_phone")
          .limit(1)
          .single();
        if (data) setSettings(data as MaintenanceSettings);
      } catch {
        /* Settings fetch failed, show defaults */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main
      aria-label="System maintenance"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "var(--space-6)",
        background: "var(--color-background)",
        color: "var(--color-text)",
        textAlign: "center",
        fontFamily: "var(--font-family)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: "var(--space-8)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="20" fill="var(--color-primary)" />
          <path
            d="M13 16c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3-1 3-2.5 3S13 17.5 13 16Zm9 0c0-1.5 1-3 2.5-3S27 14.5 27 16s-1 3-2.5 3S22 17.5 22 16Zm-7.5 7c0 0 2 4 5.5 4s5.5-4 5.5-4"
            stroke="var(--color-primary-foreground)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <span style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, letterSpacing: "-0.02em" }}>
          AlagaLahat
        </span>
      </div>

      {/* Wrench + Paw Illustration */}
      <svg
        width="200"
        height="180"
        viewBox="0 0 200 180"
        fill="none"
        aria-label="Illustration showing system maintenance in progress with a wrench and paw print"
        role="img"
        style={{ marginBottom: "var(--space-8)", maxWidth: "100%" }}
      >
        {/* Glowing circle background */}
        <circle cx="100" cy="90" r="70" fill="var(--color-primary)" opacity="0.06" />
        <circle cx="100" cy="90" r="50" fill="var(--color-primary)" opacity="0.08" />

        {/* Wrench */}
        <g transform="translate(60, 40) rotate(30 40 50)">
          <rect x="35" y="30" width="10" height="55" rx="3" fill="var(--color-text-muted)" />
          <circle cx="40" cy="25" r="15" fill="none" stroke="var(--color-text-muted)" strokeWidth="6" />
          <rect x="33" y="10" width="14" height="15" fill="var(--color-background)" />
          <rect x="35" y="85" width="10" height="8" rx="2" fill="var(--color-text-muted)" />
        </g>

        {/* Paw Print */}
        <g transform="translate(110, 55)">
          {/* Main pad */}
          <ellipse cx="20" cy="40" rx="16" ry="14" fill="var(--color-primary)" opacity="0.8" />
          {/* Toe pads */}
          <circle cx="8" cy="22" r="7" fill="var(--color-primary)" opacity="0.7" />
          <circle cx="20" cy="16" r="7" fill="var(--color-primary)" opacity="0.7" />
          <circle cx="32" cy="22" r="7" fill="var(--color-primary)" opacity="0.7" />
          <circle cx="40" cy="32" r="6" fill="var(--color-primary)" opacity="0.6" />
        </g>

        {/* Gear/cog */}
        <g transform="translate(30, 100)">
          <circle cx="20" cy="20" r="10" fill="none" stroke="var(--color-amber)" strokeWidth="3" />
          <circle cx="20" cy="20" r="4" fill="var(--color-amber)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <rect
              key={angle}
              x="18"
              y="6"
              width="4"
              height="6"
              rx="1"
              fill="var(--color-amber)"
              transform={`rotate(${angle} 20 20)`}
            />
          ))}
        </g>

        {/* Sparkles */}
        <text x="150" y="45" fontSize="16" fill="var(--color-amber)" opacity="0.6">✦</text>
        <text x="45" y="75" fontSize="12" fill="var(--color-primary)" opacity="0.5">✦</text>
        <text x="160" y="120" fontSize="14" fill="var(--color-success)" opacity="0.4">✦</text>
      </svg>

      {/* Pulsing "work in progress" indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "var(--radius-full)",
            background: "var(--color-amber)",
            display: "inline-block",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
          aria-hidden="true"
        />
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-amber)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Maintenance in Progress
        </span>
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: "clamp(var(--font-size-2xl), 5vw, var(--font-size-4xl))",
          fontWeight: 800,
          margin: "0 0 var(--space-3)",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        We&apos;re Improving AlagaLahat for You!
      </h1>

      {/* Subtext */}
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-text-muted)",
          maxWidth: 500,
          lineHeight: 1.7,
          margin: "0 0 var(--space-6)",
          fontWeight: 500,
        }}
      >
        {!loading && settings?.estimated_downtime
          ? `Estimated downtime: ${settings.estimated_downtime}. We'll be back shortly!`
          : "Please check back shortly. We're working hard to make things better for your pets! 🐾"}
      </p>

      {/* Contact Info Card */}
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5) var(--space-6)",
          maxWidth: 380,
          width: "100%",
          boxShadow: "var(--shadow-sm)",
          marginBottom: "var(--space-8)",
        }}
      >
        <p style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text)", marginBottom: "var(--space-3)" }}>
          Need urgent help?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            📧 {!loading && settings?.contact_email ? settings.contact_email : "barangay.pmu@gov.ph"}
          </p>
          <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
            📞 {!loading && settings?.contact_phone ? settings.contact_phone : "(085) 225-0000"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-light)", fontWeight: 500 }}>
        AlagaLahat — Barangay Pet Registration & Management System
      </p>
    </main>
  );
}
