"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { IconSettings, IconCheck, IconShield, IconPaw, IconSyringe, IconBell } from "@/components/icons";
import { ThemeToggle } from "@/components/AccessibilityControls";
import { ToggleSwitch } from "@/app/owner/settings/components/shared";
import { useAccessibility } from "@/components/AccessibilityProvider";

/* ---- Types ---- */
interface SettingsRow {
  id: string;
  maintenance_mode?: boolean;
  require_approval?: boolean;
  admin_email?: string | null;
  notification_banner?: string | null;
  barangay_name?: string | null;
  barangay_address?: string | null;
  species_config?: string | null;
  vaccine_types?: string | null;
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [row, setRow] = useState<SettingsRow | null>(null);

  // General
  const [barangayName, setBarangayName] = useState("");
  const [barangayAddress, setBarangayAddress] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  // Pet Configuration
  const [speciesConfig, setSpeciesConfig] = useState("Dog,Cat,Other");
  const [vaccineTypes, setVaccineTypes] = useState("Rabies");
  const [requireApproval, setRequireApproval] = useState(true);

  // Notifications
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState("");

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
    if (error) {
      setRow(null);
      setIsLoading(false);
      return;
    }
    const settings = (data as SettingsRow | null) ?? null;
    setRow(settings);
    setBarangayName(settings?.barangay_name ?? "");
    setBarangayAddress(settings?.barangay_address ?? "");
    setAdminEmail(settings?.admin_email ?? "");
    setSpeciesConfig(settings?.species_config ?? "Dog,Cat,Other");
    setVaccineTypes(settings?.vaccine_types ?? "Rabies");
    setRequireApproval(settings?.require_approval ?? true);
    setMaintenanceMode(settings?.maintenance_mode ?? false);
    setNotificationBanner(settings?.notification_banner ?? "");
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setIsSaving(true);
    const supabase = getSupabaseClient();

    const payload = {
      barangay_name: barangayName.trim() || null,
      barangay_address: barangayAddress.trim() || null,
      admin_email: adminEmail.trim() || null,
      species_config: speciesConfig.trim() || null,
      vaccine_types: vaccineTypes.trim() || null,
      require_approval: requireApproval,
      maintenance_mode: maintenanceMode,
      notification_banner: notificationBanner.trim() || null
    };

    const { error } = row
      ? await supabase.from("system_settings").update(payload as never).eq("id", row.id)
      : await supabase.from("system_settings").insert(payload as never);

    setIsSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved successfully!");
    await load();
  }

  /* ToggleSwitch is imported from shared settings component to ensure consistent styling */

  /* ---- Section Card ---- */
  function SettingsSection({ title, icon: Icon, description, children }: {
    title: string; icon: typeof IconSettings; description: string; children: React.ReactNode
  }) {
    return (
      <div style={{
        background: "var(--color-card)", border: "1.5px solid var(--color-border)",
        borderRadius: 18, boxShadow: "var(--shadow-sm)", overflow: "hidden",
        transition: "all var(--transition-base)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
      >
        <div style={{
          padding: "24px 28px", borderBottom: "1px solid var(--color-border)",
          display: "flex", alignItems: "center", gap: 16,
          background: "linear-gradient(90deg, rgba(0,82,204,0.02) 0%, transparent 100%)"
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "var(--color-primary)" + "12", color: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: "0 2px 8px var(--color-primary)20"
          }}>
            <Icon size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>{title}</h3>
            <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{description}</p>
          </div>
        </div>
        <div style={{ padding: 28, display: "grid", gap: 20 }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-fade-in">
        {/* Premium Header Section */}
        <div style={{
          marginBottom: 40,
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          padding: "40px 32px",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(124, 58, 237, 0.15)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                System Settings
              </h1>
              <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                Configure barangay information, pet management rules, and system preferences.
              </p>
            </div>
            <Button onClick={save} disabled={isLoading || isSaving} style={{ gap: 8, whiteSpace: "nowrap", background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.3)" }}>
              <IconCheck size={18} />
              {isSaving ? "Saving…" : "Save All Changes"}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "grid", gap: 20 }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-xl)" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {/* Section 1: Barangay Info */}
            <SettingsSection title="Barangay Information" icon={IconShield} description="Basic organizational details shown on certificates and public pages.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="barangayName">Barangay Name</Label>
                  <Input id="barangayName" value={barangayName} onChange={(e) => setBarangayName(e.target.value)} placeholder="e.g. Barangay San Antonio" />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="barangayAddress">Address</Label>
                  <Input id="barangayAddress" value={barangayAddress} onChange={(e) => setBarangayAddress(e.target.value)} placeholder="Complete barangay address" />
                </div>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="adminEmail">Admin Contact Email</Label>
                <Input id="adminEmail" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@barangay.gov.ph" />
              </div>
            </SettingsSection>

            {/* Section 2: Pet Configuration */}
            <SettingsSection title="Pet Configuration" icon={IconPaw} description="Configure the pet species and registration settings.">
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="speciesConfig">Allowed Species (comma-separated)</Label>
                <Input id="speciesConfig" value={speciesConfig} onChange={(e) => setSpeciesConfig(e.target.value)} placeholder="Dog,Cat,Bird,Other" />
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  These species will appear in the registration form dropdown.
                </p>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="vaccineTypes">Vaccine Types (one per line)</Label>
                <Textarea id="vaccineTypes" value={vaccineTypes} onChange={(e) => setVaccineTypes(e.target.value)} placeholder={"Rabies\nDHPP\nFVRCP\nBordetella"} />
                <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Suggested vaccine names for the vaccination tracking form.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "var(--color-background)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Require Approval for Registrations</p>
                  <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    When enabled, new pet registrations must be approved by staff/admin before they become active.
                  </p>
                </div>
                <ToggleSwitch id="requireApproval" checked={requireApproval} onChange={setRequireApproval} />
              </div>
            </SettingsSection>

            {/* Section 3: Notifications & Maintenance */}
            <SettingsSection title="Notifications & Maintenance" icon={IconBell} description="Manage system-wide alerts and maintenance mode.">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: maintenanceMode ? "rgba(231,111,81,0.06)" : "var(--color-background)", borderRadius: "var(--radius-lg)", border: `1px solid ${maintenanceMode ? "rgba(231,111,81,0.2)" : "var(--color-border)"}` }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)", color: maintenanceMode ? "var(--color-coral)" : "var(--color-text)" }}>
                    Maintenance Mode
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Temporarily disables public access. Only admins can use the system.
                  </p>
                </div>
                <ToggleSwitch id="maintenanceMode" checked={maintenanceMode} onChange={setMaintenanceMode} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="notificationBanner">Notification Banner</Label>
                <Textarea
                  id="notificationBanner"
                  value={notificationBanner}
                  onChange={(e) => setNotificationBanner(e.target.value)}
                  placeholder="Enter a system-wide announcement that will be shown to all users..."
                />
                {notificationBanner.trim() && (
                  <div style={{
                    marginTop: 8, padding: "12px 16px",
                    background: "var(--color-primary)" + "08",
                    border: "1px solid var(--color-primary)" + "20",
                    borderRadius: "var(--radius-md)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-primary)"
                  }}>
                    <strong>Preview:</strong> {notificationBanner}
                  </div>
                )}
              </div>
            </SettingsSection>

            {/* Section 4: Display Preferences */}
            <DisplayPreferencesSection />
          </div>
        )}
      </div>
    </>
  );
}

/* ---- Display Preferences (moved from navbar) ---- */
function DisplayPreferencesSection() {
  const { fontSize, setFontSize, contrastMode, toggleContrast } = useAccessibility();

  const fontOptions = [
    { label: "Small", value: "small" as const },
    { label: "Medium", value: "medium" as const },
    { label: "Large", value: "large" as const },
  ];

  return (
    <div style={{
      background: "var(--color-card)", border: "1.5px solid var(--color-border)",
      borderRadius: 18, boxShadow: "var(--shadow-sm)", overflow: "hidden",
      transition: "all var(--transition-base)"
    }}>
      <div style={{
        padding: "24px 28px", borderBottom: "1px solid var(--color-border)",
        display: "flex", alignItems: "center", gap: 16,
        background: "linear-gradient(90deg, rgba(124,58,237,0.02) 0%, transparent 100%)"
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "#EDE9FE", color: "#7C3AED",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(124,58,237,0.15)"
        }}>
          <IconSettings size={24} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>Display Preferences</h3>
          <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Theme, font size, and contrast settings for the admin panel.</p>
        </div>
      </div>
      <div style={{ padding: 28, display: "grid", gap: 20 }}>
        {/* Theme */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "var(--color-background)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Theme Mode</p>
            <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Switch between light, dark, or system-detected theme.
            </p>
          </div>
          <ThemeToggle variant="light" />
        </div>

        {/* Font Size */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "var(--color-background)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Font Size</p>
            <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Adjust the base font size across the entire application.
            </p>
          </div>
          <div style={{ display: "flex", gap: 4, background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: 3, border: "1px solid rgba(0,0,0,0.08)" }}>
            {fontOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFontSize(opt.value)}
                aria-pressed={fontSize === opt.value}
                style={{
                  padding: "6px 14px", border: "none", borderRadius: 8,
                  background: fontSize === opt.value ? "#3B82F6" : "transparent",
                  color: fontSize === opt.value ? "#fff" : "var(--color-text-muted)",
                  fontWeight: 600, fontSize: 12, cursor: "pointer",
                  transition: "all 150ms ease"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 16px", background: "var(--color-background)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)" }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--font-size-sm)" }}>High Contrast Mode</p>
            <p style={{ margin: "2px 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
              Increase contrast for better visibility and accessibility.
            </p>
          </div>
          <ToggleSwitch id="contrast-high" checked={contrastMode === "high"} onChange={() => toggleContrast()} />
        </div>
      </div>
    </div>
  );
}
