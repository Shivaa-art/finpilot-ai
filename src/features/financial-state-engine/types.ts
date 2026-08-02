import type { CashFlowProjection, CategoryBreakdown, DailyNet } from "./metrics";
import type { ConfidenceBreakdown } from "@/features/confidence-engine";

export interface DataQuality {
  transactionCount: number;
  daySpan: number;
  /** Whether there's enough real history for confidence scores to be meaningful */
  sufficientForConfidence: boolean;
}

/**
 * FinancialState is the complete, point-in-time picture of a company's
 * finances, computed entirely from its real uploaded transactions.
 *
 * This is the Financial State Engine's one job: turn raw transactions into
 * a structured, trustworthy snapshot. It does NOT decide what to do about
 * that state — ranking opportunities and optimizing decisions is the
 * Opportunity Detection Engine and Decision Optimisation Engine's job
 * (Phase 3), which consume this output rather than recomputing it.
 */
export interface FinancialState {
  /** Financial Health Score, 0-100 */
  healthScore: number;
  /** How much to trust this state, 0-100, based on data volume/consistency (same as confidenceBreakdown.overall) */
  confidence: number;
  /** The full decomposed confidence factors, from the Confidence Engine (Phase 4) */
  confidenceBreakdown: ConfidenceBreakdown;

  cashPosition: number;
  avgDailyNet: number;
  trendSlope: number;
  daysUntilNegative: number | null;
  cashFlowProjection: CashFlowProjection["projectedPositionByDay"];

  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  categories: CategoryBreakdown[];
  dailyNet: DailyNet[];

  dataQuality: DataQuality;
}

export const EMPTY_CONFIDENCE_BREAKDOWN: ConfidenceBreakdown = {
  volumeScore: 0,
  spanScore: 0,
  stabilityScore: 0,
  overall: 0,
  label: "Low",
  rationale: [],
};

export const EMPTY_FINANCIAL_STATE: FinancialState = {
  healthScore: 0,
  confidence: 0,
  confidenceBreakdown: EMPTY_CONFIDENCE_BREAKDOWN,
  cashPosition: 0,
  avgDailyNet: 0,
  trendSlope: 0,
  daysUntilNegative: null,
  cashFlowProjection: [],
  totalIncome: 0,
  totalExpenses: 0,
  netProfit: 0,
  categories: [],
  dailyNet: [],
  dataQuality: { transactionCount: 0, daySpan: 0, sufficientForConfidence: false },
};
