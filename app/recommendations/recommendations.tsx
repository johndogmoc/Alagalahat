"use client";

import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecommendationsPage() {
  return (
    <AuthShell>
      <div style={{ maxWidth: 820 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "var(--color-text)" }}>Pet care &amp; compliance</h1>
        <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          Practical guidance aligned with responsible pet ownership and local rabies-control programs (e.g. national framework under RA
          9482—implementing rules vary by city or barangay).
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <CardHeader>
              <CardTitle>Annual rabies vaccination</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: "0 0 12px" }}>
                Keep proof of anti-rabies vaccination with your registration. Schedule the next dose before the due date shown on your pet
                profile so staff can verify compliance during renewal or inspection.
              </p>
              <Button variant="outline" asChild>
                <Link href="/home">Open home dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration &amp; ID</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                After approval, use your pet&apos;s registration number on collars, feeders, and when visiting the vet. Update photos and
                contact numbers if you move or change phones so lost-pet filings stay accurate.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lost-pet prevention</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: "0 0 12px" }}>
                Secure gates and leashes; microchip data should match your barangay record. If your pet goes missing, file a report promptly
                and ask neighbors to check the{" "}
                <Link href="/lost-pets" style={{ color: "hsl(var(--primary))", fontWeight: 600 }}>
                  announcement board
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community etiquette</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                Clean up after your pet, prevent excessive noise, and obey local leash or muzzle rules. Non-compliance may be subject to
                barangay ordinances and fines—check postings at your barangay hall.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthShell>
  );
}
