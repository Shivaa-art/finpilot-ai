import { createAnonClient } from "@/lib/supabase/anon";
import { computeFinancialState } from "@/features/financial-state-engine";
import type { Transaction } from "@/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!key) {
    return Response.json({ error: "Missing API key. Pass it as ?key=... or an Authorization: Bearer header." }, { status: 401 });
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("get_transactions_for_key", { input_key: key });

  if (error) {
    return Response.json(
      { error: "API key validation failed — has the phase6 migration been run in Supabase?" },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    // Could be an invalid key OR a valid key for a company with no transactions yet —
    // treat conservatively as unauthorized since we can't distinguish safely here.
    return Response.json({ error: "Invalid API key, or no transactions found for this company." }, { status: 401 });
  }

  const state = computeFinancialState(data as Transaction[]);

  return Response.json({
    healthScore: state.healthScore,
    confidence: state.confidence,
    confidenceLabel: state.confidenceBreakdown.label,
    cashPosition: state.cashPosition,
    daysUntilNegative: state.daysUntilNegative,
    totalIncome: state.totalIncome,
    totalExpenses: state.totalExpenses,
    netProfit: state.netProfit,
    dataQuality: state.dataQuality,
    generatedAt: new Date().toISOString(),
  });
}
