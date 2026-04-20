"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

type Species = "Dog" | "Cat" | "Other";

export default function NewPetPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("Dog");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [vaccinationDetails, setVaccinationDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => Boolean(name.trim()) && Boolean(species), [name, species]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);

    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setIsSubmitting(false);
      router.replace("/login");
      return;
    }

    const { error } = await supabase.from("pets").insert({
      owner_user_id: user.id,
      owner_name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "Owner",
      owner_contact_number: (user.user_metadata?.contact_number as string | undefined) ?? null,
      name: name.trim(),
      species,
      breed: breed.trim() ? breed.trim() : null,
      color: color.trim() ? color.trim() : null,
      size: size.trim() ? size.trim() : null,
      photo_url: photoUrl.trim() ? photoUrl.trim() : null,
      vaccination_details: vaccinationDetails.trim() ? vaccinationDetails.trim() : null,
      status: "Pending",
      registration_number: null
    } as never);

    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Pet registration submitted. Staff/Admin will verify it.");
    router.replace("/home");
  }

  return (
    <AuthShell>
      <Card style={{ maxWidth: 760 }}>
        <CardHeader>
          <CardTitle>Register a Pet</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="name">Pet name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="species">Species</Label>
                <Select id="species" value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Other">Other</option>
                </Select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="breed">Breed</Label>
                <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="color">Color</Label>
                <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="size">Size</Label>
                <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="Small / Medium / Large" />
              </div>
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="photoUrl">Pet photo URL (optional)</Label>
              <Input id="photoUrl" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <Label htmlFor="vaccinationDetails">Vaccination details (optional)</Label>
              <Textarea
                id="vaccinationDetails"
                value={vaccinationDetails}
                onChange={(e) => setVaccinationDetails(e.target.value)}
                placeholder="Rabies vaccine date, etc."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit registration"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
