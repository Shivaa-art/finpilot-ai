import type { DecisionDNAProfile } from "@/features/decision-dna-engine";

export function DecisionDNAPanel({ profile }: { profile: DecisionDNAProfile }) {
  if (!profile.sufficientHistory) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-5 text-xs text-muted">
        Decision DNA needs at least 5 resolved decisions (Accept/Dismiss) to surface patterns — currently{" "}
        {profile.totalResolved}.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <p className="text-sm font-semibold text-dark">Decision DNA</p>
      <p className="text-xs text-muted">How this business actually responds to recommendations, based on real history.</p>

      <ul className="mt-4 flex flex-col gap-2">
        {profile.insights.map((insight, i) => (
          <li key={i} className="text-xs leading-relaxed text-dark">
            · {insight}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-2">
        {profile.byCategory.map((c) => (
          <div key={c.category} className="flex items-center justify-between text-xs">
            <span className="text-muted">{c.category}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-danger-light">
                <div className="h-full rounded-full bg-success" style={{ width: `${c.acceptanceRate * 100}%` }} />
              </div>
              <span className="w-9 text-right font-medium text-dark">{Math.round(c.acceptanceRate * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
