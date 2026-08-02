export interface ScenarioAdjustment {
  category: string;
  type: "income" | "expense";
  /** e.g. -20 means cut this category's spend by 20%, +15 means grow it by 15% */
  percentChange: number;
}

export interface ScenarioSeriesPoint {
  day: number;
  baseline: number;
  scenario: number;
}

export interface ScenarioResult {
  baselineDaysUntilNegative: number | null;
  scenarioDaysUntilNegative: number | null;
  baselineDay90: number;
  scenarioDay90: number;
  series: ScenarioSeriesPoint[];
}
