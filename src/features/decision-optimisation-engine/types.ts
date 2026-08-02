import type { Opportunity } from "@/features/opportunity-detection-engine";
import type { AIRecommendation } from "@/types";

export interface ScoredOpportunity {
  opportunity: Opportunity;
  score: number;
  rank: number;
}

export interface OptimisationResult {
  /** The opportunities selected for this cycle, converted into user-facing recommendations, ranked highest first */
  recommendations: AIRecommendation[];
  /** Every opportunity considered, with its score and rank — selected and deferred alike */
  scored: ScoredOpportunity[];
  /** Opportunities detected but not surfaced this cycle, because a higher-scored one took priority */
  deferred: Opportunity[];
}
