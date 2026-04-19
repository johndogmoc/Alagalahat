"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { useSession } from "@/components/SessionProvider";
import { IconChevronRight, IconBell, IconUser, IconPaw, IconMessageCircle, IconBarangaySeal, IconAlertTriangle } from "@/components/icons";

interface LostAlert {
  id: string;
  pet_name: string;
  last_known_location: string;
  status: string;
  created_at: string;
}

export function RightSidebar() {
  const { initials } = useSession();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  
  const [alerts, setAlerts] = useState<LostAlert[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = getSupabaseClient();
      
      // Load real lost pets
      const { data: lostPets } = await supabase
        .from("lost_pet_reports")
        .select("id, pet_name, last_known_location, status, created_at")
        .in("status", ["Pending", "Active"])
        .limit(3);
        
      if (lostPets) setAlerts(lostPets);

      // Load Pet Owners (just getting recent active users for now)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .limit(4);
      
      if (profiles) setUsers(profiles);

      // Load Community Highlights (Top liked posts)
      const { data: topPosts } = await supabase
        .from("feed_posts")
        .select("id, content, likes, author_name")
        .order("likes", { ascending: false })
        .limit(2);
        
      if (topPosts) setHighlights(topPosts);

      setLoading(false);
    }
    loadData();
  }, []);

  function toggleFollow(id: string) {
    setFollowing((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <aside className="home-right-sidebar" aria-label="Sidebar widgets">

      {/* ---- Active Lost Pet Alerts ---- */}
      <div className="right-widget">
        <h3 className="right-widget-title"><IconBell size={18} /> Active Lost Pet Alerts</h3>
        
        {loading ? (
          <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div style={{ background: "var(--color-background)", padding: 12, borderRadius: 8, textAlign: "center" }}>
            <IconPaw size={24} style={{ color: "var(--color-text-light)", marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-muted)" }}>No active lost pet reports in your area. Good news!</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="alert-mini-card">
              <div className="alert-mini-avatar" style={{ background: "var(--color-coral)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconAlertTriangle size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "var(--color-text)" }}>
                  {alert.pet_name}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-muted)" }}>
                  Last seen: {alert.last_known_location || "Unknown"}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#E76F51", fontWeight: 600 }}>
                  Reported {new Date(alert.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
        <Link href="/lost-pets" className="right-widget-link">
          View All Alerts <IconChevronRight size={14} />
        </Link>
      </div>

      {/* ---- People You May Know ---- */}
      <div className="right-widget">
        <h3 className="right-widget-title"><IconUser size={18} /> Pet Owners Near You</h3>
        {loading ? (
           <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Finding locals...</p>
        ) : users.length === 0 ? (
           <div style={{ padding: "12px 0", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>No suggestions right now.</p>
           </div>
        ) : (
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             {users.map(u => (
               <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                 <div style={{ width: 36, height: 36, borderRadius: 18, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                   {u.avatar_url ? <img src={u.avatar_url} alt={u.full_name} style={{ width: 36, height: 36, borderRadius: 18, objectFit: "cover" }}/> : (u.full_name?.charAt(0) || "U")}
                 </div>
                 <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{u.full_name || "Pet Owner"}</p>
                 </div>
                 <button 
                    onClick={() => toggleFollow(u.id)}
                    style={{ 
                       padding: "6px 12px", borderRadius: 12, border: "none", cursor: "pointer",
                       fontSize: 12, fontWeight: 600,
                       background: following.has(u.id) ? "var(--color-background)" : "rgba(38,70,83,0.1)",
                       color: following.has(u.id) ? "var(--color-text-muted)" : "var(--color-primary)"
                    }}
                 >
                   {following.has(u.id) ? "Connected" : "Connect"}
                 </button>
               </div>
             ))}
           </div>
        )}
      </div>

      {/* ---- Community Highlights ---- */}
      <div className="right-widget">
        <h3 className="right-widget-title"><IconPaw size={18} /> Community Highlights</h3>
        {loading ? (
           <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Loading highlights...</p>
        ) : highlights.length === 0 ? (
           <div style={{ padding: "12px 0", textAlign: "center" }}>
             <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>Post engagement data is gathering...</p>
           </div>
        ) : (
           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
             {highlights.map(post => (
               <div key={post.id} style={{ background: "var(--color-background)", padding: 12, borderRadius: 8, border: "1px solid var(--color-border)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-muted)", fontWeight: 500 }}>
                     Popluar by <span style={{ color: "var(--color-primary)" }}>{post.author_name}</span>
                  </p>
                  <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                     "{post.content}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#E9C46A", fontSize: 12, fontWeight: 700 }}>
                     <IconPaw size={14} /> {post.likes} Likes
                  </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </aside>
  );
}
