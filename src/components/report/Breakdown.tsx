"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import type { GroupRow } from "@/lib/engine";
import { faDecimal, faNum, toman, tomanCompact, unitPriceLabel } from "@/lib/format";

/** Listen for global expand request (dispatched before printing). */
export const EXPAND_ALL_EVENT = "sy:expand-all";

export default function Breakdown({ groups, grandTotal }: { groups: GroupRow[]; grandTotal: number }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(groups.slice(0, 2).map((g) => g.id)));
  const allOpen = open.size === groups.length;

  useEffect(() => {
    const h = () => setOpen(new Set(groups.map((g) => g.id)));
    window.addEventListener(EXPAND_ALL_EVENT, h);
    return () => window.removeEventListener(EXPAND_ALL_EVENT, h);
  }, [groups]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="grid gap-4">
      <button
        onClick={() => setOpen(allOpen ? new Set() : new Set(groups.map((g) => g.id)))}
        className="no-print inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        <ListTree size={15} />
        {allOpen ? "بستن همه گروه‌ها" : "باز کردن همه (مناسب چاپ کامل)"}
      </button>

      {groups.map((g) => {
        const isOpen = open.has(g.id);
        const pct = grandTotal > 0 ? (g.total / grandTotal) * 100 : 0;
        return (
          <section key={g.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print-flat">
            <button
              onClick={() => toggle(g.id)}
              className="flex w-full flex-wrap items-center gap-3 px-4 py-4 text-right transition-colors hover:bg-slate-50 sm:px-6"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg" style={{ backgroundColor: `${g.color}1a` }}>
                {g.emoji}
              </span>
              <span className="min-w-40 flex-1">
                <span className="block text-sm font-extrabold text-slate-900">{g.title}</span>
                <span className="mt-0.5 block text-[11px] font-medium text-slate-500 tnum">
                  {faNum(g.items.length)} قلم · سهم {faDecimal(Math.round(pct * 10) / 10)}٪ از کل
                </span>
              </span>
              <span className="ml-auto text-left">
                <span className="block text-sm font-black text-slate-900 tnum">{tomanCompact(g.total)}</span>
                {(g.lab > 0 || g.mat > 0) && (
                  <span className="block text-[10px] font-semibold text-slate-400 tnum">
                    دستمزد {tomanCompact(g.lab)} · مصالح {tomanCompact(g.mat)}
                  </span>
                )}
              </span>
              <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>

            <div className="h-1 w-full bg-slate-100">
              <div className="h-full rounded-l-full" style={{ width: `${Math.max(pct, 1)}%`, backgroundColor: g.color }} />
            </div>

            {isOpen && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[44rem] text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-right text-[11px] font-bold text-slate-500">
                      <th className="px-4 py-2.5 sm:px-6">شرح و فرمول متره</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">مقدار</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">قیمت واحد</th>
                      <th className="px-3 py-2.5 whitespace-nowrap">جمع کل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map((it, idx) => (
                      <tr key={`${it.key}-${idx}`} className="border-b border-slate-50 align-top last:border-0 hover:bg-slate-50/50">
                        <td className="max-w-md px-4 py-3 sm:px-6">
                          <p className="font-bold leading-6 text-slate-800">{it.label}</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500 tnum">↳ {it.formula}</p>
                          <p className="mt-0.5 text-[10px] text-slate-400">📚 منبع: {it.src}{it.note ? ` · ${it.note}` : ""}</p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-700 tnum">
                          {faDecimal(it.qty)}
                          <span className="mr-1 text-[10px] font-medium text-slate-400">{it.unit}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 tnum">
                          <span className="block font-semibold text-slate-600">{unitPriceLabel(it.unitPrice, it.unit)}</span>
                          {(it.lab > 0 || it.mat > 0) && (
                            <span className="mt-0.5 block text-[10px] leading-4 text-slate-400">
                              دستمزد {faNum(it.lab)} · مصالح {faNum(it.mat)}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 font-black text-slate-900 tnum">{toman(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50">
                      <td className="px-4 py-3 text-xs font-black text-slate-700 sm:px-6" colSpan={3}>
                        جمع گروه
                        {(g.lab > 0 || g.mat > 0) && (
                          <span className="mr-2 font-semibold text-slate-400 tnum">(دستمزد {tomanCompact(g.lab)} + مصالح و تجهیزات {tomanCompact(g.mat)})</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm font-black tnum" style={{ color: g.color }}>{toman(g.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
