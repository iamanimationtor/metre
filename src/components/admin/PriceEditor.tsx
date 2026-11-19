"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { CATALOG, type CatalogItem, type PriceClass } from "@/lib/catalog";
import { faNum } from "@/lib/format";

const CLASS_LABELS: Record<PriceClass, string> = {
  structure: "🏗️ اسکلت، فونداسیون و دیوارچینی",
  earth: "⛏️ خاکبرداری، کارگاه و محوطه",
  finish: "🎨 نازک‌کاری و معماری داخلی",
  mep: "🔧 تأسیسات مکانیکی و برقی",
  facade: "🪟 نما و بازشوها",
  fees: "📐 خدمات مهندسی و متفرقه",
};

const ORDER: PriceClass[] = ["structure", "earth", "finish", "mep", "facade", "fees"];

export default function PriceEditor({ initialOverrides }: { initialOverrides: Record<string, number> }) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const item of CATALOG) v[item.key] = String(initialOverrides[item.key] ?? 0);
    return v;
  });
  const [status, setStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>(() => {
    const s: Record<string, "idle" | "saving" | "saved" | "error"> = {};
    for (const item of CATALOG) s[item.key] = "idle";
    return s;
  });
  const [query, setQuery] = useState("");

  const save = async (item: CatalogItem) => {
    const raw = Number(values[item.key] ?? "0");
    const pct = Number.isNaN(raw) ? 0 : Math.max(-80, Math.min(200, Math.round(raw)));
    setStatus((s) => ({ ...s, [item.key]: "saving" }));
    try {
      const res = await fetch("/api/admin/prices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey: item.key, adjustPct: pct }),
      });
      if (!res.ok) throw new Error("fail");
      setValues((v) => ({ ...v, [item.key]: String(pct) }));
      setStatus((s) => ({ ...s, [item.key]: "saved" }));
      setTimeout(() => setStatus((s) => ({ ...s, [item.key]: "idle" })), 1500);
    } catch {
      setStatus((s) => ({ ...s, [item.key]: "error" }));
    }
  };

  const grouped = useMemo(() => {
    const q = query.trim();
    return ORDER.map((cls) => ({
      cls,
      items: CATALOG.filter((c) => c.cls === cls && (!q || c.label.includes(q))),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <Search size={18} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجوی آیتم… مثلاً بتن، کابینت، نما"
          className="min-w-48 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-400"
        />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">{faNum(CATALOG.length)} آیتم</span>
      </div>

      {grouped.map((g) => (
        <section key={g.cls} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 text-sm font-extrabold text-slate-800">
            {CLASS_LABELS[g.cls]}
          </h2>
          <ul className="divide-y divide-slate-50">
            {g.items.map((item) => {
              const pct = Number(values[item.key] || 0);
              const eff = Math.round(item.price * (1 + pct / 100));
              const st = status[item.key];
              return (
                <li key={item.key} className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-6 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">{item.label}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      واحد: {item.unit} · قیمت پایه: <span className="font-bold text-slate-500 tnum">{faNum(item.price)}</span> تومان
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center overflow-hidden rounded-xl border-2 border-slate-200 focus-within:border-brand-500">
                      <input
                        type="number"
                        dir="ltr"
                        value={values[item.key]}
                        min={-80}
                        max={200}
                        onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
                        onBlur={() => void save(item)}
                        onKeyDown={(e) => e.key === "Enter" && void save(item)}
                        className="w-20 bg-transparent px-2 py-2 text-center text-sm font-black outline-none tnum"
                      />
                      <span className="border-l border-slate-100 bg-slate-50 px-2.5 py-2 text-xs font-bold text-slate-500">٪±</span>
                    </div>
                    <button
                      onClick={() => void save(item)}
                      disabled={st === "saving"}
                      className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition-colors ${
                        st === "saved"
                          ? "bg-brand-600 text-white"
                          : st === "error"
                            ? "bg-red-600 text-white"
                            : "bg-slate-900 text-white hover:bg-slate-700"
                      }`}
                    >
                      {st === "saving" ? "…" : st === "saved" ? "ثبت شد ✓" : st === "error" ? "خطا!" : "ثبت"}
                    </button>
                    {pct !== 0 && (
                      <button
                        title="بازنشانی به صفر"
                        onClick={() => {
                          setValues((v) => ({ ...v, [item.key]: "0" }));
                          void (async () => {
                            await fetch("/api/admin/prices", {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ itemKey: item.key, adjustPct: 0 }),
                            });
                          })();
                        }}
                        className="rounded-xl border border-slate-200 p-2 text-slate-400 transition-colors hover:border-red-200 hover:text-red-500"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                    <span className={`w-32 text-left text-xs font-black tnum ${pct === 0 ? "text-slate-500" : pct > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      مؤثر: {faNum(eff)} ت
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
