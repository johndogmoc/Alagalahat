"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export function Toaster() {
  return <SonnerToaster richColors closeButton />;
}

export { toast };

