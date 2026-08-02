import type { Transaction } from "@/types";
import {
  coefficientOfVariation,
  computeCashFlowProjection,
  computeCategoryBreakdown,
  computeDailyNet,
  computeFinancialHealthScore,
} from "./metrics";
import { computeConfidenceBreakdown } from "@/features/confidence-engine";
import { EMPTY_FINANCIAL_STATE, type FinancialState } from "./types";

/**
 * Computes the full Financial State for a company from its real uploaded
 * transactions. This is the Phase 2 deliverable: a deterministic, explainable
 * engine — every number here traces back to actual transaction rows, with
 * no external AI call and no hardcoded data.
 *
 * Later phases build on top of this rather than duplicating it:
 * - Opportunity Detection Engine reads `categories` + `cashFlowProjection`
 * - Decision Optimisation Engine reads `healthScore` + `confidence`
 * - Confidence Engine (Phase 4) will formalize the `confidence` calculation
 *   further, but the field already exists here so nothing downstream breaks.
 */
export function computeFinancialState(transactions: Transaction[]): FinancialState {
  if (transactions.length === 0) return EMPTY_FINANCIAL_STATE;

  const dailyNet = computeDailyNet(transactions);
  const projection = computeCashFlowProjection(dailyNet);
  const categories = computeCategoryBreakdown(transactions);
  const healthScore = computeFinancialHealthScore(projection, categories);

  const dates = transactions.map((t) => new Date(t.txn_date).getTime());
  const daySpan = Math.max(1, Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)));
  const volatility = coefficientOfVariation(dailyNet.map((d) => d.net));
  const confidenceBreakdown = computeConfidenceBreakdown({
    transactionCount: transactions.length,
    daySpan,
    volatility,
  });

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return {
    healthScore,
    confidence: confidenceBreakdown.overall,
    confidenceBreakdown,
    cashPosition: projection.currentPosition,
    avgDailyNet: projection.avgDailyNet,
    trendSlope: projection.trendSlope,
    daysUntilNegative: projection.daysUntilNegative,
    cashFlowProjection: projection.projectedPositionByDay,
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
    categories,
    dailyNet,
    dataQuality: {
      transactionCount: transactions.length,
      daySpan,
      sufficientForConfidence: transactions.length >= 10 && daySpan >= 14,
    },
  };
}
