"use client";

import { useState } from "react";
import { RefreshCcw, Save, TrendingUp } from "lucide-react";
import { faDecimal, faNum } from "@/lib/format";

interface StateDTO {
  materialBase: number;
  wageBase: number;
  driftPct: number;
  updatedAt: string | null;
  monthsSinceUpdate: number;
  materialRatio: number;
  wageRatio: number;
}

const refDate = new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" });

export default function IndexPanel({ initial }: { initial: StateDTO | null }) {
  const [state, setState] = useState<StateDTO | null>(initial);
  const [matInput, setMatInput] = useState(String(initial?.materialBase ?? 100));
  const [wageInput, setWageInput] = useState(String(initial?.wageBase ?? 100));
  const [driftInput, setDriftInput] = useState(String(initial?.driftPct ?? 2.5));
  const [busy, setBusy] = useState<string | null>(null);

  const put = async (payload: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      const res = await fetch("/api/admin/indices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as { state: StateDTO };
      setState(data.state);
      setMatInput(String(data.state.materialBase));
      setWageInput(String(data.state.wageBase));
      setDriftInput(String(data.state.driftPct));
    } finally {
      setBusy(null);
    }
  };

  const updated = state?.updatedAt ? refDate.format(new Date(state.updatedAt)) : "—";

  return (
    <div className="grid gap-6">
      {/* status */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
            <TrendingUp size={19} className="text-brand-600" />
            وضعیت شاخص‌های زنده بازار
          </h2>
          <span className="rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-black text-brand-700">
            مبنای کاتالوگ: ۲۸ آبان ۱۴۰۵
          </span>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="شاخص مصالح و تجهیزات" base={state?.materialBase} ratio={state?.materialRatio} color="#0ea5e9" />
          <Metric label="شاخص دستمزد اجرا" base={state?.wageBase} ratio={state?.wageRatio} color="#f59e0b" />
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-[11px] font-bold text-slate-500">آخرین به‌روزرسانی رسمی</dt>
            <dd className="mt-1.5 text-sm font-black text-slate-900">{updated}</dd>
            <dd className="mt-1 text-[10px] text-slate-400 tnum">
              {state ? `${faDecimal(Math.round(state.monthsSinceUpdate * 10) / 10)} ماه پیش — از آن زمان، دریفت خودکار فعال بوده است` : ""}
            </dd>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <dt className="text-[11px] font-bold text-slate-500">دریفت خودکار ماهانه</dt>
            <dd className="mt-1.5 text-sm font-black text-slate-900 tnum">{faDecimal(state?.driftPct ?? 2.5)}٪</dd>
            <dd className="mt-1 text-[10px] leading-4 text-slate-400">تا تنظیم بعدی، شاخص‌ها به‌طور خودکار با این نرخ رشد ترکیبی جلو می‌آیند.</dd>
          </div>
        </dl>
      </div>

      {/* controls */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ControlCard title="تنظیم دستی شاخص مصالح" desc="مثلاً ۱۱۲ یعنی مصالح ۱۲٪ نسبت به مبنا گران‌تر شده است." hint="بازه مجاز ۴۰ تا ۴۰۰">
          <InlineEdit value={matInput} onChange={setMatInput} onSave={() => void put({ kind: "material", value: Number(matInput) }, "mat")} busy={busy === "mat"} />
        </ControlCard>
        <ControlCard title="تنظیم دستی شاخص دستمزد" desc="با بخشنامه حقوق و دستمزد سال هماهنگ کنید." hint="بازه مجاز ۴۰ تا ۴۰۰">
          <InlineEdit value={wageInput} onChange={setWageInput} onSave={() => void put({ kind: "wage", value: Number(wageInput) }, "wage")} busy={busy === "wage"} />
        </ControlCard>
        <ControlCard title="نرخ دریفت خودکار (٪ در ماه)" desc="سرعت به‌روزرسانی خودکار بین دو تنظیم دستی." hint="پیشنهاد اقتصاد تورمی: ۲ تا ۳">
          <InlineEdit value={driftInput} onChange={setDriftInput} onSave={() => void put({ driftPct: Number(driftInput) }, "drift")} busy={busy === "drift"} />
        </ControlCard>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6">
        <div className="flex-1 min-w-64">
          <h3 className="text-sm font-black text-slate-900">🔄 به‌روزرسانی یک‌کلیک تا امروز</h3>
          <p className="mt-1.5 text-xs leading-6 text-slate-600">
            دریفت انباشته را در مقدار شاخص‌ها تثبیت می‌کند و ساعت به‌روزرسانی را صفر می‌کند؛ برآورد بعدی بدون تغییر محاسبه می‌شود اما مبنای زمانی شفاف می‌ماند.
          </p>
        </div>
        <button
          onClick={() => void put({ bake: true }, "bake")}
          disabled={busy !== null}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCcw size={16} />
          {busy === "bake" ? "در حال اجرا…" : "به‌روزرسانی خودکار تا امروز"}
        </button>
      </div>

      <p className="rounded-2xl bg-slate-50 px-5 py-4 text-[11px] leading-6 text-slate-500">
        🧠 مکانیزم: هر آیتم سهم دستمزد مشخصی دارد؛ قیمت مؤثر = بخش مصالح × شاخص مصالح + بخش دستمزد × شاخص دستمزد.
        شاخص‌ها از تاریخ مرجع (۲۸ آبان ۱۴۰۵) با نرخ دریفت ترکیب می‌شوند، بنابراین حتی بدون دخالت انسان قیمت‌ها هیچ‌گاه قدیمی نمی‌شوند.
      </p>
    </div>
  );
}

function Metric({ label, base, ratio, color }: { label: string; base?: number; ratio?: number; color: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <dt className="text-[11px] font-bold text-slate-500">{label}</dt>
      <dd className="mt-1.5 flex items-baseline gap-2">
        <span className="text-lg font-black text-slate-900 tnum">{base != null ? faDecimal(base) : "—"}</span>
        {ratio != null && ratio !== 1 && (
          <span className="rounded-md px-1.5 py-0.5 text-[10px] font-black tnum" style={{ backgroundColor: `${color}22`, color }}>
            مؤثر ×{faDecimal(ratio)}
          </span>
        )}
      </dd>
      <dd className="mt-1 text-[10px] text-slate-400">عدد پایه (مبنا = {faNum(100)})</dd>
    </div>
  );
}

function ControlCard({ title, desc, hint, children }: { title: string; desc: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      <p className="mt-1 text-[11px] leading-5 text-slate-500">{desc}</p>
      <div className="mt-4">{children}</div>
      <p className="mt-2 text-[10px] text-slate-400">{hint}</p>
    </div>
  );
}

function InlineEdit({ value, onChange, onSave, busy }: { value: string; onChange: (v: string) => void; onSave: () => void; busy: boolean }) {
  return (
    <div className="flex items-stretch gap-2">
      <input
        type="number"
        dir="ltr"
        value={value}
        min={0}
        step={0.1}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !busy && onSave()}
        className="w-24 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-black outline-none tnum focus:border-brand-500"
      />
      <button
        onClick={onSave}
        disabled={busy}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
      >
        <Save size={14} />
        {busy ? "ثبت…" : "ثبت تغییر"}
      </button>
    </div>
  );
}
