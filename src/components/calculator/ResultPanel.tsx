"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ExternalLink, Printer } from "lucide-react";
import type { EstimateResult } from "@/lib/engine";
import { faDecimal, faNum, toman, tomanCompact } from "@/lib/format";
import Breakdown, { EXPAND_ALL_EVENT } from "@/components/report/Breakdown";
import BomPanel from "@/components/report/BomPanel";
import { CostDonut, QualityScenarios } from "@/components/report/Charts";
import { CashflowChart, ExportButtons, PointsGrid, ScheduleGantt, SplitBar } from "@/components/report/ExtraPanels";
import PrintMasthead from "@/components/site/PrintMasthead";

type Tab = "summary" | "items" | "bom" | "timeline" | "passport";

const TABS: { id: Tab; label: string }[] = [
  { id: "summary", label: "نمای کلی" },
  { id: "items", label: "ریز اقلام برآورد" },
  { id: "bom", label: "ریز مصالح و تجهیزات" },
  { id: "timeline", label: "زمان‌بندی" },
  { id: "passport", label: "شناسنامه" },
];

export default function ResultPanel({ result, refCode }: { result: EstimateResult; refCode?: string }) {
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState(false);
  const d = result.derived;

  const reportUrl = useMemo(() => (typeof window !== "undefined" && refCode ? `${window.location.origin}/report/${refCode}` : ""), [refCode]);

  const share = async () => {
    if (!reportUrl) return;
    try {
      await navigator.clipboard.writeText(reportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const print = () => {
    window.dispatchEvent(new Event(EXPAND_ALL_EVENT));
    setTimeout(() => window.print(), 350);
  };

  const roomsLabel = `چیدمان هر واحد: ${result.unitLayout.rooms.map((r) => r.label).join("، ")}`;

  return (
    <div className="anim-fade-up grid gap-6">
      <PrintMasthead code={refCode} />
      {/* ── کارت جمع کل ─────────────────── */}
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-l from-slate-900 via-slate-900 to-brand-950 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-teal-300">💰 برآورد کل هزینه ساخت (با عوارض و ذخیره احتیاطی)</p>
            <p className="mt-3 text-3xl font-black leading-relaxed tnum sm:text-4xl">{tomanCompact(result.grandTotal)}</p>
            <p className="mt-1 text-sm text-slate-300 tnum">{toman(result.grandTotal)}</p>
            {result.indexNote && (
              <p className="mt-2 max-w-xl rounded-xl bg-white/5 px-3 py-2 text-[11px] font-semibold leading-6 text-teal-200 ring-1 ring-white/10">
                🔄 {result.indexNote}
              </p>
            )}
            {refCode && (
              <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-teal-200">
                <CheckCircle2 size={13} />
                گزارش با کد پیگیری <span className="font-black tracking-wider" dir="ltr">{refCode}</span> ذخیره شد
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:min-w-80">
            <StatDark label="هزینه هر مترمربع زیربنا" value={`${faNum(result.costPerSqm / 1_000_000)} میلیون ت`} big />
            <StatDark label="مدت تقریبی اجرا" value={`≈ ${faNum(result.timeline.months)} ماه`} />
            <StatDark label="زیربنا / تعداد واحد" value={`${faNum(d.builtUpArea)} م² · ${faNum(d.totalUnits)}`} />
            <StatDark label="منطقه و ضریب" value={`${result.regionLabel} ×${faDecimal(result.regionCoef)}`} />
          </div>
        </div>

        {(result.timeline?.inflatedTotal ?? 0) > result.grandTotal * 1.02 && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
            <p className="text-[11px] font-bold leading-5 text-slate-300">
              📈 برآورد اسمی با تورم {faNum(result.timeline.inflationPct)}٪ سالانه طی {faNum(result.timeline.months)} ماه اجرا
            </p>
            <p className="text-base font-black text-teal-300 tnum">{tomanCompact(result.timeline.inflatedTotal)}</p>
          </div>
        )}

        <div className="no-print mt-6 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5">
          <button onClick={print} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-900 shadow transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <Printer size={15} />
            چاپ گزارش کامل (PDF)
          </button>
          <ExportButtons result={result} refCode={refCode} />
          {refCode && (
            <>
              <button onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15">
                {copied ? <CheckCircle2 size={15} /> : <ExternalLink size={15} />}
                {copied ? "لینک کپی شد!" : "کپی لینک گزارش"}
              </button>
              <Link href={`/report/${refCode}`} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15">
                صفحه دائمی گزارش
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── تب‌ها ─────────────────── */}
      <div className="no-print flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-extrabold transition-all sm:text-sm ${
              tab === t.id ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard title="سهم فازهای اجرایی از هزینه کل" subtitle="برای دیدن مبلغ دقیق روی هر بخش حرکت کنید">
            <CostDonut groups={result.groups} grandTotal={result.grandTotal} />
          </ChartCard>
          <ChartCard title="مقایسه سطوح کیفیت" subtitle="هزینه ساخت هر مترمربع در چهار سطح کیفی">
            <QualityScenarios scenarios={result.scenarios} currentQuality={result.inputs.quality} />
          </ChartCard>
          <div className="lg:col-span-2">
            <SplitBar splits={result.splits} grandTotal={result.grandTotal} />
          </div>
          <div className="lg:col-span-2">
            <GroupBars result={result} />
          </div>
        </div>
      )}

      {tab === "items" && <Breakdown groups={result.groups} grandTotal={result.grandTotal} />}

      {tab === "bom" && (
        <div className="grid gap-6">
          <BomPanel result={result} />
          <PointsGrid points={result.points} unitLayoutRooms={roomsLabel} />
        </div>
      )}

      {tab === "timeline" && (
        <div className="grid gap-6">
          <ScheduleGantt timeline={result.timeline} />
          <CashflowChart cashflow={result.timeline.cashflow} months={result.timeline.months} inflationPct={result.timeline.inflationPct ?? 0} />
        </div>
      )}

      {tab === "passport" && <Passport result={result} />}
    </div>
  );
}

/* ── اجزای کوچک ─────────────────────────── */
function StatDark({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3.5 ring-1 ring-white/10">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p className={`mt-1 font-black tnum ${big ? "text-base text-teal-300" : "text-sm text-white"}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print-flat sm:p-6">
      <h4 className="text-sm font-extrabold text-slate-900">{title}</h4>
      <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function GroupBars({ result }: { result: EstimateResult }) {
  const sorted = [...result.groups].sort((a, b) => b.total - a.total);
  const max = sorted[0]?.total ?? 1;
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm print-flat sm:p-6">
      <h4 className="text-sm font-extrabold text-slate-900">رتبه‌بندی گروه‌های هزینه</h4>
      <p className="mt-0.5 text-[11px] text-slate-500">از پرهزینه‌ترین به کم‌هزینه‌ترین</p>
      <div className="mt-5 grid gap-3">
        {sorted.map((g) => (
          <div key={g.id} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate text-xs font-bold text-slate-700 sm:w-56">
              {g.emoji} {g.title}
            </span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-slate-100">
              <div
                className="absolute inset-y-0 right-0 rounded-lg transition-all duration-700"
                style={{ width: `${Math.max((g.total / max) * 100, 2)}%`, backgroundColor: g.color, opacity: 0.85 }}
              />
            </div>
            <span className="w-24 shrink-0 text-left text-xs font-black text-slate-800 tnum sm:w-32">{tomanCompact(g.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Passport({ result }: { result: EstimateResult }) {
  const d = result.derived;
  const i = result.inputs;
  const U = result.unitLayout;
  const metrics: [string, string][] = [
    ["مساحت زمین", `${faNum(i.landArea)} مترمربع`],
    ["سطح اشغال", `${faNum(d.footprint)} مترمربع (${faNum(i.occupancyPct)}٪)`],
    ...(i.hasBasement ? ([[`زیرزمین`, `${faNum(d.basementArea)} مترمربع`]] as [string, string][]) : []),
    ["زیربنای طبقات مسکونی", `${faNum(d.grossFloorArea)} مترمربع`],
    ["زیربنای کل محاسباتی", `${faNum(d.builtUpArea)} مترمربع`],
    ["تعداد طبقات / واحد", `${faNum(i.floors)} / ${faNum(d.totalUnits)}`],
    ["میانگین مساحت هر واحد", `${faDecimal(U.netArea)} مترمربع`],
    ["تعداد اتاق خواب هر واحد", faNum(U.bedrooms)],
    ["ارتفاع تقریبی بنا", `${faDecimal(d.buildingHeight)} متر`],
    ["محیط ساختمان / زمین", `${faDecimal(d.perimeterOccupied)} / ${faDecimal(d.plotPerimeter)} متر`],
    ["دیوار پیرامونی", `${faNum(d.extWallArea)} مترمربع`],
    ["تیغه داخلی (دو رو)", `${faNum(d.partitionArea)} مترمربع`],
    ["سطوح گچ‌کاری", `${faNum(d.plasterArea)} مترمربع`],
    ["سطوح رنگ‌آمیزی", `${faNum(d.paintArea)} مترمربع`],
    ["کاشی سرویس‌ها و آشپزخانه", `${faNum(d.tileArea)} مترمربع`],
    ["مساحت نما / پنجره‌ها", `${faNum(d.facadeArea)} / ${faNum(d.windowArea)} مترمربع`],
    ["حجم خاکبرداری", `${faNum(d.excavationVolume)} مترمکعب`],
    ["بار حرارتی هر واحد", `${faNum(U.heatLoad)} کیلوکالری/ساعت`],
    ["پره رادیاتور هر واحد", U.radiatorSections > 0 && i.heatingSystem === "radiator" ? faNum(U.radiatorSections) : "—"],
    ["طول اجرای پروژه", `${faNum(result.timeline.months)} ماه (${faNum(result.timeline.totalDays)} روز)`],
    ["ابعاد زمین (بر × طول)", `${faDecimal(d.landWidth ?? 0)} × ${faDecimal(d.landDepth ?? 0)} متر`],
    ["سطح اشغال بنا", `${faDecimal(d.footWidth ?? 0)} × ${faDecimal(d.footDepth ?? 0)} = ${faNum(d.footprint)} م²`],
    ...(d.commercialArea ? ([["زیربنای تجاری/اداری", `${faNum(d.commercialArea)} م²`]] as [string, string][]) : []),
    ["ارتفاع هر طبقه", `${faDecimal(d.floorHeight ?? 3.1)} متر`],
    ["طول جداره‌های آزاد نما", `${faDecimal(d.facadeExposedLength ?? 0)} متر`],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat lg:col-span-2">
        <h4 className="text-sm font-extrabold text-slate-900">📐 شناسنامه فنی و هندسی پروژه</h4>
        <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {metrics.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed border-slate-100 pb-2">
              <dt className="text-xs font-bold text-slate-500">{k}</dt>
              <dd className="text-sm font-black text-slate-900 tnum">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="grid content-start gap-4">
        <InfoMini title="جمع هزینه‌های فیزیکی" value={tomanCompact(result.baseTotal)} note="مصالح، دستمزد و ماشین‌آلات" />
        <InfoMini title="مجوزها و عوارض قانونی" value={tomanCompact(result.feesTotal)} note="شهرداری، نظام مهندسی، بیمه و HSE" />
        <InfoMini title="ذخیره پیش‌بینی‌نشده" value={tomanCompact(result.contingency)} note="۵٪ برای نوسان قیمت و تغییرات" />
        <InfoMini title="برآورد نهایی" value={tomanCompact(result.grandTotal)} note={`معادل ${faNum(Math.round(result.grandTotal / Math.max(1, d.builtUpArea) / 10000) * 10)} هزار تومان بر مترمربع`} highlight />
      </div>
    </div>
  );
}

function InfoMini({ title, value, note, highlight }: { title: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${highlight ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
      <p className="text-[11px] font-bold text-slate-500">{title}</p>
      <p className={`mt-1.5 text-lg font-black tnum ${highlight ? "text-brand-800" : "text-slate-900"}`}>{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}
