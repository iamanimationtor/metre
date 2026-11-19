"use client";

import { useState, type ReactNode } from "react";
import { BarChart3, Settings2, TrendingUp } from "lucide-react";

type TabId = "stats" | "index" | "prices";

function TabButton({
  selected,
  onSelect,
  icon,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all ${
        selected ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function AdminTabs({
  statsSlot,
  priceSlot,
  indexSlot,
}: {
  statsSlot: ReactNode;
  priceSlot: ReactNode;
  indexSlot: ReactNode;
}) {
  const [tab, setTab] = useState<TabId>("index");

  return (
    <div className="grid gap-6">
      <div className="flex w-fit flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <TabButton selected={tab === "index"} onSelect={() => setTab("index")} icon={<TrendingUp size={15} />} label="شاخص‌های قیمت (خودکار)" />
        <TabButton selected={tab === "prices"} onSelect={() => setTab("prices")} icon={<Settings2 size={15} />} label="تنظیم ریز آیتم‌ها" />
        <TabButton selected={tab === "stats"} onSelect={() => setTab("stats")} icon={<BarChart3 size={15} />} label="آمار سامانه" />
      </div>
      {tab === "stats" ? statsSlot : tab === "index" ? indexSlot : priceSlot}
    </div>
  );
}
