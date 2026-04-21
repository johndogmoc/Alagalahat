export type AppRole = "Owner" | "Staff" | "Admin" | "SuperAdmin";

export interface FoundThisPetVisibilityInput {
  role: AppRole | null | undefined;
  requesterId: string | null | undefined;
  reporterId: string | null | undefined;
}

export function normalizeRole(role: unknown): AppRole | null {
  if (role === "Owner" || role === "Staff" || role === "Admin" || role === "SuperAdmin") {
    return role;
  }

  return null;
}

export function isAdminRole(role: unknown): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "Admin" || normalizedRole === "SuperAdmin";
}

export function canManageVaccinations(role: unknown): boolean {
  return isAdminRole(role);
}

export function canPrintCertificates(role: unknown): boolean {
  return isAdminRole(role);
}

export function canSeeFoundThisPet(input: FoundThisPetVisibilityInput): boolean {
  const normalizedRole = normalizeRole(input.role);

  if (!normalizedRole || isAdminRole(normalizedRole)) {
    return false;
  }

  if (!input.requesterId || !input.reporterId) {
    return false;
  }

  return input.requesterId !== input.reporterId;
}
