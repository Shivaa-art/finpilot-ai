import type { AIRecommendation } from "@/types";

export type Urgency = "low" | "medium" | "high";

/**
 * A detected signal in the financial data — a fact worth paying attention
 * to, not yet a decision. The Opportunity Detection Engine's whole job is
 * finding these; ranking and choosing between them belongs to the Decision
 * Optimisation Engine.
 */
export interface Opportunity {
  id: string;
  category: AIRecommendation["category"];
  /** Short, human name for what was detected */
  signal: string;
  /** The data-backed explanation of why this was flagged */
  evidence: string;
  /** Estimated dollar magnitude of this opportunity, always positive */
  magnitude: number;
  direction: "positive" | "negative" | "neutral";
  urgency: Urgency;
  horizon: string;
  /** Candidate actions available in response to this opportunity */
  options: string[];
}
