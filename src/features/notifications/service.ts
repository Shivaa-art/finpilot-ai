import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppNotification } from "./types";

export async function listNotifications(
  supabase: SupabaseClient,
  companyId: string,
  limit = 20
): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as AppNotification[];
  } catch {
    return [];
  }
}

/**
 * Creates a notification only if an unread one of the same type doesn't
 * already exist for this company — called on every dashboard load, so
 * without dedup the same cash-flow-risk alert would spam a new row every
 * page refresh.
 */
export async function ensureNotification(
  supabase: SupabaseClient,
  companyId: string,
  type: string,
  message: string
): Promise<void> {
  try {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("company_id", companyId)
      .eq("type", type)
      .eq("read", false)
      .limit(1)
      .maybeSingle();

    if (existing) return;

    await supabase.from("notifications").insert({ company_id: companyId, type, message, read: false });
  } catch {
    // Fails soft if the phase 6 migration hasn't been run yet.
  }
}

export async function markAllRead(supabase: SupabaseClient, companyId: string): Promise<void> {
  try {
    await supabase.from("notifications").update({ read: true }).eq("company_id", companyId).eq("read", false);
  } catch {
    // no-op
  }
}
