"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface PetRow {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  owner_name: string;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

function makeRegNumber(id: string) {
  const short = id.replace(/-/g, "").slice(0, 10).toUpperCase();
  return `BRGY-${short}`;
}

export default function StaffPetQueuePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<PetRow[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, owner_name, status, created_at")
      .eq("status", "Pending")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(error.message);
      setRows([]);
      setIsLoading(false);
      return;
    }
    setRows((data as PetRow[]) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function approve(pet: PetRow) {
    setMutatingId(pet.id);
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("pets")
      .update({ status: "Approved", registration_number: makeRegNumber(pet.id) } as never)
      .eq("id", pet.id);
    setMutatingId(null);
    if (error) return toast.error(error.message);
    toast.success("Approved pet registration.");
    await load();
  }

  async function reject(pet: PetRow) {
    setMutatingId(pet.id);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("pets").update({ status: "Rejected" } as never).eq("id", pet.id);
    setMutatingId(null);
    if (error) return toast.error(error.message);
    toast.success("Rejected pet registration.");
    await load();
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Registration Queue</CardTitle>
            <Button variant="outline" onClick={load} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : rows.length === 0 ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>No pending registrations.</div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {rows.map((p, idx) => (
                  <div key={p.id} style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>
                          {p.name}{" "}
                          <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>({p.species})</span>
                        </div>
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                          Owner: {p.owner_name} • Submitted: {new Date(p.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Button variant="outline" asChild href={`/pets/${encodeURIComponent(p.id)}`}>
                          Review
                        </Button>
                        <Button disabled={mutatingId === p.id} onClick={() => approve(p)}>
                          Approve
                        </Button>
                        <Button disabled={mutatingId === p.id} variant="destructive" onClick={() => reject(p)}>
                          Reject
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

