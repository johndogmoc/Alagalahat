import React from "react";

export type SemanticStatus =
  | "Completed"
  | "Success"
  | "Active"
  | "Resolved"
  | "Found"
  | "Due Soon"
  | "Warning"
  | "Pending"
  | "Overdue"
  | "Error"
  | "Rejected"
  | "Suspended"
  | "Not Recorded"
  | "Draft"
  | "Info"
  | "Missing";

export interface StatusBadgeProps {
  /** The text to display inside the badge */
  status: SemanticStatus | string;
  /**
   * Optional manual override of the color semantic.
   * If not provided, it is inferred from the status text.
   */
  variant?: "success" | "warning" | "error" | "info" | "default";
}

/**
 * A shared badge component for displaying statuses across the application.
 * Uses semantic CSS variables to ensure consistency in light/dark mode.
 */
export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  // Infer variant from status string if not explicitly provided
  let semanticVariant = variant;

  if (!semanticVariant) {
    const s = String(status).toLowerCase();
    if (s.includes("complete") || s.includes("success") || s.includes("active") || s.includes("resolv") || s.includes("found")) {
      semanticVariant = "success";
    } else if (s.includes("due soon") || s.includes("warn") || s.includes("pending") || s.includes("missing")) {
      semanticVariant = "warning";
    } else if (s.includes("overdue") || s.includes("error") || s.includes("reject") || s.includes("suspend") || s.includes("lost")) {
      semanticVariant = "error";
    } else if (s.includes("info")) {
      semanticVariant = "info";
    } else {
      semanticVariant = "default";
    }
  }

  const colorMap = {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    error: "var(--color-error)",
    info: "var(--color-info)",
    default: "var(--color-text-light)",
  };

  const baseColor = colorMap[semanticVariant as keyof typeof colorMap] || colorMap.default;

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--font-size-xs)",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        background: `color-mix(in srgb, ${baseColor} 15%, transparent)`,
        color: baseColor,
        textAlign: "center",
      }}
    >
      {status}
    </span>
  );
}

export { StatusBadge };
