import type { Transaction } from "@/types";

export type ReportPeriod = "all" | "monthly" | "quarterly";

export function filterByPeriod(transactions: Transaction[], period: ReportPeriod): Transaction[] {
  if (period === "all" || transactions.length === 0) return transactions;

  const sorted = [...transactions].sort((a, b) => b.txn_date.localeCompare(a.txn_date));
  const latest = new Date(sorted[0].txn_date);
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - (period === "monthly" ? 30 : 90));

  return transactions.filter((t) => new Date(t.txn_date) >= cutoff);
}

export interface ReportSummary {
  period: ReportPeriod;
  transactionCount: number;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  topExpenseCategories: { category: string; total: number }[];
  topIncomeCategories: { category: string; total: number }[];
}

export function buildReportSummary(transactions: Transaction[], period: ReportPeriod): ReportSummary {
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCategory = (type: "income" | "expense") => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === type)
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  return {
    period,
    transactionCount: transactions.length,
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    topExpenseCategories: byCategory("expense"),
    topIncomeCategories: byCategory("income"),
  };
}
