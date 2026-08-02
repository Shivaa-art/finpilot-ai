export type ForecastMethod = "linear-trend" | "moving-average";

export interface ForecastSeries {
  method: ForecastMethod;
  label: string;
  projectedPositionByDay: { day: number; projected: number }[];
  daysUntilNegative: number | null;
}

export interface CategoryForecast {
  category: string;
  type: "income" | "expense";
  /** Average per-day rate for this category, from the full uploaded history */
  dailyRate: number;
  projectedAt30: number;
  projectedAt60: number;
  projectedAt90: number;
}

export interface ForecastResult {
  series: ForecastSeries[];
  categoryForecasts: CategoryForecast[];
}
