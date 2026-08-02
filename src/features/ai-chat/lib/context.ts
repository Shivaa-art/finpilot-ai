import type { AIRecommendation } from "@/types";
import type { FinancialState } from "@/features/financial-state-engine";

/**
 * Turns the real, already-computed Financial State + recommendations into a
 * plain-text briefing for the chat model. The model never computes any
 * financial numbers itself — every figure it can reference here was
 * produced by the deterministic engines, so the chat can explain and
 * discuss the data without a risk of it inventing figures.
 */
export function buildChatContext(
  companyName: string,
  state: FinancialState,
  recommendations: AIRecommendation[]
): string {
  if (state.dataQuality.transactionCount === 0) {
    return `The company is "${companyName}". No financial data has been uploaded yet, so there is no Financial State to discuss. If asked about finances, tell the user to upload transactions first.`;
  }

  const recLines = recommendations
    .map(
      (r, i) =>
        `${i + 1}. [${r.category}] ${r.title} — confidence ${r.confidence}%, impact ${
          r.impact.direction === "negative" ? "-" : "+"
        }$${r.impact.amount.toLocaleString()} (${r.impact.horizon}). Reasoning: ${r.reasoning}`
    )
    .join("\n");

  return `You are FinPilot AI's financial assistant for "${companyName}". You explain and discuss the company's REAL, already-computed financial state below. Never invent numbers — only reference the figures given here. If asked something the data doesn't cover, say so plainly rather than guessing.

CURRENT FINANCIAL STATE (computed by the Financial State Engine from real uploaded transactions):
- Financial Health Score: ${state.healthScore}/100
- Confidence: ${state.confidence}/100 (${state.confidenceBreakdown.label})
- Cash position: $${Math.round(state.cashPosition).toLocaleString()}
- Average daily net cash flow: $${state.avgDailyNet.toFixed(2)}
- Cash flow trend: ${state.trendSlope >= 0 ? "improving" : "declining"}
- Days until cash goes negative (90-day forecast): ${state.daysUntilNegative ?? "never — stays positive"}
- Total income (uploaded history): $${Math.round(state.totalIncome).toLocaleString()}
- Total expenses (uploaded history): $${Math.round(state.totalExpenses).toLocaleString()}
- Net profit: $${Math.round(state.netProfit).toLocaleString()}
- Data basis: ${state.dataQuality.transactionCount} transactions over ${state.dataQuality.daySpan} days

CURRENT AI RECOMMENDATIONS (ranked by the Decision Optimisation Engine):
${recLines || "None generated this cycle."}

Answer conversationally and concisely. You may explain WHY a recommendation fired, compare it to alternatives, or help the user think through a decision — but you are not a substitute for professional financial/legal advice, and should say so if asked for something outside this scope (e.g. tax filing, legal structuring).`;
}
