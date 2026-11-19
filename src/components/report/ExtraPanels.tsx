"use client";

import { Download, FileJson } from "lucide-react";
import type { CashflowPoint, EstimateResult, GroupRow, PointsSummary, Splits, TimelineInfo } from "@/lib/engine";
import { faDecimal, faNum, tomanCompact } from "@/lib/format";
import { exportCsv, exportJson } from "@/lib/exporters";

/* ── نقاط تأسیساتی ─────────────────────────── */
export function PointsGrid({ points, unitLayoutRooms }: { points: PointsSummary; unitLayoutRooms?: string }) {
  const rows: [string, string, number][] = [
    ["پریز برق", "نقطه", points.outlets],
    ["کلید روشنایی", "نقطه", points.switches],
    ["نقطه روشنایی و چراغ", "نقطه", points.lightPoints],
    ["شبکه/تلویزیون/آیفون", "نقطه", points.dataPoints],
    ["ست شیرآلات بهداشتی", "ست", points.faucets],
    ["چاه فرنگی/ایرانی", "عدد", points.wcs],
    ["دوش و وان", "عدد", points.showers],
    ...(points.radiatorSections > 0 ? ([["پره رادیاتور آلومینیومی", "پره", points.radiatorSections]] as [string, string, number][]) : []),
    ["درب ضد سرقت ورودی", "عدد", points.entryDoors],
    ["درب داخلی MDF", "عدد", points.interiorDoors],
  ];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
      <h3 className="text-sm font-extrabold text-slate-900">⚡ شمارش نقاط تأسیساتی و اقلام واحد</h3>
      {unitLayoutRooms && <p className="mt-1 text-[11px] text-slate-500">{unitLayoutRooms}</p>}
      <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
        {rows.map(([l, u, v]) => (
          <div key={l} className="flex items-baseline justify-between gap-2 border-b border-dashed border-slate-100 pb-2">
            <dt className="text-[11px] font-bold text-slate-500">{l}</dt>
            <dd className="font-black text-slate-900 tnum">
              {faNum(v)} <span className="text-[10px] font-medium text-slate-400">{u}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── تفکیک دستمزد / مصالح / سایر ────────────── */
export function SplitBar({ splits, grandTotal }: { splits: Splits; grandTotal: number }) {
  const parts = [
    { label: "مصالح و تجهیزات", value: splits.material, color: "#0ea5e9" },
    { label: "دستمزد اجرا", value: splits.labor, color: "#f59e0b" },
    { label: "عوارض، مجوز و احتیاطی", value: splits.other, color: "#8b5cf6" },
  ];
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
      <h3 className="text-sm font-extrabold text-slate-900">💱 ساختار هزینه: دستمزد در برابر مصالح</h3>
      <div className="mt-4 flex h-7 w-full overflow-hidden rounded-xl">
        {parts.map((p) => (
          <div key={p.label} style={{ width: `${(p.value / grandTotal) * 100}%`, backgroundColor: p.color }} title={`${p.label}: ${tomanCompact(p.value)}`} />
        ))}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="flex-1 text-[11px] font-bold text-slate-600">{p.label}</span>
            <span className="text-xs font-black text-slate-900 tnum">
              {Math.round((p.value / grandTotal) * 100)}٪
              <span className="mr-1 hidden text-[10px] font-semibold text-slate-400 xl:inline">{tomanCompact(p.value)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── گانت زمان‌بندی ─────────────────────────── */
export function ScheduleGantt({ timeline }: { timeline: TimelineInfo }) {
  const days = Math.max(timeline.totalDays, 30);
  const months = timeline.months;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-slate-900">📅 برنامه زمان‌بندی اجرای پروژه</h3>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-black text-brand-700 tnum">
          مدت کل ≈ {faNum(months)} ماه ({faNum(days)} روز کاری)
        </span>
      </div>
      {/* month ruler */}
      <div className="relative mt-5 mr-36 hidden h-4 sm:block">
        {Array.from({ length: months }, (_, i) => (
          <span key={i} className="absolute -translate-x-1/2 text-[10px] font-bold text-slate-400 tnum" style={{ right: `${(i / months) * 100}%` }}>
            ماه {faNum(i + 1)}
          </span>
        ))}
      </div>
      <div className="mt-2 grid gap-1.5">
        {timeline.schedule.map((e) => {
          const right = (e.span.start / days) * 100;
          const width = ((e.span.end - e.span.start) / days) * 100;
          return (
            <div key={e.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-right text-[11px] font-bold text-slate-600 sm:w-36">
                <span className="ml-1">{e.emoji}</span>
                {e.title}
              </span>
              <div
                className="relative h-5 flex-1 rounded-md bg-slate-100"
                style={{ backgroundImage: "repeating-linear-gradient(to left, transparent 0, transparent calc(100% / " + months + " - 1px), #e2e8f0 calc(100% / " + months + " - 1px), #e2e8f0 calc(100% / " + months + "))" }}
              >
                <div
                  className="absolute inset-y-0.5 rounded-md opacity-90 transition-all"
                  style={{ right: `${right}%`, width: `${Math.max(width, 1.2)}%`, backgroundColor: e.color }}
                  title={`${e.title}: از ماه ${Math.floor(e.span.start / 30) + 1} تا ماه ${Math.ceil(e.span.end / 30)} · ${e.span.days} روز`}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] leading-5 text-slate-400">
        هم‌پوشانی فعالیت‌ها بر اساس روش اجرای رایج پیمانکاری ایران مدل شده است؛ برنامه واقعی تابع شرایط جوی، ظرفیت اکیپ‌ها و مجوزهای شهرداری است.
      </p>
    </div>
  );
}

/* ── جریان نقدینگی ماهانه ───────────────────── */
export function CashflowChart({ cashflow, months, inflationPct = 0 }: { cashflow: CashflowPoint[]; months: number; inflationPct?: number }) {
  const max = Math.max(...cashflow.map((c) => c.amount), 1);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
      <h3 className="text-sm font-extrabold text-slate-900">📈 منحنی نقدینگی ماهانه (S-Curve)</h3>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        {inflationPct > 0
          ? `ارقام اسمی با احتساب تورم ${faNum(inflationPct)}٪ سالانه — برنامه‌ریزی واقعی تأمین مالی.`
          : "بر مبنای قیمت امروز — برای برنامه‌ریزی تأمین مالی."}
      </p>
      <div className="mt-6 flex h-44 items-end gap-1 sm:gap-1.5">
        {cashflow.map((c) => (
          <div key={c.month} className="group relative flex flex-1 flex-col items-center justify-end self-stretch">
            <span className="pointer-events-none absolute -top-5 z-10 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-[9px] font-bold text-white group-hover:block tnum">
              {tomanCompact(c.amount)}
            </span>
            <div className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-teal-400 transition-all group-hover:from-brand-500" style={{ height: `${(c.amount / max) * 100}%` }} />
            <span className="mt-1 text-[9px] font-bold text-slate-400 tnum">{faNum(c.month)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[10px] font-semibold text-slate-400">
        <span>ماه شروع</span>
        <span className="tnum">جمع دوره: {tomanCompact(cashflow.reduce((s, c) => s + c.amount, 0))}</span>
        <span>ماه {faNum(months)}</span>
      </div>
    </div>
  );
}

/* ── دکمه‌های خروجی ─────────────────────────── */
export function ExportButtons({ result, refCode }: { result: EstimateResult; refCode?: string }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        onClick={() => exportCsv(result, refCode)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <Download size={15} />
        خروجی Excel (CSV)
      </button>
      <button
        onClick={() => exportJson(result, refCode)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <FileJson size={15} />
        خروجی JSON
      </button>
    </div>
  );
}

/** Re-exported helper so server pages can pass a pre-aggregated materials list if desired. */
export type { GroupRow };
