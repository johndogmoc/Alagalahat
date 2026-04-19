import React from "react";
import Link from "next/link";
import { IconPaw } from "@/components/icons";
import { StatusBadge } from "./StatusBadge";

export interface PetCardProps {
  id: string;
  name: string;
  status?: string;
  photo_url?: string | null;
  /** Defines where the card navigates when clicked. Defaults to `/pets/[id]` */
  href?: string;
}

/**
 * A shared PetCard component representing a single pet profile.
 * Hoverable with clean styling entirely via CSS variables.
 */
export default function PetCard({ id, name, status, photo_url, href }: PetCardProps) {
  return (
    <Link
      href={href ?? `/pets/${id}`}
      style={{
        minWidth: 140,
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-5) var(--space-4)",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        flexShrink: 0,
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
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "var(--radius-full)",
          background: "var(--color-background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          border: "3px solid var(--color-card)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo_url} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <IconPaw size={28} style={{ color: "var(--color-text-light)" }} />
        )}
      </div>
      
      <p style={{ margin: 0, fontWeight: 800, fontSize: "var(--font-size-sm)", textAlign: "center", color: "var(--color-text)" }}>
        {name}
      </p>

      {status && (
        <span style={{ marginTop: "-var(--space-1)" }}>
          <StatusBadge status={status} />
        </span>
      )}
    </Link>
  );
}

export { PetCard };
