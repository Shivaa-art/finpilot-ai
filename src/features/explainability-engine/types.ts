import type { ConfidenceBreakdown } from "@/features/confidence-engine";

export interface Explanation {
  recommendationId: string;
  /** One-line plain summary of why this fired */
  summary: string;
  /** The real data points this recommendation was computed from */
  dataPointsUsed: string[];
  /** Step-by-step trace of the rule/formula that produced this recommendation */
  formulaTrace: string[];
  /** Full decomposed confidence factors behind this recommendation's confidence score */
  confidenceBreakdown: ConfidenceBreakdown;
  /** Where this recommendation landed in the Decision Optimisation Engine's ranking, in plain language */
  rankingContext: string;
}
