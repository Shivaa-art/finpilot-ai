export interface CategoryDNA {
  category: string;
  accepted: number;
  dismissed: number;
  acceptanceRate: number; // 0-1
}

export interface DecisionDNAProfile {
  totalResolved: number;
  overallAcceptanceRate: number; // 0-1
  byCategory: CategoryDNA[];
  /** Plain-language patterns inferred from the history, e.g. which category types this business tends to act on */
  insights: string[];
  sufficientHistory: boolean;
}
