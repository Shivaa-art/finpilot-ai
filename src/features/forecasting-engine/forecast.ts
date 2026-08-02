import type { Transaction } from "@/types";
import { computeDailyNet, computeCashFlowProjection, type DailyNet } from "@/features/financial-state-engine";
import type { CategoryForecast, ForecastResult, ForecastSeries } from "./types";

const MOVING_AVERAGE_WINDOW = 7;

/**
 * A second, independent projection method: instead of fitting a trend line
 * across the entire history (which the Financial State Engine already
 * does), this projects forward using only the average net cash flow of the
 * most recent window — more reactive to recent changes, less influenced by
 * older history. Comparing the two methods side by side is itself useful:
 * if they agree, that's a stronger signal than either alone.
 */
function movingAverageForecast(dailyNet: DailyNet[], projectionDays = 90): ForecastSeries {
  const recent = dailyNet.slice(-MOVING_AVERAGE_WINDOW);
  const recentAvg = recent.length ? recent.reduce((s, d) => s + d.net, 0) / recent.length : 0;
  const currentPosition = dailyNet.reduce((s, d) => s + d.net, 0);

  const projectedPositionByDay: { day: number; projected: number }[] = [];
  let daysUntilNegative: number | null = null;
  let running = currentPosition;

  for (let day = 1; day <= projectionDays; day++) {
    running += recentAvg;
    projectedPositionByDay.push({ day, projected: running });
    if (daysUntilNegative === null && running < 0) daysUntilNegative = day;
  }

  return {
    method: "moving-average",
    label: `Recent ${MOVING_AVERAGE_WINDOW}-day average`,
    projectedPositionByDay,
    daysUntilNegative,
  };
}

function linearTrendForecast(dailyNet: DailyNet[], projectionDays = 90): ForecastSeries {
  const projection = computeCashFlowProjection(dailyNet, projectionDays);
  return {
    method: "linear-trend",
    label: "Full-history linear trend",
    projectedPositionByDay: projection.projectedPositionByDay,
    daysUntilNegative: projection.daysUntilNegative,
  };
}

/** Projects each of the top categories forward using its own average daily rate over the uploaded history. */
function computeCategoryForecasts(transactions: Transaction[], daySpan: number): CategoryForecast[] {
  const totals = new Map<string, { total: number; type: "income" | "expense" }>();

  for (const t of transactions) {
    const row = totals.get(t.category) ?? { total: 0, type: t.type };
    row.total += t.amount;
    totals.set(t.category, row);
  }

  return Array.from(totals.entries())
    .map(([category, row]) => {
      const dailyRate = row.total / daySpan;
      return {
        category,
        type: row.type,
        dailyRate,
        projectedAt30: Math.round(dailyRate * 30),
        projectedAt60: Math.round(dailyRate * 60),
        projectedAt90: Math.round(dailyRate * 90),
      };
    })
    .sort((a, b) => b.projectedAt90 - a.projectedAt90)
    .slice(0, 5);
}

/**
 * Runs both forecasting methods and the per-category projections. Built on
 * top of the Financial State Engine's daily-net computation rather than
 * duplicating it.
 */
export function computeForecast(transactions: Transaction[]): ForecastResult {
  if (transactions.length === 0) return { series: [], categoryForecasts: [] };

  const dailyNet = computeDailyNet(transactions);
  const dates = transactions.map((t) => new Date(t.txn_date).getTime());
  const daySpan = Math.max(1, Math.round((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24)));

  return {
    series: [linearTrendForecast(dailyNet), movingAverageForecast(dailyNet)],
    categoryForecasts: computeCategoryForecasts(transactions, daySpan),
  };
}
