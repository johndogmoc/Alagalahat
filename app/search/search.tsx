"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import { sanitizeSearchTerm } from "@/lib/searchQuery";
import { IconPaw, IconAlertTriangle } from "@/components/icons";

interface PetHit {
  id: string;
  name: string;
  species: string;
  registration_number: string | null;
  owner_name: string;
  status: string;
}

interface LostHit {
  id: string;
  pet_name: string;
  registration_number: string | null;
  last_known_location: string;
  status: string;
  missing_at: string;
}

function SearchInner() {
  const params = useSearchParams();
  const qRaw = params.get("q") ?? "";
  const term = useMemo(() => sanitizeSearchTerm(qRaw), [qRaw]);
  const [loading, setLoading] = useState(false);
  const [pets, setPets] = useState<PetHit[]>([]);
  const [lost, setLost] = useState<LostHit[]>([]);
  const [canSearchAll, setCanSearchAll] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!term) {
        setPets([]);
        setLost([]);
        return;
      }
      setLoading(true);
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      const role = user?.user_metadata?.role;
      const staffOrAdmin = role === "Staff" || role === "Admin";
      if (mounted) setCanSearchAll(staffOrAdmin);

      const pattern = `%${term}%`;

      if (staffOrAdmin) {
        const petQuery = supabase
          .from("pets")
          .select("id, name, species, registration_number, owner_name, status")
          .or(`name.ilike.${pattern},registration_number.ilike.${pattern},owner_name.ilike.${pattern},breed.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(25);

        const lostQuery = supabase
          .from("lost_pet_reports")
          .select("id, pet_name, registration_number, last_known_location, status, missing_at")
          .or(
            `pet_name.ilike.${pattern},registration_number.ilike.${pattern},last_known_location.ilike.${pattern},owner_name.ilike.${pattern}`
          )
          .order("created_at", { ascending: false })
          .limit(25);

        const [pr, lr] = await Promise.all([petQuery, lostQuery]);
        if (!mounted) return;
        setPets((pr.data as PetHit[]) ?? []);
        setLost((lr.data as LostHit[]) ?? []);
      } else if (user) {
        const { data: mine } = await supabase
          .from("pets")
          .select("id, name, species, registration_number, owner_name, status")
          .eq("owner_user_id", user.id)
          .or(`name.ilike.${pattern},registration_number.ilike.${pattern},breed.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(25);

        const { data: alerts } = await supabase
          .from("lost_pet_reports")
          .select("id, pet_name, registration_number, last_known_location, status, missing_at")
          .or(`pet_name.ilike.${pattern},last_known_location.ilike.${pattern},registration_number.ilike.${pattern}`)
          .order("created_at", { ascending: false })
          .limit(25);

        if (!mounted) return;
        setPets((mine as PetHit[]) ?? []);
        setLost((alerts as LostHit[]) ?? []);
      }
      setLoading(false);
    }
    void run();
    return () => {
      mounted = false;
    };
  }, [term]);

  return (
    <div className="post-card" style={{ marginBottom: 20, padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.01em" }}>Search Registry & Alerts</h1>
      </div>
      <div style={{ display: "grid", gap: 16 }}>
          <div style={{ color: "hsl(var(--muted-foreground))" }}>
            Query:{" "}
            <span style={{ color: "hsl(var(--foreground))", fontWeight: 600 }}>{term || "—"}</span>
            {!term ? (
              <span> — Enter a name, registration number, or location from the search bar.</span>
            ) : null}
          </div>
          {term && !loading && canSearchAll ? (
            <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              Staff/Admin view: results include all registered pets and lost-pet filings.
            </p>
          ) : null}
          {term && !loading && !canSearchAll && term ? (
            <p style={{ margin: 0, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
              Pet owner view: pets are limited to your account; alerts search community lost-pet reports.
            </p>
          ) : null}

          {loading ? (
            <div style={{ color: "hsl(var(--muted-foreground))" }}>Searching…</div>
          ) : !term ? null : (
            <>
              <section>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconPaw size={18} /> Pets
                </h2>
                {pets.length === 0 ? (
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 14 }}>No matching pets.</div>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                    {pets.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/pets/${p.id}`}
                          style={{
                            display: "block",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                            textDecoration: "none",
                            color: "inherit"
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                            {p.species} · {p.registration_number || "No # yet"} · {p.owner_name}
                          </div>
                          <Badge style={{ marginTop: 6 }}>{p.status}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
                  <IconAlertTriangle size={18} /> Lost pet reports
                </h2>
                {lost.length === 0 ? (
                  <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 14 }}>No matching reports.</div>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
                    {lost.map((r) => (
                      <li key={r.id}>
                        <Link
                          href="/lost-pets"
                          style={{
                            display: "block",
                            padding: 12,
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                            textDecoration: "none",
                            color: "inherit"
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{r.pet_name}</div>
                          <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                            {r.registration_number || "—"} · Last seen: {r.last_known_location}
                          </div>
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            <Badge>{r.status}</Badge>{" "}
                            <span style={{ color: "hsl(var(--muted-foreground))" }}>
                              {new Date(r.missing_at).toLocaleString()}
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <div style={{ padding: 24, color: "hsl(var(--muted-foreground))" }}>
            Loading search…
          </div>
        }
      >
        <SearchInner />
      </Suspense>
    </AuthShell>
  );
}
