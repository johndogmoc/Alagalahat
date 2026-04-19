"use client";

import React, { useState } from "react";
import { SectionCard, ConfirmModal, PasswordInput } from "./shared";
import { IconAlertTriangle, IconTrash, IconSearch } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export function DangerZoneSection() {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deactivateAgree, setDeactivateAgree] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [transferSearch, setTransferSearch] = useState("");

  function handleDeactivate() {
    if (!deactivateAgree) { toast.error("Please confirm you understand"); return; }
    if (!deactivatePassword) { toast.error("Password required"); return; }
    setShowDeactivate(false);
    setDeactivateAgree(false);
    setDeactivatePassword("");
    toast.success("Account deactivated. You can reactivate by logging in again.");
  }

  function handleDelete() {
    if (deleteConfirmText !== "DELETE") { toast.error("Please type DELETE to confirm"); return; }
    if (!deletePassword) { toast.error("Password required"); return; }
    setShowDelete(false);
    setDeleteStep(1);
    setDeleteConfirmText("");
    setDeletePassword("");
    toast.success("Account deletion requested. You will receive a confirmation email.");
  }

  return (
    <SectionCard id="danger-zone" icon={<IconAlertTriangle size={20} />}
      iconBg="rgba(231, 111, 81, 0.15)" iconColor="#E76F51"
      title="Danger Zone" desc="Irreversible actions. Proceed with caution." danger>

      {/* Transfer Ownership */}
      <div>
        <h4 className="settings-subsection-title" style={{ marginTop: 0 }}>🔄 Transfer Pet Ownership</h4>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px" }}>
          Transfer your pets to another registered owner before deactivating or deleting.
        </p>
        <Input id="transfer-search" name="transfer-search" placeholder="Search recipient by name or email..." value={transferSearch}
          onChange={e => setTransferSearch(e.target.value)} leftIcon={<IconSearch size={16} />}
          style={{ background: "var(--color-background)" }} />
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "8px 0 0" }}>
          The recipient must confirm the transfer via notification.
        </p>
      </div>

      {/* Deactivate */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">⏸️ Deactivate Account</h4>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px" }}>
          Your profile will be hidden. Your pets will remain registered. You can reactivate by logging in again.
        </p>
        <button type="button" className="danger-btn-outline" onClick={() => setShowDeactivate(true)}>
          Deactivate My Account
        </button>
      </div>

      {/* Delete */}
      <div className="settings-subsection">
        <h4 className="settings-subsection-title">🗑️ Permanently Delete Account</h4>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "0 0 12px" }}>
          This will permanently delete your profile, all posts, and unlink your pets. Pet records will be transferred to Barangay admin custody.
        </p>
        <button type="button" className="danger-btn-solid" onClick={() => { setDeleteStep(1); setShowDelete(true); }}>
          <IconTrash size={16} /> Permanently Delete My Account
        </button>
      </div>

      {/* Deactivate Modal */}
      <ConfirmModal open={showDeactivate} onClose={() => { setShowDeactivate(false); setDeactivateAgree(false); setDeactivatePassword(""); }} title="Deactivate your account?" danger>
        <p style={{ fontSize: 14, color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
          Your profile will be hidden from the community. Your pets will remain registered under Barangay records. You can reactivate simply by logging in again.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" checked={deactivateAgree} onChange={e => setDeactivateAgree(e.target.checked)}
              style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--color-coral)" }} />
            <span style={{ fontSize: 13, color: "var(--color-text)" }}>I understand my account will be deactivated</span>
          </label>
        </div>
        <div className="settings-form-group" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600 }}>Confirm your password</label>
          <PasswordInput id="deactivate-pw" value={deactivatePassword} onChange={setDeactivatePassword} placeholder="Enter password" />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="outline" onClick={() => { setShowDeactivate(false); setDeactivateAgree(false); setDeactivatePassword(""); }}>Cancel</Button>
          <Button variant="destructive" onClick={handleDeactivate}>Deactivate</Button>
        </div>
      </ConfirmModal>

      {/* Delete Modal */}
      <ConfirmModal open={showDelete} onClose={() => { setShowDelete(false); setDeleteStep(1); setDeleteConfirmText(""); setDeletePassword(""); }} title="⚠️ Permanently Delete Account" danger>
        {deleteStep === 1 && (
          <>
            <div style={{ padding: 14, background: "rgba(231,111,81,0.08)", borderRadius: 10, border: "1px solid rgba(231,111,81,0.2)", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: "var(--color-text)", margin: 0, lineHeight: 1.5 }}>
                <strong>This will permanently delete:</strong><br />
                • Your profile and all personal information<br />
                • All posts and community interactions<br />
                • Your pet records will be transferred to Barangay admin custody
              </p>
            </div>
            <p style={{ fontSize: 14, color: "var(--color-coral)", fontWeight: 700, margin: "0 0 16px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => { setShowDelete(false); setDeleteStep(1); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => setDeleteStep(2)}>I Understand, Continue</Button>
            </div>
          </>
        )}
        {deleteStep === 2 && (
          <>
            <div className="settings-form-group" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Type <strong style={{ color: "var(--color-coral)" }}>DELETE</strong> to confirm</label>
              <Input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" style={{ background: "var(--color-background)" }} />
            </div>
            <div className="settings-form-group" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Enter your current password</label>
              <PasswordInput id="delete-pw" value={deletePassword} onChange={setDeletePassword} placeholder="Enter password" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Button variant="outline" onClick={() => setDeleteStep(1)}>Back</Button>
              <Button variant="destructive" disabled={deleteConfirmText !== "DELETE"} onClick={handleDelete}>
                Delete My Account Forever
              </Button>
            </div>
          </>
        )}
      </ConfirmModal>
    </SectionCard>
  );
}
