import { Navbar } from "@/components/Navbar";
import { LostPetReportForm } from "@/components/lost-pets/LostPetReportForm";

export default function LostPetReportPage() {
  return (
    <div>
      <Navbar />
      <header className="container" style={{ paddingTop: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Report a Lost Pet</h1>
      </header>
      <LostPetReportForm />
    </div>
  );
}

