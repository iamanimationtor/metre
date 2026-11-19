import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, BarChart3, Banknote, Building2, Calculator, ClipboardList, FileSpreadsheet, Landmark, Layers, MapPinned, ShieldCheck, Sparkles } from "lucide-react";

const STATS = [
  { value: "۳۱", label: "استان با ضریب منطقه‌ای" },
  { value: "+۷۰", label: "آیتم ریز متره و برآورد" },
  { value: "۱۵", label: "فاز اجرایی ساختمان" },
  { value: "۱۴۰۵", label: "مبنای قیمت + شاخص خودکار" },
];

const STEPS = [
  { icon: MapPinned, title: "مشخصات زمین", desc: "استان، متراژ زمین، درصد سطح اشغال و کاربری را انتخاب کنید." },
  { icon: Building2, title: "ابعاد ساختمان", desc: "تعداد طبقات، واحدها، پارکینگ و زیرزمین را وارد کنید." },
  { icon: Layers, title: "سازه و کیفیت", desc: "اسکلت بتنی یا فلزی و سطح کیفیت متریال را برگزینید." },
  { icon: FileSpreadsheet, title: "دریافت متره کامل", desc: "ریز اقلام با قیمت، تفکیک دستمزد/مصالح، لیست خرید، زمان‌بندی گانت و خروجی Excel." },
];

const FEATURES = [
  { icon: ClipboardList, title: "متره پارامتریک اتاق‌محور", desc: "سیستم از چیدمان خودکار واحدها، سطوح گچ و رنگ، طول تیغه‌ها و تعداد دقیق نقاط برق و بهداشتی را استخراج می‌کند." },
  { icon: Banknote, title: "تفکیک دستمزد و مصالح", desc: "هر آیتم سهم دستمزد و مصالح جداگانه دارد؛ قیمت‌ها مستند به فهرست بها یا استعلام بازار و از پنل مدیریت قابل اصلاح‌اند." },
  { icon: Landmark, title: "منطبق با قوانین ایران", desc: "عوارض شهرداری، حق نظارت نظام مهندسی، بیمه مسئولیت و الزامات مباحث مقررات ملی ساختمان." },
  { icon: BarChart3, title: "زمان‌بندی و منحنی نقدینگی", desc: "برنامه گانت اجرای پروژه، مقایسه چهار سطح کیفیت و S-Curve نقدینگی ماهانه برای تأمین مالی." },
  { icon: ShieldCheck, title: "لیست خرید و خروجی Excel", desc: "BOM مصالح اصلی (سیمان، میلگرد، بلوک...)، چاپ PDF و خروجی CSV سازگار با اکسل؛ گزارش‌ها با کد پیگیری ذخیره می‌شوند." },
  { icon: Sparkles, title: "طراحی برای همه دستگاه‌ها", desc: "رابط راست‌چین فارسی با فونت وزیرمتن؛ روی موبایل، تبلت و دسکتاپ یکپارچه و روان." },
];

const SAMPLE_ROWS = [
  ["بتن آماده C25 با پمپاژ", "۲۶۸ مترمکعب", "۶٬۱۳۶٬۰۰۰ ت/م³"],
  ["میلگرد A3 با آرماتوربندی", "۲۶٬۳۲۰ کیلوگرم", "۵۵٬۴۶۰ ت/کیلو"],
  ["قالب‌بندی و شمع‌بندی", "۶۴۴ مترمربع", "۶۱۳٬۶۰۰ ت/م²"],
  ["نمای سنگ تراورتن", "۳۷۸ مترمربع", "۲٬۷۷۳٬۰۰۰ ت/م²"],
  ["کابینت آشپزخانه هایگلاس", "۴۲ مترطول", "۳۳٬۶۳۰٬۰۰۰ ت/متر"],
];

const FAQS = [
  {
    q: "مبنای قیمت‌ها چیست و چقدر دقیق هستند؟",
    a: "مبنای قیمت‌ها ۲۸ آبان ۱۴۰۵ با مرجع فهرست بهای رشته ابنیه سازمان برنامه و میانگین استعلام بازار است. شاخص‌های مصالح و دستمزد به‌صورت خودکار (دریفت ماهانه + تنظیم مدیریتی) به‌روز می‌شوند تا برآورد هیچ‌گاه قدیمی نشود. خروجی با دقت ±۱۰٪ به قیمت تمام‌شده نزدیک است و قیمت نهایی با استعلام روز قطعی می‌شود.",
  },
  {
    q: "آیا هزینه‌های قانونی مثل پروانه شهرداری هم محاسبه می‌شود؟",
    a: "بله. عوارض صدور پروانه و نوسازی شهرداری، حق‌الزحمه طراحی و نظارت نظام مهندسی، بیمه مسئولیت مدنی پروژه، آزمایش‌های فنی خاک و بتن و هزینه‌های ایمنی کارگاه (HSE) مطابق تعرفه‌های جاری به‌صورت درصدی از هزینه فیزیکی برآورد اضافه می‌شوند.",
  },
  {
    q: "تفاوت اسکلت بتنی و فلزی در نتیجه چگونه لحاظ می‌شود؟",
    a: "مقادیر مصرف بتن (حدود ۰٫۴۸ مترمکعب)، میلگرد (حدود ۴۷ کیلوگرم) و قالب‌بندی برای اسکلت بتنی و مصرف فولاد (حدود ۴۱ کیلوگرم پروفیل ST37) به‌همراه اتصالات برای اسکلت فلزی طبق سرانه‌های رایج صنعت ساختمان ایران اعمال می‌شود.",
  },
  {
    q: "سطح اشغال ۶۰ درصد یعنی چه؟",
    a: "طبق ضوابط اکثر طرح‌های تفصیلی شهرداری، حداکثر سطح اشغال مجاز در قطعات مسکونی حدود ۶۰ درصد مساحت زمین است. شما می‌توانید این عدد را متناسب با ضوابط شهر خود تغییر دهید تا زیربنای هر طبقه واقعی‌تر شود.",
  },
  {
    q: "چگونه گزارش را ذخیره یا چاپ کنم؟",
    a: "پس از پایان محاسبه، گزارش با یک کد پیگیری یکتا در سامانه ذخیره می‌شود. از صفحه نتایج می‌توانید لینک گزارش را کپی کنید یا نسخه چاپی تمیز (PDF) از تمام اقلام تهیه نمایید.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "HERMIMETR",
  alternateName: "Hermimetr",
  description:
    "سیستم متره و برآورد آنلاین هزینه ساخت ساختمان در ایران با شاخص‌های قیمتی خودکار، ریز اقلام، زمان‌بندی اجرا و خروجی Excel.",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "fa-IR",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IRR" },
};

export default function Home() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      {/* ── Hero ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 hero-grid-bg opacity-60" />
        <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="anim-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-300">
              <BadgeCheck size={14} />
              مطابق مقررات ملی ساختمان و تعرفه نظام مهندسی
            </span>
            <h1 className="mt-6 text-4xl font-black leading-[1.25] text-white sm:text-5xl sm:leading-[1.25]">
              هزینه ساخت ساختمان‌تان را
              <span className="block bg-gradient-to-l from-brand-400 to-teal-300 bg-clip-text text-transparent">
                تا ریزترین جزئیات بدانید
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg sm:leading-9">
              مشخصات زمین و ساختمان را وارد کنید؛ سیستم متره خودکارِ HERMIMETR در چند ثانیه بیش از ۷۰ قلم
              ریز هزینه — از تعداد پره رادیاتور و نقاط برق تا بلوک دیوارچینی و عوارض قانونی — را با قیمت روز بازار ایران محاسبه می‌کند.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/calculator"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-brand-500 to-teal-500 px-7 py-4 text-base font-extrabold text-white shadow-xl shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-brand-500/40"
              >
                <Calculator size={20} />
                شروع محاسبه رایگان
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
              >
                مشاهده نمونه گزارش‌ها
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-2xl font-black text-white tnum">{s.value}</dd>
                  <dd className="mt-1 text-xs font-medium leading-5 text-slate-400">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative anim-fade-in delay-200 hidden lg:block">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50">
              <Image src="/images/hero-building.png" alt="تصویرسازی یک ساختمان مسکونی مدرن ایرانی" width={900} height={1000} priority className="h-[34rem] w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-5 right-5 left-5 rounded-2xl glass p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500">برآورد نمونه — آپارتمان ۵ طبقه، تهران (آبان ۱۴۰۵)</p>
                    <p className="mt-1 text-xl font-black text-slate-900 tnum">≈ ۴۰٫۹ میلیارد تومان</p>
                  </div>
                  <span className="rounded-xl bg-brand-600/10 px-3 py-2 text-xs font-extrabold text-brand-700 tnum">متری ۵۵ میلیون ت</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {[["اسکلت", "32%", "bg-red-400"], ["نازک‌کاری", "26%", "bg-emerald-400"], ["تأسیسات", "18%", "bg-violet-400"], ["نما", "12%", "bg-teal-400"]].map(([l, v, c]) => (
                    <div key={l} className="rounded-lg bg-white/70 p-2 text-center">
                      <span className={`mx-auto block h-1.5 w-8 rounded-full ${c}`} />
                      <p className="mt-1.5 text-[10px] font-bold text-slate-700">{l}</p>
                      <p className="text-[10px] font-extrabold text-slate-900 tnum">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── مراحل ─────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-extrabold text-brand-600">فرآیند کار</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">در چهار قدم ساده تا برآورد کامل</h2>
          <p className="mt-4 leading-8 text-slate-600">بدون نیاز به دانش فنی؛ فقط اطلاعات ملک خود را وارد کنید.</p>
        </header>
        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
              <span className="absolute -top-4 right-6 grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-sm font-black text-white tnum">{i + 1}</span>
              <s.icon className="mt-3 text-brand-600" size={30} strokeWidth={1.8} />
              <h3 className="mt-4 text-base font-extrabold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── ویژگی‌ها ─────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-extrabold text-brand-600">چرا HERMIMETR؟</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">یک سیستم مهندسی، نه یک ماشین‌حساب ساده</h2>
          </header>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="group rounded-3xl border border-slate-200 bg-slate-50/60 p-7 transition-all hover:border-brand-200 hover:bg-brand-50/40">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-colors group-hover:ring-brand-300">
                  <f.icon size={22} className="text-brand-700" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-base font-extrabold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{f.desc}</p>
              </article>
            ))}
          </div>

          {/* نمونه اقلام */}
          <div className="mt-14 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm print-flat">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
              <h3 className="text-sm font-extrabold text-slate-900">📋 نمونه‌ای از خروجی ریز اقلام (پروژه ۵ طبقه بتنی)</h3>
              <Link href="/calculator" className="text-xs font-bold text-brand-700 hover:underline">خودتان امتحان کنید ←</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[34rem] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-right text-xs font-bold text-slate-500">
                    <th className="px-6 py-3">شرح آیتم</th>
                    <th className="px-4 py-3">مقدار محاسبه‌شده</th>
                    <th className="px-4 py-3">قیمت واحد</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS.map(([d, q, p]) => (
                    <tr key={d} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{d}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-600 tnum">{q}</td>
                      <td className="px-4 py-3.5 font-bold text-brand-700 tnum">{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── سوالات متداول ─────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <header className="text-center">
          <p className="text-sm font-extrabold text-brand-600">سوالات متداول</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">هر چه لازم است بدانید</h2>
        </header>
        <div className="mt-10 grid gap-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white px-6 py-4 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-8 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-l from-brand-700 via-teal-700 to-slate-900 px-6 py-16 text-center shadow-2xl shadow-brand-900/30 sm:px-16">
          <div className="absolute inset-0 hero-grid-bg" />
          <div className="relative">
            <h2 className="text-3xl font-black text-white sm:text-4xl">آماده‌اید بودجه پروژه‌تان را دقیق ببینید؟</h2>
            <p className="mx-auto mt-4 max-w-xl leading-8 text-teal-100/90">
              کمتر از دو دقیقه وقت بگذارید و گزارش حرفه‌ای هزینه ساخت را با کد پیگیری اختصاصی دریافت کنید.
            </p>
            <Link
              href="/calculator"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-extrabold text-slate-900 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            >
              <Calculator size={20} className="text-brand-700" />
              شروع محاسبه رایگان
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
