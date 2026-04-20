"use client";

import { useState } from "react";

import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { IconAlertTriangle, IconChevronRight, IconSearch } from "@/components/icons";
import { articles } from "@/lib/data/articles";

/* ================================================
   Care Guide Data
   ================================================ */
const categories = [
  { id: "all", label: "All", icon: "" },
  { id: "health", label: "Health", icon: "" },
  { id: "nutrition", label: "Nutrition", icon: "" },
  { id: "behavior", label: "Behavior", icon: "" },
  { id: "training", label: "Training", icon: "" },
  { id: "first_aid", label: "First Aid", icon: "" },
  { id: "grooming", label: "Grooming", icon: "️" },
];


const vaccinationSchedule = {
  dogs: [
    { age: "6-8 weeks", vaccine: "DHPP (1st dose)", notes: "Distemper, Hepatitis, Parvovirus, Parainfluenza" },
    { age: "10-12 weeks", vaccine: "DHPP (2nd dose)", notes: "Booster shot" },
    { age: "14-16 weeks", vaccine: "DHPP (3rd dose) + Rabies", notes: "First rabies vaccine" },
    { age: "1 year", vaccine: "DHPP + Rabies booster", notes: "Annual booster" },
    { age: "Every year", vaccine: "Annual boosters", notes: "DHPP and Rabies required by Philippine law" },
  ],
  cats: [
    { age: "6-8 weeks", vaccine: "FVRCP (1st dose)", notes: "Feline viral rhinotracheitis, calicivirus, panleukopenia" },
    { age: "10-12 weeks", vaccine: "FVRCP (2nd dose)", notes: "Booster shot" },
    { age: "14-16 weeks", vaccine: "FVRCP (3rd dose) + Rabies", notes: "First rabies vaccine" },
    { age: "1 year", vaccine: "FVRCP + Rabies booster", notes: "Annual booster" },
    { age: "Every year", vaccine: "Annual boosters", notes: "Rabies required by Philippine law" },
  ]
};

const firstAidGuides = [
  { title: "️ Heatstroke", steps: ["Move pet to shade/cool area", "Apply cool (not cold) water to body", "Place wet towels on neck & paws", "Offer small sips of water", "Rush to vet immediately"] },
  { title: " Choking", steps: ["Open mouth and check for visible objects", "Use tweezers to remove if visible", "For dogs: modified Heimlich maneuver", "For cats: gentle chest thrusts", "See vet even if object removed"] },
  { title: " Poisoning", steps: ["Identify what was ingested if possible", "Do NOT induce vomiting unless told by vet", "Call your vet or animal poison hotline", "Bring the toxic substance packaging to vet", "Monitor breathing and consciousness"] },
  { title: " Wound Care", steps: ["Apply gentle pressure with clean cloth", "Clean wound with mild antiseptic", "Do NOT use alcohol or hydrogen peroxide", "Apply antibiotic ointment", "Bandage loosely and see vet"] }
];

/* ================================================
   Component
   ================================================ */
export default function CareGuidePage() {
  const [activeTab, setActiveTab] = useState<"articles" | "vaccines" | "first_aid">("articles");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [vaxSpecies, setVaxSpecies] = useState<"dogs" | "cats">("dogs");

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = selectedCategory === "all" || a.category === selectedCategory;
    const matchesSearch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AuthShell>
      {/* Hero */}
      <section className="post-card" style={{
        background: "linear-gradient(135deg, #1B4F8A 0%, #2A9D8F 100%)",
        padding: "24px 20px",
        color: "#fff",
        textAlign: "center",
        border: "none",
        marginBottom: 20
      }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "0 0 8px", color: "#fff" }}>
          Pet Care Guide 
        </h1>
        <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 480, margin: "0 auto", color: "#fff" }}>
          Expert advice on health, nutrition, behavior, and emergency care for your pets.
        </p>
      </section>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Tabs */}
        <div style={{
          display: "flex", gap: 0, borderBottom: "2px solid var(--color-border)",
          marginBottom: 32, justifyContent: "center"
        }}>
          {[
            { id: "articles" as const, label: "Articles", icon: "" },
            { id: "vaccines" as const, label: "Vaccination Schedule", icon: "" },
            { id: "first_aid" as const, label: "First Aid", icon: "" },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
              className="tab-button"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "12px 20px", fontSize: 14, fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? "var(--color-primary)" : "var(--color-text-muted)",
                background: "none", border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? "var(--color-primary)" : "transparent"}`,
                marginBottom: -2, cursor: "pointer", fontFamily: "inherit", minHeight: 44, whiteSpace: "nowrap"
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {activeTab === "articles" && (
          <div>
            <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 600 }}>
                <IconSearch size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                <input
                  type="text"
                  placeholder="Search articles…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-base input-has-left-icon"
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, justifyContent: "center" }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 20, border: "1px solid",
                    borderColor: selectedCategory === cat.id ? "var(--color-primary)" : "var(--color-border)",
                    background: selectedCategory === cat.id ? "var(--color-primary)" : "var(--color-card)",
                    color: selectedCategory === cat.id ? "#fff" : "var(--color-text-muted)",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms ease", minHeight: 36
                  }}
                >
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filteredArticles.map((article) => (
                <Link href={`/care-guide/${article.slug}`} key={article.id} style={{
                  background: "var(--color-card)", border: "1px solid var(--color-border)",
                  borderRadius: 14, padding: 24, boxShadow: "var(--shadow-sm)",
                  display: "flex", flexDirection: "column", gap: 12, textDecoration: "none",
                  transition: "all 250ms ease", cursor: "pointer"
                }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {article.tags.map((tag) => (
                      <span key={tag} style={{
                        padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                        background: "var(--color-primary)" + "12", color: "var(--color-primary)"
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "var(--color-text)", lineHeight: 1.4 }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0, flex: 1 }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--color-border)" }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{article.readTime}</span>
                    <span style={{ fontSize: 13, color: "var(--color-primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      Read more <IconChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div style={{ textAlign: "center", padding: 48, color: "var(--color-text-muted)" }}>
                <p style={{ margin: 0, fontSize: 15 }}>No articles found matching your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Vaccination Schedule Tab */}
        {activeTab === "vaccines" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
              {(["dogs", "cats"] as const).map((species) => (
                <button
                  key={species}
                  onClick={() => setVaxSpecies(species)}
                  style={{
                    padding: "8px 20px", borderRadius: 20, border: "2px solid",
                    borderColor: vaxSpecies === species ? "var(--color-primary)" : "var(--color-border)",
                    background: vaxSpecies === species ? "var(--color-primary)" : "var(--color-card)",
                    color: vaxSpecies === species ? "#fff" : "var(--color-text)",
                    fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 200ms ease", minHeight: 40
                  }}
                >
                  {species === "dogs" ? " Dogs" : " Cats"}
                </button>
              ))}
            </div>

            <div style={{
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: 14, overflow: "hidden", boxShadow: "var(--shadow-sm)"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text)" }}>Age</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text)" }}>Vaccine</th>
                    <th style={{ textAlign: "left", padding: "14px 20px", fontWeight: 700, color: "var(--color-text)" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinationSchedule[vaxSpecies].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <td style={{ padding: "14px 20px", fontWeight: 600, color: "var(--color-primary)" }}>{row.age}</td>
                      <td style={{ padding: "14px 20px", fontWeight: 600 }}>{row.vaccine}</td>
                      <td style={{ padding: "14px 20px", color: "var(--color-text-muted)" }}>{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: 20, padding: 16, borderRadius: 12,
              background: "#E9C46A14", border: "1px solid #E9C46A30"
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text)" }}>
                <strong>️ Important:</strong> Under Philippine law (RA 9482 — Anti-Rabies Act), all dogs and cats must be vaccinated against rabies. Failure to vaccinate is punishable by law.
              </p>
            </div>
          </div>
        )}

        {/* First Aid Tab */}
        {activeTab === "first_aid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {firstAidGuides.map((guide) => (
              <div key={guide.title} style={{
                background: "var(--color-card)", border: "1px solid var(--color-border)",
                borderRadius: 14, padding: 24, boxShadow: "var(--shadow-sm)"
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 16px", color: "var(--color-text)" }}>
                  {guide.title}
                </h3>
                <ol style={{ margin: 0, padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                  {guide.steps.map((step, i) => (
                    <li key={i} style={{ fontSize: 14, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ))}

            <div style={{
              gridColumn: "1 / -1",
              padding: 20, borderRadius: 14,
              background: "#E76F5114", border: "1px solid #E76F5130",
              display: "flex", alignItems: "center", gap: 14
            }}>
              <IconAlertTriangle size={24} style={{ color: "#E76F51", flexShrink: 0 }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "var(--color-text)" }}>
                  In a serious emergency, ALWAYS rush your pet to the nearest veterinarian.
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
                  These first aid steps are temporary measures only. Professional veterinary care is essential.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
