import "./globals.css";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata = {
  title: "AlagaLahat — Barangay Pet Registration & Management",
  description:
    "AlagaLahat is the official barangay pet registration, vaccination tracking, and lost pet alert system. Protecting your pets, serving your barangay.",
  keywords: "pet registration, barangay, lost pets, vaccination, pet management",
  authors: [{ name: "AlagaLahat" }],
  openGraph: {
    title: "AlagaLahat — Barangay Pet Registration & Management",
    description: "Protecting your pets, serving your barangay.",
    type: "website"
  }
};

const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('alagalahat-theme') || 'system';
      if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);

      var font = localStorage.getItem('alagalahat-font-size');
      if (font) document.documentElement.setAttribute('data-fontsize', font);

      var contrast = localStorage.getItem('alagalahat-contrast');
      if (contrast) document.documentElement.setAttribute('data-contrast', contrast);
    } catch (e) {}
  })();
`;

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SidebarRole } from "@/components/Sidebar";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let role: SidebarRole | null = null;
  let userName: string | null = null;
  let initials: string | null = null;
  let barangay: string | null = null;

  if (user) {
    const r = user.user_metadata?.role;
    role = r === "SuperAdmin" || r === "Admin" ? "Admin" : r === "Staff" ? "Staff" : "Owner";
    
    // User name
    const fullName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "User";
    userName = fullName;
    
    // Initials
    const parts = fullName.trim().split(" ");
    initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : fullName.slice(0, 2).toUpperCase();
      
    // Barangay
    barangay = user.user_metadata?.barangay || "";
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <SessionProvider role={role} userName={userName} initials={initials} barangay={barangay}>
          <AccessibilityProvider>
            <Toaster />
            {children}
          </AccessibilityProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
