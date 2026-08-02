import { ConfidenceRing } from "@/components/ui/confidence-ring";
import type { AIRecommendation } from "@/types";
import type { Explanation } from "@/features/explainability-engine";
import type { DecisionLogEntry } from "@/features/decision-memory-engine";
import { DecisionActions } from "./decision-actions";
import { cn } from "@/lib/utils";

const categoryLabel: Record<AIRecommendation["category"], string> = {
  "cash-flow": "Cash Flow",
  expense: "Expense",
  revenue: "Revenue",
  hiring: "Hiring",
  investment: "Investment",
  risk: "Risk",
};

export function RecommendationList({
  recommendations,
  explanations,
  decisions,
}: {
  recommendations: AIRecommendation[];
  explanations?: Record<string, Explanation>;
  decisions?: Record<string, DecisionLogEntry>;
}) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
        No recommendations yet — upload transaction data to activate the AI engine.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {recommendations.map((rec) => {
        const explanation = explanations?.[rec.id];
        const decision = decisions?.[rec.id];
        return (
          <div key={rec.id} className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-medium text-primary-dark">
                {categoryLabel[rec.category]}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    rec.impact.direction === "positive" ? "text-success" : rec.impact.direction === "negative" ? "text-danger" : "text-muted"
                  )}
                >
                  {rec.impact.direction === "negative" ? "-" : "+"}${rec.impact.amount.toLocaleString()} · {rec.impact.horizon}
                </span>
                {decision && <DecisionActions logId={decision.id} status={decision.status} />}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              <ConfidenceRing value={rec.confidence} size={72} className="shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-dark">{rec.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{rec.reasoning}</p>
                {rec.alternatives.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted">Alternatives considered</p>
                    <ul className="mt-1 flex flex-col gap-1">
                      {rec.alternatives.map((alt, i) => (
                        <li key={i} className="text-xs text-muted">
                          · {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {explanation && (
              <details className="group mt-4 rounded-xl border border-border bg-background px-4 py-3">
                <summary className="cursor-pointer text-xs font-medium text-primary select-none">
                  Explain this recommendation
                </summary>
                <div className="mt-3 flex flex-col gap-3 text-xs text-muted">
                  <div>
                    <p className="font-medium text-dark">How this was computed</p>
                    <ol className="mt-1 flex flex-col gap-0.5">
                      {explanation.formulaTrace.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-dark">Confidence breakdown</p>
                    <ul className="mt-1 flex flex-col gap-0.5">
                      {explanation.confidenceBreakdown.rationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-dark">Ranking</p>
                    <p className="mt-1">{explanation.rankingContext}</p>
                  </div>
                </div>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
