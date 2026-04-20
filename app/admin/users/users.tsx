"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { IconSearch, IconUser, IconCheck, IconX } from "@/components/icons";

type Role = "Owner" | "Staff" | "Admin";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    let query = supabase.from("profiles").select("id, email, full_name, role, is_active, created_at").order("created_at", { ascending: false });

    if (q.trim()) {
      query = query.ilike("email", `%${q.trim()}%`);
    }
    if (roleFilter !== "All") {
      query = query.eq("role", roleFilter);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      toast.error(error.message);
      setRows([]);
      setIsLoading(false);
      return;
    }

    setRows((data as ProfileRow[]) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function updateUser(id: string, patch: Partial<Pick<ProfileRow, "role" | "is_active">>) {
    setMutatingId(id);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", id);
    setMutatingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("User updated successfully");
    await load();
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "Admin":
        return { bg: "#F3E8FF", text: "#7C3AED", label: "Administrator" };
      case "Staff":
        return { bg: "#DBEAFE", text: "#0369A1", label: "Staff Member" };
      default:
        return { bg: "#ECFDF5", text: "#059669", label: "Pet Owner" };
    }
  };

  const totalUsers = rows.length;
  const activeUsers = rows.filter((r) => r.is_active).length;
  const adminCount = rows.filter((r) => r.role === "Admin").length;
  const staffCount = rows.filter((r) => r.role === "Staff").length;
  const ownerCount = rows.filter((r) => r.role === "Owner").length;

  return (
    <>
      <div className="page-fade-in">
        {/* Premium Header Section */}
        <div style={{
          marginBottom: 40,
          background: "linear-gradient(135deg, var(--color-secondary) 0%, #007A5E 100%)",
          padding: "40px 32px",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0, 166, 126, 0.15)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
              User Management
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              Manage all system users, roles, and permissions
            </p>
          </div>
        </div>

        {/* Premium Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Users", value: totalUsers, color: "#1B4F8A", bg: "#EFF6FF" },
            { label: "Active Users", value: activeUsers, color: "#059669", bg: "#ECFDF5" },
            { label: "Administrators", value: adminCount, color: "#7C3AED", bg: "#F3E8FF" },
            { label: "Staff Members", value: staffCount, color: "#0369A1", bg: "#DBEAFE" }
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-card)",
                border: "1.5px solid var(--color-border)",
                borderRadius: 16,
                padding: "28px 20px",
                boxShadow: "var(--shadow-sm)",
                transition: "all var(--transition-base)",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = stat.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              <div style={{ position: "absolute", top: -10, right: -10, width: 100, height: 100, background: stat.bg, borderRadius: "50%", opacity: 0.5 }} aria-hidden="true" />
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {stat.label}
                </p>
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 36,
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                    letterSpacing: "-0.02em"
                  }}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Search & Filter Section */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1.5px solid var(--color-border)",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 32,
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            boxShadow: "var(--shadow-sm)",
            transition: "all var(--transition-base)"
          }}
        >
          <div style={{ flex: 1, minWidth: 280, position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
            <IconSearch size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="Search by email or name…"
              style={{ border: "none", background: "transparent", padding: 0, fontSize: 14, outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | "All")}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                background: "var(--color-background)",
                color: "var(--color-text)",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              <option value="All">All Roles</option>
              <option value="Owner">Owners</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admins</option>
            </select>
            <Button variant="primary" onClick={load} disabled={isLoading} style={{ borderRadius: 8 }}>
              {isLoading ? "Loading..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}
        >
          {isLoading ? (
            <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--color-text-muted)" }}>
              <div style={{ display: "inline-block", padding: "20px 40px" }}>Loading users...</div>
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#EFF6FF",
                  color: "#1B4F8A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px"
                }}
              >
                <IconUser size={28} />
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--color-text)" }}>
                No users found
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "2px solid var(--color-border)",
                      background: "var(--color-background)"
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Role
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Joined
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "12px 20px",
                        fontWeight: 700,
                        color: "var(--color-text-muted)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => {
                    const roleConfig = getRoleColor(u.role);
                    const initials = (u.full_name || u.email)
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "?";

                    return (
                      <tr
                        key={u.id}
                        style={{
                          borderBottom: idx < rows.length - 1 ? "1px solid var(--color-border)" : "none",
                          transition: "background 150ms ease"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 20px", fontWeight: 600 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #1B4F8A 0%, #2A9D8F 100%)",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: 700,
                                flexShrink: 0
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ color: "var(--color-text)" }}>{u.full_name || "Unknown"}</div>
                              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px", color: "var(--color-text-muted)", fontSize: 13 }}>
                          {u.email}
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateUser(u.id, {
                                role: e.target.value as Role
                              })
                            }
                            disabled={mutatingId === u.id}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 8,
                              border: "1px solid var(--color-border)",
                              background: roleConfig.bg,
                              color: roleConfig.text,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: mutatingId === u.id ? "not-allowed" : "pointer",
                              opacity: mutatingId === u.id ? 0.5 : 1
                            }}
                          >
                            <option value="Owner">Owner</option>
                            <option value="Staff">Staff</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              background: u.is_active ? "#ECFDF5" : "#FEF3C7",
                              color: u.is_active ? "#059669" : "#D97706",
                              display: "inline-block"
                            }}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px", color: "var(--color-text-muted)", fontSize: 13 }}>
                          {new Date(u.created_at).toLocaleDateString("en-PH")}
                        </td>
                        <td style={{ padding: "14px 20px", textAlign: "right" }}>
                          <Button
                            variant={u.is_active ? "outline" : "primary"}
                            size="sm"
                            disabled={mutatingId === u.id}
                            onClick={() =>
                              updateUser(u.id, {
                                is_active: !u.is_active
                              })
                            }
                            style={{
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              gap: 4
                            }}
                          >
                            {u.is_active ? (
                              <>
                                <IconX size={14} /> Deactivate
                              </>
                            ) : (
                              <>
                                <IconCheck size={14} /> Activate
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {rows.length > 0 && (
          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              background: "var(--color-background)",
              borderRadius: 12,
              border: "1px solid var(--color-border)",
              fontSize: 13,
              color: "var(--color-text-muted)"
            }}
          >
            Showing <strong>{rows.length}</strong> users •  Active: <strong>{activeUsers}</strong> •
            Owners: <strong>{ownerCount}</strong> • Staff: <strong>{staffCount}</strong> • Admins:{" "}
            <strong>{adminCount}</strong>
          </div>
        )}
      </div>
    </>
  );
}
