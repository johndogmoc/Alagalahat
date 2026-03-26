"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

type Role = "Owner" | "Staff" | "Admin";

interface ProfileRow {
  id: string;
  email: string | null;
  role: Role;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [q, setQ] = useState("");
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const query = supabase.from("profiles").select("id, email, role, is_active, created_at").order("created_at", {
      ascending: false
    });

    const { data, error } = q.trim()
      ? await query.ilike("email", `%${q.trim()}%`).limit(50)
      : await query.limit(50);

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
  }, []);

  async function updateUser(id: string, patch: Partial<Pick<ProfileRow, "role" | "is_active">>) {
    setMutatingId(id);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", id);
    setMutatingId(null);
    if (error) return toast.error(error.message);
    toast.success("User updated.");
    await load();
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email…" />
              <Button variant="outline" onClick={load} disabled={isLoading}>
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : rows.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>No users found.</div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {rows.map((u, idx) => (
                  <div key={u.id} style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{u.email ?? u.id}</div>
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                          Created: {new Date(u.created_at).toLocaleString()} • Active: {u.is_active ? "Yes" : "No"}
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        <Select
                          value={u.role}
                          onChange={(e) => updateUser(u.id, { role: e.target.value as Role })}
                          disabled={mutatingId === u.id}
                          style={{ minWidth: 160 }}
                        >
                          <option value="Owner">Owner</option>
                          <option value="Staff">Staff</option>
                          <option value="Admin">Admin</option>
                        </Select>
                        <Button
                          variant="outline"
                          disabled={mutatingId === u.id}
                          onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                    {idx !== rows.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

