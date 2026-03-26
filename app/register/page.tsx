"use client";

import { useMemo, useState } from "react";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { getSupabaseClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => Boolean(email.trim()) && password.length >= 6, [email, password]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. You can now log in.");
  }

  return (
    <div>
      <Navbar />
      <main className="container" style={{ paddingBlock: 32 }}>
        <Card style={{ maxWidth: 520, marginInline: "auto" }}>
          <CardHeader>
            <CardTitle>Register</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                />
              </div>
              <Button disabled={!canSubmit || isLoading} type="submit">
                {isLoading ? "Creating..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

