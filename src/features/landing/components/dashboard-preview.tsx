"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { AlertTriangle, ArrowUpRight, Newspaper } from "lucide-react";
import { ConfidenceRing } from "@/components/ui/confidence-ring";
import { dashboardRecommendations } from "../data";

const cashFlowData = [
  { day: "Mon", value: 62 },
  { day: "Tue", value: 58 },
  { day: "Wed", value: 66 },
  { day: "Thu", value: 71 },
  { day: "Fri", value: 69 },
  { day: "Sat", value: 78 },
  { day: "Sun", value: 84 },
];

export function DashboardPreview() {
  const primary = dashboardRecommendations[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-dark sm:text-4xl">
          One screen. Every decision that matters today.
        </h2>
        <p className="mt-4 text-muted">
          Financial health, cash flow, and the AI&apos;s top recommendation — all reasoned,
          scored, and ready before your first coffee.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Financial Health */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
          <div className="text-sm font-medium text-muted">Financial Health</div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-4xl font-semibold text-dark">82</span>
            <span className="mb-1 text-sm font-medium text-success">/ 100</span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-primary-light">
            <div className="h-full w-[82%] rounded-full bg-success" />
          </div>
          <p className="mt-3 text-xs text-muted">Up 6 points since last month</p>
        </div>

        {/* Cash Flow */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted">Cash Flow — 7 day runway</div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +12.4%
            </span>
          </div>
          <div className="mt-4 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#cashFlowFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendation + Confidence */}
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted">AI Recommendation</span>
            <span className="rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-medium capitalize text-primary-dark">
              {primary.category.replace("-", " ")}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
            <ConfidenceRing value={primary.confidence} size={72} className="shrink-0" />
            <div>
              <h3 className="text-base font-semibold text-dark">{primary.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{primary.reasoning}</p>
            </div>
          </div>
        </div>

        {/* CEO Brief */}
        <div className="rounded-[var(--radius-card)] border border-border bg-dark p-6 shadow-soft">
          <div className="flex items-center gap-2 text-sm font-medium text-white/70">
            <Newspaper className="h-4 w-4" />
            Today&apos;s CEO Brief
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            Runway holds through Q3 if the warehouse renewal is delayed. One risk flagged
            below needs a decision by Friday.
          </p>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white/10 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs leading-relaxed text-white/80">
              Supplier B payment terms expire in 5 days — renegotiate before auto-renewal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
