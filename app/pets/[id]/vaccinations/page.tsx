"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface VaccinationRow {
  id: string;
  vaccine_name: string;
  administered_at: string;
  next_due_at: string | null;
  vet_name: string | null;
  created_at: string;
}

export default function VaccinationsPage() {
  const params = useParams<{ id: string }>();
  const petId = params?.id ?? "";

  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<VaccinationRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [vaccineName, setVaccineName] = useState("");
  const [administeredAt, setAdministeredAt] = useState("");
  const [nextDueAt, setNextDueAt] = useState("");
  const [vetName, setVetName] = useState("");

  const canSubmit = useMemo(() => Boolean(vaccineName.trim()) && Boolean(administeredAt), [administeredAt, vaccineName]);

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("vaccinations")
      .select("id, vaccine_name, administered_at, next_due_at, vet_name, created_at")
      .eq("pet_id", petId)
      .order("administered_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setRows([]);
      setIsLoading(false);
      return;
    }
    setRows((data as VaccinationRow[]) ?? []);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!petId) return;
    load();
  }, [petId]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("vaccinations").insert({
      pet_id: petId,
      vaccine_name: vaccineName.trim(),
      administered_at: new Date(administeredAt).toISOString(),
      next_due_at: nextDueAt ? new Date(nextDueAt).toISOString() : null,
      vet_name: vetName.trim() ? vetName.trim() : null
    } as never);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Vaccination record added.");
    setVaccineName("");
    setAdministeredAt("");
    setNextDueAt("");
    setVetName("");
    await load();
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24, display: "grid", gap: 12 }}>
        <Card>
          <CardHeader>
            <CardTitle>Vaccination Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="vaccineName">Vaccine name</Label>
                  <Input id="vaccineName" value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} placeholder="e.g. Rabies" />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="administeredAt">Date administered</Label>
                  <Input id="administeredAt" type="datetime-local" value={administeredAt} onChange={(e) => setAdministeredAt(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="nextDueAt">Next due (optional)</Label>
                  <Input id="nextDueAt" type="datetime-local" value={nextDueAt} onChange={(e) => setNextDueAt(e.target.value)} />
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="vetName">Vet name (optional)</Label>
                  <Input id="vetName" value={vetName} onChange={(e) => setVetName(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Saving..." : "Add record"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Vaccination history</CardTitle>
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
              <div style={{ color: "hsl(var(--muted-foreground))" }}>No vaccination records yet.</div>
            ) : (
              <div style={{ display: "grid", gap: 14 }}>
                {rows.map((r, idx) => (
                  <div key={r.id} style={{ display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{r.vaccine_name}</div>
                        <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                          Given: {new Date(r.administered_at).toLocaleString()}
                          {r.next_due_at ? ` • Next due: ${new Date(r.next_due_at).toLocaleString()}` : ""}
                          {r.vet_name ? ` • Vet: ${r.vet_name}` : ""}
                        </div>
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

