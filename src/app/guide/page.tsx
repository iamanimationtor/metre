import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "راهنمای مراحل قانونی و اجرایی ساخت ساختمان در ایران",
  description:
    "مسیر کامل ساخت از استعلام زمین تا پایان‌کار؛ شامل مراجع قانونی، مدت زمان هر مرحله، هزینه‌ها و اشتباهات رایج مطابق مقررات ملی ساختمان.",
};

interface Stage {
  n: number;
  title: string;
  dur: string;
  authority: string;
  desc: string;
  laws: string[];
}

const STAGES: Stage[] = [
  {
    n: 1,
    title: "استعلام ثبتی و خرید زمین",
    dur: "۱ تا ۴ هفته",
    authority: "اداره ثبت اسناد · شهرداری منطقه",
    desc: "پیش از معامله، سند تک‌برگ، عدم بازداشتی بودن ملک، کاربری مندرج در طرح تفصیلی (مسکونی/تجاری/اختلاط) و عرض گذر بررسی شود. زمین‌های قولنامه‌ای ریسک پروانه دارند.",
    laws: ["استعلام ماده ۵ شهرداری", "بررسی پهنه‌بندی طرح تفصیلی"],
  },
  {
    n: 2,
    title: "دستور نقشه و ضوابط شهرسازی",
    dur: "۱ تا ۳ هفته",
    authority: "دفتر خدمات الکترونیک شهر",
    desc: "با ارائه سند و مدارک مالکیت، دستور نقشه صادر می‌شود که در آن تعداد طبقات مجاز، سطح اشغال (معمولاً ۶۰٪)، عقب‌نشینی‌ها و کاربری تعیین شده است.",
    laws: ["طرح تفصیلی مصوب", "ضوابط کمیسیون ماده ۵"],
  },
  {
    n: 3,
    title: "طراحی معماری، سازه و تأسیسات",
    dur: "۳ تا ۸ هفته",
    authority: "شرکت مهندسی · سازمان نظام مهندسی",
    desc: "نقشه‌های فاز دو توسط مهندسان دارای پروانه اشتغال تهیه و در سامانه نظام مهندسی بارگذاری می‌شود؛ کنترل‌های ارچه، لرزه‌ای (استاندارد ۲۸۰۰) و انرژی (مبحث ۱۹) انجام می‌گیرد.",
    laws: ["مبحث ۶ بارهای وارد بر ساختمان", "استاندارد ۲۸۰۰ زلزله", "مبحث ۱۹ صرفه‌جویی انرژی"],
  },
  {
    n: 4,
    title: "صدور پروانه ساخت",
    dur: "۲ تا ۶ هفته",
    authority: "شهرداری منطقه",
    desc: "پس از تأیید نقشه‌ها و پرداخت عوارض نوسازی و صدور پروانه، جواز ساخت با اعتبار معمول دو ساله صادر می‌شود. شروع عملیات بدون پروانه مشمول رأی کمیسیون ماده ۱۰۰ است.",
    laws: ["قانون کمیسیون ماده ۱۰۰ شهرداری", "آیین‌نامه عوارض محلی"],
  },
  {
    n: 5,
    title: "بیمه مسئولیت و آزمایش خاک",
    dur: "همزمان با شروع",
    authority: "شرکت بیمه · آزمایشگاه مکانیک خاک",
    desc: "بیمه تمام‌خطر پروژه و مسئولیت مدنی کارفرما در قبال کارگران و ثالث الزامی است. گزارش ژئوتکنیک (گمانه‌زنی) مبانی طراحی فونداسیون را تعیین می‌کند.",
    laws: ["مبحث ۷ پی و پی‌سازی", "مبحث ۱۲ ایمنی و حفاظت کار"],
  },
  {
    n: 6,
    title: "گودبرداری و سازه نگهبان",
    dur: "۳ تا ۸ هفته",
    authority: "ناظر سازه · مهندس ناظر",
    desc: "برای گود‌های عمیق شهری، سیستم پایدارسازی (نیلینگ، خرپا یا شاتکریت) پیش از خاکبرداری اجرا و پایش‌گیری از ابنیه مجاور انجام می‌شود؛ حادثه گود از پرریسک‌ترین رویدادهای ساخت است.",
    laws: ["مبحث ۷ و ۱۲", "پیوست ژئوتکنیکی گزارش مرحله‌ای"],
  },
  {
    n: 7,
    title: "اجرای فونداسیون و اسکلت",
    dur: "هر طبقه ≈ ۲ تا ۳ هفته",
    authority: "مجری ذی‌صلاح · ناظر سازه",
    desc: "آزمایش‌های بتن (اسلامپ و مکعبی) و جوش (NDT) مستند و در گزارش‌های مرحله‌ای نظام مهندسی ثبت می‌شود؛ بدون تأیید ناظر، سقف بعدی قابل اجرا نیست.",
    laws: ["مبحث ۹ بتن", "مبحث ۱۰ فولاد", "مبحث دوم نظام اداری نظارت"],
  },
  {
    n: 8,
    title: "دیوارچینی، نما و نازک‌کاری",
    dur: "۲ تا ۵ ماه",
    authority: "ناظر معماری",
    desc: "نما باید مطابق نقشه مصوب و با ضوابط همجواری اجرا شود؛ تغییر مصالح نما یا پیشروی نسبت به پروانه از تخلفات شایع است که در پایان‌کار دردسرساز می‌شود.",
    laws: ["مبحث ۸ طرح و اجرای دیوارها", "ضوابط نمای شهرداری"],
  },
  {
    n: 9,
    title: "تأسیسات و ایمنی حریق",
    dur: "همپوشان با نازک‌کاری",
    authority: "سازمان آتش‌نشانی · شرکت گاز",
    desc: "سیستم‌های اعلام و اطفاء حریق، ارتینگ و صاعقه‌گیر برای ساختمان‌های بلندمرتبه الزامی است؛ تأییدیه شرکت گاز منوط به استانداردبودن لوله‌کشی و دودکش‌هاست.",
    laws: ["مبحث ۳ حفاظت در برابر حریق", "مباحث ۱۳، ۱۶ و ۱۷"],
  },
  {
    n: 10,
    title: "پایان‌کار و صورت‌مجلس تفکیکی",
    dur: "۳ تا ۸ هفته",
    authority: "شهرداری · اداره ثبت",
    desc: "پس از بازدید و تطبیق بنا با پروانه، گواهی پایان‌کار صادر و سپس صورت‌مجلس تفکیکی واحدها برای صدور سند مستقل هر واحد از ثبت اخذ می‌شود.",
    laws: ["آیین‌نامه صدور پایان‌کار", "قانون تملک آپارتمان‌ها"],
  },
];

const PITFALLS = [
  ["ساخت بدون پروانه یا پیشروی طولی", "پرونده ماده ۱۰۰، جریمه سنگین یا حتی حکم تخریب بخشی از بنا."],
  ["عدم بیمه مسئولیت کارگاه", "در حوادث کارگری، دیه مستقیماً متوجه مالک می‌شود."],
  ["تغییر ناظر یا مجری بدون اطلاع نظام مهندسی", "گزارش‌های مرحله‌ای فاقد اعتبار شده و پایان‌کار متوقف می‌شود."],
  ["کسر پارکینگ نسبت به پروانه", "جریمه کسر پارکینگ چند برابر ارزش معاملاتی روز محاسبه می‌شود."],
  ["نظافت نکردن گزارش آزمایش بتن", "در اختلافات حقوقی، مستندات آزمایشگاهی سند دفاعی اصلی است."],
];

export default function GuidePage() {
  return (
    <div>
      {/* hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
          <p className="text-sm font-extrabold text-brand-600">راهنمای جامع</p>
          <h1 className="mt-3 text-3xl font-black leading-relaxed text-slate-900 sm:text-4xl">
            مسیر قانونی و اجرایی ساخت ساختمان در ایران
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-9 text-slate-600">
            از لحظه انتخاب زمین تا دریافت سند واحدها؛ ده مرحله اصلی با ذکر مرجع رسمی، بازه زمانی معمول و
            مستندات قانونی لازم. این راهنما دید روشنی از زمان و هزینه واقعی پروژه به شما می‌دهد.
          </p>
        </div>
      </section>

      {/* timeline */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <ol className="relative grid gap-8 before:absolute before:right-[1.35rem] before:top-2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-300 before:via-teal-200 before:to-slate-200">
          {STAGES.map((s) => (
            <li key={s.n} className="relative pr-16">
              <span className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-teal-600 text-base font-black text-white shadow-lg shadow-brand-600/25 tnum">
                {s.n.toLocaleString("fa-IR")}
              </span>
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md print-flat">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">{s.title}</h2>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-black text-brand-700">{s.dur}</span>
                </div>
                <p className="mt-1 text-[11px] font-bold text-slate-400">مرجع: {s.authority}</p>
                <p className="mt-3 text-sm leading-8 text-slate-600">{s.desc}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.laws.map((l) => (
                    <li key={l} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">📚 {l}</li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>

        {/* pitfalls */}
        <section className="mt-16 overflow-hidden rounded-[2rem] border border-red-100 bg-red-50/60 p-8 print-flat">
          <h2 className="flex items-center gap-2 text-lg font-black text-red-800">
            <ShieldAlert size={22} />
            پنج اشتباه پرهزینه که باید جدی بگیرید
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {PITFALLS.map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-red-100 bg-white p-5">
                <p className="text-sm font-extrabold text-slate-900">⚠️ {t}</p>
                <p className="mt-2 text-xs leading-7 text-slate-600">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 rounded-[2rem] bg-slate-900 p-10 text-center">
          <h2 className="text-xl font-black text-white">حالا بودجه همین پروژه را دقیق ببینید</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
            با مشخصات زمین و بنای خود، متره کامل مصالح، دستمزد و عوارض قانونی را در چند دقیقه دریافت کنید.
          </p>
          <Link
            href="/calculator"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-brand-500 to-teal-500 px-7 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-brand-600/30 transition-transform hover:-translate-y-0.5"
          >
            <Calculator size={18} />
            شروع برآورد رایگان
          </Link>
        </div>
      </section>
    </div>
  );
}
