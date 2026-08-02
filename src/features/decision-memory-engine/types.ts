export type DecisionStatus = "pending" | "accepted" | "dismissed";

export interface DecisionLogEntry {
  id: string;
  company_id: string;
  recommendation_id: string;
  title: string;
  category: string;
  confidence: number;
  magnitude: number;
  direction: string;
  status: DecisionStatus;
  created_at: string;
  resolved_at: string | null;
}
