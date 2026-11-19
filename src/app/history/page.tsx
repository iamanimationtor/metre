import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ArrowLeft, FileSearch } from "lucide-react";
import { db } from "@/db";
import { estimates } from "@/db/schema";
import { dateFa, faNum, tomanCompact } from "@/lib/format";

export const metadata: Metadata = {
  title: "گزارش‌های اخیر",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  let rows: Awaited<ReturnType<typeof fetchRows>> = [];
  try {
    rows = await fetchRows();
  } catch {
    rows = [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">📁 گزارش‌های اخیر</h1>
          <p className="mt-2 text-sm text-slate-500">برآوردهای ثبت‌شده در سامانه؛ روی هر کارت کلیک کنید تا گزارش کامل را ببینید.</p>
        </div>
        <Link
          href="/calculator"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
        >
          برآورد جدید
          <ArrowLeft size={16} />
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="mt-16 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white p-14 text-center">
          <FileSearch size={44} className="mx-auto text-slate-300" />
          <h2 className="mt-5 text-lg font-extrabold text-slate-800">هنوز گزارشی ثبت نشده است</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
            اولین برآورد خود را همین حالا انجام دهید تا با کد پیگیری اختصاصی اینجا ذخیره شود.
          </p>
          <Link
            href="/calculator"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-l from-brand-600 to-teal-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25"
          >
            شروع محاسبه
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <li key={r.refCode}>
              <Link
                href={`/report/${r.refCode}`}
                className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-black tracking-wider text-white" dir="ltr">
                    {r.refCode}
                  </span>
                  <time className="text-[11px] font-medium text-slate-400">{dateFa(r.createdAt)}</time>
                </div>
                <h2 className="mt-4 text-base font-extrabold leading-7 text-slate-900 group-hover:text-brand-700">
                  ساختمان {r.usageLabel} — {faNum(r.floors)} طبقه، {faNum(r.totalUnits)} واحد
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {r.provinceLabel} · زمین {faNum(r.landArea)} م² · زیربنا {faNum(r.builtUpArea)} م²
                </p>
                <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                  <Chip>{r.structureLabel}</Chip>
                  <Chip>کیفیت {r.qualityLabel}</Chip>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-slate-200 pt-4">
                  <div>
                    <dt className="text-[10px] font-bold text-slate-400">برآورد کل</dt>
                    <dd className="mt-0.5 text-sm font-black text-slate-900 tnum">{tomanCompact(Number(r.grandTotal))}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-slate-400">هر مترمربع</dt>
                    <dd className="mt-0.5 text-sm font-black text-brand-700 tnum">{tomanCompact(Number(r.costPerSqm))}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{children}</span>;
}

async function fetchRows() {
  return db
    .select({
      refCode: estimates.refCode,
      createdAt: estimates.createdAt,
      provinceLabel: estimates.provinceLabel,
      usageLabel: estimates.usageLabel,
      structureLabel: estimates.structureLabel,
      qualityLabel: estimates.qualityLabel,
      landArea: estimates.landArea,
      floors: estimates.floors,
      totalUnits: estimates.totalUnits,
      builtUpArea: estimates.builtUpArea,
      grandTotal: estimates.grandTotal,
      costPerSqm: estimates.costPerSqm,
    })
    .from(estimates)
    .orderBy(desc(estimates.createdAt))
    .limit(24);
}
