"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/components/SessionProvider";
import type { Comment } from "../types";
import { getSupabaseClient } from "@/lib/supabase";
import { IconTrash2, IconMoreVertical } from "@/components/icons";
import { toast } from "@/components/ui/sonner";

interface CommentSectionProps {
  comments: Comment[];
  postId: string;
  onCommentsUpdate?: (comments: Comment[]) => void;
}

export function CommentSection({ comments: initialComments, postId, onCommentsUpdate }: CommentSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const { userName, initials } = useSession();
  const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

  // Sync comments when initialComments changes (from parent/localStorage)
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    const supabase = getSupabaseClient();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    const { data } = await supabase.from("post_comments").insert({
      post_id: postId,
      user_id: userData.user.id,
      user_name: userName || "User",
      user_initials: initials || "U",
      text: newComment.trim()
    }).select().single();
    
    if (data) {
      const comment: Comment = {
        id: data.id,
        user_id: data.user_id,
        user_name: data.user_name,
        user_initials: data.user_initials,
        user_color: data.user_color,
        text: data.text,
        created_at: data.created_at,
      };
      const updatedComments = [...comments, comment];
      setComments(updatedComments);
      if (onCommentsUpdate) onCommentsUpdate(updatedComments);
    }
    
    setNewComment("");
    setExpanded(true);
    toast.success("Comment posted!");
  }

  async function handleDeleteComment(commentId: string) {
    const supabase = getSupabaseClient();
    await supabase.from("post_comments").delete().eq("id", commentId);
    
    const updatedComments = comments.filter(c => c.id !== commentId);
    setComments(updatedComments);
    toast.success("Comment deleted");
    setShowMoreMenu(null);
    if (onCommentsUpdate) {
      onCommentsUpdate(updatedComments);
    }
  }

  const visibleComments = expanded ? comments : comments.slice(0, 1);
  const hiddenCount = comments.length - 1;

  if (comments.length === 0 && !expanded) {
    return (
      <div className="comment-section">
        <form onSubmit={handleSubmit} className="comment-input-row">
          <div
            className="comment-avatar"
            style={{ background: "var(--color-primary)", minWidth: 32, minHeight: 32 }}
          >
            {initials || "U"}
          </div>
          <input
            type="text"
            className="comment-input"
            placeholder="Write a comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            aria-label="Write a comment"
          />
        </form>
      </div>
    );
  }

  return (
    <div className="comment-section">
      {/* Toggle */}
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          className="comment-toggle-btn"
          onClick={() => setExpanded(true)}
        >
          View {hiddenCount} more comment{hiddenCount > 1 ? "s" : ""}
        </button>
      )}
      {expanded && comments.length > 1 && (
        <button
          type="button"
          className="comment-toggle-btn"
          onClick={() => setExpanded(false)}
        >
          Hide comments
        </button>
      )}

      {/* Comments */}
      {visibleComments.map((c) => (
        <div key={c.id}>
          <div className="comment-item" style={{ position: "relative" }}>
            <div className="comment-avatar" style={{ background: c.user_color || "var(--color-primary)", minWidth: 32, minHeight: 32 }}>
              {c.user_initials}
            </div>
            <div className="comment-bubble">
              <p className="comment-author">{c.user_name}</p>
              <p className="comment-text">{c.text}</p>
            </div>
            {/* Check if the user is the owner. For now, since we verify on server RLS, we can just show it and let it fail, 
                or ideally grab the user ID. Because this is client side, we'll let them try deleting and let RLS fail if unauthorized */}
              <div style={{ position: "relative", marginLeft: "auto" }}>
                <button
                  type="button"
                  onClick={() => setShowMoreMenu(showMoreMenu === c.id ? null : c.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    padding: "4px 8px", color: "var(--color-text-muted)"
                  }}
                >
                  <IconMoreVertical size={16} />
                </button>
                {showMoreMenu === c.id && (
                  <div style={{
                    position: "absolute", right: 0, top: "100%", marginTop: 4,
                    background: "var(--color-card)", border: "1px solid var(--color-border)",
                    borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 10
                  }}>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 12px",
                        background: "none", border: "none", cursor: "pointer", fontSize: 13,
                        color: "var(--color-error)", transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                      <IconTrash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
          </div>
          <p className="comment-time">{new Date(c.created_at).toLocaleString()}</p>
        </div>
      ))}

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="comment-input-row">
        <div
          className="comment-avatar"
          style={{ background: "var(--color-primary)", minWidth: 32, minHeight: 32 }}
        >
          {initials || "U"}
        </div>
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          aria-label="Write a comment"
        />
      </form>
    </div>
  );
}
