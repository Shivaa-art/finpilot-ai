import type { SupabaseClient } from "@supabase/supabase-js";
import type { CompanyMember, MemberRole } from "./types";

export async function listMembers(supabase: SupabaseClient, companyId: string): Promise<CompanyMember[]> {
  try {
    const { data, error } = await supabase
      .from("company_members")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as CompanyMember[];
  } catch {
    return [];
  }
}

export async function inviteMember(
  supabase: SupabaseClient,
  companyId: string,
  email: string,
  role: MemberRole
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("company_members").insert({
      company_id: companyId,
      invited_email: email.trim().toLowerCase(),
      role,
      status: "pending",
    });
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to invite member." };
  }
}

export async function removeMember(supabase: SupabaseClient, memberId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("company_members").delete().eq("id", memberId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to remove member." };
  }
}

/**
 * Called on every login: if the current user's email matches a pending
 * invite, claim it — attach their user_id and flip status to active. This
 * is how "team management" works without needing a transactional email
 * service or Supabase's admin API: the invited person just signs up
 * normally, and their first login silently attaches them to the company
 * that invited them.
 */
export async function claimPendingInvites(supabase: SupabaseClient): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return;

    await supabase
      .from("company_members")
      .update({ user_id: user.id, status: "active" })
      .eq("invited_email", user.email.toLowerCase())
      .eq("status", "pending");
  } catch {
    // Fails soft — if the phase 6 migration hasn't been run yet, this table won't exist.
  }
}

/** Finds a company the current user has membership access to (not ownership) — used as a fallback in getCurrentCompany. */
export async function getMemberCompanyId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data.company_id as string;
  } catch {
    return null;
  }
}
