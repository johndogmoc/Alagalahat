"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { Post } from "../types";
import { CommentSection } from "./CommentSection";
import { IconPaw, IconLink2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post) => void;
}

interface ReportReason {
  id: string;
  label: string;
  description: string;
}

const REPORT_REASONS: ReportReason[] = [
  { id: "spam", label: "Spam", description: "Spam or misleading content" },
  { id: "inappropriate", label: "Inappropriate", description: "Inappropriate or offensive content" },
  { id: "false-info", label: "False Information", description: "Contains false or misleading information" },
  { id: "harassment", label: "Harassment", description: "Harassment or hate speech" },
  { id: "fake-pet", label: "Fake Pet Alert", description: "Appears to be a fake or hoax" },
  { id: "other", label: "Other", description: "Something else" }
];

export function PostCard({ post, onPostUpdate }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [shareCount, setShareCount] = useState(post.shares);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [copied, setCopied] = useState(false);

  function toggleLike() {
    setLiked(!liked);
    const newCount = liked ? likeCount - 1 : likeCount + 1;
    setLikeCount(newCount);
    if (onPostUpdate) {
      onPostUpdate({ ...post, likes: newCount });
    }
  }

  function handleShare() {
    const postUrl = `${window.location.origin}/home?post=${post.id}`;
    navigator.clipboard.writeText(postUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    const newCount = shareCount + 1;
    setShareCount(newCount);
    if (onPostUpdate) {
      onPostUpdate({ ...post, shares: newCount });
    }
    toast.success("Post link copied to clipboard!");
    setShowShareMenu(false);
  }

  function handleSocialShare(platform: string) {
    const postUrl = `${window.location.origin}/home?post=${post.id}`;
    const text = `Check out this pet update on AlagaLahat: ${post.text.slice(0, 50)}...`;
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      viber: `viber://forward?text=${encodeURIComponent(text + " " + postUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + postUrl)}`
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank", "width=600,height=400");
      const newCount = shareCount + 1;
      setShareCount(newCount);
      if (onPostUpdate) {
        onPostUpdate({ ...post, shares: newCount });
      }
      toast.success(`Shared to ${platform}!`);
    }
    setShowShareMenu(false);
  }

  function handleReportSubmit() {
    if (!selectedReason) {
      toast.error("Please select a reason for reporting");
      return;
    }

    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setShowReportModal(false);
      setSelectedReason(null);
      setReportDetails("");
      toast.success("Thank you for your report. We'll review it shortly.");
    }, 1000);
  }

  const isSystem = post.user_id === "system";

  return (
    <article className="post-card" id={`post-${post.id}`}>
      {/* === TYPE-SPECIFIC BANNER === */}
      {post.type === "lost" && (
        <div className="post-banner post-banner-lost">
          <span>LOST PET ALERT</span>
          {post.lastSeenLocation && (
            <span style={{ marginLeft: "auto", fontWeight: 500, fontSize: 12 }}>
              {post.lastSeenLocation}
            </span>
          )}
        </div>
      )}
      {post.type === "vaccination" && (
        <div className="post-banner post-banner-vaccination">
          <span>VACCINATION UPDATE</span>
        </div>
      )}
      {post.type === "reunion" && (
        <div className="post-banner post-banner-reunion" style={{ position: "relative", overflow: "hidden" }}>
          <span>PET REUNITED!</span>
          {post.reunionDays && (
            <span style={{ marginLeft: "auto", fontWeight: 500, fontSize: 12 }}>
              Found after {post.reunionDays} days
            </span>
          )}
        </div>
      )}
      {post.type === "tip" && (
        <div className="post-banner post-banner-tip">
          <span><IconPaw size={14} /></span>
          <span>AlagaLahat · Community Tip</span>
          {post.tipCategory && (
            <span className="tip-category-tag" style={{ marginLeft: "auto" }}>
              {post.tipCategory}
            </span>
          )}
        </div>
      )}

      {/* === POST HEADER === */}
      <div className="post-header">
        {isSystem ? (
          <div
            className="post-avatar-placeholder"
            style={{ background: "var(--color-primary)" }}
          >
            <IconPaw size={20} />
          </div>
        ) : (
          <div
            className="post-avatar-placeholder"
            style={{ background: post.user_color || "var(--color-primary)" }}
          >
            {post.user_initials || "U"}
          </div>
        )}
        <div className="post-meta">
          <p className="post-author">
            {post.user_name || "User"}
            {isSystem && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 2,
                marginLeft: 6, padding: "1px 6px", borderRadius: 4,
                background: "var(--color-primary-light)", color: "var(--color-primary)", fontSize: 10, fontWeight: 700
              }}>
                ✓ Official
              </span>
            )}
          </p>
          <p className="post-timestamp">
            {new Date(post.created_at).toLocaleString()}
            <span style={{ margin: "0 4px" }}>·</span>
            <span title={post.privacy === "public" ? "Public" : "Barangay only"}>
              {post.privacy === "public" ? "Public" : "Barangay"}
            </span>
          </p>
        </div>
      </div>

      {/* === POST BODY === */}
      <div className="post-body" style={{ whiteSpace: "pre-line" }}>
        {post.text}
      </div>

      {/* === VACCINATION DETAILS === */}
      {post.type === "vaccination" && post.petName && (
        <div className="vax-details" style={{ borderLeft: "4px solid #22C55E" }}>
          <div className="vax-detail-row">
            <span className="vax-detail-label">Pet</span>
            <span className="vax-detail-value">{post.petName}</span>
          </div>
          <div className="vax-detail-row">
            <span className="vax-detail-label">Vaccine</span>
            <span className="vax-detail-value">{post.vaccineName}</span>
          </div>
          <div className="vax-detail-row">
            <span className="vax-detail-label">Date</span>
            <span className="vax-detail-value">{post.dateAdministered}</span>
          </div>
          <div className="vax-detail-row" style={{ borderTop: "1px dashed var(--color-border)", paddingTop: 8 }}>
            <span className="vax-detail-label">Next Due</span>
            <span className="vax-detail-value" style={{ color: "#16A34A" }}>
              {post.nextDueDate}
            </span>
          </div>
        </div>
      )}

      {/* === POST IMAGE === */}
      {post.type === "lost" && post.lostPetPhoto ? (
        <img
          src={post.lostPetPhoto}
          alt="Lost pet"
          className="post-image"
          style={{ borderTop: "1px solid var(--color-border)" }}
        />
      ) : post.image_url ? (
        <img
          src={post.image_url}
          alt="Post image"
          className="post-image"
        />
      ) : null}

      {/* === LOST PET ACTION BUTTONS === */}
      {post.type === "lost" && (
        <div className="lost-action-btns">
          <button 
            type="button" 
            className="lost-action-btn primary"
            onClick={() => {
              toast.success("Thank you for reporting! We've notified the pet owner.");
            }}
          >
            I&apos;ve Seen This Pet
          </button>
          <button 
            type="button" 
            className="lost-action-btn secondary"
            onClick={handleShare}
          >
            Share
          </button>
          <button 
            type="button" 
            className="lost-action-btn secondary"
            onClick={() => {
              toast.success("Opening contact options...");
              // In a real app, this would open a contact modal
            }}
          >
            Contact Owner
          </button>
        </div>
      )}

      {/* === POST STATS === */}
      <div className="post-stats">
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {likeCount > 0 && (
            <>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: "50%", background: "var(--color-primary)", color: "#fff", fontSize: 10
              }}>
                +
              </span>
              <span>{likeCount}</span>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {(post.comments || []).length > 0 && (
            <span>{(post.comments || []).length} comment{(post.comments || []).length > 1 ? "s" : ""}</span>
          )}
          {post.shares > 0 && (
            <span className="share-count">{post.shares} shares</span>
          )}
          {post.type === "lost" && post.sightingsCount && post.sightingsCount > 0 && (
            <span style={{ color: "#E9C46A", fontWeight: 700 }}>
              {post.sightingsCount} sighting{post.sightingsCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* === REACTION BAR === */}
      <div className="post-reactions-bar">
        <button
          type="button"
          className={`post-reaction-btn ${liked ? "liked" : ""}`}
          onClick={toggleLike}
        >
          <span>{liked ? "Liked" : "Like"}</span>
        </button>
        <button type="button" className="post-reaction-btn">
          <span>Comment</span>
        </button>
        <div style={{ position: "relative" }}>
          <button 
            type="button" 
            className="post-reaction-btn"
            onClick={() => setShowShareMenu(!showShareMenu)}
          >
            <span>Share</span>
          </button>
          
          {/* Share Menu */}
          {showShareMenu && (
            <div style={{
              position: "absolute", bottom: "100%", right: 0, marginBottom: 8,
              background: "var(--color-card)", border: "1px solid var(--color-border)",
              borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: 200, zIndex: 50
            }}>
              <button
                type="button"
                onClick={handleShare}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
                  background: "none", border: "none", borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer", fontSize: 14, color: "var(--color-text)", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <IconLink2 size={18} />
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("facebook")}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
                  background: "none", border: "none", borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer", fontSize: 14, color: "var(--color-text)", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span>f</span>
                <span>Share to Facebook</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("viber")}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
                  background: "none", border: "none", borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer", fontSize: 14, color: "var(--color-text)", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span>V</span>
                <span>Share to Viber</span>
              </button>
              <button
                type="button"
                onClick={() => handleSocialShare("whatsapp")}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 16px",
                  background: "none", border: "none",
                  cursor: "pointer", fontSize: 14, color: "var(--color-text)", transition: "background 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-background)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span>W</span>
                <span>Share to WhatsApp</span>
              </button>
            </div>
          )}
        </div>
        <button 
          type="button" 
          className="post-reaction-btn"
          onClick={() => setShowReportModal(true)}
          style={{ color: "var(--color-error)" }}
        >
          <span>Report</span>
        </button>
      </div>

      {/* === REPORT MODAL === */}
      {showReportModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center"
        }} onClick={() => setShowReportModal(false)}>
          <div style={{
            background: "var(--color-card)", borderRadius: 16, padding: 24,
            maxWidth: 500, width: "90%", maxHeight: "80vh", overflowY: "auto"
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 700, color: "var(--color-text)" }}>
              Report This Post
            </h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--color-text-muted)" }}>
              Help us keep the community safe. Tell us why you&apos;re reporting this post.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  style={{
                    padding: 12, borderRadius: 8, border: `2px solid ${selectedReason === reason.id ? "var(--color-primary)" : "var(--color-border)"}`,
                    background: selectedReason === reason.id ? "rgba(27, 79, 138, 0.05)" : "transparent",
                    cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text)" }}>
                    {selectedReason === reason.id && "✓ "}{reason.label}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                    {reason.description}
                  </div>
                </button>
              ))}
            </div>

            <textarea
              placeholder="Additional details (optional)..."
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              style={{
                width: "100%", padding: 12, borderRadius: 8, border: "1px solid var(--color-border)",
                background: "var(--color-background)", color: "var(--color-text)", fontSize: 13,
                fontFamily: "inherit", resize: "vertical", minHeight: 80, marginBottom: 16, outline: "none"
              }}
            />

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => setShowReportModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleReportSubmit}
                disabled={!selectedReason || isReporting}
              >
                {isReporting ? "Sending..." : "Send Report"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === COMMENT SECTION === */}
      <CommentSection 
        comments={post.comments || []} 
        postId={post.id}
        onCommentsUpdate={(updatedComments) => {
          if (onPostUpdate) {
            onPostUpdate({ ...post, comments: updatedComments });
          }
        }}
      />
    </article>
  );
}
