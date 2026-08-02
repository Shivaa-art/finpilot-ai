import { kpiStats } from "../data";

export function TrustedStats() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {kpiStats.map((stat) => (
            <div key={stat.id} className="text-center sm:text-left">
              <div className="text-2xl font-semibold tracking-tight text-dark sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted sm:text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
