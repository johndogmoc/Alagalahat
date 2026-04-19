import { ReactNode } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role as string | undefined;

  // Enforce correct role
  if (role !== "Admin" && role !== "SuperAdmin") {
    redirect("/home");
  }

  // Generate a display name for the shell
  const userName = (user.user_metadata?.full_name as string) || (user.email?.split("@")[0]) || "Admin";

  return (
    <DashboardShell role="Admin" userName={userName}>
      {children}
    </DashboardShell>
  );
}
