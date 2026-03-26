"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getSupabaseClient } from "@/lib/supabase";

interface CountRow {
  count: number;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPets, setPendingPets] = useState<number>(0);
  const [pendingLostPetReports, setPendingLostPetReports] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const supabase = getSupabaseClient();

      const pets = await supabase
        .from("pets")
        .select("count", { count: "exact", head: true })
        .eq("status", "Pending");

      const lost = await supabase
        .from("lost_pet_reports")
        .select("count", { count: "exact", head: true })
        .eq("status", "Pending");

      if (!mounted) return;
      setPendingPets(pets.count ?? 0);
      setPendingLostPetReports(lost.count ?? 0);
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
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            {isLoading ? (
              <div style={{ display: "grid", gap: 10 }}>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{pendingPets}</div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>Pending pet registrations</div>
                  </div>
                  <Button variant="outline" asChild href="/staff/pets">
                    Review queue
                  </Button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 20 }}>{pendingLostPetReports}</div>
                    <div style={{ color: "hsl(var(--muted-foreground))", fontSize: 13 }}>Pending lost pet reports</div>
                  </div>
                  <Button asChild href="/lost-pets/admin">
                    Review reports
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin tools</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="outline" asChild href="/admin/users">
              User management
            </Button>
            <Button variant="outline" asChild href="/admin/logs">
              Reports & logs
            </Button>
            <Button variant="outline" asChild href="/admin/settings">
              System settings
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

