"use client";

import { useState } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inviteMember, removeMember } from "@/features/team-management";
import type { CompanyMember, MemberRole } from "@/features/team-management";

export function TeamManagement({
  companyId,
  initialMembers,
  isOwner,
}: {
  companyId: string;
  initialMembers: CompanyMember[];
  isOwner: boolean;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await inviteMember(supabase, companyId, email, role);

    setLoading(false);
    if (error) {
      setError(error);
      return;
    }

    setMembers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        company_id: companyId,
        user_id: null,
        invited_email: email.trim().toLowerCase(),
        role,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);
    setEmail("");
  }

  async function handleRemove(memberId: string) {
    const supabase = createClient();
    await removeMember(supabase, memberId);
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  return (
    <div className="max-w-xl rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <h2 className="text-sm font-semibold text-dark">Team</h2>
      <p className="text-xs text-muted">
        Invite a teammate by email. They get access automatically the first time they log in with that email —
        no invite email is sent, so let them know directly.
      </p>

      {isOwner && (
        <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-dark">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-dark">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as MemberRole)}
              className="mt-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Invite
          </button>
        </form>
      )}

      {error && <p className="mt-3 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="mt-5 flex flex-col gap-2">
        {members.length === 0 && <p className="text-xs text-muted">No team members yet — just you.</p>}
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5">
            <div>
              <p className="text-sm text-dark">{m.invited_email}</p>
              <p className="text-xs text-muted capitalize">
                {m.role} · {m.status}
              </p>
            </div>
            {isOwner && (
              <button onClick={() => handleRemove(m.id)} className="text-muted hover:text-danger">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
