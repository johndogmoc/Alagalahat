"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  color: string | null;
  size: string | null;
  photo_url: string | null;
  vaccination_details: string | null;
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  owner_name: string;
  owner_contact_number: string | null;
}

export default function PetProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const [isLoading, setIsLoading] = useState(true);
  const [pet, setPet] = useState<PetRow | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("pets").select("*").eq("id", id).single();
      if (!mounted) return;
      if (error) {
        setPet(null);
        setIsLoading(false);
        return;
      }
      setPet(data as PetRow);
      setIsLoading(false);
    }
    if (id) load();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-12">
            <CardTitle>Pet Profile</CardTitle>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Button variant="outline" asChild href={`/pets/${encodeURIComponent(id)}/vaccinations`}>
                Vaccinations
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : !pet ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>Pet not found.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {pet.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pet.photo_url}
                      alt={pet.name}
                      width={72}
                      height={72}
                      style={{ borderRadius: 14, border: "1px solid hsl(var(--border))", objectFit: "cover" }}
                    />
                  ) : null}
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>
                      {pet.name}{" "}
                      <span style={{ fontWeight: 600, color: "hsl(var(--muted-foreground))" }}>
                        ({pet.species})
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                      Reg #: {pet.registration_number ?? "—"} • Status: {pet.status}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                  <div><span style={{ fontWeight: 700 }}>Breed:</span> {pet.breed ?? "—"}</div>
                  <div><span style={{ fontWeight: 700 }}>Color:</span> {pet.color ?? "—"}</div>
                  <div><span style={{ fontWeight: 700 }}>Size:</span> {pet.size ?? "—"}</div>
                  <div><span style={{ fontWeight: 700 }}>Vaccination:</span> {pet.vaccination_details ?? "—"}</div>
                  <div><span style={{ fontWeight: 700 }}>Owner:</span> {pet.owner_name}</div>
                  <div><span style={{ fontWeight: 700 }}>Contact:</span> {pet.owner_contact_number ?? "—"}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

