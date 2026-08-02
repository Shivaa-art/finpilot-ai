import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OverviewCardsProps {
  healthScore: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export function OverviewCards({ healthScore, revenue, expenses, profit }: OverviewCardsProps) {
  const healthTone = healthScore >= 70 ? "var(--color-success)" : healthScore >= 40 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
        <p className="text-xs font-medium text-muted">Financial Health</p>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-3xl font-semibold text-dark">{healthScore}</span>
          <span className="mb-1 text-xs font-medium text-muted">/ 100</span>
        </div>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-light">
          <div className="h-full rounded-full" style={{ width: `${healthScore}%`, background: healthTone }} />
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
        <p className="text-xs font-medium text-muted">Revenue (uploaded)</p>
        <div className="mt-2 flex items-center gap-1.5">
          <ArrowUpRight className="h-4 w-4 text-success" />
          <span className="text-2xl font-semibold text-dark">${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
        <p className="text-xs font-medium text-muted">Expenses (uploaded)</p>
        <div className="mt-2 flex items-center gap-1.5">
          <ArrowDownRight className="h-4 w-4 text-danger" />
          <span className="text-2xl font-semibold text-dark">${expenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
        <p className="text-xs font-medium text-muted">Net Profit</p>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={cn("text-2xl font-semibold", profit >= 0 ? "text-success" : "text-danger")}>
            {profit >= 0 ? "+" : "-"}${Math.abs(profit).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
