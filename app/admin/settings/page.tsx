"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

interface SettingsRow {
  id: string;
  barangay_name: string | null;
  barangay_address: string | null;
  species_config: string | null;
  vaccine_types: string | null;
}

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [row, setRow] = useState<SettingsRow | null>(null);

  const [barangayName, setBarangayName] = useState("");
  const [barangayAddress, setBarangayAddress] = useState("");
  const [speciesConfig, setSpeciesConfig] = useState("");
  const [vaccineTypes, setVaccineTypes] = useState("");

  async function load() {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("system_settings").select("*").limit(1).maybeSingle();
    if (error) {
      setRow(null);
      setIsLoading(false);
      return;
    }
    const settings = (data as SettingsRow | null) ?? null;
    setRow(settings);
    setBarangayName(settings?.barangay_name ?? "");
    setBarangayAddress(settings?.barangay_address ?? "");
    setSpeciesConfig(settings?.species_config ?? "Dog,Cat,Other");
    setVaccineTypes(settings?.vaccine_types ?? "Rabies");
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setIsSaving(true);
    const supabase = getSupabaseClient();

    const payload = {
      barangay_name: barangayName.trim() ? barangayName.trim() : null,
      barangay_address: barangayAddress.trim() ? barangayAddress.trim() : null,
      species_config: speciesConfig.trim() ? speciesConfig.trim() : null,
      vaccine_types: vaccineTypes.trim() ? vaccineTypes.trim() : null
    };

    const { error } = row
      ? await supabase.from("system_settings").update(payload as never).eq("id", row.id)
      : await supabase.from("system_settings").insert(payload as never);

    setIsSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved.");
    await load();
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>System Settings</CardTitle>
            <Button onClick={save} disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {isLoading ? (
              <div style={{ color: "hsl(var(--muted-foreground))" }}>
                Loading settings… (Create `system_settings` table to enable this.)
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <Label htmlFor="barangayName">Barangay name</Label>
                    <Input id="barangayName" value={barangayName} onChange={(e) => setBarangayName(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <Label htmlFor="barangayAddress">Barangay address</Label>
                    <Input
                      id="barangayAddress"
                      value={barangayAddress}
                      onChange={(e) => setBarangayAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="speciesConfig">Species config (comma-separated)</Label>
                  <Input
                    id="speciesConfig"
                    value={speciesConfig}
                    onChange={(e) => setSpeciesConfig(e.target.value)}
                    placeholder="Dog,Cat,Other"
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <Label htmlFor="vaccineTypes">Vaccine types (one per line)</Label>
                  <Textarea
                    id="vaccineTypes"
                    value={vaccineTypes}
                    onChange={(e) => setVaccineTypes(e.target.value)}
                    placeholder={"Rabies\nDHPP\nFVRCP"}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

