"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { EstimateResult } from "@/lib/engine";
import { buildBom } from "@/lib/takeoff";
import { faDecimal, faNum, tomanCompact } from "@/lib/format";

/** Component-level bill of materials with reference supply prices. */
export default function BomPanel({ result }: { result: EstimateResult }) {
  const bom = useMemo(() => buildBom(result), [result]);
  const [open, setOpen] = useState<Set<string>>(() => new Set(bom.sections.slice(0, 3).map((s) => s.id)));

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">🧾 ریزِ ریز مصالح و ملزومات (دانه به دانه)</h3>
            <p className="mt-1.5 max-w-2xl text-[11px] leading-6 text-slate-500">
              هر قلم با نرخ مصرف استاندارد ایرانی از متره پروژه استخراج شده است؛ قیمت‌های مرجع، میانگین بازار آبان ۱۴۰۵ هستند
              و صرفاً برای برآورد «بخش خرید» نشان داده می‌شوند (دستمزد و بالاسری در اقلام اصلی جداگانه دیده شده‌اند).
            </p>
          </div>
          <span className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-black text-brand-800 tnum">
            جمع تقریبی خرید مواد: {tomanCompact(bom.grandTotal)}
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {bom.sections.map((s) => {
            const isOpen = open.has(s.id);
            return (
              <div key={s.id} className="overflow-hidden rounded-2xl border border-slate-100 print-flat">
                <button
                  onClick={() => setOpen((prev) => { const n = new Set(prev); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n; })}
                  className="flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-slate-50"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base" style={{ backgroundColor: `${s.color}1a` }}>{s.emoji}</span>
                  <span className="flex-1 text-sm font-extrabold text-slate-800">{s.title}</span>
                  <span className="text-xs font-black tnum" style={{ color: s.color }}>{faNum(s.rows.length)} قلم · {tomanCompact(s.total)}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                </button>
                {isOpen && (
                  <table className="w-full min-w-[42rem] text-xs">
                    <thead>
                      <tr className="border-y border-slate-100 bg-slate-50/70 text-right text-[10px] font-bold text-slate-500">
                        <th className="px-4 py-2">کد</th>
                        <th className="px-3 py-2">شرح کالا</th>
                        <th className="px-3 py-2 whitespace-nowrap">مقدار محاسبه‌شده</th>
                        <th className="px-3 py-2 whitespace-nowrap">قیمت مرجع واحد</th>
                        <th className="px-3 py-2 whitespace-nowrap">برآورد خرید</th>
                        <th className="px-3 py-2">مبنای محاسبه</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.rows.map((r) => (
                        <tr key={r.code} className="border-b border-slate-50 last:border-0">
                          <td className="whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-bold text-slate-400" dir="ltr">{r.code}</td>
                          <td className="px-3 py-2.5 font-bold text-slate-800">{r.title}</td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-black text-slate-900 tnum">
                            {faDecimal(r.qty)} <span className="text-[10px] font-medium text-slate-400">{r.unit}</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-slate-500 tnum">{faNum(r.unitPrice)} ت</td>
                          <td className="whitespace-nowrap px-3 py-2.5 font-bold text-slate-700 tnum">{tomanCompact(r.total)}</td>
                          <td className="max-w-56 px-3 py-2.5 text-[10px] leading-5 text-slate-400">{r.basis}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* تجهیزات خریدنی */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
          <h3 className="text-sm font-black text-slate-900">⚙️ فهرست خرید تجهیزات و دستگاه‌ها</h3>
          <ul className="mt-4 divide-y divide-slate-50">
            {bom.equipment.map((e) => (
              <li key={e.title} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="block text-xs font-bold text-slate-800">{e.title}</span>
                  <span className="block text-[10px] text-slate-400">{e.note}</span>
                </span>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 tnum">
                  {faNum(e.qty)} {e.unit}{e.total > 0 ? ` · ${tomanCompact(e.total)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ماشین‌آلات و ابزار */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
          <h3 className="text-sm font-black text-slate-900">🚜 ماشین‌آلات و ابزار کارگاهی مورد نیاز</h3>
          <ul className="mt-4 divide-y divide-slate-50">
            {bom.tools.map((t) => (
              <li key={t.title} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="block text-xs font-bold text-slate-800">{t.title}</span>
                  <span className="block text-[10px] text-slate-400">{t.basis}</span>
                </span>
                <span className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">{t.qtyText}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* نیروی انسانی */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm print-flat">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-black text-slate-900">👷 برنامه نیروی انسانی (استخراج‌شده از دستمزد اقلام)</h3>
          <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700 tnum">جمع ≈ {faNum(bom.totalPersonDays)} نفر-روز</span>
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {bom.labor.map((l) => (
            <div key={l.trade} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs font-bold text-slate-700">{l.emoji} {l.trade}</span>
              <span className="shrink-0 text-left text-[11px] font-black text-slate-900 tnum">
                {faNum(l.personDays)} نفر-روز
                <span className="block text-[9px] font-semibold text-slate-400">≈ {faDecimal(l.teamMonths)} ماه تک‌اکیپ</span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[10px] leading-5 text-slate-400">
          مبنای تبدیل: مزد روزانه استادکار ماهر پاییز ۱۴۰۵؛ اکیپ‌بندی واقعی بسته به برنامه زمان‌بندی فشرده‌تر خواهد بود.
        </p>
      </section>
    </div>
  );
}
