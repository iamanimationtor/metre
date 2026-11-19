"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GroupRow, ScenarioPoint } from "@/lib/engine";
import { tomanCompact } from "@/lib/format";

const tooltipStyle = {
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 30px -10px rgb(2 6 23 / 0.2)",
  fontFamily: "inherit",
  fontSize: 12,
} as const;

export function DonutChart({ groups, grandTotal }: { groups: GroupRow[]; grandTotal: number }) {
  const sorted = [...groups].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, 7);
  const restSum = sorted.slice(7).reduce((s, g) => s + g.total, 0);
  const data = [
    ...top.map((g) => ({ name: g.title, value: g.total, color: g.color })),
    ...(restSum > 0 ? [{ name: "سایر هزینه‌ها", value: restSum, color: "#94a3b8" }] : []),
  ];

  return (
    <div className="h-72" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="80%" paddingAngle={2} stroke="#fff" strokeWidth={2}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [tomanCompact(Number(v)), ""]}
            contentStyle={tooltipStyle}
            itemStyle={{ fontWeight: 700 }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={9}
            wrapperStyle={{ fontSize: 11, fontFamily: "inherit", lineHeight: "22px" }}
            formatter={(value: string) => {
              const item = data.find((d) => d.name === value);
              const pct = item && grandTotal ? Math.round((item.value / grandTotal) * 100) : 0;
              return `${value} (${pct}٪)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScenarioBar({ scenarios, currentQuality }: { scenarios: ScenarioPoint[]; currentQuality: string }) {
  const data = scenarios.map((s) => ({
    name: s.label,
    قیمت: s.perSqm,
    active: s.quality === currentQuality,
    color: s.quality === "economic" ? "#0ea5e9" : s.quality === "standard" ? "#10b981" : s.quality === "good" ? "#f59e0b" : "#8b5cf6",
  }));

  return (
    <div className="h-72" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
          <CartesianGrid horizontal={false} strokeDasharray="4 6" stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)} م`} tick={{ fontSize: 11, fontFamily: "inherit" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={64} orientation="right" tick={{ fontSize: 12, fontFamily: "inherit", fontWeight: 700 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [`${tomanCompact(Number(v))} بر مترمربع`, "هزینه ساخت"]} contentStyle={tooltipStyle} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
          <Bar dataKey="قیمت" radius={[8, 0, 0, 8]} barSize={26}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} opacity={d.active ? 1 : 0.45} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
