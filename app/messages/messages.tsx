"use client";

import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";

// Mock data until DB is connected
interface Conversation {
  id: string;
  avatar: string;
  name?: string;
  lastMessage?: string;
  unread?: boolean;
  time?: string;
}
const MOCK_CONVERSATIONS: Conversation[] = [];

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(MOCK_CONVERSATIONS[0]?.id || null);

  return (
    <AuthShell>
      <div className="post-card" style={{ display: "flex", height: "calc(100vh - 140px)", minHeight: 500, margin: 0, padding: 0, overflow: "hidden" }}>
        {/* Left Side: Conversations List */}
        <div style={{ width: 320, borderRight: "1px solid var(--color-border)", display: "flex", flexDirection: "column", background: "var(--color-card)" }}>
          <div style={{ padding: "20px 20px 10px" }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--color-text)", letterSpacing: "-0.02em" }}>Chats</h1>
            <input 
              type="text" 
              placeholder="Search messages..." 
              style={{
                width: "100%", padding: "10px 16px", borderRadius: 20, 
                border: "none", background: "#F0F2F5", marginTop: 16,
                fontSize: 14, outline: "none"
              }} 
            />
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            {MOCK_CONVERSATIONS.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setActiveChat(chat.id)}
                style={{ 
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", 
                  cursor: "pointer", background: activeChat === chat.id ? "rgba(27,58,107,0.05)" : "transparent",
                  borderLeft: activeChat === chat.id ? "3px solid var(--color-primary)" : "3px solid transparent",
                  transition: "background 200ms ease"
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "#2A9D8F", 
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", 
                  fontWeight: 700, flexShrink: 0
                }}>
                  {chat.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: chat.unread ? 800 : 600, color: "var(--color-text)", fontSize: 15 }}>{chat.name}</span>
                    <span style={{ fontSize: 12, color: chat.unread ? "var(--color-primary)" : "var(--color-text-muted)", fontWeight: chat.unread ? 700 : 500 }}>{chat.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: chat.unread ? "var(--color-text)" : "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: chat.unread ? 600 : 400 }}>
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-primary)", flexShrink: 0 }}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Active Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F0F2F5" }}>
          {activeChat ? (
            <>
              <div style={{ padding: "16px 24px", background: "var(--color-card)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: "#2A9D8F", 
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700
                }}>
                  {MOCK_CONVERSATIONS.find(c => c.id === activeChat)?.avatar}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text)" }}>
                    {MOCK_CONVERSATIONS.find(c => c.id === activeChat)?.name}
                  </h2>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>Active now</p>
                </div>
              </div>

              <div style={{ flex: 1, padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Mock messages body */}
                <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: 12, marginBottom: 16 }}>Today</div>
                
                <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", maxWidth: "70%" }}>
                  <div style={{ padding: "10px 14px", background: "var(--color-card)", borderRadius: "18px 18px 18px 4px", fontSize: 14, color: "var(--color-text)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    {MOCK_CONVERSATIONS.find(c => c.id === activeChat)?.lastMessage}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, alignSelf: "flex-end", maxWidth: "70%" }}>
                  <div style={{ padding: "10px 14px", background: "#1B3A6B", color: "#fff", borderRadius: "18px 18px 4px 18px", fontSize: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                    Thanks for reaching out!
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px 24px", background: "var(--color-card)", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <input 
                    type="text" 
                    placeholder="Aa" 
                    style={{
                      flex: 1, padding: "12px 18px", borderRadius: 20, 
                      border: "none", background: "#F0F2F5", fontSize: 14, outline: "none"
                    }} 
                  />
                  <button style={{ 
                    background: "transparent", border: "none", color: "#1B3A6B", 
                    fontWeight: 700, fontSize: 14, cursor: "pointer", padding: "8px 12px"
                  }}>
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-muted)" }}>
              No active conversations. Start a new chat!
            </div>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
