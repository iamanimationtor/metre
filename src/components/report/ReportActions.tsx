"use client";

import Link from "next/link";
import { ArrowRight, PenLine, Printer } from "lucide-react";

export default function ReportActions({ refCode }: { refCode?: string }) {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Link href="/calculator" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
        <ArrowRight size={15} /> برآورد جدید
      </Link>
      {refCode && (
        <Link href={`/calculator?ref=${refCode}`} className="inline-flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-100">
          <PenLine size={15} /> ویرایش و محاسبه مجدد
        </Link>
      )}
      <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800">
        <Printer size={15} /> چاپ / PDF
      </button>
    </div>
  );
}
