export type FilingUserRole = "Owner" | "Staff" | "Admin" | "SuperAdmin";
export type LostPetReportStatus = "Pending" | "Active" | "Resolved" | "Archived";

export interface LostPetRegistrationSnapshot {
  petPhotoUrl: string | null;
  petName: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  color: string | null;
  size: string | null;
  vaccinationDetails: string | null;
  registrationNumber: string;
  ownerName: string;
  ownerContactNumber: string | null;
}

export interface LostPetReport {
  id: string;
  petId?: string | null;
  reporterId?: string | null;
  pet: LostPetRegistrationSnapshot;
  lastKnownLocation: string;
  missingAt: string; // ISO datetime
  notes?: string | null;
  filingUserRole: FilingUserRole;
  status: LostPetReportStatus;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  latitude?: number | null;
  longitude?: number | null;
  petBehavior?: string | null;
  rewardOffered?: string | null;
  specificPurok?: string | null;
  alternateContact?: string | null;
}

