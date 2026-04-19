"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Button } from "@/components/ui/button";
import { IconCheck, IconSyringe, IconAlertTriangle, IconClock, IconPlus } from "@/components/icons";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Pet {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  registration_number: string | null;
  status: "Pending" | "Approved" | "Rejected";
}

interface Vaccination {
  id: string;
  pet_id: string;
  vaccine_name: string;
  date_administered: string;
  next_due_date: string;
}

export default function VaccinesPage() {
  const router = useRouter();
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [shellRole, setShellRole] = useState<"Owner" | "Staff" | "Admin">("Owner");

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

      // Fetch pets
      const { data: petData } = await supabase
        .from("pets")
        .select("id, name, species, registration_number, status")
        .eq("owner_user_id", user.id)
        .order("created_at", { ascending: false });

      if (mounted && petData && petData.length > 0) {
        setPets(petData as Pet[]);
        setSelectedPetId(petData[0].id);

        // Fetch vaccinations for first pet
        const { data: vacData } = await supabase
          .from("vaccinations")
          .select("id, pet_id, vaccine_name, date_administered, next_due_date")
          .eq("pet_id", petData[0].id)
          .order("next_due_date", { ascending: true });

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
          .select("id, pet_id, vaccine_name, date_administered, next_due_date")
          .eq("pet_id", selectedPetId)
          .order("next_due_date", { ascending: true });

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
  const getSpeciesEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case "dog": return "🐕";
      case "cat": return "🐱";
      default: return "🐾";
    }
  };

  const getVaccinationStatus = (dateAdministered: string, nextDueDate: string) => {
    const now = new Date();
    const nextDue = new Date(nextDueDate);
    const daysUntilDue = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= 30) return "dueSoon";
    return "complete";
  };

  // Calculate stats
  const completeCount = vaccinations.filter(v => getVaccinationStatus(v.date_administered, v.next_due_date) === "complete").length;
  const dueSoonCount = vaccinations.filter(v => getVaccinationStatus(v.date_administered, v.next_due_date) === "dueSoon").length;
  const overdueCount = vaccinations.filter(v => getVaccinationStatus(v.date_administered, v.next_due_date) === "overdue").length;

  if (loading) {
    return (
      <DashboardShell role={shellRole} userName={userName}>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
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
            <h1 className="text-3xl font-bold">Vaccination Schedules</h1>
            <p className="mt-2 text-blue-100">Track and manage your pets' vaccination records</p>
          </div>
          <Button
            variant="primary"
            className="inline-flex items-center gap-2 bg-white text-[#0f2a4a] hover:bg-blue-50"
          >
            <IconPlus size={18} />
            Add Vaccination
          </Button>
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
          {/* STATS ROW */}
          <div className="mb-8 grid grid-cols-3 gap-6">
            {/* Complete Stats */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-3">
                  <IconCheck size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Vaccines Complete</p>
                  <p className="text-2xl font-bold text-gray-900">{completeCount}</p>
                </div>
              </div>
            </div>

            {/* Due Soon Stats */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-3">
                  <IconClock size={24} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Due Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{dueSoonCount}</p>
                </div>
              </div>
            </div>

            {/* Overdue Stats */}
            <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-100 p-3">
                  <IconAlertTriangle size={24} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{overdueCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PET SELECTOR */}
          <div className="mb-8">
            <p className="mb-4 text-sm font-semibold text-gray-700">SELECT PET</p>
            <div className="flex gap-4">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  onClick={() => setSelectedPetId(pet.id)}
                  className={`flex flex-1 items-center gap-4 rounded-xl border-2 p-4 transition-all ${
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
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{pet.species}</p>
                    <p className="font-mono text-xs text-blue-600">#{pet.registration_number || "Not assigned"}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* VACCINATION RECORDS TABLE */}
          <div className="rounded-xl border border-[#e2e8f0] bg-white">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] p-6">
              <h2 className="text-xl font-bold text-gray-900">Vaccination Records</h2>
              <Button
                variant="secondary"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <IconPlus size={16} className="mr-2" />
                Add Record
              </Button>
            </div>

            {vaccinations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No vaccination records for this pet yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                        Vaccine Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                        Date Given
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                        Next Due
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-600">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-gray-600">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vaccinations.map((vaccine) => {
                      const status = getVaccinationStatus(vaccine.date_administered, vaccine.next_due_date);
                      const bgClass =
                        status === "overdue"
                          ? "bg-red-50"
                          : status === "dueSoon"
                            ? "bg-yellow-50"
                            : "bg-white";

                      const statusConfig =
                        status === "complete"
                          ? { label: "Complete", badgeClass: "bg-green-100 text-green-700" }
                          : status === "dueSoon"
                            ? { label: "Due Soon", badgeClass: "bg-amber-100 text-amber-700" }
                            : { label: "Overdue", badgeClass: "bg-red-100 text-red-700" };

                      return (
                        <tr
                          key={vaccine.id}
                          className={`border-b border-[#e2e8f0] ${bgClass} hover:bg-opacity-75 transition-colors`}
                        >
                          <td className="px-6 py-4 font-semibold text-gray-900">{vaccine.vaccine_name}</td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">
                            {new Date(vaccine.date_administered).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">
                            {new Date(vaccine.next_due_date).toLocaleDateString("en-PH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.badgeClass}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
