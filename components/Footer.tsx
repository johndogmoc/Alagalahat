import { IconBarangaySeal } from "@/components/icons";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-card)",
        padding: "var(--space-8) 0",
        marginTop: "var(--space-12)"
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <IconBarangaySeal size={24} style={{ color: "var(--color-text-muted)" }} />
          <div>
            <p style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              fontWeight: 600,
              color: "var(--color-text)"
            }}>
              Barangay Pet Management Office
            </p>
            <p style={{
              margin: 0,
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted)"
            }}>
              Barangay Hall, Municipality, Province
            </p>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <p style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            fontWeight: 600,
            color: "var(--color-coral)"
          }}>
            Emergency Hotline: 911 / 117
          </p>
          <p style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
            marginTop: 2
          }}>
            Last updated: March 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
