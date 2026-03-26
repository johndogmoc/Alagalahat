"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string;
  status: "Pending" | "Approved" | "Rejected";
}

export default function OwnerDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [overdueCount, setOverdueCount] = useState<number>(0);
  const [dueSoonCount, setDueSoonCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;
      if (error) {
        setPets([]);
        setIsLoading(false);
        return;
      }
      setPets((data as PetRow[]) ?? []);

      // Vaccination alerts (simple heuristic: next_due_at < now is overdue, within 30 days is due soon)
      const now = new Date();
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);

      const { data: vaxData } = await supabase
        .from("vaccinations")
        .select("next_due_at, pet_id")
        .in(
          "pet_id",
          ((data as PetRow[]) ?? []).map((p) => p.id)
        )
        .not("next_due_at", "is", null);

      if (!mounted) return;
      const dates = ((vaxData as { next_due_at: string | null }[]) ?? [])
        .map((x) => (x.next_due_at ? new Date(x.next_due_at) : null))
        .filter((d): d is Date => Boolean(d));

      setOverdueCount(dates.filter((d) => d < now).length);
      setDueSoonCount(dates.filter((d) => d >= now && d <= soon).length);
      setIsLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24, display: "grid", gap: 12 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Owner Dashboard</CardTitle>
            <Button variant="outline" asChild href="/pets/new">
              Register a pet
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : pets.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>
                No pets yet. Register your pet to get a barangay registration number.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {pets.map((p) => (
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
                      <div style={{ fontWeight: 700 }}>
                        {p.name} <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 500 }}>({p.species})</span>
                      </div>
                      <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                        Reg #: {p.registration_number || "—"} • Status: {p.status}
                      </div>
                    </div>
                    <Button variant="outline" asChild href={`/pets/${encodeURIComponent(p.id)}`}>
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lost pet alerts</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
            Go to the Lost Pets board to view community alerts and file a report.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vaccination alerts</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{overdueCount}</div>
              <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Overdue</div>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{dueSoonCount}</div>
              <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>Due in 30 days</div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

