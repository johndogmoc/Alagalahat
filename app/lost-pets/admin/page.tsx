import { Navbar } from "@/components/Navbar";
import { LostPetReportList } from "@/components/lost-pets/LostPetReportList";

export default function LostPetAdminPage() {
  return (
    <div>
      <Navbar />
      <header className="container" style={{ paddingTop: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Admin • Lost Pet Reports</h1>
        <p style={{ marginTop: 6, marginBottom: 0, color: "hsl(var(--muted-foreground))" }}>
          Review, edit, approve, and manage lost pet reports.
        </p>
      </header>
      <LostPetReportList />
    </div>
  );
}

