import { canManageVaccinations, canPrintCertificates, normalizeRole } from "@/lib/permissions";
import type { AppRole } from "@/lib/permissions";

export function requireAdminVaccinationAccess(role: unknown) {
  const normalizedRole = normalizeRole(role);

  if (!canManageVaccinations(normalizedRole)) {
    return {
      ok: false as const,
      status: 403,
      message: "Only admin users can manage vaccination records."
    };
  }

  return {
    ok: true as const,
    role: normalizedRole as AppRole
  };
}

export function requireAdminCertificateAccess(role: unknown) {
  const normalizedRole = normalizeRole(role);

  if (!canPrintCertificates(normalizedRole)) {
    return {
      ok: false as const,
      status: 403,
      message: "Only admin users can print registration certificates."
    };
  }

  return {
    ok: true as const,
    role: normalizedRole as AppRole
  };
}
