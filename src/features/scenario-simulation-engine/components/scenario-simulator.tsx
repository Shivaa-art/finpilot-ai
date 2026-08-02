"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { simulateScenario } from "@/features/scenario-simulation-engine";
import type { ScenarioAdjustment } from "@/features/scenario-simulation-engine";
import type { Transaction } from "@/types";

interface CategoryOption {
  category: string;
  type: "income" | "expense";
}

export function ScenarioSimulator({
  transactions,
  categoryOptions,
}: {
  transactions: Transaction[];
  categoryOptions: CategoryOption[];
}) {
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const scenarioAdjustments: ScenarioAdjustment[] = useMemo(
    () =>
      categoryOptions
        .map((c) => ({ category: c.category, type: c.type, percentChange: adjustments[c.category] ?? 0 }))
        .filter((a) => a.percentChange !== 0),
    [adjustments, categoryOptions]
  );

  const result = useMemo(
    () => simulateScenario(transactions, scenarioAdjustments),
    [transactions, scenarioAdjustments]
  );

  function setPct(category: string, pct: number) {
    setAdjustments((prev) => ({ ...prev, [category]: pct }));
  }

  function reset() {
    setAdjustments({});
  }

  const day90Delta = result.scenarioDay90 - result.baselineDay90;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-dark">Adjust categories</p>
          <button onClick={reset} className="text-xs font-medium text-primary hover:underline">
            Reset all
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {categoryOptions.map((c) => {
            const value = adjustments[c.category] ?? 0;
            return (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-dark">
                    {c.category} <span className="text-muted">({c.type})</span>
                  </span>
                  <span className={value === 0 ? "text-muted" : value > 0 ? "text-success" : "text-danger"}>
                    {value > 0 ? "+" : ""}
                    {value}%
                  </span>
                </div>
                <input
                  type="range"
                  min={-50}
                  max={100}
                  step={5}
                  value={value}
                  onChange={(e) => setPct(c.category, Number(e.target.value))}
                  className="mt-1.5 w-full accent-[var(--color-primary)]"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
          <p className="text-xs font-medium text-muted">Day 90 position</p>
          <p className="mt-2 text-2xl font-semibold text-dark">${Math.round(result.scenarioDay90).toLocaleString()}</p>
          {day90Delta !== 0 && (
            <p className={`mt-1 text-xs font-medium ${day90Delta > 0 ? "text-success" : "text-danger"}`}>
              {day90Delta > 0 ? "+" : ""}${Math.round(day90Delta).toLocaleString()} vs baseline
            </p>
          )}
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-soft">
          <p className="text-xs font-medium text-muted">Cash flow risk</p>
          <p className="mt-2 text-2xl font-semibold text-dark">
            {result.scenarioDaysUntilNegative === null ? "None" : `Day ${result.scenarioDaysUntilNegative}`}
          </p>
          {result.baselineDaysUntilNegative !== result.scenarioDaysUntilNegative && (
            <p className="mt-1 text-xs font-medium text-warning">
              Baseline: {result.baselineDaysUntilNegative === null ? "none" : `day ${result.baselineDaysUntilNegative}`}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-soft">
        <p className="text-sm font-medium text-dark">Baseline vs. scenario — 90 day projection</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="day" tickFormatter={(d) => `Day ${d}`} tick={{ fontSize: 11, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <ReferenceLine y={0} stroke="var(--color-danger)" strokeDasharray="4 4" />
              <Tooltip
                formatter={(value) => [`$${Math.round(Number(value)).toLocaleString()}`, ""]}
                labelFormatter={(d) => `Day ${d}`}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="baseline" name="Baseline" stroke="var(--color-muted)" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line type="monotone" dataKey="scenario" name="Scenario" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
