"use client";

import { useState } from "react";
import type { LostPetReport } from "@/lib/types/lostPet";

export interface LostPetAnnouncementCardProps {
  report: LostPetReport;
  isWatched?: boolean;
  onToggleWatch?: (reportId: string) => void;
}

/* ── Tiny inline SVG icons ── */
const PawIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
    <ellipse cx="8" cy="6" rx="2" ry="2.5"/><ellipse cx="16" cy="6" rx="2" ry="2.5"/><ellipse cx="5" cy="11" rx="2" ry="2.5"/><ellipse cx="19" cy="11" rx="2" ry="2.5"/>
    <path d="M12 18c-2.5 0-4.5-1.5-5-3.5 0-1 1-2 2-2.5.6-.3 1.3-.5 2-.5h2c.7 0 1.4.2 2 .5 1 .5 2 1.5 2 2.5-.5 2-2.5 3.5-5 3.5z"/>
  </svg>
);
const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
);
const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
);
const IdIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function LostPetAnnouncementCard({ report, isWatched, onToggleWatch }: LostPetAnnouncementCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const isResolved = report.status === "Resolved";
  const statusClass = report.status === "Active" ? "active" : report.status === "Pending" ? "pending" : "resolved";

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
      <article className={`lpc-card ${isResolved ? "is-resolved" : ""}`}>
        {/* ── Status Badge ── */}
        <span className={`lpc-badge ${statusClass}`}>
          {report.status === "Active" ? "⚠ MISSING" : report.status === "Pending" ? "⏳ PENDING" : "✓ FOUND"}
        </span>

        {/* ── Details ── */}
        <div className="lpc-details">
          {/* Header */}
          <div className="lpc-header">
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className="lpc-avatar" onClick={() => report.pet.petPhotoUrl && setLightboxOpen(true)}>
                {report.pet.petPhotoUrl ? (
                  <img src={report.pet.petPhotoUrl} alt={report.pet.petName} loading="lazy" />
                ) : (
                  <div className="lpc-avatar-fallback">
                    {report.pet.petName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {report.pet.petPhotoUrl && (
                  <div className="lpc-avatar-expand"><ExpandIcon /></div>
                )}
              </div>
              <div>
                <h3 className="lpc-name">
                  <PawIcon />
                  {report.pet.petName}
                </h3>
                <p className="lpc-species">
                  {report.pet.species}
                  {report.pet.breed ? ` • ${report.pet.breed}` : ""}
                  {report.pet.color ? ` • ${report.pet.color}` : ""}
                  {report.pet.size ? ` • ${report.pet.size}` : ""}
                </p>
              </div>
            </div>
            {onToggleWatch && (
              <button
                className={`lpc-watchlist-btn ${isWatched ? "active" : ""}`}
                onClick={() => onToggleWatch(report.id)}
              >
                {isWatched ? "★ Saved" : "☆ Save"}
              </button>
            )}
          </div>

          <hr className="lpc-divider" />

          {/* Info Grid */}
          <div className="lpc-info-grid">
            <div className="lpc-info-item">
              <p className="lpc-info-label"><IdIcon /> Registration</p>
              <p className="lpc-info-value mono">{report.pet.registrationNumber || "—"}</p>
            </div>
            <div className="lpc-info-item">
              <p className="lpc-info-label">Behavior</p>
              <p className="lpc-info-value">{report.petBehavior || "Unknown"}</p>
            </div>
          </div>

          <hr className="lpc-divider" />

          {/* Location + Time */}
          <div className="lpc-location-block">
            <div>
              <p className="lpc-info-label"><MapPinIcon /> Last Known Location</p>
              <p className="lpc-info-value">
                {report.lastKnownLocation}
                {report.specificPurok ? ` (${report.specificPurok})` : ""}
              </p>
            </div>
            <div>
              <p className="lpc-info-label"><ClockIcon /> Missing Since</p>
              <p className="lpc-info-value">
                {formatDateTime(report.missingAt)}
                <span style={{ marginLeft: 8, fontSize: 11, color: "#F5A623", fontWeight: 700 }}>
                  ({timeAgo(report.missingAt)})
                </span>
              </p>
            </div>
          </div>

          {/* Reward */}
          {report.rewardOffered && (
            <>
              <hr className="lpc-divider" />
              <div className="lpc-reward">
                💰 Reward: ₱{report.rewardOffered}
              </div>
            </>
          )}

          <hr className="lpc-divider" />

          {/* Contact CTA */}
          <button className="lpc-contact-cta" onMouseMove={handleRipple}>
            <PhoneIcon />
            <div style={{ textAlign: "left" }}>
              <div className="lpc-contact-label">Contact Owner</div>
              <div className="lpc-contact-name">
                {report.pet.ownerName}
                {report.pet.ownerContactNumber ? ` • ${report.pet.ownerContactNumber}` : ""}
              </div>
            </div>
          </button>

          {/* Notes */}
          {report.notes && (
            <>
              <hr className="lpc-divider" />
              <div className="lpc-notes">
                <p className="lpc-info-label">📝 Additional Notes</p>
                <p>{report.notes}</p>
              </div>
            </>
          )}
        </div>
      </article>

      {/* ── Lightbox ── */}
      {lightboxOpen && report.pet.petPhotoUrl && (
        <div className="lpc-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="lpc-lightbox-close" onClick={() => setLightboxOpen(false)}>✕</button>
          <img src={report.pet.petPhotoUrl} alt={report.pet.petName} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
