"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";

interface ActivityEntry {
  id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  created_at: string;
}

export default function StaffProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | null>(null);
  const [barangay, setBarangay] = useState<string | null>(null);
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /* Edit state */
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  /* Password change */
  const [showPwChange, setShowPwChange] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!mounted) return;
      if (!user) { router.replace("/login"); return; }

      const meta = user.user_metadata ?? {};
      const name = (meta.full_name as string) || user.email?.split("@")[0] || "";
      setUserName(name);
      setEditName(name);
      setEmail(user.email ?? "");
      setPhone((meta.contact_number as string) ?? (meta.phone as string) ?? null);
      setEditPhone((meta.contact_number as string) ?? (meta.phone as string) ?? "");
      setBarangay((meta.barangay as string) ?? null);
      setJoinedAt(user.created_at ?? null);

      /* Check active status from profiles */
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .single();
      if (mounted && profile) setIsActive(profile.is_active ?? true);

      /* Recent activity */
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("id, action, target_type, target_id, created_at")
        .eq("actor_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (mounted && logs) setActivity(logs as ActivityEntry[]);

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, [router]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.auth.updateUser({
        data: { full_name: editName.trim(), contact_number: editPhone.trim() },
      });
      setUserName(editName.trim());
      setPhone(editPhone.trim() || null);
      setEditing(false);
    } catch { /* swallow */ }
    finally { setSaving(false); }
  }

  async function handleChangePassword() {
    if (newPw.length < 6) { setPwMsg("Password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match."); return; }
    setPwSaving(true);
    setPwMsg(null);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) { setPwMsg(error.message); } else {
        setPwMsg("Password updated successfully!");
        setNewPw(""); setConfirmPw(""); setShowPwChange(false);
      }
    } catch { setPwMsg("Something went wrong."); }
    finally { setPwSaving(false); }
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <DashboardShell role="Staff" userName="…">
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ height: 160, borderRadius: "var(--radius-lg)" }} />
          <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)" }} />
        </div>
      </DashboardShell>
    );
  }

  const initials = userName ? userName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "S";

  return (
    <DashboardShell role="Staff" userName={userName}>
      <div style={{ marginBottom: "var(--space-8)", textAlign: "center" }}>
        <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800, margin: "0 0 var(--space-2)", letterSpacing: "-0.02em", color: "var(--color-text)" }}>
          Staff Profile
        </h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          View and manage your account information
        </p>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* ────── Banner + Avatar Card ────── */}
        <div style={{
          background: "var(--color-card)", borderRadius: "var(--radius-xl)",
          border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)",
          overflow: "hidden",
        }}>
          {/* Banner */}
          <div style={{
            height: 130,
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)" }}>
              <span style={{
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
                padding: "var(--space-1) var(--space-3)", borderRadius: "var(--radius-full)",
                color: "var(--color-primary-foreground)", fontSize: "var(--font-size-xs)", fontWeight: 700,
              }}>
                Barangay Staff
              </span>
            </div>
          </div>

          {/* Avatar + Name */}
          <div style={{ padding: "0 var(--space-6) var(--space-6)", display: "flex", flexDirection: "column", alignItems: "center", marginTop: -48 }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "var(--color-background)", border: "4px solid var(--color-card)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "var(--font-size-3xl)", fontWeight: 800, color: "var(--color-primary)",
              boxShadow: "var(--shadow-lg)", marginBottom: "var(--space-4)",
            }}>
              {initials}
            </div>
            <h2 style={{ fontSize: "var(--font-size-xl)", fontWeight: 800, margin: "0 0 var(--space-1)", color: "var(--color-text)" }}>{userName}</h2>
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>{email}</p>
            <span style={{
              marginTop: "var(--space-3)",
              display: "inline-block", padding: "var(--space-1) var(--space-3)",
              borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: 700,
              background: isActive
                ? "color-mix(in srgb, var(--color-success) 15%, transparent)"
                : "color-mix(in srgb, var(--color-coral) 15%, transparent)",
              color: isActive ? "var(--color-success)" : "var(--color-coral)",
            }}>
              {isActive ? "Active" : "Suspended"}
            </span>
          </div>
        </div>

        {/* ────── Info Grid ────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>
          {/* Personal Info */}
          <div style={{
            background: "var(--color-card)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)", padding: "var(--space-5)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
              <h3 style={{ margin: 0, fontSize: "var(--font-size-base)", fontWeight: 700 }}>Personal Information</h3>
              {!editing && (
                <button className="btn btn-ghost btn-size-sm" style={{ fontSize: "var(--font-size-xs)" }} onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label htmlFor="edit-name" style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                    Display Name
                  </label>
                  <input id="edit-name" className="input-base" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="edit-phone" style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                    Phone Number
                  </label>
                  <input id="edit-phone" className="input-base" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-size-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-size-sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {[
                  { label: "Phone Number", value: phone || "Not provided" },
                  { label: "Barangay", value: barangay || "Not assigned" },
                  { label: "Date Joined", value: joinedAt ? new Date(joinedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : "—" },
                ].map((field) => (
                  <div key={field.label}>
                    <p style={{ margin: "0 0 var(--space-1)", fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {field.label}
                    </p>
                    <div style={{ background: "var(--color-background-hover)", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>{field.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security */}
          <div style={{
            background: "var(--color-card)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)", padding: "var(--space-5)",
            boxShadow: "var(--shadow-sm)",
          }}>
            <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--font-size-base)", fontWeight: 700 }}>Security</h3>

            {showPwChange ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div>
                  <label htmlFor="new-pw" style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                    New Password
                  </label>
                  <input id="new-pw" className="input-base" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="confirm-pw" style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "var(--space-2)" }}>
                    Confirm Password
                  </label>
                  <input id="confirm-pw" className="input-base" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </div>
                {pwMsg && (
                  <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: pwMsg.includes("success") ? "var(--color-success)" : "var(--color-error)", fontWeight: 600 }}>
                    {pwMsg}
                  </p>
                )}
                <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
                  <button className="btn btn-ghost btn-size-sm" onClick={() => { setShowPwChange(false); setPwMsg(null); }}>Cancel</button>
                  <button className="btn btn-primary btn-size-sm" onClick={handleChangePassword} disabled={pwSaving}>
                    {pwSaving ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p style={{ margin: "0 0 var(--space-4)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                  Strengthen your account by changing your password periodically.
                </p>
                <button className="btn btn-outline btn-size-default" style={{ width: "100%" }} onClick={() => setShowPwChange(true)}>
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ────── Recent Activity ────── */}
        <div style={{
          background: "var(--color-card)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)", padding: "var(--space-5)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <h3 style={{ margin: "0 0 var(--space-5)", fontSize: "var(--font-size-base)", fontWeight: 700 }}>Recent Activity</h3>
          {activity.length === 0 ? (
            <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", textAlign: "center", padding: "var(--space-6) 0" }}>
              No recent activity to show.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {activity.map((entry) => (
                <div key={entry.id} style={{
                  display: "flex", alignItems: "center", gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-background-hover)",
                  borderRadius: "var(--radius-md)",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: entry.action.toLowerCase().includes("approv") ? "var(--color-success)"
                      : entry.action.toLowerCase().includes("reject") ? "var(--color-coral)"
                      : "var(--color-primary)",
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--font-size-sm)", fontWeight: 600, color: "var(--color-text)" }}>
                      {entry.action}
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {entry.target_type}{entry.target_id ? ` · ${entry.target_id}` : ""} · {new Date(entry.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ────── Actions ────── */}
        <div style={{
          background: "var(--color-card)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)", padding: "var(--space-5)",
          display: "flex", flexWrap: "wrap", gap: "var(--space-4)",
          boxShadow: "var(--shadow-sm)",
        }}>
          <Button variant="outline" asChild href="/help" style={{ flex: 1, minWidth: 200, padding: "var(--space-5) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)", fontWeight: 700 }}>
            <span>Get Help & Support</span>
          </Button>
          <Button variant="destructive" onClick={() => void signOut()} style={{ flex: 1, minWidth: 200, padding: "var(--space-5) var(--space-4)", borderRadius: "var(--radius-md)", fontSize: "var(--font-size-sm)", fontWeight: 700 }}>
            Sign Out
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
