export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_initials: string;
  user_color: string;
  text: string;
  created_at: string;
}

export interface Post {
  id: string;
  type: "regular" | "vaccination" | "lost" | "reunion" | "tip";
  user_id: string;
  user_name: string;
  user_initials: string;
  user_color: string;
  created_at: string;
  privacy: "public" | "barangay";
  text: string;
  image_url?: string;
  likes: number;
  shares: number;
  comments?: Comment[];
  // Metadata for specific post types
  lastSeenLocation?: string;
  reunionDays?: number;
  tipCategory?: string;
  petName?: string;
  vaccineName?: string;
  dateAdministered?: string;
  nextDueDate?: string;
  lostPetPhoto?: string;
  sightingsCount?: number;
}
