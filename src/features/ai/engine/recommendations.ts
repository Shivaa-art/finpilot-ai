import type { AIRecommendation, Transaction } from "@/types";
import { computeFinancialState, type FinancialState } from "@/features/financial-state-engine";
import { detectOpportunities, type Opportunity } from "@/features/opportunity-detection-engine";
import { optimizeDecisions } from "@/features/decision-optimisation-engine";
import { explainOpportunity, type Explanation } from "@/features/explainability-engine";

export interface EngineOutput extends FinancialState {
  recommendations: AIRecommendation[];
  /** Every signal detected this cycle, selected or not — exposed for future UI (e.g. "also noticed") */
  allOpportunities: Opportunity[];
  /** Signals detected but not surfaced, because higher-priority ones took the decision budget */
  deferredOpportunities: Opportunity[];
  /** Structured explanation trace for every recommendation, keyed by recommendation id */
  explanations: Record<string, Explanation>;
}

/**
 * Runs the full four-engine pipeline on a company's real transactions:
 *
 * 1. Financial State Engine     — what's true about the finances right now
 * 2. Opportunity Detection      — what signals are worth paying attention to
 * 3. Decision Optimisation      — which of those signals actually get surfaced, ranked
 * 4. Explainability Engine      — a structured "why" trace for every recommendation
 *
 * No external AI call anywhere in this pipeline — every number, ranking,
 * and explanation traces back to real uploaded transactions and explicit
 * formulas.
 */
export function runAIEngine(transactions: Transaction[]): EngineOutput {
  const state = computeFinancialState(transactions);

  if (transactions.length === 0) {
    return { ...state, recommendations: [], allOpportunities: [], deferredOpportunities: [], explanations: {} };
  }

  const opportunities = detectOpportunities(state, transactions);
  const { recommendations, deferred, scored } = optimizeDecisions(opportunities, state.confidence, {
    maxDecisions: 4,
  });

  const selectedIds = new Set(recommendations.map((r) => r.id));
  const explanations: Record<string, Explanation> = {};
  for (const s of scored) {
    explanations[s.opportunity.id] = explainOpportunity(
      s,
      state.confidenceBreakdown,
      scored.length,
      selectedIds.has(s.opportunity.id)
    );
  }

  return {
    ...state,
    recommendations,
    allOpportunities: opportunities,
    deferredOpportunities: deferred,
    explanations,
  };
}
