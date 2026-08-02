import type { ConfidenceBreakdown, ConfidenceLabel } from "./types";

export interface ConfidenceInputs {
  transactionCount: number;
  daySpan: number;
  /** Coefficient of variation of daily net cash flow, 0+ (higher = less stable) */
  volatility: number;
}

function labelFor(overall: number): ConfidenceLabel {
  if (overall >= 80) return "High";
  if (overall >= 55) return "Medium";
  return "Low";
}

/**
 * Confidence isn't a vibe — it's a function of how much and how consistent
 * the underlying data is. This engine makes each contributing factor
 * explicit and inspectable, rather than hiding them inside one number, so
 * the Explainability Engine (and the dashboard) can show its work.
 */
export function computeConfidenceBreakdown(inputs: ConfidenceInputs): ConfidenceBreakdown {
  const { transactionCount, daySpan, volatility } = inputs;

  const volumeScore = Math.round(Math.min(1, transactionCount / 60) * 100);
  const spanScore = Math.round(Math.min(1, daySpan / 60) * 100);
  const stabilityScore = Math.round(Math.max(0, 1 - Math.min(1, volatility / 3)) * 100);

  const blended = (volumeScore * 0.4 + spanScore * 0.35 + stabilityScore * 0.25) / 100;
  const overall = Math.round(Math.max(35, Math.min(97, blended * 100)));

  const rationale = [
    `Transaction volume: ${transactionCount} transactions (${volumeScore}/100 — saturates at 60+).`,
    `History span: ${daySpan} days of data (${spanScore}/100 — saturates at 60+ days).`,
    `Cash flow stability: ${stabilityScore}/100 based on day-to-day volatility of net cash flow.`,
  ];

  return { volumeScore, spanScore, stabilityScore, overall, label: labelFor(overall), rationale };
}
