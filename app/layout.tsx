import "./globals.css";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  title: "AlagaLahat",
  description: "Barangay pet registration and management system"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster />
        {children}
      </body>
    </html>
  );
}

