import Link from "next/link";
import { dateFa, faNum, tomanCompact } from "@/lib/format";

export interface AdminStats {
  totalReports: number;
  avgGrand: number;
  avgPerSqm: number;
  byQuality: { label: string; n: number; avgPer: number }[];
  byStructure: { label: string; n: number; avgPer: number }[];
  byProvince: { label: string; n: number }[];
  recent: {
    refCode: string;
    provinceLabel: string;
    qualityLabel: string;
    floors: number;
    totalUnits: number;
    grandTotal: string;
    costPerSqm: string;
    createdAt: Date;
  }[];
}

export default function StatsPanel({ stats }: { stats: AdminStats }) {
  return (
    <div className="grid gap-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi emoji="🗂️" label="کل برآوردهای ثبت‌شده" value={faNum(stats.totalReports)} />
        <Kpi emoji="💰" label="میانگین برآورد کل پروژه‌ها" value={stats.avgGrand > 0 ? tomanCompact(stats.avgGrand) : "—"} />
        <Kpi emoji="📏" label="میانگین هزینه هر مترمربع" value={stats.avgPerSqm > 0 ? tomanCompact(stats.avgPerSqm) : "—"} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <DistCard title="توزیع بر اساس سطح کیفیت" rows={stats.byQuality.map((r) => [`${r.label} · متری ${tomanCompact(r.avgPer)}`, r.n])} color="#10b981" />
        <DistCard title="توزیع بر اساس نوع اسکلت" rows={stats.byStructure.map((r) => [`${r.label} · متری ${tomanCompact(r.avgPer)}`, r.n])} color="#6366f1" />
        <DistCard title="پرتقاضاترین استان‌ها" rows={stats.byProvince.map((r) => [r.label, r.n])} color="#f59e0b" />
      </div>

      {/* recent activity */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-extrabold text-slate-800">🕒 آخرین فعالیت‌ها</h2>
        {stats.recent.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-400">هنوز برآوردی ثبت نشده است.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {stats.recent.map((r) => (
              <li key={r.refCode}>
                <Link href={`/report/${r.refCode}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3.5 transition-colors hover:bg-brand-50/40">
                  <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-black tracking-wider text-white" dir="ltr">{r.refCode}</span>
                  <span className="text-xs font-bold text-slate-700">{r.provinceLabel} · {faNum(r.floors)} طبقه · {faNum(r.totalUnits)} واحد</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{r.qualityLabel}</span>
                  <span className="ml-auto text-left">
                    <span className="block text-xs font-black text-slate-900 tnum">{tomanCompact(Number(r.grandTotal))}</span>
                    <span className="block text-[10px] text-slate-400">{dateFa(r.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ emoji, label, value, accent }: { emoji: string; label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${accent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs font-bold text-slate-500">{emoji} {label}</p>
      <p className={`mt-2 text-xl font-black tnum ${accent ? "text-brand-800" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function DistCard({ title, rows, color }: { title: string; rows: [string, number][]; color: string }) {
  const max = Math.max(...rows.map(([, n]) => n), 1);
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-extrabold text-slate-800">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-4 text-xs text-slate-400">داده‌ای موجود نیست.</p>
      ) : (
        <ul className="mt-4 grid gap-2.5">
          {rows.map(([l, n]) => (
            <li key={l} className="flex items-center gap-2.5">
              <span className="min-w-28 flex-1 truncate text-right text-[11px] font-bold text-slate-600">{l}</span>
              <div className="relative h-4 w-28 overflow-hidden rounded-md bg-slate-100">
                <div className="absolute inset-y-0 right-0 rounded-md" style={{ width: `${(n / max) * 100}%`, backgroundColor: color }} />
              </div>
              <span className="w-8 text-left text-xs font-black text-slate-800 tnum">{faNum(n)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
