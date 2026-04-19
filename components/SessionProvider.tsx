"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SidebarRole } from "@/components/Sidebar";

interface SessionContextType {
  role: SidebarRole | null;
  userName: string | null;
  initials: string | null;
  barangay: string | null;
}

const SessionContext = createContext<SessionContextType>({
  role: null,
  userName: null,
  initials: null,
  barangay: null,
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ 
  children, 
  role, 
  userName,
  initials,
  barangay
}: { 
  children: ReactNode; 
  role: SidebarRole | null;
  userName: string | null;
  initials: string | null;
  barangay: string | null;
}) {
  return (
    <SessionContext.Provider value={{ role, userName, initials, barangay }}>
      {children}
    </SessionContext.Provider>
  );
}
