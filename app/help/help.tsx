"use client";

import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <AuthShell>
      <div style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px", color: "var(--color-text)" }}>Help &amp; support</h1>
        <p style={{ margin: "0 0 24px", color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          AlagaLahat helps barangays register pets, track rabies vaccination, and coordinate lost-pet alerts.
        </p>

        <div style={{ display: "grid", gap: 16 }}>
          <Card>
            <CardHeader>
              <CardTitle>Getting started</CardTitle>
            </CardHeader>
            <CardContent style={{ display: "grid", gap: 12, color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                Create an account with your email, complete your barangay details, then use{" "}
                <strong style={{ color: "hsl(var(--foreground))" }}>Register Pet</strong> to submit an animal for verification.
                Staff or admin will approve registrations and assign an official registration number.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Button asChild>
                  <Link href="/register">Create account</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vaccinations</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                After approval, open your pet&apos;s profile and use <strong style={{ color: "hsl(var(--foreground))" }}>Vaccinations</strong>{" "}
                to log shots and next due dates. Your dashboard highlights doses due within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lost pets</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                File a report from <strong style={{ color: "hsl(var(--foreground))" }}>Report Lost Pet</strong> only for pets that are already
                registered and approved. The announcement board shows alerts that the barangay has published as active or resolved.
                Use <strong style={{ color: "hsl(var(--foreground))" }}>Watchlist</strong> to bookmark cases you want to follow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency</CardTitle>
            </CardHeader>
            <CardContent style={{ color: "hsl(var(--muted-foreground))" }}>
              <p style={{ margin: 0 }}>
                For bites, severe injury, or dangerous animals, contact local emergency services (e.g. <strong>911</strong> /{" "}
                <strong>117</strong>) and your barangay health or veterinary office—not only this app.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthShell>
  );
}
