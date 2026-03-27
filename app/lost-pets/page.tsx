import { Navbar } from "@/components/Navbar";
import { LostPetAnnouncementBoard } from "@/components/lost-pets/LostPetAnnouncementBoard";

export default function LostPetsPage() {
  return (
    <div>
      <Navbar />
      <header className="container" style={{ paddingTop: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Lost Pet Announcements</h1>
        <p style={{ marginTop: 6, marginBottom: 0, color: "hsl(var(--muted-foreground))" }}>
          Verified community alerts for missing pets. You must be logged in to view the board.
        </p>
      </header>
      <LostPetAnnouncementBoard />
    </div>
  );
}

