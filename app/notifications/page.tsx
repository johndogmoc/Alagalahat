"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/lib/supabase";
import { IconBell, IconPaw, IconAlertTriangle, IconSyringe, IconCheck, IconX } from "@/components/icons";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const typeConfig: Record<string, { icon: typeof IconPaw; color: string; dot: string }> = {
  lost_alert: { icon: IconAlertTriangle, color: "#E76F51", dot: "" },
  vaccine_reminder: { icon: IconSyringe, color: "#E9C46A", dot: "" },
  found: { icon: IconCheck, color: "#52B788", dot: "" },
  sighting: { icon: IconCheck, color: "#52B788", dot: "" },
  article: { icon: IconBell, color: "#1B4F8A", dot: "" },
  milestone: { icon: IconPaw, color: "#9CA3AF", dot: "" },
  watchlist_match: { icon: IconBell, color: "#2A9D8F", dot: "" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const supabase = getSupabaseClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !mounted) return;

      // Try to fetch from notifications table, fall back to demo data
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        if (mounted) setNotifications(data as Notification[]);
      } else {
        // Demo notifications
        if (mounted) {
          setNotifications([
            { id: "1", type: "lost_alert", title: "Lost pet alert near your area", body: "A Shih Tzu named Coco was reported missing in Brgy. Poblacion, 500m from your location.", link: "/lost-pets", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: "2", type: "vaccine_reminder", title: "Vaccination due for Bantay", body: "Anti-rabies booster is due in 3 days. Schedule a visit to your nearest vet clinic.", link: "/pets", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
            { id: "3", type: "found", title: "Great news! Mingming has been found! ", body: "Mingming was found at Brgy. Zone 4 by a community helper. The owner has been notified.", link: "/lost-pets", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            { id: "4", type: "article", title: "New Care Guide: Heatstroke Prevention", body: "Learn how to protect your pets from the summer heat with these essential tips.", link: "/care-guide", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
            { id: "5", type: "milestone", title: "AlagaLahat just reunited its 200th pet! ", body: "Thanks to our amazing community, 200 pets have been safely returned to their families.", link: "/", is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
            { id: "6", type: "watchlist_match", title: "New Aspin report matches your watchlist", body: "A new lost pet report for an Aspin was filed in your monitored area (Brgy. San Jose).", link: "/lost-pets", is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
          ]);
        }
      }
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  function markAsRead(id: string) {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  function dismissNotif(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const displayed = filter === "unread"
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <AuthShell>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "var(--color-text)" }}>
              Notifications 
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <IconCheck size={14} /> Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {(["all", "unread"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 16px", borderRadius: 20, border: "1px solid",
              borderColor: filter === f ? "var(--color-primary)" : "var(--color-border)",
              background: filter === f ? "var(--color-primary)" : "var(--color-card)",
              color: filter === f ? "#fff" : "var(--color-text-muted)",
              fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              transition: "all 200ms ease", minHeight: 36
            }}
          >
            {f === "all" ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div style={{
        background: "var(--color-card)", border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)"
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading notifications…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
            <IconBell size={36} style={{ color: "var(--color-text-light)", marginBottom: 12 }} />
            <p style={{ margin: 0, fontWeight: 600 }}>No notifications</p>
            <p style={{ margin: "4px 0 0", fontSize: 14 }}>
              {filter === "unread" ? "All notifications have been read." : "You're all caught up!"}
            </p>
          </div>
        ) : (
          displayed.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.milestone;
            const NotifIcon = config.icon;
            return (
              <div
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "16px 20px",
                  background: notif.is_read ? "transparent" : "var(--color-primary)" + "06",
                  borderBottom: i < displayed.length - 1 ? "1px solid var(--color-border)" : "none",
                  cursor: "pointer",
                  transition: "background 200ms ease"
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: config.color + "14", color: config.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 2
                }}>
                  <NotifIcon size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {!notif.is_read && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
                    )}
                    <p style={{
                      margin: 0, fontWeight: notif.is_read ? 500 : 700,
                      fontSize: 14, color: "var(--color-text)",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>
                      {notif.title}
                    </p>
                  </div>
                  {notif.body && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {notif.body}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-light)" }}>
                      {timeAgo(notif.created_at)}
                    </span>
                    {notif.link && (
                      <Link
                        href={notif.link}
                        onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 12, color: "var(--color-primary)", fontWeight: 600 }}
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id); }}
                  aria-label="Dismiss notification"
                  style={{
                    width: 32, height: 32, borderRadius: 6, border: "none",
                    background: "transparent", color: "var(--color-text-light)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 200ms ease", flexShrink: 0, marginTop: 2,
                    minWidth: 32, minHeight: 32
                  }}
                >
                  <IconX size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </AuthShell>
  );
}
