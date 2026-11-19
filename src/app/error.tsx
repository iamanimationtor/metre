"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCcw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <span className="grid h-24 w-24 place-items-center rounded-[2rem] bg-red-50 text-5xl">🧯</span>
      <h1 className="mt-8 text-2xl font-black text-slate-900">خطای غیرمنتظره رخ داد</h1>
      <p className="mt-4 leading-8 text-slate-600">
        مشکلی در پردازش درخواست پیش آمد. با یک تلاش دوباره معمولاً حل می‌شود؛ اگر تکرار شد، از صفحه اصلی شروع کنید.
        {error.digest ? ` (کد خطا: ${error.digest})` : ""}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">
          <RefreshCcw size={16} />
          تلاش دوباره
        </button>
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">
          صفحه اصلی
        </Link>
      </div>
    </div>
  );
}
