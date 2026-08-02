import type { ForecastResult } from "@/features/forecasting-engine";

export function ForecastPanel({ forecast }: { forecast: ForecastResult }) {
  if (forecast.series.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {forecast.series.map((s) => (
          <div key={s.method} className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className="mt-2 text-lg font-semibold text-dark">
              {s.daysUntilNegative === null
                ? "Stays positive through day 90"
                : `Crosses zero on day ${s.daysUntilNegative}`}
            </p>
            <p className="mt-1 text-xs text-muted">
              Day 90 projected position: $
              {Math.round(s.projectedPositionByDay[s.projectedPositionByDay.length - 1]?.projected ?? 0).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {forecast.series.length === 2 &&
        forecast.series[0].daysUntilNegative !== forecast.series[1].daysUntilNegative && (
          <div className="rounded-xl bg-warning-light px-4 py-3 text-xs text-warning">
            The two forecasting methods disagree on cash flow risk — the linear trend and recent moving average
            are telling different stories, which usually means recent activity has shifted meaningfully from the
            longer-term pattern. Worth a closer look before acting on either alone.
          </div>
        )}

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
        <p className="text-sm font-medium text-dark">Category forecasts</p>
        <p className="text-xs text-muted">Projected cumulative total per category, based on its own average daily rate.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 text-right font-medium">30 days</th>
                <th className="py-2 pr-4 text-right font-medium">60 days</th>
                <th className="py-2 text-right font-medium">90 days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {forecast.categoryForecasts.map((c) => (
                <tr key={c.category}>
                  <td className="py-2 pr-4 text-dark">{c.category}</td>
                  <td className="py-2 pr-4 capitalize text-muted">{c.type}</td>
                  <td className="py-2 pr-4 text-right text-dark">${c.projectedAt30.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right text-dark">${c.projectedAt60.toLocaleString()}</td>
                  <td className="py-2 text-right text-dark">${c.projectedAt90.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
