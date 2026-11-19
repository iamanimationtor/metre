"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Check, Landmark, Layers, Loader2, Ruler, Sparkles, Wrench } from "lucide-react";
import {
  CEILING_OPTIONS,
  DEED_OPTIONS,
  DEFAULT_INPUTS,
  ELEVATOR_PERSONS_OPTIONS,
  FACADE_OPTIONS,
  FACADE_STYLE_OPTIONS,
  HEATING_OPTIONS,
  LANDSCAPE_OPTIONS,
  LOT_OPTIONS,
  PROVINCES,
  QUALITY_OPTIONS,
  SLAB_OPTIONS,
  SMART_OPTIONS,
  STRUCTURE_OPTIONS,
  USAGE_OPTIONS,
  WATER_TABLE_OPTIONS,
  WINDOW_OPTIONS,
  type CalcInputs,
} from "@/lib/constants";
import { computeEstimate, type EstimateResult } from "@/lib/engine";
import { faDecimal, faNum, tomanCompact } from "@/lib/format";
import { NumberField, OptionCards, RangeField, SectionCard, SelectField, ToggleSwitch } from "./fields";
import ResultPanel from "./ResultPanel";

const STEPS = [
  { title: "زمین و کاربری", emoji: "📍" },
  { title: "ابعاد ساختمان", emoji: "🏢" },
  { title: "سازه و کیفیت", emoji: "🧱" },
  { title: "امکانات", emoji: "⚙️" },
  { title: "نتیجه", emoji: "📊" },
];

/** Full inputs encoded into a shareable URL parameter (?d=...). */
function encodeConfig(inp: CalcInputs): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(inp)));
  } catch {
    return "";
  }
}

function decodeConfig(): CalcInputs | null {
  if (typeof window === "undefined") return null;
  try {
    const p = new URLSearchParams(window.location.search).get("d");
    if (!p) return null;
    const obj = JSON.parse(decodeURIComponent(atob(p))) as CalcInputs;
    return obj && typeof obj.landWidth === "number" ? { ...DEFAULT_INPUTS, ...obj } : null;
  } catch {
    return null;
  }
}

const DRAFT_KEY = "hermimetr:draft:v1";

export default function Wizard() {
  // Always hydrate with defaults; restoration happens post-mount (no SSR mismatch).
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_INPUTS);
  const restoredRef = useRef(false);
  const [step, setStep] = useState(0);
  const [computing, setComputing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CalcInputs>(key: K, value: CalcInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  // Restore state once after mount — priority: saved report > shared URL > local draft
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      let alive = true;
      fetch(`/api/estimates/${encodeURIComponent(ref)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { item?: { inputsJson?: unknown } } | null) => {
          if (!alive || !data?.item?.inputsJson) return;
          const restored = data.item.inputsJson as Partial<CalcInputs>;
          if (restored && (typeof restored.landWidth === "number" || typeof restored.landArea === "number")) {
            const base = { ...DEFAULT_INPUTS, ...restored };
            if (typeof restored.landWidth !== "number" && typeof restored.landArea === "number") {
              base.landWidth = Math.round(Math.sqrt(restored.landArea) * 2) / 2;
              base.landDepth = Math.round((restored.landArea / base.landWidth) * 2) / 2;
            }
            setInputs(base);
            setNotice("✔ مشخصات گزارش ذخیره‌شده بارگذاری شد؛ در صورت نیاز تغییر دهید و برآورد بگیرید.");
          }
        })
        .catch(() => {});
      return () => {
        alive = false;
      };
    }

    const shared = decodeConfig();
    if (shared) {
      // Browser-only share state is restored after hydration to avoid SSR mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputs(shared);
      setNotice("✔ تنظیمات به‌اشتراک‌گذاشته‌شده از لینک بارگذاری شد.");
      return;
    }

    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { v?: number; ts?: number; inputs?: Partial<CalcInputs> };
        const fresh = parsed.ts && Date.now() - parsed.ts < 7 * 24 * 3600 * 1000;
        if (parsed.v === 1 && fresh && parsed.inputs && typeof parsed.inputs.landWidth === "number") {
          setInputs({ ...DEFAULT_INPUTS, ...parsed.inputs });
          setNotice("💾 پیش‌نویس جلسه قبل بازیابی شد؛ ادامه دهید یا «برآورد جدید» بزنید.");
        }
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  // Persist configuration: shareable URL (?d=...) + auto-saved local draft
  useEffect(() => {
    const t = setTimeout(() => {
      const enc = encodeConfig(inputs);
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: 1, ts: Date.now(), inputs }));
      } catch {
        /* ignore quota errors */
      }
      window.history.replaceState(null, "", enc ? `/calculator?d=${enc}` : "/calculator");
    }, 350);
    return () => clearTimeout(t);
  }, [inputs]);

  // Instant local preview (base prices, no DB roundtrip)
  const preview = useMemo(() => computeEstimate(inputs, {}, { skipScenarios: true }), [inputs]);

  const topGroups = [...preview.groups]
    .filter((g) => g.id !== "permits" && g.id !== "contingency")
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Smart advisory notices
  const landAreaNow = Math.round(inputs.landWidth * inputs.landDepth);
  const unitsPreview = Math.max(1, Math.round(inputs.unitsPerFloor * inputs.floors));
  const parkingNeed = unitsPreview + inputs.commercialFloors * 2;
  const warnings: string[] = [];
  if (inputs.deedType === "contract") {
    warnings.push("برای زمین قولنامه‌ای پیش از معامله، استعلام ثبت و شهرداری (دستور نقشه) انجام شود.");
  }
  if (inputs.floors > 4 && !inputs.hasElevator) {
    warnings.push("طبق مبحث چهارم مقررات ملی، ساختمان بیش از ۴ طبقه به آسانسور نیاز دارد.");
  }
  if (inputs.parkingCount < parkingNeed) {
    warnings.push(`ضابطه رایج شهرداری: حداقل ${faNum(parkingNeed)} پارکینگ (واحدها + تجاری) تأمین شود.`);
  }
  if (inputs.occupancyPct >= 95) {
    warnings.push("سطح اشغال نزدیک ۱۰۰٪ فقط در پهنه‌های خاص مجاز است؛ دستور نقشه را استعلام کنید.");
  }
  if (inputs.commercialFloors > 0 && inputs.heatingSystem === "radiator") {
    warnings.push("برای طبقات تجاری/اداری سیستم چیلر یا داکت اسپلیت توصیه می‌شود.");
  }
  if (inputs.waterTable === "high") {
    warnings.push("به دلیل سطح آب بالا، عایق بدنه فونداسیون و زهکش در برآورد لحاظ شد.");
  }
  if (preview.derived.unitAvgArea < 50) {
    warnings.push("میانگین مساحت واحد کمتر از ۵۰ متر شد؛ برنامه اتاق‌ها بر اساس پلان کوچک تنظیم شده است.");
  }

  const runFinal = async () => {
    setStep(4);
    setComputing(true);
    setError(null);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });
      if (!res.ok) throw new Error("server");
      const data = (await res.json()) as { refCode?: string | null; result: EstimateResult; saved?: boolean };
      const saved = data.saved ?? Boolean(data.refCode);
      setResult(data.result);
      setRefCode(saved ? data.refCode ?? null : null);
      if (!saved) {
        setError("برآورد انجام شد، اما پایگاه داده در دسترس نبود و گزارش ذخیره نشد. تنظیمات DATABASE_URL و اتصال دیتابیس را بررسی کنید.");
      }
    } catch {
      const local = computeEstimate(inputs, {});
      setResult(local);
      setRefCode(null);
      setError("ثبت گزارش در سرور ناموفق بود؛ برآورد به‌صورت آفلاین محاسبه شد.");
    } finally {
      setComputing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setRefCode(null);
    setNotice(null);
    setInputs(DEFAULT_INPUTS);
    setStep(0);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    window.history.replaceState(null, "", "/calculator");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (step === 3) void runFinal();
    else setStep((s) => Math.min(s + 1, 4));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* progress */}
      <ol className="no-print mx-auto mb-10 flex max-w-3xl items-center">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={s.title} className={`flex items-center ${i > 0 ? "flex-1" : ""}`}>
              {i > 0 && (
                <span className={`mx-1 h-0.5 flex-1 rounded-full sm:mx-2 ${state !== "todo" ? "bg-brand-500" : "bg-slate-200"}`} />
              )}
              <button
                type="button"
                disabled={i > step || step === 4}
                onClick={() => i < step && setStep(i)}
                className="group flex flex-col items-center gap-1.5 disabled:cursor-default"
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-2xl border-2 text-sm font-black transition-all ${
                    state === "done"
                      ? "border-brand-500 bg-brand-500 text-white"
                      : state === "current"
                        ? "border-brand-600 bg-white text-brand-700 shadow-lg shadow-brand-600/20"
                        : "border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {state === "done" ? <Check size={17} strokeWidth={3} /> : <span aria-hidden>{s.emoji}</span>}
                </span>
                <span className={`hidden text-[11px] font-bold sm:block ${state === "current" ? "text-brand-700" : "text-slate-500"}`}>
                  {s.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {(notice || warnings.length > 0) && step < 4 && (
        <div className="anim-fade-in mx-auto mb-8 grid max-w-3xl gap-2">
          {notice && <p className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-xs font-bold leading-6 text-brand-800">{notice}</p>}
          {warnings.map((w) => (
            <p key={w} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold leading-6 text-amber-800">💡 {w}</p>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* ── main column ─────────────────── */}
        <div className="min-w-0">
          {step === 0 && (
            <StepWrap key="s0" title="مشخصات زمین و کاربری" subtitle="ابعاد دقیق قطعه، هندسه واقعی نما و دیوارها را تعیین می‌کند؛ اعداد را از سند یا نقشه هوایی وارد کنید.">
              <SectionCard title="موقعیت و کاربری" emoji="🗺️" subtitle="ضریب قیمت منطقه بر اساس استان اعمال می‌شود.">
                <SelectField
                  label="استان محل پروژه"
                  value={inputs.provinceId}
                  onChange={(v) => set("provinceId", v)}
                  options={PROVINCES.map((p) => ({ value: p.id, label: `${p.label} (ضریب ${p.coef.toLocaleString("fa-IR")})` }))}
                />
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">نوع کاربری ساختمان</p>
                  <OptionCards columns={3} value={inputs.usageType} onChange={(v) => set("usageType", v)} options={USAGE_OPTIONS} />
                </div>
              </SectionCard>

              <SectionCard title="ابعاد دقیق زمین" emoji="📐" subtitle="بر (عرض) از سمت گذر و طول (عمق) قطعه — با دقت نیم متر.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField label="بر زمین (عرض از گذر)" value={inputs.landWidth} onChange={(v) => set("landWidth", v)} min={5} max={60} step={0.5} suffix="متر" hint="مثلاً ۱۲" />
                  <NumberField label="طول زمین (عمق)" value={inputs.landDepth} onChange={(v) => set("landDepth", v)} min={8} max={150} step={0.5} suffix="متر" hint="مثلاً ۱۷" />
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
                  <Ruler size={15} className="text-brand-600" />
                  مساحت کل: <span className="font-black text-slate-900 tnum">{faNum(landAreaNow)} م²</span>
                  <span className="text-slate-300">|</span>
                  محیط زمین: <span className="font-black text-slate-900 tnum">{faDecimal(2 * (inputs.landWidth + inputs.landDepth))} متر</span>
                  <span className="text-slate-300">|</span>
                  سطح اشغال {faNum(inputs.occupancyPct)}٪: <span className="font-black text-slate-900 tnum">{faNum(Math.round(inputs.landWidth * Math.max(6, Math.round(inputs.landDepth * inputs.occupancyPct / 100 / 2) * 2)))} م²</span>
                </div>
                <RangeField label="درصد سطح اشغال مجاز" value={inputs.occupancyPct} onChange={(v) => set("occupancyPct", v)} min={30} max={100} suffix="٪" hint="طبق طرح تفصیلی" />
              </SectionCard>

              <SectionCard title="موقعیت قطعه و سند" emoji="🧭" subtitle="تعداد جداره‌های آزاد، مساحت نما و هزینه آن را مستقیماً تغییر می‌دهد.">
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">موقعیت قرارگیری قطعه</p>
                  <OptionCards columns={3} value={inputs.lotPosition} onChange={(v) => set("lotPosition", v)} options={LOT_OPTIONS} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">وضعیت سند</p>
                  <OptionCards value={inputs.deedType} onChange={(v) => set("deedType", v)} options={DEED_OPTIONS} />
                </div>
              </SectionCard>
            </StepWrap>
          )}

          {step === 1 && (
            <StepWrap key="s1" title="ابعاد و ظرفیت ساختمان" subtitle="طبقات، واحدها و سیستم سقف — حجم اسکلت و نازک‌کاری از همین بخش نشأت می‌گیرد.">
              <SectionCard title="طبقات و واحدها" emoji="🏢">
                <div className="grid gap-4 sm:grid-cols-3">
                  <NumberField label="طبقات مسکونی" value={inputs.floors} onChange={(v) => set("floors", v)} min={1} max={20} suffix="طبقه" />
                  <NumberField label="واحد در هر طبقه" value={inputs.unitsPerFloor} onChange={(v) => set("unitsPerFloor", v)} min={1} max={8} suffix="واحد" />
                  <NumberField label="طبقات تجاری/اداری" value={inputs.commercialFloors} onChange={(v) => set("commercialFloors", v)} min={0} max={6} suffix="طبقه" hint="۰ = بدون تجاری" />
                </div>
              </SectionCard>
              <SectionCard title="پارکینگ و زیرزمین" emoji="🅿️" subtitle="زیرزمین هزینه گود و سازه نگهبان اضافه می‌کند اما ارزش ملک را بالا می‌برد.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <NumberField label="تعداد پارکینگ" value={inputs.parkingCount} onChange={(v) => set("parkingCount", v)} min={0} max={100} suffix="عدد" big hint={`توصیه: ≥ ${parkingNeed}`} />
                  <ToggleSwitch checked={inputs.hasBasement} onChange={(v) => set("hasBasement", v)} label="پارکینگ در زیرزمین" desc="گود عمیق + نیلینگ و سازه نگهبان" />
                </div>
              </SectionCard>
              <SectionCard title="ارتفاع و سیستم سقف" emoji="📏">
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">ارتفاع طبقات</p>
                  <OptionCards value={inputs.ceilingHeight} onChange={(v) => set("ceilingHeight", v)} options={CEILING_OPTIONS} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-slate-800">سیستم سقف</p>
                  <OptionCards columns={3} value={inputs.slabType} onChange={(v) => set("slabType", v)} options={SLAB_OPTIONS} />
                </div>
              </SectionCard>
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap key="s2" title="سیستم سازه و سطح کیفیت" subtitle="مهم‌ترین تصمیم‌های هزینه‌ای پروژه؛ حدود ۳۵ تا ۴۰ درصد کل بودجه همین‌جا رقم می‌خورد.">
              <SectionCard title="نوع اسکلت ساختمان" emoji="🏗️" subtitle="مبحث نهم (بتنی) و دهم (فولادی) مقررات ملی">
                <OptionCards value={inputs.structureType} onChange={(v) => set("structureType", v)} options={STRUCTURE_OPTIONS} />
              </SectionCard>
              <SectionCard title="سطح کیفیت مصالح و نازک‌کاری" emoji="✨">
                <OptionCards columns={4} value={inputs.quality} onChange={(v) => set("quality", v)} options={QUALITY_OPTIONS} />
              </SectionCard>
              <SectionCard title="شرایط زمین (ژئوتکنیک)" emoji="💧" subtitle="مطابق گزارش آزمایش خاک؛ اگر ندارید، گزینه پایین معمولاً امن است.">
                <OptionCards value={inputs.waterTable} onChange={(v) => set("waterTable", v)} options={WATER_TABLE_OPTIONS} />
              </SectionCard>
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap key="s3" title="امکانات و تجهیزات" subtitle="جزئیاتی که هم هزینه و هم ارزش فروش ساختمان را تعیین می‌کنند.">
              <SectionCard title="گرمایش و سرمایش" emoji="🌡️">
                <OptionCards columns={4} value={inputs.heatingSystem} onChange={(v) => set("heatingSystem", v)} options={HEATING_OPTIONS} />
              </SectionCard>
              <SectionCard title="نما: مصالح و سبک معماری" emoji="🪨">
                <OptionCards columns={4} value={inputs.facadeType} onChange={(v) => set("facadeType", v)} options={FACADE_OPTIONS} />
                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold text-slate-800">سبک طراحی نما</p>
                  <OptionCards columns={3} value={inputs.facadeStyle} onChange={(v) => set("facadeStyle", v)} options={FACADE_STYLE_OPTIONS} />
                </div>
              </SectionCard>
              <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="پنجره و محوطه" emoji="🪟">
                  <OptionCards value={inputs.windowType} onChange={(v) => set("windowType", v)} options={WINDOW_OPTIONS} />
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-bold text-slate-800">محوطه‌سازی</p>
                    <OptionCards columns={3} value={inputs.landscapeLevel} onChange={(v) => set("landscapeLevel", v)} options={LANDSCAPE_OPTIONS} />
                  </div>
                </SectionCard>
                <SectionCard title="آسانسور و برق اضطراری" emoji="🛗">
                  <ToggleSwitch checked={inputs.hasElevator} onChange={(v) => set("hasElevator", v)} label="آسانسور" desc="الزامی برای بیش از ۴ طبقه (مبحث ۴)" />
                  {inputs.hasElevator && (
                    <SelectField
                      label="ظرفیت آسانسور"
                      value={inputs.elevatorPersons}
                      onChange={(v) => set("elevatorPersons", Number(v))}
                      options={ELEVATOR_PERSONS_OPTIONS.map((n) => ({ value: n, label: `${n.toLocaleString("fa-IR")} نفره` }))}
                    />
                  )}
                  <ToggleSwitch checked={inputs.hasGenerator} onChange={(v) => set("hasGenerator", v)} label="دیزل ژنراتور اضطراری" desc="برق مشاعات و آسانسور هنگام قطع شبکه" />
                </SectionCard>
              </div>
              <SectionCard title="هوشمندسازی و اقتصاد ساخت" emoji="🤖">
                <OptionCards columns={3} value={inputs.smartLevel} onChange={(v) => set("smartLevel", v)} options={SMART_OPTIONS} />
                <RangeField label="فرض تورم سالانه دوره ساخت" value={inputs.inflationPct} onChange={(v) => set("inflationPct", v)} min={0} max={45} suffix="٪" hint="برای منحنی نقدینگی اسمی" />
              </SectionCard>
            </StepWrap>
          )}

          {step === 4 && (
            <div key="s4">
              {computing && <ComputingState />}
              {!computing && result && (
                <>
                  {error && (
                    <p className="anim-fade-up mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5 text-xs font-bold leading-6 text-amber-800">⚠️ {error}</p>
                  )}
                  <ResultPanel result={result} refCode={refCode ?? undefined} />
                  <div className="no-print mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50">
                      ← شروع برآورد جدید
                    </button>
                    <button onClick={() => void runFinal()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800">
                      🔄 محاسبه مجدد با همین مشخصات
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {step < 4 && (
            <div className="no-print mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowRight size={17} />
                مرحله قبل
              </button>
              <button
                onClick={next}
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-brand-600 to-teal-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                {step === 3 ? (
                  <>
                    <Sparkles size={17} />
                    مشاهده برآورد کامل
                  </>
                ) : (
                  <>
                    مرحله بعد
                    <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── live summary sidebar ─────────────────── */}
        {step < 4 && (
          <aside id="summary-preview" className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
              <div className="bg-gradient-to-l from-slate-900 to-brand-950 px-5 py-4 text-white">
                <p className="text-[11px] font-bold text-teal-300">⚡ برآورد لحظه‌ای (قیمت‌های پایه)</p>
                <p className="mt-1.5 text-2xl font-black tnum">{tomanCompact(preview.grandTotal)}</p>
                <p className="mt-0.5 text-[11px] text-slate-300 tnum">هر مترمربع ≈ {tomanCompact(preview.costPerSqm)}</p>
              </div>
              <dl className="grid grid-cols-2 gap-px bg-slate-100 text-center">
                {[
                  [`${faDecimal(inputs.landWidth)}×${faDecimal(inputs.landDepth)} م`, `زمین ${faNum(landAreaNow)} م²`, <Ruler key="d" size={15} className="text-brand-600" />],
                  [`${faNum(preview.derived.builtUpArea)} م²`, "زیربنای کل", <Building2 key="b" size={15} className="text-brand-600" />],
                  [faNum(preview.derived.totalUnits), "واحد مسکونی", <Landmark key="l" size={15} className="text-violet-600" />],
                  [`≈ ${faNum(preview.timeline.months)} ماه`, "مدت اجرا", <Layers key="t" size={15} className="text-sky-600" />],
                ].map(([v, l, ic]) => (
                  <div key={l as string} className="bg-white px-3 py-4">
                    <dd className="flex items-center justify-center gap-1.5 text-sm font-black text-slate-900 tnum">{ic}{v}</dd>
                    <dt className="mt-1 text-[10px] font-bold text-slate-400">{l as string}</dt>
                  </div>
                ))}
              </dl>
              <div className="grid gap-2.5 border-t border-dashed border-slate-200 px-5 py-4">
                <p className="text-[11px] font-black text-slate-700">پرهزینه‌ترین بخش‌ها</p>
                {topGroups.map((g) => (
                  <div key={g.id} className="flex items-center gap-2">
                    <span className="w-16 shrink-0 truncate text-right text-[10px] font-bold text-slate-500">{g.title}</span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="absolute inset-y-0 right-0 rounded-full" style={{ width: `${Math.max((g.total / topGroups[0].total) * 100, 3)}%`, backgroundColor: g.color }} />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] font-semibold text-slate-400 tnum">{preview.regionLabel} · ضریب ×{faDecimal(preview.regionCoef)}</p>
              </div>
              <p className="border-t border-dashed border-slate-200 px-5 py-3 text-[10px] leading-5 text-slate-400">
                لینک همین صفحه، تمام تنظیمات شما را هم منتقل می‌کند. برآورد نهایی شامل عوارض قانونی، ذخیره احتیاطی و قیمت‌های به‌روز سامانه است.
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function StepWrap({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="anim-fade-up grid gap-5">
      <header>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{title}</h2>
        <p className="mt-1.5 text-sm leading-7 text-slate-500">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

function ComputingState() {
  return (
    <div className="anim-fade-in rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
      <Loader2 size={38} className="mx-auto animate-spin text-brand-600" />
      <h3 className="mt-5 text-lg font-black text-slate-900">در حال تهیه متره و برآورد حرفه‌ای…</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
        بیش از ۷۰ قلم هزینه بر اساس هندسه واقعی زمین شما محاسبه و با تعرفه‌های نظام مهندسی تکمیل می‌شود.
      </p>
      <div className="mx-auto mt-7 grid max-w-md gap-2.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="shimmer-line h-3.5 rounded-full" style={{ width: `${100 - i * 22}%`, marginInline: "auto" }} />
        ))}
      </div>
    </div>
  );
}
