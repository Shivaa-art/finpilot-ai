export type ConfidenceLabel = "High" | "Medium" | "Low";

export interface ConfidenceBreakdown {
  /** 0-100: how much transaction volume supports the data (saturates at 60+ transactions) */
  volumeScore: number;
  /** 0-100: how much date-range history supports the data (saturates at 60+ days) */
  spanScore: number;
  /** 0-100: how stable/consistent daily net cash flow has been (inverse of volatility) */
  stabilityScore: number;
  /** 0-100: the final blended confidence score used everywhere else in the app */
  overall: number;
  label: ConfidenceLabel;
  /** Human-readable justification for each sub-score, for the Explainability Engine to surface */
  rationale: string[];
}
