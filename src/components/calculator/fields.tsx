"use client";

import type { ReactNode } from "react";
import { Check, Minus, Plus } from "lucide-react";
import type { OptionDef } from "@/lib/constants";
import { faNum } from "@/lib/format";

export function SectionCard({ title, subtitle, emoji, children }: { title: string; subtitle?: string; emoji?: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-900">
        {emoji && <span aria-hidden>{emoji}</span>}
        {title}
      </h3>
      {subtitle && <p className="mt-1 text-xs leading-6 text-slate-500">{subtitle}</p>}
      <div className="mt-5 grid gap-4">{children}</div>
    </div>
  );
}

export function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </div>
  );
}

export function OptionCards<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly OptionDef<T>[];
  columns?: 2 | 3 | 4;
}) {
  const gridCls =
    columns === 2 ? "grid-cols-1 sm:grid-cols-2" : columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4";
  return (
    <div className={`grid ${gridCls} gap-3`}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`relative rounded-2xl border-2 p-4 text-right transition-all ${
              active
                ? "border-brand-500 bg-brand-50/70 shadow-md shadow-brand-600/10"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            {active && (
              <span className="absolute left-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white">
                <Check size={14} strokeWidth={3} />
              </span>
            )}
            {o.emoji && <span className="text-xl" aria-hidden>{o.emoji}</span>}
            <span className="mt-2 block text-sm font-extrabold text-slate-900">{o.label}</span>
            {o.desc && <span className="mt-1 block text-[11px] leading-5 text-slate-500">{o.desc}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  hint,
  big,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  hint?: string;
  big?: boolean;
  /** Increment for ± buttons (default: 1, or 10 when big). */
  step?: number;
}) {
  const delta = step ?? (big ? 10 : 1);
  const set = (v: number) => {
    if (Number.isNaN(v)) return;
    onChange(Math.min(max, Math.max(min, v)));
  };
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="flex items-stretch overflow-hidden rounded-2xl border-2 border-slate-200 bg-white focus-within:border-brand-500">
        <button
          type="button"
          aria-label="کاهش"
          onClick={() => set(Math.round((value - delta) * 100) / 100)}
          className="grid w-12 shrink-0 place-items-center border-l border-slate-100 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Minus size={16} />
        </button>
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={delta}
            onChange={(e) => set(Number(e.target.value))}
            className="w-full bg-transparent px-3 py-3 text-center text-lg font-black text-slate-900 outline-none tnum [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          {suffix && (
            <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-400">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label="افزایش"
          onClick={() => set(Math.round((value + delta) * 100) / 100)}
          className="grid w-12 shrink-0 place-items-center border-r border-slate-100 bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  suffix,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <div className="flex items-center gap-4">
        <input
          type="range"
          dir="ltr"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
        />
        <span className="w-24 shrink-0 rounded-xl bg-brand-50 px-3 py-2 text-center text-sm font-black text-brand-700 tnum">
          {faNum(value)}{suffix ? ` ${suffix}` : ""}
        </span>
      </div>
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-right transition-all ${
        checked ? "border-brand-500 bg-brand-50/70" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span>
        <span className="block text-sm font-extrabold text-slate-900">{label}</span>
        {desc && <span className="mt-0.5 block text-[11px] leading-5 text-slate-500">{desc}</span>}
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-brand-600" : "bg-slate-300"}`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "right-6" : "right-1"}`}
        />
      </span>
    </button>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  hint?: string;
}) {
  return (
    <div>
      <FieldLabel label={label} hint={hint} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-2xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-colors focus:border-brand-500"
      >
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
