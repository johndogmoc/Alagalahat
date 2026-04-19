"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/components/SessionProvider";
import { IconPaw, IconSyringe, IconAlertTriangle } from "@/components/icons";

interface CreatePostBoxProps {
  onPost?: (content: string, type: string) => void;
}

export function CreatePostBox({ onPost }: CreatePostBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("general");
  const { initials } = useSession();

  const handleSubmit = () => {
    if (!content.trim()) return;
    if (onPost) onPost(content, postType);
    setContent("");
    setIsExpanded(false);
    setPostType("general");
  };

  return (
    <div className="create-post-box" style={{ transition: "all 300ms ease" }}>
      <div className="create-post-top" style={{ alignItems: isExpanded ? "flex-start" : "center", borderBottom: isExpanded ? "none" : "1px solid var(--color-border)" }}>
        <div className="create-post-avatar">{initials || "U"}</div>
        
        {isExpanded ? (
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share a pet update, vaccination record, or sighting…"
            style={{
              flex: 1, minHeight: 80, border: "none", background: "transparent",
              fontSize: 18, color: "var(--color-text)", resize: "none", outline: "none",
              fontFamily: "inherit", paddingTop: 8
            }}
          />
        ) : (
          <button type="button" className="create-post-input" onClick={() => setIsExpanded(true)}>
            Share a pet update, vaccination record, or sighting…
          </button>
        )}
      </div>

      {isExpanded && (
        <div style={{ padding: "16px 0 0", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
             <select 
               value={postType} 
               onChange={(e) => setPostType(e.target.value)}
               style={{ 
                 padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", 
                 background: "var(--color-background)", color: "var(--color-text)", outline: "none", fontSize: 13, fontWeight: 600
               }}
             >
               <option value="general">Updates & Stories</option>
               <option value="missing">Report Lost Pet</option>
               <option value="reunion">Reunited Pet</option>
               <option value="vaccination">Log Vaccination</option>
               <option value="tip">Share Care Tip</option>
             </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <Button variant="outline" onClick={() => { setIsExpanded(false); setContent(""); }}>Cancel</Button>
            <Button variant="primary" disabled={!content.trim()} onClick={handleSubmit}>Post Update</Button>
          </div>
        </div>
      )}

      {!isExpanded && (
        <div className="create-post-actions">
          <button type="button" className="create-post-action-btn" onClick={() => setIsExpanded(true)}>
            <span className="action-icon" style={{ color: "#22C55E" }}><IconPaw size={18} /></span>
            <span>Photo/Video</span>
          </button>
          <button type="button" className="create-post-action-btn" onClick={() => setIsExpanded(true)}>
            <span className="action-icon" style={{ color: "#3B82F6" }}><IconSyringe size={18} /></span>
            <span>Log Vaccination</span>
          </button>
          <button type="button" className="create-post-action-btn" onClick={() => { setIsExpanded(true); setPostType("missing"); }}>
            <span className="action-icon" style={{ color: "#EF4444" }}><IconAlertTriangle size={18} /></span>
            <span>Report Lost Pet</span>
          </button>
        </div>
      )}
    </div>
  );
}
