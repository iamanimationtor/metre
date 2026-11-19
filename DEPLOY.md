# 🚀 راهنمای استقرار روی Netlify (بدون نقص، طبق مستندات رسمی)

این پروژه یک اپلیکیشن **Next.js 16 (App Router)** است. مطابق [مستندات رسمی نتلیفای](https://docs.netlify.com/frameworks/next-js/overview/)،
Next.js با آداپتور متن‌باز **OpenNext** به‌صورت خودکار و بدون نیاز به افزونه شناسایی و پیکربندی می‌شود؛
SSR، Route Handlerها، بهینه‌سازی تصاویر (`next/image` از طریق Image CDN)، کش لبه و Skew Protection همگی پشتیبانی می‌شوند.
فایل `netlify.toml` موجود صرفاً برای صراحت نسخه Node و هدرهای امنیتی است.

> **علت رایج صفحه‌ی Netlify «Page not found»:** Netlify فقط فایل‌های قابل‌مشاهده در مخزن و پوشه‌ی انتشار را می‌سازد. در ریشه‌ی مخزن باید `package.json`، `netlify.toml` و پوشه‌ی `src/` مستقیماً وجود داشته باشند؛ قرار دادن کل پروژه فقط داخل فایل ZIP باعث می‌شود Netlify اصلاً اپ Next.js را تشخیص ندهد. هنگام اتصال سایت، Base directory را خالی/ریشه‌ی مخزن بگذارید و ZIP را به‌عنوان ورودی build انتخاب نکنید.

---

## ۱) پیش‌نیازها

| مورد | توضیح |
| --- | --- |
| حساب Git | ریپازیتوری GitHub/GitLab/Bitbucket حاوی کد پروژه |
| پایگاه داده PostgreSQL | پیشنهاد: [Neon](https://neon.tech) یا Supabase (لایه رایگان + اتصال Serverless-friendly) |
| حساب Netlify | لایه رایگان کافی است |

> ⚠️ مهم: توکن‌ها و رشته اتصال دیتابیس هرگز نباید در ریپازیتوری باشند. فایل `.env` در `.gitignore` قرار دارد؛ فقط `.env.example` نگهداری می‌شود.

---

## ۲) آماده‌سازی دیتابیس

1. یک دیتابیس PostgreSQL بسازید و رشته اتصال را یادداشت کنید (ترجیحاً اتصال pooled مانند `...pooler...?sslmode=require` در Neon).
2. اسکیمای جداول را اعمال کنید — یک بار، از سیستمی که به دیتابیس دسترسی دارد:

   ```bash
   DATABASE_URL="postgresql://..." npx drizzle-kit push --force
   ```

   (جدول‌ها: `estimates`, `price_overrides`, `price_indices`, `app_settings`)
3. `DATABASE_URL` برای **ساخت سایت لازم نیست**؛ بااین‌حال برای ذخیره‌ی برآوردها، گزارش‌های دائمی، شاخص‌ها و پنل مدیریت ضروری است. پس از تنظیم متغیر، `/api/health` باید `"database":"up"` برگرداند؛ شاخص‌های قیمت نیز در اولین فراخوانی به‌صورت خودکار seed می‌شوند.

---

## ۳) استقرار از طریق داشبورد Netlify (روش توصیه‌شده)

1. در [app.netlify.com](https://app.netlify.com) گزینه **Add new site → Import an existing project** را بزنید و ریپازیتوری را متصل کنید.
2. مطمئن شوید **Base directory خالی/ریشه‌ی مخزن** است و تنظیمات ساخت مطابق `netlify.toml` هستند:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Node version:** `22`
   - **Framework/runtime:** Next.js؛ آداپتور Netlify/OpenNext باید فعال/خودکار تشخیص داده شود. این برنامه SSR و API دارد؛ خروجی آن را به `public` یا `out` تغییر ندهید و SPA catch-all redirect اضافه نکنید.
3. در بخش **Site configuration → Environment variables** این متغیرها را اضافه کنید. برای `DATABASE_URL` دسترسی **Functions/runtime** را نیز فعال کنید:

   | متغیر | مقدار | ضرورت |
   | --- | --- | --- |
   | `DATABASE_URL` | رشته اتصال PostgreSQL | لازم برای ذخیره و لینک دائمی گزارش‌ها، APIهای داده و پنل مدیریت؛ برای build صفحه‌ی اصلی لازم نیست |
   | `NEXT_PUBLIC_SITE_URL` | دامنه نهایی (مثلاً `https://hermimetr.netlify.app`) | اختیاری — برای sitemap و لینک گزارش‌ها؛ بدون آن از `URL` داخلی نتلیفای استفاده می‌شود |

4. **Deploy site** را بزنید. پس از ساخت، دامنه‌ی اصلی باید صفحه‌ی HERMIMETR را نشان دهد؛ بیلد حدود ۱ تا ۲ دقیقه طول می‌کشد.

---

## ۴) استقرار با Netlify CLI (اختیاری)

```bash
npm install -g netlify-cli
netlify login
netlify link
netlify deploy --build --prod
```

> مطابق مستندات، حتماً از فلگ `--build` استفاده شود تا خروجی Next.js درست پردازش شود.

---

## ۵) چک‌لیست پس از استقرار

- [ ] `GET /api/health` پاسخ ۲۰۰ بدهد و پس از تنظیم دیتابیس، `"database":"up"` را نشان دهد (بدون دیتابیس پاسخ `down` است؛ صفحه‌ی اصلی همچنان در دسترس می‌ماند).
- [ ] یک برآورد نمونه در `/calculator` ثبت شود و صفحه گزارش `/report/[code]` باز شود.
- [ ] `sitemap.xml` و `robots.txt` در دسترس باشند.
- [ ] پنل `/admin`: تب «شاخص‌های قیمت» مقادیر پایه (۱۰۰) را نشان دهد؛ تست «به‌روزرسانی خودکار تا امروز» بدون خطا اجرا شود.

---

## ۶) عیب‌یابی رایج

| نشانه | راه‌حل |
| --- | --- |
| صفحه‌ی پیش‌فرض Netlify با پیام **Page not found** | در لاگ Deploy اول موفق بودن build را تأیید کنید؛ Base directory باید ریشه‌ی مخزن باشد و همان‌جا `package.json`، `netlify.toml` و `src/` دیده شوند. Build command را `npm run build` و Publish directory را `.next` نگه دارید؛ برای Next.js از redirect عمومی به `index.html` استفاده نکنید. |
| خطای اتصال دیتابیس یا `database: down` در APIها | بررسی `DATABASE_URL` در Environment variables و دسترسی Functions/runtime؛ فعال بودن SSL (`sslmode=require`)؛ استفاده از اتصال pooled |
| صفحه سفید/خطای build درباره Node | اطمینان از `NODE_VERSION=22` (در `netlify.toml` تنظیم شده) |
| build در دانلود فونت متوقف می‌شود | فونت Vazirmatn اکنون از پکیج محلی npm بسته‌بندی می‌شود و به اتصال زمان build به Google Fonts نیاز ندارد. |
| سرد شدن Functions بعد از بی‌فعالی | طبیعی است؛ اولین درخواست کمی کندتر است اما Pool اتصال بازسازی می‌شود. نیازی به تغییر کد نیست |
| نیاز به تغییر اسکیمای DB بعداً | اجرای مجدد `npx drizzle-kit push` با همان رشته اتصال (سازگار با داده‌های موجود) |
| دامنه اختصاصی | Site configuration → Domain management → افزودن دامنه؛ `NEXT_PUBLIC_SITE_URL` را به‌روز کنید |

---

## ۷) چک‌لیست آمادگی تحویل نهایی

- [x] بیلد پروداکشن بدون هیچ خطا/هشدار TypeScript
- [x] مدیریت خطا در همه سطوح (`error.tsx`، `global-error.tsx`، `not-found.tsx`)
- [x] هدرهای امنیتی در دو لایه (`next.config.ts` و `netlify.toml`)
- [x] Skew Protection رسمی نتلیفای فعال
- [x] ایندکس دیتابیس برای کوئری‌های تاریخچه اعمال شده (`estimates_created_at_idx`)
- [x] سلامت‌سنجی کامل در `/api/health` (وضعیت اپ + اتصال دیتابیس)
- [x] سئو: متادیتای کامل، OG/Twitter با لینک مطلق، JSON‑LD، sitemap پویا، robots
- [x] PWA: مانIFEST راست‌چین + آیکون؛ قابل نصب روی موبایل
- [x] دسترس‌پذیری: RTL استاندارد، اسکیپ‌لینک، فوکوس مشخص، پشتیبانی کاهش حرکت

## ۸) نگه‌داری جاری

- **قیمت‌ها خودکار به‌روز می‌مانند**: شاخص‌های مصالح/دستمزد با دریفت ماهانه جلو می‌آیند؛ هر زمان خواستید از `/admin` تثبیت دستی انجام دهید.
- گزارش‌ها در جدول `estimates` ذخیره می‌شوند و از طریق `sitemap.xml` نیز نمایه‌پذیرند.
