import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getTransactions } from "@/services/company";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopNavbar } from "@/features/dashboard/components/top-navbar";
import { ScenarioSimulator } from "@/features/scenario-simulation-engine/components/scenario-simulator";

export default async function ScenarioPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);
  if (!company) redirect("/onboarding");

  const transactions = await getTransactions(supabase, company.id);

  const totals = new Map<string, { total: number; type: "income" | "expense" }>();
  for (const t of transactions) {
    const row = totals.get(t.category) ?? { total: 0, type: t.type };
    row.total += t.amount;
    totals.set(t.category, row);
  }
  const categoryOptions = Array.from(totals.entries())
    .map(([category, row]) => ({ category, type: row.type }))
    .sort((a, b) => (totals.get(b.category)?.total ?? 0) - (totals.get(a.category)?.total ?? 0))
    .slice(0, 6);

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNavbar companyName={company.name} companyId={company.id} />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-dark">Scenario Simulation</h1>
            <p className="text-sm text-muted">
              Adjust a category and see the real cash flow projection recompute live — same math as the dashboard,
              just fed a hypothetical instead of your actual history.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-10 text-center text-sm text-muted">
              Upload transaction data first to run scenarios against it.
            </div>
          ) : (
            <ScenarioSimulator transactions={transactions} categoryOptions={categoryOptions} />
          )}
        </main>
      </div>
    </div>
  );
}
