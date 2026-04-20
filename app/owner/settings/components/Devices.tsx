"use client";

import React, { useState } from "react";
import { SectionCard, ConfirmModal } from "./shared";
import { IconSmartphone } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

const MOCK_SESSIONS = [
  { id: 1, device: "Windows PC", icon: "💻", browser: "Chrome 124", lastActive: "Now", location: "Bunawan", current: true },
  { id: 2, device: "Android", icon: "📱", browser: "Mobile Chrome", lastActive: "2h ago", location: "Bunawan", current: false },
  { id: 3, device: "iPhone", icon: "📱", browser: "Safari", lastActive: "3 days ago", location: "Unknown", current: false },
];

export function DevicesSection() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [showRevokeAll, setShowRevokeAll] = useState(false);

  function revokeSession(id: number) {
    setSessions(prev => prev.filter(s => s.id !== id));
    toast.success("Session revoked successfully");
  }

  function revokeAll() {
    setSessions(prev => prev.filter(s => s.current));
    setShowRevokeAll(false);
    toast.success("All other sessions revoked");
  }

  return (
    <SectionCard id="devices" icon={<IconSmartphone size={20} />}
      iconBg="rgba(59, 130, 246, 0.12)" iconColor="#3B82F6"
      title="Connected Devices & Sessions" desc="Manage where you're logged in.">

      <div style={{ overflowX: "auto" }}>
        <table className="settings-table">
          <thead>
            <tr>
              <th>Device</th>
              <th>Browser</th>
              <th>Last Active</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id}>
                <td>
                  <span className="device-icon">
                    <span style={{ fontSize: 16 }}>{s.icon}</span> {s.device}
                  </span>
                </td>
                <td>{s.browser}</td>
                <td>
                  <span style={{ fontWeight: s.current ? 700 : 400, color: s.current ? "var(--color-success)" : "var(--color-text)" }}>
                    {s.lastActive}
                  </span>
                </td>
                <td>{s.location}</td>
                <td>
                  {s.current ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-success)", background: "rgba(82,183,136,0.12)", padding: "4px 10px", borderRadius: 6 }}>Current</span>
                  ) : (
                    <button type="button" onClick={() => revokeSession(s.id)}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--color-coral)", background: "transparent", color: "var(--color-coral)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.filter(s => !s.current).length > 0 && (
        <button type="button" className="danger-btn-outline" onClick={() => setShowRevokeAll(true)} style={{ alignSelf: "flex-start" }}>
          Revoke All Other Sessions
        </button>
      )}

      <ConfirmModal open={showRevokeAll} onClose={() => setShowRevokeAll(false)} title="Revoke all other sessions?" danger>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 20px" }}>
          You&apos;ll be signed out from all other devices. Only this browser session will remain active.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={() => setShowRevokeAll(false)}>Cancel</Button>
          <Button variant="destructive" onClick={revokeAll}>Revoke All</Button>
        </div>
      </ConfirmModal>
    </SectionCard>
  );
}
