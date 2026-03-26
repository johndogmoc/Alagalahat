"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";

export function Navbar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }

  return (
    <div style={{ borderBottom: "1px solid hsl(var(--border))" }}>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBlock: 12
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" style={{ fontWeight: 700 }}>
            AlagaLahat
          </Link>
          <nav style={{ display: "flex", gap: 10, fontSize: 14, color: "hsl(var(--muted-foreground))" }}>
            <Link href="/lost-pets">Lost Pets</Link>
            <Link href="/lost-pets/report">Report</Link>
            <Link href="/lost-pets/admin">Admin</Link>
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            {email ? email : "Guest"}
          </span>
          {email ? (
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          ) : (
            <Button asChild href="/login">
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

