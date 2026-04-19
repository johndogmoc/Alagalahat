import React from "react";
import Link from "next/link";
import { IconAlertTriangle, IconMap } from "@/components/icons";
import { StatusBadge } from "./StatusBadge";

export interface LostPetAlertProps {
  id: string;
  name: string;
  species: string;
  lastSeenLocation: string;
  dateLost: string;
  photoUrl?: string | null;
  status?: string;
  href?: string;
}

/**
 * A shared component for displaying a lost pet alert.
 * Duplicated across the Community Board and Owner Feed.
 */
export default function LostPetAlert({
  id,
  name,
  species,
  lastSeenLocation,
  dateLost,
  photoUrl,
  status = "Missing",
  href,
}: LostPetAlertProps) {
  const isFound = status.toLowerCase() === "found" || status.toLowerCase() === "resolved";

  return (
    <Link
      href={href ?? `/lost-pets/${id}`}
      style={{
        display: "flex",
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "var(--shadow-sm)",
        transition: "transform var(--transition-base), box-shadow var(--transition-base)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Photo Column */}
      <div
        style={{
          width: 100,
          background: "var(--color-background-hover)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-light)" }}>
            <IconAlertTriangle size={32} />
          </div>
        )}
        {!isFound && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            background: "rgba(220, 38, 38, 0.85)", backdropFilter: "blur(4px)",
            color: "white", fontSize: "10px", fontWeight: 800,
            textAlign: "center", padding: "4px 0", letterSpacing: "0.05em"
          }}>
            MISSING
          </div>
        )}
      </div>

      {/* Info Column */}
      <div style={{ padding: "var(--space-4)", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
          <h4 style={{ margin: 0, fontSize: "var(--font-size-base)", fontWeight: 800, color: "var(--color-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </h4>
          <StatusBadge status={status} />
        </div>
        
        <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>
          {species}
        </p>
        
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            <IconAlertTriangle size={12} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Lost {new Date(dateLost).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            <IconMap size={12} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {lastSeenLocation}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { LostPetAlert };
