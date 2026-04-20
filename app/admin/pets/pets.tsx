"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { IconPaw, IconCheck, IconX, IconAlertTriangle } from "@/components/icons";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  owner_name: string;
  color_markings: string;
  status: string;
  registration_number: string;
  created_at: string;
}

export default function AdminPetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Pending" | "Active" | "Rejected">("Pending");

  useEffect(() => {
    fetchPets();
  }, [filter]);

  async function fetchPets() {
    setLoading(true);
    const supabase = getSupabaseClient();
    
    let query = supabase
      .from("pets")
      .select("id, name, species, breed, owner_name, color_markings, status, registration_number, created_at")
      .order("created_at", { ascending: false });

    if (filter !== "All") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;
    if (data && !error) {
      setPets(data as Pet[]);
    } else if (error) {
       console.error("Error fetching pets:", error);
    }
    setLoading(false);
  }

  async function handlePetAction(petId: string, action: "Active" | "Rejected") {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData?.user?.id;

    if (!currentUserId) return;

    try {
      const updatePayload = {
        status: action,
        ...(action === "Active" ? { approved_by: currentUserId, approved_at: new Date().toISOString() } : {})
      };
      
      const { error } = await supabase
        .from("pets")
        .update(updatePayload)
        .eq("id", petId);

      if (!error) {
        setPets((prev) =>
          prev.map((p) => (p.id === petId ? { ...p, status: action } : p))
        );
      } else {
        console.error("Failed to update status", error);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="page-fade-in">
        {/* Premium Header Section with Gradient matching Admin Dashboard */}
        <div style={{
          marginBottom: 40,
          background: "linear-gradient(135deg, var(--color-primary) 0%, #003FA1 100%)",
          padding: "40px 32px",
          borderRadius: 20,
          boxShadow: "0 4px 24px rgba(0, 82, 204, 0.15)",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} aria-hidden="true" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: 16 }}>
              <IconPaw size={36} /> Pet Registry Management
            </h1>
            <p style={{ margin: "12px 0 0", fontSize: 15, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
              Review, approve, and proactively manage registered pets in the platform.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {(["Pending", "Active", "Rejected", "All"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                border: "none",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                background: filter === f ? "var(--color-primary)" : "var(--color-card)",
                color: filter === f ? "white" : "var(--color-text-muted)",
                boxShadow: filter === f ? "0 4px 12px rgba(27, 79, 138, 0.2)" : "var(--shadow-sm)"
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Pet Data Table container */}
        <div style={{
          background: "var(--color-card)", border: "1.5px solid var(--color-border)",
          borderRadius: 18, overflow: "hidden", boxShadow: "var(--shadow-sm)"
        }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)", fontWeight: 600 }}>Loading registry records...</div>
          ) : pets.length === 0 ? (
             <div style={{ padding: "60px 40px", textAlign: "center", color: "var(--color-text-muted)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EFF6FF", color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <IconPaw size={32} />
              </div>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>No pets found</p>
              <p style={{ margin: "8px 0 0", fontSize: 14 }}>There are currently no {filter !== "All" ? filter.toLowerCase() : ""} pet records to display.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--color-border)", background: "rgba(0,0,0,0.02)" }}>
                      <th style={{ textAlign: "left", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Pet Name</th>
                      <th style={{ textAlign: "left", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Species & Breed</th>
                      <th style={{ textAlign: "left", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Owner</th>
                      <th style={{ textAlign: "left", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Markings</th>
                      <th style={{ textAlign: "left", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</th>
                      <th style={{ textAlign: "center", padding: "18px 24px", fontWeight: 800, color: "var(--color-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pets.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--color-border)", transition: "all 150ms ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td style={{ padding: "18px 24px", fontWeight: 800, color: "var(--color-text)", fontSize: 15 }}>
                          {p.name}
                        </td>
                        <td style={{ padding: "18px 24px", color: "var(--color-text)" }}>
                           <span style={{ fontWeight: 700 }}>{p.species}</span> <br/>
                           <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>{p.breed}</span>
                        </td>
                        <td style={{ padding: "18px 24px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                           {p.owner_name || "Unknown"}
                        </td>
                        <td style={{ padding: "18px 24px", color: "var(--color-text-muted)", fontWeight: 500 }}>
                           {p.color_markings || "N/A"}
                        </td>
                        <td style={{ padding: "18px 24px" }}>
                           <span style={{
                              padding: "6px 14px", borderRadius: 24, fontSize: 12, fontWeight: 800,
                              background: p.status === "Active" ? "#ECFDF5" : p.status === "Pending" ? "#FFFBEB" : "#FEF2F2",
                              color: p.status === "Active" ? "#059669" : p.status === "Pending" ? "#D97706" : "#DC2626",
                              letterSpacing: "0.02em"
                            }}>
                              {p.status}
                           </span>
                        </td>
                        <td style={{ padding: "18px 24px", textAlign: "center" }}>
                          {p.status === "Pending" ? (
                            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                               <Button variant="outline" size="sm" asChild href={`/pets/${p.id}`} style={{ padding: "0 10px", height: 36, borderRadius: 12, border: "none", background: "rgba(0,0,0,0.05)" }} title="View Profile">
                                  <IconPaw size={16} />
                               </Button>
                               <Button variant="primary" size="sm" onClick={() => handlePetAction(p.id, "Active")} style={{ gap: 6, borderRadius: 12, fontWeight: 700, fontSize: 13, padding: "0 18px", height: 36 }}>
                                  <IconCheck size={16} /> Approve
                               </Button>
                               <Button variant="outline" size="sm" onClick={() => handlePetAction(p.id, "Rejected")} style={{ gap: 6, color: "#DC2626", borderColor: "#FECACA", borderRadius: 12, fontWeight: 700, fontSize: 13, padding: "0 18px", height: 36, background: "white" }}>
                                  <IconX size={16} /> Reject
                               </Button>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" asChild href={`/pets/${p.id}`} style={{ gap: 6, borderRadius: 12, fontWeight: 700, fontSize: 13, padding: "0 18px", height: 36 }}>
                               <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  View Profile
                               </span>
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
