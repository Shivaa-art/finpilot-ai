import type { SupabaseClient } from "@supabase/supabase-js";
import type { AIRecommendation } from "@/types";
import type { DecisionLogEntry, DecisionStatus } from "./types";

/**
 * Ensures every currently-surfaced recommendation has a "pending" row in
 * decision_log — this is what lets the app remember, across sessions, which
 * recommendations were shown and whether the user later acted on them.
 * Idempotent: won't create a duplicate pending row for a recommendation id
 * that already has one open.
 *
 * Fails soft: if the decision_log table doesn't exist yet (Phase 4
 * migration not run), this quietly does nothing instead of breaking the
 * dashboard — Decision Memory is additive, not load-bearing.
 */
export async function ensureDecisionsLogged(
  supabase: SupabaseClient,
  companyId: string,
  recommendations: AIRecommendation[]
): Promise<Record<string, DecisionLogEntry>> {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("decision_log")
      .select("*")
      .eq("company_id", companyId)
      .eq("status", "pending");

    if (fetchError) return {};

    const existingMap = new Map<string, DecisionLogEntry>(
      (existing as DecisionLogEntry[]).map((e) => [e.recommendation_id, e])
    );

    const toInsert = recommendations
      .filter((r) => !existingMap.has(r.id))
      .map((r) => ({
        company_id: companyId,
        recommendation_id: r.id,
        title: r.title,
        category: r.category,
        confidence: r.confidence,
        magnitude: r.impact.amount,
        direction: r.impact.direction,
        status: "pending" as DecisionStatus,
      }));

    if (toInsert.length > 0) {
      const { data: inserted } = await supabase.from("decision_log").insert(toInsert).select("*");
      (inserted as DecisionLogEntry[] | null)?.forEach((e) => existingMap.set(e.recommendation_id, e));
    }

    return Object.fromEntries(existingMap);
  } catch {
    return {};
  }
}

export async function getDecisionHistory(
  supabase: SupabaseClient,
  companyId: string,
  limit = 10
): Promise<DecisionLogEntry[]> {
  try {
    const { data, error } = await supabase
      .from("decision_log")
      .select("*")
      .eq("company_id", companyId)
      .in("status", ["accepted", "dismissed"])
      .order("resolved_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data ?? []) as DecisionLogEntry[];
  } catch {
    return [];
  }
}

/** Fetches the full resolved decision history for Decision DNA analysis — not capped to a small display list. */
export async function getAllResolvedDecisions(
  supabase: SupabaseClient,
  companyId: string
): Promise<DecisionLogEntry[]> {
  return getDecisionHistory(supabase, companyId, 500);
}
