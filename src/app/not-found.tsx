import Link from "next/link";
import { Calculator, House } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="anim-float grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-br from-brand-100 to-teal-100 text-5xl">🏚️</span>
      <h1 className="mt-8 text-3xl font-black text-slate-900 tnum">۴۰۴ — این آدرس ساخته نشده است!</h1>
      <p className="mt-4 leading-8 text-slate-600">
        صفحه‌ای که دنبالش بودید پیدا نشد؛ شاید گزارش پاک شده یا لینک اشتباه تایپ شده است.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          <House size={16} />
          بازگشت به خانه
        </Link>
        <Link href="/calculator" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
          <Calculator size={16} />
          شروع برآورد جدید
        </Link>
      </div>
    </div>
  );
}
