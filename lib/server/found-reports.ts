import { canSeeFoundThisPet, normalizeRole } from "@/lib/permissions";
import type { AppRole } from "@/lib/permissions";

export type FoundReportContactPreference = "phone" | "email" | "in_app_chat";

export interface FoundReportEligibilityRecord {
  id: string;
  reporter_id: string | null;
  status: string;
}

export interface FoundReportPayloadInput {
  foundLocation: string;
  foundAt: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  contactPreference: FoundReportContactPreference;
  contactValue: string | null;
  imageUrls: string[];
}

export interface FoundReportValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateFoundReportPayload(payload: FoundReportPayloadInput): FoundReportValidationResult {
  const errors: Record<string, string> = {};
  const trimmedLocation = payload.foundLocation.trim();
  const trimmedDescription = payload.description.trim();
  const trimmedContactValue = payload.contactValue?.trim() ?? "";

  if (!trimmedLocation) {
    errors.foundLocation = "Location is required.";
  } else if (trimmedLocation.length > 200) {
    errors.foundLocation = "Location must be 200 characters or less.";
  }

  if (!payload.foundAt) {
    errors.foundAt = "Date and time found are required.";
  } else {
    const foundAtDate = new Date(payload.foundAt);
    if (Number.isNaN(foundAtDate.getTime())) {
      errors.foundAt = "Date and time found are invalid.";
    } else if (foundAtDate.getTime() > Date.now()) {
      errors.foundAt = "Date and time found cannot be in the future.";
    }
  }

  if (!trimmedDescription) {
    errors.description = "Description is required.";
  } else if (trimmedDescription.length > 500) {
    errors.description = "Description must be 500 characters or less.";
  }

  if (payload.imageUrls.length > 5) {
    errors.images = "You can upload up to 5 images only.";
  }

  if (payload.contactPreference === "phone" || payload.contactPreference === "email") {
    if (!trimmedContactValue) {
      errors.contactValue = `A ${payload.contactPreference} contact value is required.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function buildFoundReportInsert(
  lostPetReportId: string,
  reporterId: string,
  payload: FoundReportPayloadInput
) {
  return {
    lost_pet_report_id: lostPetReportId,
    reporter_id: reporterId,
    found_location: payload.foundLocation.trim(),
    found_at: new Date(payload.foundAt).toISOString(),
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description.trim(),
    contact_preference: payload.contactPreference,
    contact_value: payload.contactValue?.trim() || null,
    image_urls: payload.imageUrls,
    status: "submitted"
  };
}

export function getFoundThisPetEligibility(args: {
  role: unknown;
  requesterId: string | null | undefined;
  report: FoundReportEligibilityRecord | null;
}) {
  const role = normalizeRole(args.role);
  const canSubmit = canSeeFoundThisPet({
    role,
    requesterId: args.requesterId,
    reporterId: args.report?.reporter_id
  });

  if (!args.report) {
    return {
      allowed: false,
      reason: "missing"
    } as const;
  }

  if (role === "Admin" || role === "SuperAdmin") {
    return {
      allowed: false,
      reason: "admin"
    } as const;
  }

  if (!args.requesterId) {
    return {
      allowed: false,
      reason: "anonymous"
    } as const;
  }

  if (!canSubmit) {
    return {
      allowed: false,
      reason: "original_poster"
    } as const;
  }

  return {
    allowed: true,
    role: role as AppRole
  } as const;
}
