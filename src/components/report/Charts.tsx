"use client";

import dynamic from "next/dynamic";
import type { GroupRow, ScenarioPoint } from "@/lib/engine";

// recharts relies on browser layout APIs — mount it client-side only.
const DonutChart = dynamic(() => import("./ChartImpl").then((m) => m.DonutChart), { ssr: false });
const ScenarioBar = dynamic(() => import("./ChartImpl").then((m) => m.ScenarioBar), { ssr: false });

export function CostDonut({ groups, grandTotal }: { groups: GroupRow[]; grandTotal: number }) {
  return <DonutChart groups={groups} grandTotal={grandTotal} />;
}

export function QualityScenarios({ scenarios, currentQuality }: { scenarios: ScenarioPoint[]; currentQuality: string }) {
  return <ScenarioBar scenarios={scenarios} currentQuality={currentQuality} />;
}
