import type { Transaction } from "@/types";
import { computeDailyNet, computeCashFlowProjection } from "@/features/financial-state-engine";
import type { ScenarioAdjustment, ScenarioResult } from "./types";

/**
 * Applies a set of hypothetical category adjustments to real transactions
 * (e.g. "cut Marketing by 20%") and returns a synthetic transaction set —
 * same shape as the real data, just scaled. This is what lets the scenario
 * reuse computeDailyNet / computeCashFlowProjection directly instead of
 * needing a parallel projection model.
 */
function applyAdjustments(transactions: Transaction[], adjustments: ScenarioAdjustment[]): Transaction[] {
  if (adjustments.length === 0) return transactions;

  const adjustmentMap = new Map(adjustments.map((a) => [`${a.type}:${a.category}`, a.percentChange]));

  return transactions.map((t) => {
    const pct = adjustmentMap.get(`${t.type}:${t.category}`);
    if (pct === undefined) return t;
    return { ...t, amount: Math.max(0, t.amount * (1 + pct / 100)) };
  });
}

/**
 * Compares the real baseline projection against a hypothetical scenario,
 * both computed with the exact same Financial State Engine math — the only
 * difference is the input transactions. This keeps the simulation honest:
 * it can't diverge from how the real dashboard computes things.
 */
export function simulateScenario(transactions: Transaction[], adjustments: ScenarioAdjustment[]): ScenarioResult {
  if (transactions.length === 0) {
    return { baselineDaysUntilNegative: null, scenarioDaysUntilNegative: null, baselineDay90: 0, scenarioDay90: 0, series: [] };
  }

  const baselineDaily = computeDailyNet(transactions);
  const baselineProjection = computeCashFlowProjection(baselineDaily);

  const adjustedTransactions = applyAdjustments(transactions, adjustments);
  const scenarioDaily = computeDailyNet(adjustedTransactions);
  const scenarioProjection = computeCashFlowProjection(scenarioDaily);

  const series = baselineProjection.projectedPositionByDay
    .filter((p) => p.day % 5 === 0 || p.day === 1)
    .map((p) => ({
      day: p.day,
      baseline: p.projected,
      scenario: scenarioProjection.projectedPositionByDay[p.day - 1]?.projected ?? p.projected,
    }));

  return {
    baselineDaysUntilNegative: baselineProjection.daysUntilNegative,
    scenarioDaysUntilNegative: scenarioProjection.daysUntilNegative,
    baselineDay90: baselineProjection.projectedPositionByDay[baselineProjection.projectedPositionByDay.length - 1]?.projected ?? 0,
    scenarioDay90: scenarioProjection.projectedPositionByDay[scenarioProjection.projectedPositionByDay.length - 1]?.projected ?? 0,
    series,
  };
}
