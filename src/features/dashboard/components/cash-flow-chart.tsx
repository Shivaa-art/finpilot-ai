"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";

export function CashFlowChart({ data }: { data: { day: number; projected: number }[] }) {
  const sampled = data.filter((d) => d.day % 5 === 0 || d.day === 1);

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sampled} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="dashCashFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tickFormatter={(d) => `Day ${d}`}
            tick={{ fontSize: 11, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <ReferenceLine y={0} stroke="var(--color-danger)" strokeDasharray="4 4" />
          <Tooltip
            formatter={(value) => [`$${Math.round(Number(value)).toLocaleString()}`, "Projected cash"]}
            labelFormatter={(d) => `Day ${d}`}
            contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="projected"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#dashCashFlow)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
