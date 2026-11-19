import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { estimates } from "@/db/schema";
import type { CalcInputs } from "@/lib/constants";
import type { DerivedGeometry, EstimateResult, GroupRow, PointsSummary, ScenarioPoint, Splits, TimelineInfo } from "@/lib/engine";
import type { UnitLayout } from "@/lib/layout";
import { dateFa, faNum, toman, tomanCompact } from "@/lib/format";
import Breakdown from "@/components/report/Breakdown";
import BomPanel from "@/components/report/BomPanel";
import { CostDonut, QualityScenarios } from "@/components/report/Charts";
import { CashflowChart, ExportButtons, PointsGrid, ScheduleGantt, SplitBar } from "@/components/report/ExtraPanels";
import ReportActions from "@/components/report/ReportActions";
import PrintMasthead from "@/components/site/PrintMasthead";

export const dynamic = "force-dynamic";

interface Meta {
  derived: DerivedGeometry;
  scenarios?: ScenarioPoint[];
  timeline?: TimelineInfo;
  points?: PointsSummary;
  splits?: Splits;
  unitLayout?: UnitLayout;
}

async function getRow(ref: string) {
  try {
    const rows = await db.select().from(estimates).where(eq(estimates.refCode, ref)).limit(1);
    return rows[0];
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ ref: string }> }): Promise<Metadata> {
  const { ref } = await params;
  return { title: `گزارش برآورد ${ref}` };
}

export default async function ReportPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const row = await getRow(ref);
  if (!row) notFound();

  const groups = row.groupsJson as unknown as GroupRow[];
  const meta = (row.metaJson ?? {}) as unknown as Meta;
  const inputs = (row.inputsJson ?? {}) as unknown as CalcInputs;
  const grand = Number(row.grandTotal);
  const d = meta.derived;

  // Lightweight result shape for client exporters & panels
  const pseudoResult = {
    inputs,
    derived: d,
    regionLabel: row.provinceLabel,
    groups,
    grandTotal: grand,
    costPerSqm: Number(row.costPerSqm),
    baseTotal: Number(row.baseTotal),
    unitLayout: meta.unitLayout,
    timeline: meta.timeline,
    points: meta.points,
  } as unknown as EstimateResult;

  const roomsLabel = meta.unitLayout
    ? `چیدمان هر واحد: ${meta.unitLayout.rooms.map((r) => r.label).join("، ")}`
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PrintMasthead code={row.refCode} dateText={dateFa(row.createdAt)} />
      {/* header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-brand-700">
            کد پیگیری <span dir="ltr" className="tracking-wider">{row.refCode}</span> · ثبت در {dateFa(row.createdAt)}
          </p>
          <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">📄 گزارش متره و برآورد هزینه ساخت</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            ساختمان {row.usageLabel} · {row.provinceLabel} · {faNum(row.floors)} طبقه · {faNum(row.totalUnits)} واحد · زیربنا {faNum(d?.builtUpArea ?? row.builtUpArea)} مترمربع
            {meta.timeline ? ` · مدت اجرا ≈ ${faNum(meta.timeline.months)} ماه` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportActions refCode={row.refCode} />
          <ExportButtons result={pseudoResult} refCode={row.refCode} />
        </div>
      </header>

      {/* totals strip */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalCard label="برآورد نهایی کل" value={tomanCompact(grand)} sub={toman(grand)} dark />
        <TotalCard label="هزینه هر مترمربع" value={tomanCompact(Number(row.costPerSqm))} sub="بر مبنای زیربنای محاسباتی" accent />
        <TotalCard label="هزینه‌های فیزیکی" value={tomanCompact(Number(row.baseTotal))} sub="مصالح، دستمزد و اجرا" />
        <TotalCard label="مجوزها و ذخیره احتیاطی" value={tomanCompact(grand - Number(row.baseTotal))} sub="عوارض، نظام مهندسی، بیمه و ۵٪ احتیاط" />
      </section>

      {meta.splits && <div className="mt-6"><SplitBar splits={meta.splits} grandTotal={grand} /></div>}

      {/* passport quick facts */}
      {d && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
          <h2 className="text-sm font-extrabold text-slate-900">📐 خلاصه مشخصات پروژه</h2>
          <dl className="mt-4 grid gap-x-10 gap-y-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
            {(
              [
                ["زمین", `${faNum(row.landArea)} م²`],
                ["سطح اشغال", `${faNum(d.footprint)} م²`],
                ...(d.basementArea > 0 ? ([["زیرزمین", `${faNum(d.basementArea)} م²`]] as [string, string][]) : []),
                ["تعداد واحد", faNum(d.totalUnits)],
                ...(meta.unitLayout ? ([[`خواب هر واحد`, faNum(meta.unitLayout.bedrooms)]] as [string, string][]) : []),
                ["دیوار پیرامونی", `${faNum(d.extWallArea ?? 0)} م²`],
                ["گچ‌کاری", `${faNum(d.plasterArea ?? 0)} م²`],
                ["کاشی‌کاری", `${faNum(d.tileArea ?? 0)} م²`],
                ["ابعاد زمین", d.landWidth ? `${Math.round(d.landWidth * 10) / 10}×${Math.round((d.landDepth ?? 0) * 10) / 10} م` : "—"],
                ["جداره آزاد نما", d.facadeExposedLength ? `${Math.round(d.facadeExposedLength)} مترطول` : "—"],
                ["مساحت نما", `${faNum(d.facadeArea)} م²`],
                ["حجم خاکبرداری", `${faNum(d.excavationVolume)} م³`],
                ...(meta.timeline ? ([[`مدت اجرا`, `${faNum(meta.timeline.months)} ماه`]] as [string, string][]) : []),
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                <dt className="text-xs font-bold text-slate-500">{k}</dt>
                <dd className="font-black text-slate-900 tnum">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* component-level BOM + points */}
      <section className="mt-6 grid gap-6">
        <BomPanel result={pseudoResult} />
        {meta.points && <PointsGrid points={meta.points} unitLayoutRooms={roomsLabel} />}
      </section>

      {/* timeline */}
      {meta.timeline && (
        <section className="mt-6 grid gap-6">
          <ScheduleGantt timeline={meta.timeline} />
          {meta.timeline.cashflow.length > 0 && (
            <CashflowChart cashflow={meta.timeline.cashflow} months={meta.timeline.months} inflationPct={meta.timeline.inflationPct ?? 0} />
          )}
        </section>
      )}

      {/* charts */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
          <h2 className="text-sm font-extrabold text-slate-900">سهم فازهای اجرایی از هزینه</h2>
          <div className="mt-3">
            <CostDonut groups={groups} grandTotal={grand} />
          </div>
        </div>
        {meta.scenarios && meta.scenarios.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
            <h2 className="text-sm font-extrabold text-slate-900">مقایسه سطوح کیفیت</h2>
            <div className="mt-3">
              <QualityScenarios scenarios={meta.scenarios} currentQuality="" />
            </div>
          </div>
        )}
      </section>

      {/* breakdown */}
      <section className="mt-6">
        <h2 className="mb-4 text-lg font-black text-slate-900">ریز اقلام متره ({faNum(groups.reduce((s, g) => s + g.items.length, 0))} قلم)</h2>
        <Breakdown groups={groups} grandTotal={grand} />
      </section>

      <p className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[11px] leading-6 text-slate-500">
        ⚖️ این برآورد بر پایه مبنای قیمت ۲۸ آبان ۱۴۰۵ و شاخص‌های خودکار بازار (مصالح/دستمزد) و ضرایب فهرست بهای سازمان برنامه تهیه شده و جنبه مشورتی دارد.
        مقادیر مصرف از مدل پارامتریک معماری و سرانه‌های رایج صنعت ساختمان ایران (مباحث مقررات ملی) استخراج شده‌اند؛ قیمت نهایی منوط به استعلام روز و تأیید دستگاه نظارت است.
      </p>
    </div>
  );
}

function TotalCard({ label, value, sub, dark, accent }: { label: string; value: string; sub: string; dark?: boolean; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-5 shadow-sm print-flat ${dark ? "border-slate-900 bg-slate-900 text-white" : accent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
      <p className={`text-[11px] font-bold ${dark ? "text-teal-300" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-2 text-xl font-black tnum ${dark ? "text-white" : accent ? "text-brand-800" : "text-slate-900"}`}>{value}</p>
      <p className="mt-1 text-[11px] text-slate-400 tnum">{sub}</p>
    </div>
  );
}
