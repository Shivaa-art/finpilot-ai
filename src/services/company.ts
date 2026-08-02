import type { SupabaseClient } from "@supabase/supabase-js";
import type { Company, Transaction } from "@/types";
import { claimPendingInvites, getMemberCompanyId } from "@/features/team-management";

/**
 * Fetches the company the logged-in user should see: their own most
 * recently onboarded company if they have one, otherwise a company they've
 * been added to as a team member (Phase 6 — Team Management). Also claims
 * any pending invite matching their email on the way in, so an invited
 * teammate gets access automatically on their first login after signup.
 */
export async function getCurrentCompany(supabase: SupabaseClient): Promise<Company | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  await claimPendingInvites(supabase);

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getCurrentCompany:", error.message);
    return null;
  }

  if (data) return data as Company;

  // No owned company — check if this user is an active member of one instead.
  const memberCompanyId = await getMemberCompanyId(supabase);
  if (!memberCompanyId) return null;

  const { data: memberCompany } = await supabase.from("companies").select("*").eq("id", memberCompanyId).maybeSingle();
  return (memberCompany as Company | null) ?? null;
}

export async function getTransactions(supabase: SupabaseClient, companyId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("company_id", companyId)
    .order("txn_date", { ascending: true });

  if (error) {
    console.error("getTransactions:", error.message);
    return [];
  }

  return (data ?? []) as Transaction[];
}
