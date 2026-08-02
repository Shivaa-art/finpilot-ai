import type { Opportunity } from "@/features/opportunity-detection-engine";
import type { AIRecommendation } from "@/types";
import type { OptimisationResult, ScoredOpportunity } from "./types";

const URGENCY_WEIGHT: Record<Opportunity["urgency"], number> = { high: 1.5, medium: 1.1, low: 0.8 };

/**
 * A single opportunity's priority score. Risk (negative-direction) signals
 * get a boost relative to equal-magnitude gains, on the reasoning that
 * avoiding a loss is generally more time-sensitive than capturing an
 * equivalent upside. Confidence scales the score down when the underlying
 * data is thin, so a shaky signal doesn't outrank a well-supported one
 * purely on magnitude.
 */
export function scoreOpportunity(opportunity: Opportunity, confidence: number): number {
  const riskBoost = opportunity.direction === "negative" ? 1.3 : 1;
  const urgencyWeight = URGENCY_WEIGHT[opportunity.urgency];
  const confidenceFactor = Math.max(0.4, confidence / 100);
  return opportunity.magnitude * urgencyWeight * riskBoost * confidenceFactor;
}

function toRecommendation(
  opportunity: Opportunity,
  confidence: number,
  rank: number,
  totalConsidered: number
): AIRecommendation {
  const optimisationNote =
    totalConsidered > 1
      ? ` Ranked #${rank} of ${totalConsidered} signals detected this cycle based on urgency, magnitude, and data confidence.`
      : "";

  return {
    id: opportunity.id,
    title: opportunity.signal,
    reasoning: opportunity.evidence + optimisationNote,
    confidence,
    impact: {
      amount: opportunity.magnitude,
      currency: "USD",
      direction: opportunity.direction,
      horizon: opportunity.horizon,
    },
    alternatives: opportunity.options,
    category: opportunity.category,
  };
}

/**
 * Ranks every detected opportunity by priority score and selects the top
 * `maxDecisions` to actually surface — this is the "optimisation": choosing
 * what deserves attention this cycle rather than dumping every signal on
 * the user unranked. Anything that doesn't make the cut is returned as
 * `deferred`, not discarded, so the dashboard can still say "we also
 * noticed X" if there's room.
 */
export function optimizeDecisions(
  opportunities: Opportunity[],
  confidence: number,
  options: { maxDecisions?: number } = {}
): OptimisationResult {
  const maxDecisions = options.maxDecisions ?? 4;

  const scored: ScoredOpportunity[] = opportunities
    .map((opportunity) => ({ opportunity, score: scoreOpportunity(opportunity, confidence), rank: 0 }))
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

  const selected = scored.slice(0, maxDecisions);
  const deferred = scored.slice(maxDecisions).map((s) => s.opportunity);

  const recommendations = selected.map((s) =>
    toRecommendation(s.opportunity, confidence, s.rank, scored.length)
  );

  return { recommendations, scored, deferred };
}
