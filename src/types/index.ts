/**
 * Core domain types for FinPilot AI.
 * These are intentionally shared across the landing page's dashboard
 * preview and the real dashboard module built in a later pass, so the
 * preview never drifts out of sync with the product.
 */

export type ImpactDirection = "positive" | "negative" | "neutral";

export interface FinancialImpact {
  amount: number;
  currency: string;
  direction: ImpactDirection;
  /** e.g. "over the next 90 days" */
  horizon: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  reasoning: string;
  confidence: number; // 0-100
  impact: FinancialImpact;
  alternatives: string[];
  category: "cash-flow" | "expense" | "revenue" | "hiring" | "investment" | "risk";
}

export interface KPIStat {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: ImpactDirection;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/** Real data model — these rows come from Supabase, not mock data. */
export interface Company {
  id: string;
  user_id: string;
  name: string;
  industry: string;
  country: string;
  employees: string;
  annual_revenue: string;
  financial_software: string | null;
  goals: string[] | null;
  webhook_url: string | null;
  created_at: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  company_id: string;
  txn_date: string; // ISO date
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  created_at: string;
}

/** Row shape expected straight out of an uploaded CSV/Excel file. */
export interface ParsedTransactionRow {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
}
