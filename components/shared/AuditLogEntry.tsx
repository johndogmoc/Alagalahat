import React from "react";
import { IconCheck, IconAlertTriangle, IconSettings, IconUser } from "@/components/icons";

export interface AuditLogEntryProps {
  id: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  createdAt: string;
  actorName?: string;
  actorRole?: string;
}

/**
 * A shared component for displaying a single row of an audit log.
 * Duplicated across Admin Audit Log and Staff Profile.
 */
export default function AuditLogEntry({ action, targetType, targetId, createdAt, actorName, actorRole }: AuditLogEntryProps) {
  // Determine icon and color based on typical action keywords
  let color = "var(--color-primary)";
  let Icon = IconSettings;

  const actionLower = action.toLowerCase();
  if (actionLower.includes("approv") || actionLower.includes("resolv") || actionLower.includes("success")) {
    color = "var(--color-success)";
    Icon = IconCheck;
  } else if (actionLower.includes("reject") || actionLower.includes("suspend") || actionLower.includes("fail") || actionLower.includes("delet")) {
    color = "var(--color-coral)";
    Icon = IconAlertTriangle;
  } else if (actionLower.includes("login") || actionLower.includes("user") || actionLower.includes("profile")) {
    color = "var(--color-info)";
    Icon = IconUser;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-background-hover)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `color-mix(in srgb, ${color} 15%, transparent)`,
          color: color,
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>
          {action}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          <span>{targetType} {targetId && `· ${targetId}`}</span>
          {actorName && (
            <>
              <span>•</span>
              <span style={{ fontWeight: 600 }}>{actorName} {actorRole && `(${actorRole})`}</span>
            </>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-light)", fontWeight: 500, whiteSpace: "nowrap" }}>
        {new Date(createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
      </div>
    </div>
  );
}

export { AuditLogEntry };
