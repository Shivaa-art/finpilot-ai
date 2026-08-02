import type { Transaction } from "@/types";

export interface DailyNet {
  date: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  type: "income" | "expense";
  transactionCount: number;
  /** Share of total income/expense this category represents, 0-1 */
  share: number;
}

export interface CashFlowProjection {
  /** Current cash position implied purely by the uploaded transactions */
  currentPosition: number;
  /** Average net cash flow per day, based on the full uploaded history */
  avgDailyNet: number;
  /** Linear trend slope of daily net cash flow (is it improving or worsening?) */
  trendSlope: number;
  /** Projected cash position N days from the last transaction date */
  projectedPositionByDay: { day: number; projected: number }[];
  /** First day (if any, within the 90-day projection) the projection goes negative */
  daysUntilNegative: number | null;
}

/** Groups raw transactions into one net-cash-flow row per calendar day. */
export function computeDailyNet(transactions: Transaction[]): DailyNet[] {
  const byDate = new Map<string, DailyNet>();

  for (const t of transactions) {
    const key = t.txn_date;
    const row = byDate.get(key) ?? { date: key, income: 0, expense: 0, net: 0 };
    if (t.type === "income") row.income += t.amount;
    else row.expense += t.amount;
    row.net = row.income - row.expense;
    byDate.set(key, row);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/** Simple linear regression slope over an evenly-indexed series (least squares). */
function linearSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;

  const xs = values.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (values[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

/**
 * Projects cash position forward from the real uploaded history.
 * "currentPosition" is the cumulative net of every transaction uploaded —
 * this is a runway model, not a bank balance, so it's most meaningful once
 * a full recent history (30+ days) has been uploaded.
 */
export function computeCashFlowProjection(
  daily: DailyNet[],
  projectionDays = 90
): CashFlowProjection {
  const currentPosition = daily.reduce((sum, d) => sum + d.net, 0);
  const netSeries = daily.map((d) => d.net);
  const avgDailyNet = netSeries.length ? netSeries.reduce((a, b) => a + b, 0) / netSeries.length : 0;
  const trendSlope = linearSlope(netSeries);

  const projectedPositionByDay: { day: number; projected: number }[] = [];
  let daysUntilNegative: number | null = null;
  let running = currentPosition;

  for (let day = 1; day <= projectionDays; day++) {
    // Project using trend-adjusted daily net so a worsening trend compounds forward.
    const projectedDailyNet = avgDailyNet + trendSlope * day;
    running += projectedDailyNet;
    projectedPositionByDay.push({ day, projected: running });
    if (daysUntilNegative === null && running < 0) daysUntilNegative = day;
  }

  return { currentPosition, avgDailyNet, trendSlope, projectedPositionByDay, daysUntilNegative };
}

/** Breaks down transactions by category, ranked by total within each type. */
export function computeCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const totals = new Map<string, { total: number; type: "income" | "expense"; count: number }>();

  for (const t of transactions) {
    const key = `${t.type}:${t.category}`;
    const row = totals.get(key) ?? { total: 0, type: t.type, count: 0 };
    row.total += t.amount;
    row.count += 1;
    totals.set(key, row);
  }

  const incomeTotal = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenseTotal = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return Array.from(totals.entries())
    .map(([key, row]) => {
      const category = key.split(":").slice(1).join(":");
      const denominator = row.type === "income" ? incomeTotal : expenseTotal;
      return {
        category,
        total: row.total,
        type: row.type,
        transactionCount: row.count,
        share: denominator > 0 ? row.total / denominator : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

/**
 * Financial Health Score (0-100), a composite of:
 * - Runway safety: how far out (of the 90-day projection) the cash stays positive
 * - Trend: whether daily net cash flow is improving or worsening
 * - Diversification: how concentrated expenses are in a single category (risk)
 */
export function computeFinancialHealthScore(
  projection: CashFlowProjection,
  categories: CategoryBreakdown[]
): number {
  const runwayScore =
    projection.daysUntilNegative === null ? 100 : Math.min(100, (projection.daysUntilNegative / 90) * 100);

  const trendScore = projection.trendSlope >= 0 ? 100 : Math.max(0, 100 + projection.trendSlope * 20);

  const topExpenseShare = categories.find((c) => c.type === "expense")?.share ?? 0;
  const concentrationScore = Math.max(0, 100 - topExpenseShare * 100);

  const score = runwayScore * 0.5 + trendScore * 0.3 + concentrationScore * 0.2;
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (mean === 0) return 0;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / Math.abs(mean);
}
