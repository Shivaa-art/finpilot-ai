import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCompany, getTransactions } from "@/services/company";
import { computeForecast } from "@/features/forecasting-engine";
import { runAIEngine } from "@/features/ai/engine";
import { getAllResolvedDecisions } from "@/features/decision-memory-engine";
import { computeDecisionDNA } from "@/features/decision-dna-engine";
import { buildInvestorReport, buildCEOWeeklyBrief, buildBoardReport } from "@/features/reports/lib/narrative-reports";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { TopNavbar } from "@/features/dashboard/components/top-navbar";
import { ReportView } from "@/features/reports/components/report-view";
import { ForecastPanel } from "@/features/reports/components/forecast-panel";
import { NarrativeReportGenerator } from "@/features/reports/components/narrative-report-generator";

export default async function ReportsPage() {
  const supabase = await createClient();
  const company = await getCurrentCompany(supabase);
  if (!company) redirect("/onboarding");

  const transactions = await getTransactions(supabase, company.id);
  const forecast = computeForecast(transactions);
  const engine = runAIEngine(transactions);
  const resolvedDecisions = await getAllResolvedDecisions(supabase, company.id);
  const dna = computeDecisionDNA(resolvedDecisions);

  const narrativeReports = {
    investor: buildInvestorReport(company.name, engine, engine.recommendations),
    "ceo-brief": buildCEOWeeklyBrief(company.name, engine, engine.recommendations),
    board: buildBoardReport(company.name, engine, engine.recommendations, dna),
  };

  return (
    <div className="flex min-h-full flex-1">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNavbar companyName={company.name} companyId={company.id} />
        <main className="flex-1 overflow-y-auto bg-background px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-dark">Reports</h1>
            <p className="text-sm text-muted">Real summaries generated from your uploaded transactions.</p>
          </div>
          <ReportView companyName={company.name} transactions={transactions} />

          {forecast.series.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-dark">Forecast</h2>
              <p className="mb-4 text-sm text-muted">Two independent projection methods, compared.</p>
              <ForecastPanel forecast={forecast} />
            </div>
          )}

          {transactions.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-dark">Narrative Reports</h2>
              <p className="mb-4 text-sm text-muted">
                Investor updates, weekly briefs, and board reports — composed from the same real analysis, framed
                for different readers.
              </p>
              <NarrativeReportGenerator reports={narrativeReports} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
