import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { HomeSearch } from "@/components/HomeSearch";

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 24 }}>
        <Card>
          <CardHeader>
            <CardTitle>AlagaLahat</CardTitle>
          </CardHeader>
          <CardContent style={{ display: "grid", gap: 12 }}>
            <p style={{ margin: 0, color: "hsl(var(--muted-foreground))" }}>
              Pet registration and community alerts.
            </p>
            <HomeSearch placeholder="Search (demo route)..." />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Button asChild>
                <Link href="/lost-pets">Lost Pet Board</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/lost-pets/report">Report Lost Pet</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

