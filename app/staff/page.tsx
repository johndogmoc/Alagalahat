"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string;
  status: "Pending" | "Approved" | "Rejected";
  owner_name: string;
}

export default function StaffDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pending, setPending] = useState<PetRow[]>([]);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<PetRow[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status, owner_name")
        .eq("status", "Pending")
        .order("created_at", { ascending: true })
        .limit(20);
      if (!mounted) return;
      if (error) {
        setPending([]);
        setIsLoading(false);
        return;
      }
      setPending((data as PetRow[]) ?? []);
      setIsLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function search() {
    const query = q.trim();
    if (!query) return;
    setIsSearching(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, registration_number, status, owner_name")
      .or(`registration_number.ilike.%${query}%,owner_name.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(25);
    setIsSearching(false);
    if (error) {
      setResults([]);
      return;
    }
    setResults((data as PetRow[]) ?? []);
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24, display: "grid", gap: 12 }}>
        <Card>
          <CardHeader>
            <CardTitle>Staff Dashboard</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pet by reg #, owner name, or pet name"
              />
              <Button variant="outline" onClick={search} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
              <Button asChild href="/lost-pets/report">
                File lost pet report
              </Button>
            </div>

            {results.length > 0 ? (
              <div style={{ display: "grid", gap: 10 }}>
                {results.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      padding: 12
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                        Reg #: {p.registration_number || "—"} • Owner: {p.owner_name} • Status: {p.status}
                      </div>
                    </div>
                    <Button variant="outline" asChild href={`/pets/${encodeURIComponent(p.id)}`}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Pending registrations (queue)</CardTitle>
            <Button variant="outline" asChild href="/staff/pets">
              Open queue
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : pending.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>No pending registrations right now.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {pending.map((p) => (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>
                        {p.name}{" "}
                        <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>
                          ({p.species})
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                        Owner: {p.owner_name}
                      </div>
                    </div>
                    <Button variant="outline" asChild href={`/pets/${encodeURIComponent(p.id)}`}>
                      Review
                    </Button>
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

