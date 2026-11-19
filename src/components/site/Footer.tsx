import Link from "next/link";

export default function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-teal-700 text-xl">
              🏗️
            </span>
            <span className="text-lg font-extrabold">HERMIMETR</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            سامانه متره و برآورد آنلاین هزینه ساخت؛ محاسبات پارامتریک مبتنی بر فهرست بهای سازمان برنامه و تعرفه‌های نظام مهندسی،
            با مبنای قیمت ۲۸ آبان ۱۴۰۵ و به‌روزرسانی خودکار از طریق شاخص‌های زنده مصالح و دستمزد.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">دسترسی سریع</h3>
          <ul className="mt-4 grid gap-2.5 text-sm text-slate-600">
            <li><Link className="transition-colors hover:text-brand-700" href="/calculator">محاسبه‌گر متره و برآورد</Link></li>
            <li><Link className="transition-colors hover:text-brand-700" href="/guide">راهنمای مراحل قانونی ساخت</Link></li>
            <li><Link className="transition-colors hover:text-brand-700" href="/methodology">متدولوژی محاسبات و منابع قیمت</Link></li>
            <li><Link className="transition-colors hover:text-brand-700" href="/history">گزارش‌های ذخیره‌شده</Link></li>
            <li><Link className="transition-colors hover:text-brand-700" href="/admin">به‌روزرسانی قیمت‌ها</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">مبانی محاسباتی</h3>
          <ul className="mt-4 grid gap-2.5 text-sm text-slate-600">
            <li>📕 مباحث مقررات ملی ساختمان (۳ تا ۲۲)</li>
            <li>📊 فهرست بهای رشته ابنیه سازمان برنامه</li>
            <li>🛠️ تعرفه خدمات نظام مهندسی استان‌ها</li>
            <li>🌐 استاندارد ۲۸۰۰ طراحی لرزه‌ای</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-500">
        ارقام ارائه‌شده تخمینی و جنبه مشورتی دارند؛ برای برآورد نهایی با مهندس ناظر یا دفتر فنی مشورت کنید. © ۱۴۰۵ HERMIMETR
      </div>
    </footer>
  );
}
