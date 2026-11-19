# راهنمای استقرار HERMIMETR روی Netlify

این پروژه **Next.js 16 با App Router، صفحات سروری و API** است؛ خروجی خام `.next` یک سایت استاتیک آمادهٔ انتشار نیست. برای نمونه، فایل صفحهٔ اصلی در `.next/server/app/index.html` ساخته می‌شود، نه در ریشهٔ `.next`. اگر آداپتور Next.js اجرا نشود، Netlify ممکن است بیلد را موفق اعلام کند اما برای `/` و سایر مسیرها صفحهٔ پیش‌فرض **Page not found** نشان دهد.

برای جلوگیری از این وضعیت، `netlify.toml` آداپتور رسمی `@netlify/plugin-nextjs` را **صریحاً** فعال می‌کند و نسخهٔ آن در `package-lock.json` ثبت شده است. آداپتور تابع سرور، مسیریابی، فایل‌های استاتیک و کش موردنیاز را می‌سازد. افزونهٔ محلی `verify-next-runtime` نیز پس از بسته‌بندی بررسی می‌کند که تابع، مسیرهای GET و POST ضروری و فایل‌های قابل انتشار وجود داشته باشند؛ اگر نباشند، بیلد را پیش از انتشار متوقف می‌کند.

> این تنظیمات خطاهای مربوط به حساب، دامنه، شاخهٔ انتخاب‌شده یا انتشار نسخهٔ قدیمی را به‌تنهایی اصلاح نمی‌کنند. نتیجه را حتماً روی URL همان deploy بررسی کنید.

## ۱. تنظیمات پروژه در Netlify

مخزن Git حاوی پروژه را به سایت وصل کنید و در **Project configuration → Build & deploy** موارد زیر را بررسی کنید:

| تنظیم | مقدار |
| --- | --- |
| Base directory | خالی یا ریشهٔ مخزن؛ `package.json`، `netlify.toml`، `src` و `netlify/plugins` باید در همان پروژه در دسترس باشند |
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node version | `22` (در `netlify.toml` تنظیم شده است) |
| آداپتور | `@netlify/plugin-nextjs` از `netlify.toml`؛ نصب دستی Integration در داشبورد لازم نیست |

- این اپلیکیشن فقط استاتیک نیست. پوشهٔ انتشار را به `public` یا `out` تغییر ندهید و redirect عمومی `/* → /index.html` اضافه نکنید؛ این کار ممکن است APIها و مسیرهای سروری را خراب کند. در زمان انتشار، آداپتور محتوای قابل انتشار را خودش آماده می‌کند.
- متغیر `NETLIFY_NEXT_PLUGIN_SKIP` نباید `true` یا `1` باشد؛ آن را از تنظیمات محیطی Netlify حذف کنید. تنظیماتی مثل `NPM_FLAGS=--omit=dev` را هم که نصب وابستگی‌های build را حذف می‌کنند، استفاده نکنید.
- تمام فایل‌های پروژه، شامل `netlify.toml`، `package-lock.json` و `netlify/plugins/verify-next-runtime`، باید در **همان شاخه و commit مورد استفادهٔ سایت** وجود داشته باشند. اگر شاخهٔ تولید `main` است، deploy شاخهٔ دیگر الزاماً سایت اصلی را به‌روز نمی‌کند.
- از deploy مبتنی بر Git یا دستور `netlify deploy --build --prod` استفاده کنید. آپلود دستی پوشهٔ خام `.next` یا ZIP سورس، مرحلهٔ build و آداپتور را اجرا نمی‌کند.

## ۲. متغیرهای محیطی و دیتابیس

| متغیر | کاربرد |
| --- | --- |
| `DATABASE_URL` | اتصال PostgreSQL برای ذخیره و بازیابی گزارش‌ها، شاخص‌ها و پنل مدیریت؛ باید در محدودهٔ **Functions/runtime** قابل دسترس باشد |
| `NEXT_PUBLIC_SITE_URL` | اختیاری؛ دامنهٔ اصلی مثل `https://example.netlify.app` برای لینک‌ها و sitemap |

برای دیتابیس بهتر است از اتصال pooled و SSL استفاده کنید و اسکیما را یک بار از محیطی با دسترسی به دیتابیس اعمال کنید:

```bash
DATABASE_URL="postgresql://..." npx drizzle-kit push --force
```

کلیدها و رشتهٔ اتصال را در Git قرار ندهید. `DATABASE_URL` برای build و نمایش صفحهٔ اصلی لازم نیست؛ بدون آن، `/api/health` مقدار `"database":"down"` می‌دهد و گزارش‌ها ذخیره نمی‌شوند.

## ۳. ساخت و بررسی محلی

```bash
npm ci
npm test
npm run lint
npm run typecheck
npx --yes netlify-cli@27.20.0 build --offline
```

در لاگ build نتلیفای باید موارد زیر دیده شوند:

1. `Using Next.js Runtime - v5...`
2. بسته‌بندی `___netlify-server-handler`
3. اجرای `verify-next-runtime (onPostBuild event)` و پیام `Verified the Next.js server function, application routes, and publish assets.`

هشدار غیرفعال بودن Skew Protection هنگام build با CLI آفلاین طبیعی است؛ این قابلیت جداگانه برای buildهای Netlify در `netlify.toml` فعال شده است. برای به‌روزرسانی آداپتور، dependency و lockfile را به‌روز و همین آزمون‌ها را دوباره اجرا کنید.

## ۴. انتشار و بررسی نسخهٔ زنده

1. تغییرات را در شاخه‌ای که سایت Netlify از آن build می‌شود قرار دهید. در بخش **Deploys**، یک deploy جدید را با **Clear cache and deploy site** اجرا کنید.
2. در لاگ deploy، وجود سه مورد بخش قبل و مسیر فایل پیکربندی درست را بررسی کنید. در خلاصهٔ deploy یا بخش Functions، تابع `___netlify-server-handler` باید وجود داشته باشد. عبارت `0 new function(s) to upload` به‌تنهایی کافی برای تشخیص نیست، چون ممکن است تابع قبلی بدون تغییر دوباره استفاده شود.
3. ابتدا **URL اختصاصی همان deploy** را باز کنید، سپس دامنهٔ اصلی را. صفحهٔ `/` و `/calculator` باید نمایش داده شوند و `/api/health` باید JSON حاوی `"service":"hermimetr"` برگرداند. `/images/hero-building.png` و فایل‌های `/_next/static/` نیز باید بارگذاری شوند.
4. یک مسیر عمداً ناموجود باید پاسخ **۴۰۴** دهد. پس از راه‌اندازی دیتابیس، یک برآورد ثبت کنید و فقط با کد واقعی آن، `/report/[ref]` را بررسی کنید.

اگر URL اختصاصی deploy درست است ولی دامنهٔ اصلی هنوز ۴۰۴ می‌دهد، بررسی کنید deploy منتشرشده نسخهٔ تولید است و دامنه به همان سایت Netlify متصل است. در صورت ادامهٔ مشکل، URL سایت، URL deploy، نام شاخه/commit و بخش‌های مربوط به Runtime و Functions در لاگ deploy برای تشخیص لازم‌اند؛ متغیرهای محرمانه را ارسال نکنید.

## ۵. خطاهای رایج

| نشانه | بررسی |
| --- | --- |
| پیام Netlify «Page not found» با وجود build موفق | اول commit و Base directory را بررسی کنید؛ سپس مطمئن شوید `netlify.toml` خوانده شده، Runtime و تابع سرور در همان deploy وجود دارند و deploy جدید روی دامنهٔ درست منتشر شده است. |
| خطای `NETLIFY_NEXT_PLUGIN_SKIP` | این متغیر را از Environment variables حذف و مجدداً deploy کنید. |
| خطای افزونهٔ `verify-next-runtime` | جزئیات خطا را در لاگ ببینید؛ آداپتور باید اجرا شود، تابع و مسیرهای آن بسته‌بندی شوند و publish directory برابر `.next` باشد. |
| `/api/health` مقدار `database: down` دارد | `DATABASE_URL`، محدودهٔ Functions، SSL، دسترسی شبکه و اعمال اسکیما را بررسی کنید؛ این مشکل علت ۴۰۴ صفحهٔ اصلی نیست. |
| گزارش مشخصی ۴۰۴ می‌دهد | از درستی کد گزارش و وجود آن در دیتابیس همان محیط مطمئن شوید. |
| خطای نسخهٔ Node یا dependency | Node 22 و نصب وابستگی‌های توسعه را بررسی کنید؛ cache را پاک کرده و مجدداً deploy کنید. |
