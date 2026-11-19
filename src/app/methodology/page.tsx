import type { Metadata } from "next";
import { CATALOG } from "@/lib/catalog";
import { FEE_RATES, PROVINCES, QUALITY_MULTIPLIERS, QUALITY_OPTIONS } from "@/lib/constants";
import { faDecimal, faNum } from "@/lib/format";

export const metadata: Metadata = {
  title: "متدولوژی محاسبات و منابع قیمت",
  description:
    "روش‌شناسی شفاف موتور متره و برآورد HERMIMETR؛ سرانه‌های مصرف، مدل چیدمان، تعرفه‌های قانونی و منابع قیمت‌گذاری.",
};

const QUANTITY_RULES: [string, string, string][] = [
  ["بتن آماده — اسکلت بتنی", "۰٫۴۸ مترمکعب به ازای هر مترمربع زیربنا", "تفکیک ۳۰٪ فونداسیون، ۲۲٪ ستون/برشی، ۴۸٪ سقف و تیر"],
  ["بتن آماده — اسکلت فلزی", "۰٫۳۰ مترمکعب به ازای هر مترمربع زیربنا", "عمدتاً فونداسیون، کرسی و دال‌های اتصال"],
  ["میلگرد A3 — اسکلت بتنی", "۴۷ کیلوگرم بر مترمربع (+۵٪ پرت)", "توزیع ۳۳ / ۲۴ / ۴۳ درصد بین فونداسیون، ستون و سقف"],
  ["پروفیل فولادی ST37", "۴۱ کیلوگرم بر مترمربع (+۴٪ پرت)", "فقط در گزینه اسکلت فلزی؛ شامل ساخت و نصب"],
  ["قالب‌بندی", "۱٫۱۵ برابر زیربنا (بتنی) · ۰٫۸ (فلزی)", "سطوح تماس قالب با بتن"],
  ["دیوار پیرامونی", "محیط اشغال × ارتفاع طبقات − ۲۴٪ بازشو", "بر اساس هندسه واقعی قطعه"],
  ["تیغه داخلی", "مدل اتاق‌محور: ۴٫۲×اتاق‌خواب + ۰٫۱۱×مساحت واحد + ثابت", "مشاعات هر طبقه جداگانه اضافه می‌شود"],
  ["گچ‌کاری", "سطح داخلی دیوار خارجی + تیغه دورو + سقف", "کسر سطوح کاشی‌شده در رنگ اعمال می‌شود"],
  ["کاشی سرویس و آشپزخانه", "از شیت‌بندی اتاق‌ها (+۸٪ پرت)", "دیوار سرویس‌ها تا ارتفاع ۱٫۸ متر"],
  ["نقاط برق هر واحد", "پریز ۱۹–۲۲ · کلید ۷–۹ · روشنایی ۹–۱۲ · ضعیف ۲–۶", "استاندارد مصرف خانوار ایرانی"],
  ["رادیاتور آلومینیومی", "بار حرارتی = مساحت واحد × ۱۳۰ kcal/h ÷ ۱۳۵", "با ۱۰٪ ضریب اطمینان طراحی"],
  ["خاکبرداری", "سطح اشغال × عمق گود × ۱٫۰۸ (شیب اجرا)", "عمق گود: ۳٫۴ م با زیرزمین، ۱٫۳ م بدون آن"],
  ["هندسه زمین", "بر و طول واقعی قطعه وارد می‌شود", "محیط زمین، سطح اشغال و ابعاد نما از همان مستطیل محاسبه می‌شوند"],
  ["جداره‌های آزاد نما", "تک‌بر: جلو+عقب · نبش: +یک ضلع · سه‌بر: +دو ضلع", "فقط جداره‌های واقعاً آزاد نماکاری و داربست می‌گیرند"],
  ["اثر نوع سقف", "دال بتنی: بتن +۰٫۰۳ و قالب ×۱٫۱۸ · عرشه: بتن −۰٫۰۵ و قالب ×۰٫۸۲", "نسبت به سقف مرجع تیرچه بلوک"],
  ["ارتفاع طبقات", "معمول ۳٫۱ م / بلند ۳٫۴۵ م", "مستقیماً دیوار، گچ، رنگ و ارتفاع نما را تغییر می‌دهد"],
  ["سبک نما", "کلاسیک ×۱٫۱۲ + ردیف ابزار GRC · مینیمال ×۰٫۹", "ابزار کلاسیک معادل ۴۵٪ مساحت نما اضافه می‌شود"],
  ["تورم دوره ساخت", "ترکیب ماهانه (1+i)^(1/12) بر منحنی نقدینگی", "جمع اسمی پروژه در کنار برآورد قیمت امروز گزارش می‌شود"],
];

export default function MethodologyPage() {
  const topProvinces = [...PROVINCES].sort((a, b) => b.coef - a.coef);
  const lowProvinces = [...PROVINCES].sort((a, b) => a.coef - b.coef);
  const sources = Array.from(new Set(CATALOG.map((c) => c.src)));

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <header className="text-center">
        <p className="text-sm font-extrabold text-brand-600">شفافیت کامل</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">📖 متدولوژی محاسبات HERMIMETR</h1>
        <p className="mx-auto mt-5 max-w-2xl leading-9 text-slate-600">
          همه خروجی‌های سامانه از فرمول‌های مستند زیر تولید می‌شود؛ هیچ «جعبه سیاهی» وجود ندارد.
          اعداد این صفحه مستقیماً از موتور محاسبات خوانده شده و همیشه با نسخه جاری هماهنگ است.
        </p>
      </header>

      {/* rules table */}
      <section className="mt-14">
        <h2 className="text-lg font-black text-slate-900">۱. قواعد متره (مقادیر مصرف)</h2>
        <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm print-flat">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-right text-xs font-bold text-slate-500">
                <th className="px-5 py-3.5">آیتم</th>
                <th className="px-4 py-3.5">قاعده محاسبه</th>
                <th className="px-4 py-3.5">توضیح</th>
              </tr>
            </thead>
            <tbody>
              {QUANTITY_RULES.map(([a, b, c]) => (
                <tr key={a} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{a}</td>
                  <td className="px-4 py-3.5 font-medium text-brand-700 tnum">{b}</td>
                  <td className="px-4 py-3.5 text-xs leading-6 text-slate-500">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* quality & fees */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm print-flat">
          <h2 className="text-base font-black text-slate-900">۲. ضرایب سطح کیفیت</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">بر قیمت پایه هر آیتم در چهار کلاس کاری اعمال می‌شود.</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-right text-xs font-bold text-slate-500">
                <th className="py-2">سطح</th>
                <th className="py-2">سازه</th>
                <th className="py-2">نازک‌کاری</th>
                <th className="py-2">تأسیسات</th>
                <th className="py-2">نما</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {(["economic", "standard", "good", "luxury"] as const).map((q) => {
                const m = QUALITY_OPTIONS.find((o) => o.value === q)!;
                const mult = QUALITY_MULTIPLIERS[q];
                return (
                  <tr key={q} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-bold text-slate-800">{m.emoji} {m.label}</td>
                    <td className="py-2.5 text-slate-600">×{faDecimal(mult.structure)}</td>
                    <td className="py-2.5 text-slate-600">×{faDecimal(mult.finish)}</td>
                    <td className="py-2.5 text-slate-600">×{faDecimal(mult.mep)}</td>
                    <td className="py-2.5 text-slate-600">×{faDecimal(mult.facade)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm print-flat">
          <h2 className="text-base font-black text-slate-900">۳. عوارض و هزینه‌های قانونی</h2>
          <p className="mt-2 text-xs leading-6 text-slate-500">درصدی از جمع هزینه‌های فیزیکی پروژه (گذر دوم محاسبه).</p>
          <ul className="mt-4 grid gap-3 text-sm">
            {[
              ["عوارض پروانه و نوسازی شهرداری", `${faDecimal(FEE_RATES.municipality * 100)}٪`, "کاربری تجاری ×۱٫۳۵ و مختلط ×۱٫۱۵"],
              ["طراحی و نظارت نظام مهندسی", `${faDecimal(FEE_RATES.nezam * 100)}٪`, "تعرفه استانی سازمان نظام مهندسی"],
              ["بیمه مسئولیت و آزمایش فنی", `${faDecimal(FEE_RATES.insuranceLab * 100)}٪`, "تمام‌خطر + آزمایش بتن و جوش"],
              ["ایمنی و HSE کارگاه", `${faDecimal(FEE_RATES.hse * 100)}٪`, "مبحث ۱۲ مقررات ملی"],
              ["ذخیره پیش‌بینی‌نشده", `${faDecimal(FEE_RATES.contingency * 100)}٪`, "نوسان قیمت مصالح و تغییرات کارفرما"],
            ].map(([t, v, n]) => (
              <li key={t} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span>
                  <span className="block text-xs font-extrabold text-slate-800">{t}</span>
                  <span className="mt-0.5 block text-[10px] text-slate-400">{n}</span>
                </span>
                <span className="shrink-0 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-sm font-black text-indigo-700 tnum">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* regional coefficients */}
      <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm print-flat">
        <h2 className="text-base font-black text-slate-900">۴. ضرایب منطقه‌ای ({faNum(PROVINCES.length)} استان)</h2>
        <p className="mt-2 text-xs leading-6 text-slate-500">
          بر اختلاف سطح دستمزد، حمل مصالح و فشار تقاضا در بازارهای محلی تنظیم شده است.
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-black text-red-600">گران‌ترین بازارها</p>
            <ul className="grid gap-2">
              {topProvinces.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between rounded-xl bg-red-50 px-4 py-2.5 text-sm">
                  <span className="font-bold text-slate-700">{p.label}</span>
                  <span className="font-black text-red-700 tnum">×{faDecimal(p.coef)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-black text-emerald-600">مقرون‌به‌صرفه‌ترین بازارها</p>
            <ul className="grid gap-2">
              {lowProvinces.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between rounded-xl bg-emerald-50 px-4 py-2.5 text-sm">
                  <span className="font-bold text-slate-700">{p.label}</span>
                  <span className="font-black text-emerald-700 tnum">×{faDecimal(p.coef)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* automatic refresh system */}
      <section className="mt-12 rounded-3xl border border-indigo-100 bg-indigo-50/50 p-7 print-flat">
        <h2 className="text-base font-black text-slate-900">۵. نظام به‌روزرسانی خودکار قیمت‌ها</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-8 text-slate-700">
          <li>🗓️ <b>مبنای زمانی:</b> کل کاتالوگ در تاریخ ۲۸ آبان ۱۴۰۵ بازتعریف شده است (رشد تفکیکی مصالح ×۱٫۳۴ و دستمزد ×۱٫۴۶ نسبت به ارقام پایه).</li>
          <li>📊 <b>شاخص‌های زنده:</b> دو شاخص «مصالح و تجهیزات» و «دستمزد اجرا» طبق مدل شاخص تعدیل سازمان برنامه روی قیمت‌ها اعمال می‌شود؛ هر آیتم دقیقاً به اندازه سهم دستمزد خود از شاخص مربوطه اثر می‌پذیرد.</li>
          <li>⏱️ <b>دریفت خودکار:</b> فاصله آخرین تنظیم تا امروز، ماهانه با نرخ ترکیبی (پیش‌فرض ۲٫۵٪) پر می‌شود؛ بنابراین قیمت‌ها بدون دخالت انسان همیشه به‌روز می‌مانند.</li>
          <li>🎛️ <b>نظارت مدیریتی:</b> از پنل مدیریت می‌توان شاخص‌ها را دستی تنظیم یا دریفت انباشته را با یک کلیک تثبیت کرد.</li>
        </ul>
      </section>

      {/* component takeoff */}
      <section className="mt-12 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-7 print-flat">
        <h2 className="text-base font-black text-slate-900">۶. مدل تجزیه جزء‌به‌جزء مصالح (ریزِ ریز)</h2>
        <p className="mt-2 text-sm leading-8 text-slate-600">
          خروجی «ریز مصالح و تجهیزات» هر کار ترکیبی را با نرخ‌های مصرف استاندارد ایران به مواد خام می‌شکند؛ برای نمونه:
        </p>
        <ul className="mt-4 grid gap-2.5 text-xs leading-7 text-slate-700 sm:grid-cols-2">
          <li className="rounded-xl bg-white p-3.5">🚛 <b>هر م³ بتن C30</b> ← ۳۵۰ کیلو سیمان + ۰٫۶ م³ ماسه + ۰٫۸ م³ شن + افزودنی ۰٫۷٪</li>
          <li className="rounded-xl bg-white p-3.5">🪛 <b>هر تن میلگرد</b> ← ۸ کیلو مفتول گره‌زنی + اسپیسر بر حسب سقف</li>
          <li className="rounded-xl bg-white p-3.5">🧱 <b>دیوار لیکا ۲۰</b> ← ۱۲٫۵ بلوک بر م² + ۵ کیلو سیمان + ۳۰ لیتر ماسه ملات</li>
          <li className="rounded-xl bg-white p-3.5">⚪ <b>گچ‌کاری</b> ← ۱۲ کیلو گچ بر م² + خاک بادی لایه ۱۴ میلی‌متری</li>
          <li className="rounded-xl bg-white p-3.5">🔲 <b>کاشی‌کاری</b> ← کاشی +۸٪ پرت، چسب ۵ کیلو/m²، بندکشی ۰٫۶ کیلو/m²</li>
          <li className="rounded-xl bg-white p-3.5">⚡ <b>هر نقطه برق</b> ← متر کابل تفکیک سایز (۱٫۵/۲٫۵/۴) + ۳٫۲ متر لوله + مکانیزم مجزا</li>
          <li className="rounded-xl bg-white p-3.5">🚿 <b>لوله‌کشی واحدها</b> ← پنج‌لایه ≈ ۱٫۱×مساحت واحد + فاضلاب و گاز قطر‌بندی‌شده + اتصالات ۵۵٪</li>
          <li className="rounded-xl bg-white p-3.5">👷 <b>نیروی انسانی</b> ← نفر-روز هر تخصص از تقسیم دستمزد اقلام بر مزد روزانه ۱۴۰۵</li>
        </ul>
        <p className="mt-4 text-[11px] leading-6 text-slate-500">
          قیمت‌های مرجع این بخش میانگین بازار آبان ۱۴۰۵ است و فقط «بخش خرید» را نشان می‌دهد؛ جمع آن معمولاً ۷۰ تا ۹۰ درصد
          سهم مصالح برآورد اصلی است (مازاد، بالاسری، حمل و سود تأمین‌کننده است که در قیمت‌های فهرست‌بهایی لحاظ شده‌اند).
        </p>
      </section>

      {/* sources */}
      <section className="mt-12">
        <h2 className="text-lg font-black text-slate-900">۷. منابع قیمت‌گذاری</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {sources.map((s) => (
            <li key={s} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
              <span className="text-brand-600">✔</span>
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-xs leading-7 text-amber-800">
          ⚠️ قیمت‌ها میانگین‌گیری دوره‌ای هستند و در بازه ±۱۰ درصد بازار نوسان دارند. برای قراردادهای پیمانکاری،
          استعلام روز سه فروشنده و تطبیق با فهرست بهای سال جاری توصیه می‌شود. از پنل «مدیریت قیمت‌ها» می‌توانید
          درصد تعدیل هر آیتم را برای برآوردهای خود شخصی‌سازی کنید.
        </p>
      </section>
    </div>
  );
}
