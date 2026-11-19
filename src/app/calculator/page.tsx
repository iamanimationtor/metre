import type { Metadata } from "next";
import Wizard from "@/components/calculator/Wizard";

export const metadata: Metadata = {
  title: "محاسبه‌گر هزینه ساخت ساختمان",
  description: "مشخصات ساختمان خود را وارد کنید و برآورد ریز هزینه ساخت را مطابق بازار ایران دریافت کنید.",
};

export default function CalculatorPage() {
  return (
    <div className="relative">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6">
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">🧮 محاسبه‌گر هزینه ساخت ساختمان</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 text-slate-600">
            در پنج مرحله ساده، برآوردی مهندسی از تمام هزینه‌های پروژه — شامل مصالح، دستمزد، ماشین‌آلات،
            عوارض شهرداری و حق‌الزحمه نظام مهندسی — دریافت خواهید کرد.
          </p>
        </div>
      </div>
      <Wizard />
    </div>
  );
}
