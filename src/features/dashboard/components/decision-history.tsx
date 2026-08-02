import type { DecisionLogEntry } from "@/features/decision-memory-engine";

export function DecisionHistory({ entries }: { entries: DecisionLogEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
      <p className="text-sm font-medium text-dark">Decision history</p>
      <p className="text-xs text-muted">Past recommendations and what you did with them.</p>
      <ul className="mt-4 flex flex-col gap-3">
        {entries.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-dark">{e.title}</span>
            <span className="flex items-center gap-2 shrink-0">
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  e.status === "accepted" ? "bg-success-light text-success" : "bg-danger-light text-danger"
                }`}
              >
                {e.status === "accepted" ? "Accepted" : "Dismissed"}
              </span>
              <span className="text-xs text-muted">
                {e.resolved_at ? new Date(e.resolved_at).toLocaleDateString() : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
