import React from "react";
import { IconAlertTriangle } from "@/components/icons";

export interface EmptyStateProps {
  /** The main heading or title of the empty state */
  title: string;
  /** The descriptive text explaining why it's empty */
  description?: string;
  /** Optional custom icon element to display instead of the default. Use an SVG. */
  icon?: React.ReactNode;
  /** Optional call-to-action button or link */
  action?: React.ReactNode;
}

/**
 * A shared Empty State component for lists, tables, and searches that yield no results.
 * Uses a dashed border card design matching the application's clean aesthetic.
 */
export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-10)",
        textAlign: "center",
        color: "var(--color-text-muted)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          marginBottom: "var(--space-3)",
          color: "var(--color-text-light)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      >
        {icon || <IconAlertTriangle size={48} />}
      </div>
      <h3 style={{ margin: "0 0 var(--space-2)", fontSize: "var(--font-size-lg)", fontWeight: 700, color: "var(--color-text)" }}>
        {title}
      </h3>
      {description && (
        <p style={{ margin: "0 0 var(--space-5)", fontSize: "var(--font-size-sm)", maxWidth: "420px", lineHeight: 1.6 }}>
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: "var(--space-2)" }}>
          {action}
        </div>
      )}
    </div>
  );
}

export { EmptyState };
