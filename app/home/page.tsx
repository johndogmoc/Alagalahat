"use client";

import { useState, useMemo, useEffect } from "react";
import { IconPaw, IconHome, IconSyringe, IconAlertTriangle, IconMenu } from "@/components/icons";
import "./home.css";

import { HomeNavbar } from "./components/HomeNavbar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { CreatePostBox } from "./components/CreatePostBox";
import { FeedFilters } from "./components/FeedFilters";
import { PostCard } from "./components/PostCard";
import { useSession } from "@/components/SessionProvider";
import { getSupabaseClient } from "@/lib/supabase";
import type { Post } from "./types";

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userName, initials } = useSession();

  // Load live posts from Supabase
  useEffect(() => {
    async function loadPosts() {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("feed_posts")
        .select(`
          id, type, user_id, user_name, user_initials, user_color,
          created_at, privacy, text, image_url, likes, shares,
          post_comments (
            id, user_id, user_name, user_initials, user_color, text, created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (data && !error) {
        // Map Supabase columns to UI Post interface
        const formatted = data.map((d: any) => ({
          ...d,
          comments: d.post_comments || []
        }));
        setPosts(formatted);
      }
      setLoadingPosts(false);
      setIsHydrated(true);
    }
    loadPosts();
  }, []);

  const handleNewPost = async (content: string, type: string) => {
    const supabase = getSupabaseClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return; // safety

    const pType = type === "general" ? "regular" : type;
    
    // Insert into DB
    const { data, error } = await supabase.from("feed_posts").insert({
      user_id: userData.user.id,
      user_name: userName || "User",
      user_initials: initials || "U",
      text: content,
      type: pType,
      privacy: "public"
    }).select(`
      id, type, user_id, user_name, user_initials, user_color,
      created_at, privacy, text, image_url, likes, shares,
      post_comments (
        id, user_id, user_name, user_initials, user_color, text, created_at
      )
    `).single();

    if (data && !error) {
      setPosts([{...data, comments: data.post_comments || []}, ...posts]);
    }
  };

  const filteredPosts = useMemo(() => {
    if (activeFilter === "all") return posts;
    if (activeFilter === "lost") {
      return posts.filter((p) => p.type === "lost" || p.type === "reunion");
    }
    return posts.filter((p) => p.type === activeFilter);
  }, [activeFilter, posts]);

  const visiblePosts = filteredPosts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPosts.length;

  function loadMore() {
    setVisibleCount((prev) => prev + 5);
  }

  function handleFilterChange(filter: string) {
    setActiveFilter(filter);
    setVisibleCount(5);
  }

  return (
    <div className="home-page">
      {/* Top Navigation */}
      <HomeNavbar />

      {/* 3-Column Layout */}
      <div className="home-layout">
        {/* Left Sidebar */}
        <LeftSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        {/* Center Feed */}
        <main className="home-feed" role="main">
          {/* Create Post */}
          <CreatePostBox onPost={handleNewPost} />

          {/* Feed Filters */}
          <FeedFilters
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />

          {/* Posts */}
          {visiblePosts.length === 0 ? (
            <div style={{
              background: "var(--color-card)",
              borderRadius: 12,
              padding: "48px 24px",
              textAlign: "center",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--color-text-muted)", opacity: 0.5 }}>
                <IconPaw size={40} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--color-text)", margin: "0 0 6px" }}>
                No posts yet
              </p>
              <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
                Be the first to share a pet update in this category!
              </p>
            </div>
          ) : (
            visiblePosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                onPostUpdate={(updatedPost) => {
                  setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
                }}
              />
            ))
          )}

          {/* Load More */}
          {hasMore && (
            <button
              type="button"
              className="load-more-btn"
              onClick={loadMore}
            >
              Load More Posts
            </button>
          )}

          {/* End of feed */}
          {!hasMore && visiblePosts.length > 0 && (
            <div style={{
              textAlign: "center",
              padding: "32px 16px",
              color: "var(--color-text-muted)",
              fontSize: 14
            }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, opacity: 0.5 }}>
                <IconPaw size={24} />
              </div>
              <p style={{ margin: 0, fontWeight: 600 }}>You&apos;re all caught up!</p>
              <p style={{ margin: "4px 0 0", fontSize: 13 }}>Check back later for new pet updates.</p>
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button className="bottom-nav-item active">
          <IconHome size={22} />
          Feed
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/pets'}>
          <IconPaw size={22} />
          My Pets
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/lost-pets'}>
          <IconAlertTriangle size={22} />
          Lost Pets
        </button>
        <button className="bottom-nav-item" onClick={() => window.location.href = '/pets'}>
          <IconSyringe size={22} />
          Vaccines
        </button>
        <button className="bottom-nav-item" onClick={() => setIsMobileMenuOpen(true)}>
          <IconMenu size={22} />
          More
        </button>
      </nav>
    </div>
  );
}
