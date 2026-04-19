"use client";

import React, { useState } from "react";
import { SectionCard } from "./shared";
import { IconDatabase, IconDownload } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function DataSection({ stats }: { stats: { memberSince: string; pets: number; vaccinations: number; posts: number; reports: number } }) {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  async function requestExport() {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1200));
    setExporting(false);
    setExportStatus("Export requested on " + new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + " — Processing…");
    toast.success("Data export requested! You'll be notified by email when ready.");
  }

  return (
    <SectionCard id="data" icon={<IconDatabase size={20} />}
      iconBg="rgba(99, 102, 241, 0.12)" iconColor="#6366F1"
      title="Data & Download" desc="Export your data or view account summary.">

      {/* Download */}
      <div>
        <h4 className="settings-subsection-title" style={{ marginTop: 0 }}>📥 Download Your Data</h4>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
          Generate a ZIP file containing your profile information, registered pets, vaccination history, posts, and lost pet reports.
        </p>

        {exportStatus ? (
          <div style={{ padding: 14, background: "rgba(59,130,246,0.08)", borderRadius: 10, border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📦</span>
            <span style={{ fontSize: 13, color: "var(--color-text)", fontWeight: 600 }}>{exportStatus}</span>
          </div>
        ) : (
          <Button variant="primary" disabled={exporting} onClick={requestExport}>
            <IconDownload size={16} style={{ marginRight: 6 }} />
            {exporting ? "Requesting..." : "Request Data Export"}
          </Button>
        )}

        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "12px 0 0" }}>
          Your data will be ready within 24 hours. We&apos;ll notify you by email.
        </p>
      </div>

      {/* Summary */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">📊 Account Data Summary</h4>
        <div className="data-stat-grid">
          <div className="data-stat-card">
            <p className="stat-value">{stats.memberSince}</p>
            <p className="stat-label">Member Since</p>
          </div>
          <div className="data-stat-card">
            <p className="stat-value">{stats.pets}</p>
            <p className="stat-label">Pets Registered</p>
          </div>
          <div className="data-stat-card">
            <p className="stat-value">{stats.vaccinations}</p>
            <p className="stat-label">Vaccinations</p>
          </div>
          <div className="data-stat-card">
            <p className="stat-value">{stats.posts}</p>
            <p className="stat-label">Posts Created</p>
          </div>
          <div className="data-stat-card">
            <p className="stat-value">{stats.reports}</p>
            <p className="stat-label">Lost Reports</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
