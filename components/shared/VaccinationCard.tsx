import React from "react";
import { IconSyringe } from "@/components/icons";
import { StatusBadge } from "./StatusBadge";

export interface VaccinationCardProps {
  /** The name or type of the vaccine */
  name: string;
  /** ISO date string of when it was given */
  dateGiven?: string | null;
  /** ISO date string of when the next dose is due */
  nextDue?: string | null;
  /** Explicit status (Completed, Overdue, etc). If missing, we infer it from nextDue. */
  status?: "Completed" | "Due Soon" | "Overdue" | "Not Recorded" | string;
}

/**
 * A shared component for displaying a pet's vaccination record.
 */
export default function VaccinationCard({ name, dateGiven, nextDue, status }: VaccinationCardProps) {
  let inferredStatus = status;

  if (!inferredStatus) {
    if (!dateGiven && !nextDue) {
      inferredStatus = "Not Recorded";
    } else if (!nextDue) {
      inferredStatus = "Completed";
    } else {
      const due = new Date(nextDue);
      const now = new Date();
      if (due < now) {
        inferredStatus = "Overdue";
      } else {
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);
        inferredStatus = due <= thirtyDays ? "Due Soon" : "Completed";
      }
    }
  }

  const formattedGiven = dateGiven ? new Date(dateGiven).toLocaleDateString("en-PH") : "—";
  const formattedDue = nextDue ? new Date(nextDue).toLocaleDateString("en-PH") : "—";

  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-4)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          background: "var(--color-background-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-primary)",
          flexShrink: 0,
        }}
        aria-hidden="true"
      >
        <IconSyringe size={20} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
          <h4 style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-text)" }}>
            {name}
          </h4>
          <StatusBadge status={inferredStatus} />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)", fontSize: "var(--font-size-xs)" }}>
          <div>
            <span style={{ display: "block", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Given</span>
            <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{formattedGiven}</span>
          </div>
          <div>
            <span style={{ display: "block", color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Next Due</span>
            <span style={{ color: "var(--color-text)", fontWeight: 500 }}>{formattedDue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { VaccinationCard };
