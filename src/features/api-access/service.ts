import type { SupabaseClient } from "@supabase/supabase-js";
import type { ApiKey } from "./types";

function generateKey(): string {
  const raw = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  return `fp_live_${raw.slice(0, 40)}`;
}

export async function listApiKeys(supabase: SupabaseClient, companyId: string): Promise<ApiKey[]> {
  try {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as ApiKey[];
  } catch {
    return [];
  }
}

export async function generateApiKey(
  supabase: SupabaseClient,
  companyId: string,
  label: string
): Promise<{ key: ApiKey | null; error: string | null }> {
  try {
    const key = generateKey();
    const { data, error } = await supabase
      .from("api_keys")
      .insert({ company_id: companyId, key, label: label || "Default key" })
      .select("*")
      .single();

    if (error) return { key: null, error: error.message };
    return { key: data as ApiKey, error: null };
  } catch (e) {
    return { key: null, error: e instanceof Error ? e.message : "Failed to generate key." };
  }
}

export async function revokeApiKey(supabase: SupabaseClient, keyId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from("api_keys").delete().eq("id", keyId);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to revoke key." };
  }
}
