"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Calculator, History, Menu, Settings2, X } from "lucide-react";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/calculator", label: "محاسبه‌گر" },
  { href: "/history", label: "گزارش‌ها" },
  { href: "/guide", label: "راهنمای ساخت" },
  { href: "/methodology", label: "متدولوژی" },
  { href: "/admin", label: "مدیریت" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="no-print sticky top-0 z-50 border-b border-slate-200/70 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-xl shadow-lg shadow-brand-600/25">
            🏗️
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold text-slate-900">HERMIMETR</span>
            <span className="block text-[11px] font-medium text-slate-500">برآورد هوشمند هزینه ساخت</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/calculator"
            className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg sm:inline-flex"
          >
            <Calculator size={16} />
            شروع برآورد
          </Link>
          <button
            aria-label="منو"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${
                  pathname === n.href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {n.label}
                {n.href === "/calculator" && <Calculator size={16} className="text-brand-600" />}
                {n.href === "/history" && <History size={16} className="text-slate-400" />}
                {n.href === "/admin" && <Settings2 size={16} className="text-slate-400" />}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
