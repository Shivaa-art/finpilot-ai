import type { Transaction } from "@/types";
import type { FinancialState } from "@/features/financial-state-engine";
import type { Opportunity } from "./types";

/** Splits transactions into an earlier and later half by date, for trend comparisons. */
function splitByHalf(transactions: Transaction[]) {
  const sorted = [...transactions].sort((a, b) => a.txn_date.localeCompare(b.txn_date));
  const mid = Math.floor(sorted.length / 2);
  return { earlier: sorted.slice(0, mid), later: sorted.slice(mid) };
}

function sumByCategory(transactions: Transaction[], type: "income" | "expense") {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return map;
}

function detectCashFlowOpportunity(state: FinancialState): Opportunity {
  const { daysUntilNegative, avgDailyNet, trendSlope, cashPosition, cashFlowProjection } = state;

  if (daysUntilNegative !== null) {
    const shortfall = Math.abs(
      cashFlowProjection[Math.min(cashFlowProjection.length - 1, daysUntilNegative - 1)]?.projected ?? 0
    );
    const urgency: "high" | "medium" = daysUntilNegative <= 30 ? "high" : "medium";
    return {
      id: "cash-flow-risk",
      category: "cash-flow",
      signal: `Cash position projected negative in ${daysUntilNegative} days`,
      evidence: `Average daily net cash flow of ${avgDailyNet.toFixed(
        2
      )} combined with the current trend crosses zero around day ${daysUntilNegative} of the 90-day forecast.`,
      magnitude: Math.round(shortfall),
      direction: "negative",
      urgency,
      horizon: `next ${daysUntilNegative} days`,
      options: [
        "Accelerate receivables collection on outstanding invoices",
        "Delay non-critical expense commitments",
        "Draw on a credit line to bridge the gap",
      ],
    };
  }

  return {
    id: "cash-flow-healthy",
    category: "cash-flow",
    signal: "Cash position stays positive across the full 90-day forecast",
    evidence: `Average daily net cash flow of ${avgDailyNet.toFixed(2)} and a ${
      trendSlope >= 0 ? "stable-to-improving" : "slightly declining"
    } trend keep projected cash above zero through the forecast window.`,
    magnitude: Math.round(Math.abs(cashPosition)),
    direction: "positive",
    urgency: "low",
    horizon: "next 90 days",
    options: ["Maintain current spending pace", "Reinvest surplus into growth channels"],
  };
}

function detectExpenseOpportunity(transactions: Transaction[]): Opportunity | null {
  const { earlier, later } = splitByHalf(transactions);
  const earlierExpense = sumByCategory(earlier, "expense");
  const laterExpense = sumByCategory(later, "expense");

  let topCategory: string | null = null;
  let topAmount = 0;
  let topPct = 0;

  for (const [category, laterTotal] of laterExpense) {
    const earlierTotal = earlierExpense.get(category) ?? 0;
    const growth = laterTotal - earlierTotal;
    const growthPct = earlierTotal > 0 ? growth / earlierTotal : growth > 0 ? 1 : 0;
    if (growth > topAmount && growthPct > 0.15) {
      topAmount = growth;
      topPct = growthPct;
      topCategory = category;
    }
  }

  if (!topCategory) return null;

  return {
    id: "expense-optimization",
    category: "expense",
    signal: `"${topCategory}" spend up ${Math.round(topPct * 100)}% against its own baseline`,
    evidence: `Comparing the first and second half of the uploaded history, "${topCategory}" spend increased by ${Math.round(
      topAmount
    )} — the largest category drift in the data, measured against your own history rather than an industry benchmark.`,
    magnitude: Math.round(topAmount),
    direction: "positive", // positive = acting on it recovers value
    urgency: topPct > 0.4 ? "high" : "medium",
    horizon: "if corrected next period",
    options: [
      "Renegotiate the underlying vendor or contract",
      "Set a category budget cap and alert threshold",
      "Leave as-is if the increase maps to planned, one-off growth spend",
    ],
  };
}

function detectRevenueOpportunity(transactions: Transaction[]): Opportunity | null {
  const { earlier, later } = splitByHalf(transactions);
  const earlierIncome = sumByCategory(earlier, "income");
  const laterIncome = sumByCategory(later, "income");

  let topCategory: string | null = null;
  let topGrowthPct = 0;

  for (const [category, laterTotal] of laterIncome) {
    const earlierTotal = earlierIncome.get(category) ?? 0;
    const growthPct = earlierTotal > 0 ? (laterTotal - earlierTotal) / earlierTotal : laterTotal > 0 ? 1 : 0;
    if (growthPct > topGrowthPct) {
      topGrowthPct = growthPct;
      topCategory = category;
    }
  }

  if (!topCategory || topGrowthPct <= 0.1) return null;

  const projectedGain = Math.round((laterIncome.get(topCategory) ?? 0) * topGrowthPct);

  return {
    id: "revenue-opportunity",
    category: "revenue",
    signal: `"${topCategory}" is the fastest-growing revenue line`,
    evidence: `"${topCategory}" revenue grew ${Math.round(
      topGrowthPct * 100
    )}% between the earlier and later half of the uploaded history, outpacing every other income category in the data.`,
    magnitude: projectedGain,
    direction: "positive",
    urgency: topGrowthPct > 0.3 ? "medium" : "low",
    horizon: "if trend continues",
    options: [
      "Hold current allocation and monitor another cycle",
      "Reallocate marketing spend toward this category",
      "Investigate whether the growth is seasonal before committing",
    ],
  };
}

function detectHiringOpportunity(state: FinancialState): Opportunity {
  const { healthScore, daysUntilNegative, avgDailyNet } = state;
  const ready = healthScore >= 70 && (daysUntilNegative === null || daysUntilNegative > 60);

  return {
    id: "hiring-readiness",
    category: "hiring",
    signal: ready ? "Financial position supports a new hire or investment" : "Hold off on new hiring or major investment",
    evidence: ready
      ? `A financial health score of ${healthScore}/100 and a cash runway extending ${
          daysUntilNegative ? `${daysUntilNegative} days` : "through the full 90-day forecast"
        } indicate enough buffer to absorb a new fixed cost without threatening runway.`
      : `A financial health score of ${healthScore}/100${
          daysUntilNegative ? ` and a projected shortfall in ${daysUntilNegative} days` : ""
        } suggest committing to new fixed costs now would tighten the runway further.`,
    magnitude: Math.round(Math.abs(avgDailyNet) * 30),
    direction: ready ? "positive" : "negative",
    urgency: ready ? "low" : "medium",
    horizon: "next 30 days",
    options: ready
      ? ["Bring on a part-time or contract role first", "Wait one more reporting period to confirm the trend"]
      : ["Bring on a part-time contractor instead of a full hire", "Revisit after the next upload once trend is clearer"],
  };
}

/**
 * Scans the Financial State + raw transactions for every distinct signal
 * worth surfacing. Returns them unranked — the Decision Optimisation Engine
 * decides which ones actually get surfaced to the user and in what order.
 */
export function detectOpportunities(state: FinancialState, transactions: Transaction[]): Opportunity[] {
  if (transactions.length === 0) return [];

  const opportunities: Opportunity[] = [detectCashFlowOpportunity(state), detectHiringOpportunity(state)];

  const expenseOpp = detectExpenseOpportunity(transactions);
  if (expenseOpp) opportunities.push(expenseOpp);

  const revenueOpp = detectRevenueOpportunity(transactions);
  if (revenueOpp) opportunities.push(revenueOpp);

  return opportunities;
}
