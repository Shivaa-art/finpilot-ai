import type { ConfidenceBreakdown } from "@/features/confidence-engine";
import type { ScoredOpportunity } from "@/features/decision-optimisation-engine";
import type { Explanation } from "./types";

const FORMULA_TRACE: Record<string, string[]> = {
  "cash-flow-risk": [
    "1. Compute net cash flow per day from every uploaded transaction.",
    "2. Fit a linear trend (least-squares slope) across the daily net series.",
    "3. Project the trend forward day-by-day for 90 days from the current cash position.",
    "4. Flag the first day the projected running total crosses below zero.",
  ],
  "cash-flow-healthy": [
    "1. Compute net cash flow per day from every uploaded transaction.",
    "2. Fit a linear trend across the daily net series.",
    "3. Project forward 90 days — no day in the projection goes negative.",
  ],
  "expense-optimization": [
    "1. Split the uploaded history into an earlier half and a later half by date.",
    "2. Sum expense transactions per category in each half.",
    "3. Compute % growth per category between halves.",
    "4. Flag the category with the largest absolute growth where growth exceeds 15%.",
  ],
  "revenue-opportunity": [
    "1. Split the uploaded history into an earlier half and a later half by date.",
    "2. Sum income transactions per category in each half.",
    "3. Compute % growth per category between halves.",
    "4. Flag the category with the highest growth rate where growth exceeds 10%.",
  ],
  "hiring-readiness": [
    "1. Read the Financial Health Score and days-until-negative from the Financial State Engine.",
    "2. Ready if health score >= 70 AND runway extends beyond 60 days (or never goes negative).",
    "3. Otherwise, flag as not ready this cycle.",
  ],
};

function rankingSentence(scored: ScoredOpportunity, totalConsidered: number, wasSelected: boolean): string {
  if (totalConsidered <= 1) return "Only one signal was detected this cycle, so no ranking was needed.";
  const position = wasSelected
    ? `selected as priority #${scored.rank} of ${totalConsidered} detected signals`
    : `detected but ranked #${scored.rank} of ${totalConsidered} — deprioritized this cycle in favor of higher-scored signals`;
  return `Priority score ${scored.score.toFixed(1)} — ${position}, based on urgency, magnitude, and data confidence.`;
}

/**
 * Builds the full explanation trace for a single scored opportunity —
 * combining what data it used, what rule fired, its confidence breakdown,
 * and where it landed in the Decision Optimisation Engine's ranking.
 */
export function explainOpportunity(
  scored: ScoredOpportunity,
  confidenceBreakdown: ConfidenceBreakdown,
  totalConsidered: number,
  wasSelected: boolean
): Explanation {
  const { opportunity } = scored;

  return {
    recommendationId: opportunity.id,
    summary: opportunity.signal,
    dataPointsUsed: [
      `${confidenceBreakdown.rationale[0] ?? ""}`,
      `${confidenceBreakdown.rationale[1] ?? ""}`,
      opportunity.evidence,
    ].filter(Boolean),
    formulaTrace: FORMULA_TRACE[opportunity.id] ?? ["No formula trace registered for this signal type."],
    confidenceBreakdown,
    rankingContext: rankingSentence(scored, totalConsidered, wasSelected),
  };
}
