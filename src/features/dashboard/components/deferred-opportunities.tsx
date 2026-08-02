import type { Opportunity } from "@/features/opportunity-detection-engine";

export function DeferredOpportunities({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-border bg-surface p-5">
      <p className="text-xs font-medium text-muted">
        Also detected this cycle, ranked lower by the Decision Optimisation Engine
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {opportunities.map((o) => (
          <li key={o.id} className="flex items-center justify-between text-xs">
            <span className="text-dark">{o.signal}</span>
            <span className="text-muted">${o.magnitude.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
