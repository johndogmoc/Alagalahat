"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

export interface FoundPetReport {
  id: string;
  petPhotoUrl: string | null;
  species: string;
  breedGuess: string | null;
  colorMarkings: string;
  size: string | null;
  petCondition: string;
  hasCollar: boolean;
  collarDetails: string | null;
  foundLocation: string;
  foundAt: string;
  latitude: number | null;
  longitude: number | null;
  specificPurok: string | null;
  finderName: string;
  finderContact: string;
  petBehavior: string | null;
  notes: string | null;
  currentlyWithFinder: boolean;
  temporaryShelter: string | null;
  status: string;
  createdAt: string;
}

export interface FoundPetAnnouncementCardProps {
  report: FoundPetReport;
}

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
);
const HeartIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
);
const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
);

function formatDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-PH", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true
  });
}

export function FoundPetAnnouncementCard({ report }: FoundPetAnnouncementCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isClaimed = report.status === "Claimed";

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(0);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(0);
    btn.style.setProperty("--ripple-x", `${x}%`);
    btn.style.setProperty("--ripple-y", `${y}%`);
  };

  return (
    <>
      <article className={`lpc-card ${isClaimed ? "is-resolved" : ""}`}>
        {/* Status Badge */}
        <span className={`lpc-badge ${isClaimed ? "resolved" : ""}`} style={!isClaimed ? { background: "#22c55e", color: "#fff", animation: "lpcPulse 2s ease-in-out infinite" } : {}}>
          {isClaimed ? "✓ CLAIMED" : "🐾 FOUND PET"}
        </span>

        {/* Details */}
        <div className="lpc-details">
          <div className="lpc-header">
             <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="lpc-avatar" style={{ background: "linear-gradient(135deg, #22c55e, #2a9d8f)" }} onClick={() => report.petPhotoUrl && setLightboxOpen(true)}>
                {report.petPhotoUrl ? (
                  <img src={report.petPhotoUrl} alt="Found pet" loading="lazy" />
                ) : (
                  <div className="lpc-avatar-fallback">
                    {report.species.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {report.petPhotoUrl && (
                  <div className="lpc-avatar-expand"><ExpandIcon /></div>
                )}
              </div>
              <div>
                <h3 className="lpc-name" style={{ color: "#22c55e" }}>
                  <HeartIcon /> Found {report.species}
                </h3>
                <p className="lpc-species">
                  {report.breedGuess ? `${report.breedGuess} • ` : ""}
                  {report.colorMarkings}
                  {report.size ? ` • ${report.size}` : ""}
                </p>
              </div>
            </div>
          </div>

          <hr className="lpc-divider" />

          {/* Info Grid */}
          <div className="lpc-info-grid">
            <div>
              <p className="lpc-info-label"><HeartIcon /> Condition</p>
              <p className="lpc-info-value" style={{ color: report.petCondition === "Good" ? "#22c55e" : "#F5A623" }}>
                {report.petCondition}
              </p>
            </div>
            <div>
              <p className="lpc-info-label">Behavior</p>
              <p className="lpc-info-value">{report.petBehavior || "Unknown"}</p>
            </div>
            {report.hasCollar && (
              <div style={{ gridColumn: "1 / -1" }}>
                <p className="lpc-info-label">🏷 Collar / Tag</p>
                <p className="lpc-info-value">{report.collarDetails || "Yes (no details)"}</p>
              </div>
            )}
          </div>

          <hr className="lpc-divider" />

          {/* Location + Time */}
          <div className="lpc-location-block">
            <div>
              <p className="lpc-info-label"><MapPinIcon /> Found At</p>
              <p className="lpc-info-value">
                {report.foundLocation}
                {report.specificPurok ? ` (${report.specificPurok})` : ""}
              </p>
            </div>
            <div>
              <p className="lpc-info-label"><ClockIcon /> Date & Time Found</p>
              <p className="lpc-info-value">{formatDateTime(report.foundAt)}</p>
            </div>
          </div>

          {/* Currently with finder */}
          <hr className="lpc-divider" />
          <div className="lpc-reward" style={{ background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.2)", color: "#22c55e" }}>
            {report.currentlyWithFinder ? "🏠 Currently with the finder" : `📍 At: ${report.temporaryShelter || "Unknown location"}`}
          </div>

          {/* Contact CTA */}
          <hr className="lpc-divider" />
          <button className="lpc-contact-cta" onMouseMove={handleRipple} style={{ background: "linear-gradient(135deg, #22c55e 0%, #2a9d8f 100%)" }}>
            <PhoneIcon />
            <div style={{ textAlign: "left" }}>
              <div className="lpc-contact-label">Contact Finder</div>
              <div className="lpc-contact-name">{report.finderName} • {report.finderContact}</div>
            </div>
          </button>

          {/* Notes */}
          {report.notes && (
            <>
              <hr className="lpc-divider" />
              <div className="lpc-notes" style={{ borderLeftColor: "#22c55e", background: "rgba(34,197,94,0.04)" }}>
                <p className="lpc-info-label">📝 Additional Notes</p>
                <p>{report.notes}</p>
              </div>
            </>
          )}
        </div>
      </article>

      {/* Lightbox */}
      {lightboxOpen && report.petPhotoUrl && (
        <div className="lpc-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lpc-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
          <img src={report.petPhotoUrl} alt="Found pet" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
