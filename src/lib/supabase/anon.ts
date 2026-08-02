import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * A stateless Supabase client for server routes that authenticate via an
 * API key rather than a logged-in user session (no cookies involved).
 * Used only by /api/v1/* routes. Data access for these routes goes through
 * the get_transactions_for_key() security-definer function, not raw table
 * RLS, since there's no auth.uid() to check here.
 */
export function createAnonClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
