"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export interface AppNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    async function loadNotifications() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (mounted && !error) {
        setNotifications(data as AppNotification[]);
        setUnreadCount((data as AppNotification[]).filter((n: AppNotification) => !n.read).length);
      }
    }

    loadNotifications();

    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: any) => {
          supabase.auth.getUser().then(({ data }: any) => {
            const userId = data.user?.id;
            if (userId && payload.new.user_id === userId) {
              setNotifications((prev) => {
                const newBells = [payload.new as AppNotification, ...prev].slice(0, 20);
                setUnreadCount(newBells.filter((n: AppNotification) => !n.read).length);
                return newBells;
              });
            }
          });
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return { notifications, unreadCount };
}
