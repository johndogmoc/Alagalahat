"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { IconDownload, IconPrinter, IconCheck } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Pet {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed: string | null;
  color: string | null;
  gender: string | null;
  date_of_birth: string | null;
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
  created_at: string;
}

interface Vaccination {
  vaccine_name: string;
  date_administered: string;
}

export default function CertificatesPage() {
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [shellRole, setShellRole] = useState<"Owner" | "Staff" | "Admin">("Owner");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      const role = user.user_metadata?.role || "Owner";
      setShellRole(role === "SuperAdmin" || role === "Admin" ? "Admin" : role === "Staff" ? "Staff" : "Owner");
      setUserName((user.user_metadata?.full_name as string | undefined) || user.email?.split("@")[0] || "User");
      setUserEmail(user.email || "");

      // Fetch pets
      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, species, breed, color, gender, date_of_birth, registration_number, status, created_at")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (mounted && petData && petData.length > 0) {
        setPets(petData as Pet[]);
        setSelectedPetId(petData[0].id);

        // Fetch vaccinations for first pet
        const { data: vacData } = await supabase
          .from("vaccinations")
          .select("vaccine_name, date_administered")
          .eq("pet_id", petData[0].id)
          .limit(5);

        setVaccinations((vacData as Vaccination[]) ?? []);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (selectedPetId) {
      let mounted = true;
      async function loadVaccinations() {
        const supabase = getSupabaseClient();
        const { data: vacData } = await supabase
          .from("vaccinations")
          .select("vaccine_name, date_administered")
          .eq("pet_id", selectedPetId)
          .limit(5);

        if (mounted) {
          setVaccinations((vacData as Vaccination[]) ?? []);
        }
      }
      loadVaccinations();
      return () => {
        mounted = false;
      };
    }
  }, [selectedPetId]);

  const selectedPet = pets.find(p => p.id === selectedPetId);

  // Generate QR code when pet changes
  useEffect(() => {
    if (selectedPetId && selectedPet?.registration_number) {
      const generateQR = async () => {
        try {
          const QRCode = await import("qrcode");
          const url = await QRCode.toDataURL(
            `https://barangay.local/pet/${selectedPet.registration_number}`,
            { width: 200, margin: 2 }
          );
          setQrCodeUrl(url);
        } catch (err) {
          console.error("QR Code generation error:", err);
        }
      };
      generateQR();
    }
  }, [selectedPetId, selectedPet?.registration_number]);

  const getSpeciesEmoji = (species: string) => {
    switch (species?.toLowerCase()) {
      case "dog": return "🐕";
      case "cat": return "🐱";
      default: return "🐾";
    }
  };

  if (loading) {
    return (
      <DashboardShell role={shellRole} userName={userName}>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role={shellRole} userName={userName}>
      {/* HEADER */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#0f2a4a] to-[#1e4976] p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pet Certificates</h1>
            <p className="mt-2 text-blue-100">Official registration certificates for your pets</p>
          </div>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="rounded-xl border border-[#e2e8f0] bg-white p-12 text-center">
          <p className="text-gray-600 mb-4">No pets registered yet.</p>
          <Button variant="primary" asChild href="/owner/register-pet">
            Register a Pet
          </Button>
        </div>
      ) : (
        <>
          {/* PET SELECTOR */}
          <div className="mb-8">
            <p className="mb-4 text-sm font-semibold text-gray-700">SELECT PET</p>
            <div className="flex gap-4 flex-wrap">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`flex flex-1 min-w-[280px] items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                    selectedPetId === pet.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-[#e2e8f0] bg-white hover:border-blue-200"
                  }`}
                >
                  <span className="text-4xl">{getSpeciesEmoji(pet.species)}</span>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {pet.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pet.species}</p>
                    <p className="font-mono text-xs text-blue-600">#{pet.registration_number || "Not assigned"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Records
                    </Button>
                    <Button variant="primary" size="sm">
                      Profile
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPet && (
            <>
              {/* CERTIFICATE DOCUMENT */}
              <div className="rounded-xl border border-[#e2e8f0] bg-white overflow-hidden shadow-lg">
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-[#0f2a4a] to-[#1e4976] px-8 py-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">🏛️</span>
                      <div>
                        <p className="text-sm uppercase tracking-widest text-blue-100">Official Document</p>
                        <h2 className="text-2xl font-bold">Certificate of Pet Registration</h2>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-blue-100">Issued: {new Date(selectedPet.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                      <p className="text-blue-100 mt-1">Valid Until: {new Date(new Date(selectedPet.created_at).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                    </div>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="grid grid-cols-2 gap-8 p-8">
                  {/* LEFT: Pet Information */}
                  <div>
                    <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-600">Pet Information</h3>
                    <div className="space-y-5">
                      <div>
                        <p className="text-10px font-bold uppercase text-gray-500">Pet Name</p>
                        <p className="mt-1 text-xl font-bold text-gray-900">{selectedPet.name}</p>
                      </div>
                      <div>
                        <p className="text-10px font-bold uppercase text-gray-500">Species & Breed</p>
                        <p className="mt-1 text-base font-semibold text-gray-900">{selectedPet.species} {selectedPet.breed ? `• ${selectedPet.breed}` : ""}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-10px font-bold uppercase text-gray-500">Color</p>
                          <p className="mt-1 text-base font-semibold text-gray-900">{selectedPet.color || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-10px font-bold uppercase text-gray-500">Gender</p>
                          <p className="mt-1 text-base font-semibold text-gray-900">{selectedPet.gender || "N/A"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-10px font-bold uppercase text-gray-500">Date of Birth</p>
                        <p className="mt-1 text-base font-mono font-semibold text-gray-900">
                          {selectedPet.date_of_birth ? new Date(selectedPet.date_of_birth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                        </p>
                      </div>
                      <div className="border-t border-[#e2e8f0] pt-4">
                        <p className="text-10px font-bold uppercase text-gray-500">Registration No.</p>
                        <p className="mt-1 text-lg font-mono font-bold text-blue-600">{selectedPet.registration_number || "Pending"}</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Owner Info & Vaccinations & QR Code */}
                  <div>
                    <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-gray-600">Owner Information</h3>
                    <div className="mb-8 space-y-5">
                      <div>
                        <p className="text-10px font-bold uppercase text-gray-500">Owner Name</p>
                        <p className="mt-1 text-base font-semibold text-gray-900">{userName}</p>
                      </div>
                      <div>
                        <p className="text-10px font-bold uppercase text-gray-500">Email</p>
                        <p className="mt-1 text-base font-semibold text-gray-900">{userEmail}</p>
                      </div>
                    </div>

                    {/* Vaccination Status */}
                    {vaccinations.length > 0 && (
                      <>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-600">Vaccination Status</h3>
                        <div className="mb-6 flex flex-wrap gap-2">
                          {vaccinations.map((vac, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold"
                            >
                              <IconCheck size={12} />
                              {vac.vaccine_name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {/* QR Code */}
                    <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4">
                      {qrCodeUrl && (
                        <>
                          <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                          <p className="mt-2 text-center text-xs text-gray-600 font-semibold">Scan to verify</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Certificate Footer */}
                <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-gray-50 px-8 py-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <p className="text-sm font-bold text-green-700">Officially Registered</p>
                      <p className="text-xs text-gray-600">This certificate is issued by the Barangay Health Office</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="inline-flex items-center gap-2 border-gray-300"
                    >
                      <IconPrinter size={18} />
                      Print
                    </Button>
                    <Button
                      variant="primary"
                      className="inline-flex items-center gap-2 bg-[#0f2a4a] hover:bg-[#1e4976]"
                    >
                      <IconDownload size={18} />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardShell>
  );
}
