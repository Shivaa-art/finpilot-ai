import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getTransactions } from "@/services/company";
import { runAIEngine } from "@/features/ai/engine";
import { computeCashFlowProjection, computeDailyNet } from "@/features/financial-state-engine";
import { ensureDecisionsLogged, getDecisionHistory, getAllResolvedDecisions } from "@/features/decision-memory-engine";
import { computeDecisionDNA } from "@/features/decision-dna-engine";
import { ensureNotification } from "@/features/notifications";
import { DecisionDNAPanel } from "@/features/dashboard/components/decision-dna-panel";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopNavbar } from "@/features/dashboard/components/top-navbar";
import { OverviewCards } from "@/features/dashboard/components/overview-cards";
import { RecommendationList } from "@/features/dashboard/components/recommendation-list";
import { DeferredOpportunities } from "@/features/dashboard/components/deferred-opportunities";
import { DecisionHistory } from "@/features/dashboard/components/decision-history";
import { CEOBrief } from "@/features/dashboard/components/ceo-brief";
import { CashFlowChart } from "@/features/dashboard/components/cash-flow-chart";
import { EmptyState } from "@/features/dashboard/components/empty-state";

export default async function DashboardPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);

  if (!company) redirect("/onboarding");

  const transactions = await getTransactions(supabase, company.id);
  const engine = runAIEngine(transactions);

  const revenue = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const profit = revenue - expenses;

  const daily = computeDailyNet(transactions);
  const projection = computeCashFlowProjection(daily);

  const decisions = await ensureDecisionsLogged(supabase, company.id, engine.recommendations);
  const decisionHistory = await getDecisionHistory(supabase, company.id);
  const allResolved = await getAllResolvedDecisions(supabase, company.id);
  const decisionDNA = computeDecisionDNA(allResolved);

  if (engine.daysUntilNegative !== null) {
    await ensureNotification(
      supabase,
      company.id,
      "cash-flow-risk",
      `Cash position is projected to go negative in ${engine.daysUntilNegative} days.`
    );
  }

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNavbar companyName={company.name} companyId={company.id} />

        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          {transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-6">
              <OverviewCards healthScore={engine.healthScore} revenue={revenue} expenses={expenses} profit={profit} />

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
                  <p className="text-sm font-medium text-muted">Cash Flow — 90 day projection</p>
                  <CashFlowChart data={projection.projectedPositionByDay} />
                  {!engine.dataQuality.sufficientForConfidence && (
                    <p className="mt-2 text-xs text-warning">
                      Based on {engine.dataQuality.transactionCount} transactions over{" "}
                      {engine.dataQuality.daySpan} days — upload more history to raise confidence.
                    </p>
                  )}
                </div>

                <CEOBrief
                  topRecommendation={engine.recommendations[0] ?? null}
                  daysUntilNegative={engine.daysUntilNegative}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-dark">AI Recommendations</h2>
                <p className="text-sm text-muted">Ranked by financial impact, each with its full reasoning.</p>
                <div className="mt-4">
                  <RecommendationList
                    recommendations={engine.recommendations}
                    explanations={engine.explanations}
                    decisions={decisions}
                  />
                </div>
                {engine.deferredOpportunities.length > 0 && (
                  <div className="mt-4">
                    <DeferredOpportunities opportunities={engine.deferredOpportunities} />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DecisionHistory entries={decisionHistory} />
                <DecisionDNAPanel profile={decisionDNA} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
