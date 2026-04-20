/* ============================================
   Mock Data for AlagaLahat Social Feed
   ============================================ */

export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
  color: string;
  barangay: string;
  petCount: number;
}

export interface PetData {
  id: string;
  name: string;
  species: "Dog" | "Cat";
  breed: string;
  photo: string;
  vaccinationStatus: "vaccinated" | "pending" | "overdue";
  owner: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  text: string;
  time: string;
}

export interface Post {
  id: string;
  type: "regular" | "vaccination" | "lost" | "reunion" | "tip";
  userId: string;
  userName: string;
  userAvatar?: string;
  userInitials: string;
  userColor: string;
  timestamp: string;
  privacy: "public" | "barangay";
  text: string;
  image?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  // Vaccination-specific
  petName?: string;
  vaccineName?: string;
  dateAdministered?: string;
  nextDueDate?: string;
  // Lost pet-specific
  lastSeenLocation?: string;
  dateReported?: string;
  lostPetPhoto?: string;
  sightingsCount?: number;
  // Tip-specific
  tipCategory?: string;
  // Reunion-specific
  reunionDays?: number;
}

/* --- Current User --- */
export const currentUser: UserProfile = {
  id: "user-001",
  name: "John Carry Dogmoc",
  initials: "JC",
  color: "#2A9D8F",
  barangay: "Brgy. Poblacion",
  petCount: 3
};

/* --- Community Users --- */
export const communityUsers: UserProfile[] = [];

/* --- User's Pets --- */
export const myPets: PetData[] = [];

/* --- Feed Posts --- */
export const feedPosts: Post[] = [];

/* --- Lost Pet Alerts (Right Sidebar) --- */
export const activeLostAlerts: { id: string; pet_name: string; last_known_location: string; status: string; created_at: string }[] = [];

/* --- Suggested People --- */
export const suggestedPeople: { id: string; full_name: string; avatar_url: string | null }[] = [];

/* --- Community Highlights --- */
export const communityHighlights = {
  topOwner: { name: "Carlo Rivera", pets: 4, barangay: "Brgy. Zone 4", initials: "CR", color: "#06B6D4" },
  mostSharedPost: { title: "Snowball Lost Pet Alert", shares: 134, type: "lost" }
};
