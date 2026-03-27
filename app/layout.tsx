import "./globals.css";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-fontsize="medium" data-contrast="normal" suppressHydrationWarning>
      <body>
        <AccessibilityProvider>
          <Toaster />
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
