/**
 * Base price catalog — Iranian construction market.
 * Reference date (مبنای قیمت): ۱۴۰۵/۰۸/۲۸.
 * The RAW figures below are late-1404 levels; every entry is automatically
 * escalated to the 1405 reference using split material/wage growth factors
 * (material ×1.34, wage ×1.46 — consistent with فهرست بها trends and the
 * 1405 minimum-wage decree). Afterward, live movements are tracked by the
 * automatic price-index system (lib/indices.ts) — no manual edits needed.
 */

export type PriceClass = "structure" | "finish" | "mep" | "facade" | "earth" | "fees";

export interface CatalogItem {
  key: string;
  label: string;
  unit: string;
  /** Composite unit price in toman at the reference date. */
  price: number;
  /** Share of labor (دستمزد) in the composite price, 0..1. */
  lab: number;
  cls: PriceClass;
  src: string;
  note?: string;
}

const S_BONYAD = "فهرست بهای ابنیه ۱۴۰۵";
const S_MARKET = "استعلام بازار — آبان ۱۴۰۵";
const S_NEZAM = "تعرفه نظام مهندسی ۱۴۰۵";

interface Raw extends Omit<CatalogItem, "price"> {
  raw: number;
}

const r1k = (n: number) => Math.round(n / 1000) * 1000;

/** 1404 → 1405 escalation (reference 28 Aban 1405). */
const MAT_GROWTH = 1.34;
const WAGE_GROWTH = 1.46;

const RAW: Raw[] = [
  // ── خاکبرداری، گود و کارگاه ───────────────────────────────
  { key: "excavation", label: "خاکبرداری مکانیکی با حمل و تخلیه مجاز", unit: "مترمکعب", raw: 435_000, lab: 0.22, cls: "earth", src: `${S_BONYAD}، فصل اول` },
  { key: "retaining", label: "سازه نگهبان (نیلینگ، خرپا، شاتکریت)", unit: "مترمربع", raw: 3_450_000, lab: 0.45, cls: "earth", src: `${S_BONYAD}، فصل دوم`, note: "مطابق مبحث ۷ و ۱۲ مقررات ملی" },
  { key: "leveling", label: "تسطیح، کرسی‌چینی و بتن مگر", unit: "مترمربع", raw: 295_000, lab: 0.35, cls: "earth", src: `${S_BONYAD}، فصل پنجم` },
  { key: "waste_removal", label: "حمل نخاله و پاکسازی مستمر کارگاه", unit: "مترمربع", raw: 98_000, lab: 0.3, cls: "earth", src: S_MARKET },
  { key: "site_services", label: "انشعاب موقت، آب و برق کارگاهی", unit: "مترمربع", raw: 38_000, lab: 0.5, cls: "earth", src: S_MARKET },
  { key: "fence_wall", label: "دیوارکشی محوطه و درب ورودی", unit: "مترطول", raw: 1_780_000, lab: 0.4, cls: "earth", src: S_MARKET },

  // ── اسکلت و فونداسیون ─────────────────────────────────────
  { key: "concrete_fnd", label: "بتن فونداسیون C30 با پمپاژ و ویبره", unit: "مترمکعب", raw: 5_750_000, lab: 0.2, cls: "structure", src: `${S_BONYAD}، فصل پنجم`, note: "+۳٪ پرت اجرا در مقدار لحاظ شده" },
  { key: "concrete_col", label: "بتن ستون‌ها و دیوارهای برشی", unit: "مترمکعب", raw: 5_950_000, lab: 0.24, cls: "structure", src: `${S_BONYAD}، فصل نهم` },
  { key: "concrete_slab", label: "بتن سقف و تیرها (دال/تیرچه)", unit: "مترمکعب", raw: 5_650_000, lab: 0.22, cls: "structure", src: `${S_BONYAD}، فصل هشتم` },
  { key: "rebar_fnd", label: "میلگرد A3 فونداسیون با آرماتوربندی", unit: "کیلوگرم", raw: 49_500, lab: 0.26, cls: "structure", src: S_MARKET, note: "+۵٪ پرت برش و خاموت" },
  { key: "rebar_col", label: "میلگرد A3 ستون‌ها و برشی", unit: "کیلوگرم", raw: 49_500, lab: 0.3, cls: "structure", src: S_MARKET },
  { key: "rebar_slab", label: "میلگرد و مش A3 سقف و تیر", unit: "کیلوگرم", raw: 49_500, lab: 0.28, cls: "structure", src: S_MARKET },
  { key: "steel_profile", label: "پروفیل ST37 با ساخت کارخانه‌ای و نصب", unit: "کیلوگرم", raw: 86_000, lab: 0.24, cls: "structure", src: S_MARKET, note: "مطابق مبحث دهم؛ جوش و پیچ‌مهره شامل است" },
  { key: "steel_conn", label: "اتصالات، بیس‌پلیت و مهاربند", unit: "مترمربع", raw: 175_000, lab: 0.4, cls: "structure", src: S_MARKET },
  { key: "formwork", label: "قالب‌بندی فلزی و شمع‌بندی", unit: "مترمربع", raw: 545_000, lab: 0.45, cls: "structure", src: `${S_BONYAD}، فصل هشتم` },
  { key: "crane_hoist", label: "بالابر کارگاهی / اجاره تاورکرین", unit: "طبقه", raw: 22_000_000, lab: 0.6, cls: "structure", src: S_MARKET },
  { key: "pump_pour", label: "پمپ دکل و تجهیزات بتن‌ریزی", unit: "مرحله بتن‌ریزی", raw: 10_500_000, lab: 0.5, cls: "structure", src: S_MARKET },

  // ── بام ───────────────────────────────────────────────────
  { key: "roof_insulation", label: "ایزوگام دولایه بام + فوم حرارتی", unit: "مترمربع", raw: 465_000, lab: 0.38, cls: "finish", src: S_MARKET, note: "مطابق مبحث ۱۹ صرفه‌جویی انرژی" },
  { key: "roof_parapet", label: "جان‌پناه، ماهیچه و فلاشینگ", unit: "مترطول", raw: 655_000, lab: 0.45, cls: "finish", src: S_MARKET },

  // ── دیوارچینی ────────────────────────────────────────────
  { key: "wall_ext", label: "دیوار پیرامونی لیکا/سیمانی ۲۰ + وال‌پست", unit: "مترمربع", raw: 670_000, lab: 0.4, cls: "structure", src: `${S_BONYAD}، فصل چهاردهم`, note: "وال‌پست طبق مبحث ۸" },
  { key: "wall_int", label: "تیغه داخلی سفال/بلوک سبک ۱۰", unit: "مترمربع", raw: 495_000, lab: 0.42, cls: "structure", src: `${S_BONYAD}، فصل چهاردهم` },

  // ── نازک‌کاری ─────────────────────────────────────────────
  { key: "plaster_combo", label: "گچ‌وخاک + گچ سفید (دیوار و سقف)", unit: "مترمربع", raw: 585_000, lab: 0.55, cls: "finish", src: `${S_BONYAD}، فصل پانزدهم` },
  { key: "konaf", label: "سقف کاذب کناف و نورمخفی", unit: "مترمربع", raw: 415_000, lab: 0.5, cls: "finish", src: S_MARKET },
  { key: "flooring", label: "کفسازی، پوکه‌ریزی و سنگ/سرامیک/لمینت", unit: "مترمربع", raw: 1_720_000, lab: 0.33, cls: "finish", src: S_MARKET, note: "+۸٪ پرت برش کاشی/سنگ" },
  { key: "tiling_wet", label: "کاشی دیوار و سرامیک کف سرویس‌ها", unit: "مترمربع", raw: 1_450_000, lab: 0.4, cls: "finish", src: S_MARKET },
  { key: "wet_waterproof", label: "عایق رطوبتی QR سرویس‌ها", unit: "مترمربع", raw: 415_000, lab: 0.45, cls: "finish", src: S_MARKET },
  { key: "paint", label: "نقاشی کامل (ماستیک + اکرلیک/روغنی)", unit: "مترمربع", raw: 198_000, lab: 0.62, cls: "finish", src: `${S_BONYAD}، فصل شانزدهم` },
  { key: "door_interior", label: "درب داخلی MDF روکش پلی‌اورتان", unit: "عدد", raw: 15_800_000, lab: 0.22, cls: "finish", src: S_MARKET },
  { key: "door_entry", label: "درب ضد سرقت واحد با قفل کتابی", unit: "عدد", raw: 37_500_000, lab: 0.18, cls: "finish", src: S_MARKET },
  { key: "cabinet_run", label: "کابینت آشپزخانه هایگلاس/پلی‌اورتان", unit: "مترطول", raw: 31_500_000, lab: 0.28, cls: "finish", src: S_MARKET },
  { key: "countertop_run", label: "صفحه کابینت کورین/سنگ طبیعی", unit: "مترطول", raw: 12_500_000, lab: 0.25, cls: "finish", src: S_MARKET },
  { key: "wardrobe_unit", label: "کمد دیواری ام‌دی‌اف اتاق‌ها", unit: "واحد مسکونی", raw: 86_000_000, lab: 0.25, cls: "finish", src: S_MARKET },
  { key: "stair_finish", label: "سنگ پله، پاگرد و نرده استیل", unit: "بازوی پله", raw: 31_500_000, lab: 0.4, cls: "finish", src: S_MARKET },
  { key: "lobby_decor", label: "دکوراسیون لابی، سنگ مشاعات و نورپردازی", unit: "واحد مسکونی", raw: 14_500_000, lab: 0.55, cls: "finish", src: S_MARKET },

  // ── تأسیسات مکانیکی ───────────────────────────────────────
  { key: "mech_base", label: "لوله‌کشی آب سرد/گرم، فاضلاب و کلکتور", unit: "مترمربع", raw: 345_000, lab: 0.4, cls: "mep", src: `${S_BONYAD}، فصل بیستم`, note: "مطابق مبحث ۱۶" },
  { key: "gas_piping", label: "لوله‌کشی گاز با تأییدیه شرکت گاز", unit: "واحد مسکونی", raw: 12_500_000, lab: 0.45, cls: "mep", src: S_MARKET, note: "مبحث ۱۷" },
  { key: "fire_fighting", label: "اعلام و اطفاء حریق مشاعات", unit: "مترمربع", raw: 118_000, lab: 0.3, cls: "mep", src: S_MARKET, note: "ضوابط آتش‌نشانی و مبحث ۳" },
  { key: "pkg_boiler", label: "پکیج دیواری فن‌دار + دودکش و اتصالات", unit: "واحد مسکونی", raw: 58_000_000, lab: 0.15, cls: "mep", src: S_MARKET },
  { key: "radiator_section", label: "رادیاتور آلومینیومی با شیر و نصب", unit: "پره", raw: 2_250_000, lab: 0.28, cls: "mep", src: S_MARKET, note: "ظرفیت هر پره ≈ ۱۳۵ کیلوکالری/ساعت" },
  { key: "hvac_floorheat", label: "گرمایش از کف کامل هر واحد", unit: "واحد مسکونی", raw: 138_000_000, lab: 0.35, cls: "mep", src: S_MARKET },
  { key: "hvac_ductsplit", label: "داکت اسپلیت کانالی هر واحد", unit: "واحد مسکونی", raw: 185_000_000, lab: 0.25, cls: "mep", src: S_MARKET },
  { key: "hvac_chiller", label: "چیلر، فن‌کوئل و کانال‌کشی مرکزی", unit: "مترمربع", raw: 1_520_000, lab: 0.3, cls: "mep", src: S_MARKET },
  { key: "water_tank", label: "منبع ذخیره، پمپ‌خانه و بوستر", unit: "واحد مسکونی", raw: 15_500_000, lab: 0.3, cls: "mep", src: S_MARKET },
  { key: "fixture_faucet", label: "شیرآلات بهداشتی komplet (روشویی/حمام/سینک)", unit: "ست", raw: 6_900_000, lab: 0.25, cls: "mep", src: S_MARKET },
  { key: "fixture_wc", label: "فرنگی/ایرانی با فلاش‌تانک و متعلقات", unit: "عدد", raw: 9_200_000, lab: 0.25, cls: "mep", src: S_MARKET },
  { key: "fixture_shower", label: "دوش، وان یا کابین دوش", unit: "عدد", raw: 5_400_000, lab: 0.25, cls: "mep", src: S_MARKET },
  { key: "fixture_washer", label: "انواع لوله‌کشی ماشین لباس‌شویی", unit: "عدد", raw: 2_300_000, lab: 0.35, cls: "mep", src: S_MARKET },
  { key: "fixture_kitchensink", label: "سینک ظرفشویی دولگنه + شیر علم‌دار", unit: "عدد", raw: 5_800_000, lab: 0.25, cls: "mep", src: S_MARKET },

  // ── تأسیسات برقی ──────────────────────────────────────────
  { key: "elec_infra", label: "زیرسازی برق، لوله‌گذاری و سینه‌کشی", unit: "مترمربع", raw: 215_000, lab: 0.5, cls: "mep", src: `${S_BONYAD}، فصل نوزدهم`, note: "مبحث ۱۳" },
  { key: "point_outlet", label: "نقطه پریز برق کامل (سیم، قوطی، مکانیزم)", unit: "نقطه", raw: 1_180_000, lab: 0.45, cls: "mep", src: S_MARKET },
  { key: "point_switch", label: "نقطه کلید روشنایی کامل", unit: "نقطه", raw: 1_080_000, lab: 0.45, cls: "mep", src: S_MARKET },
  { key: "point_light", label: "نقطه روشنایی با چراغ و هالوژن", unit: "نقطه", raw: 1_550_000, lab: 0.42, cls: "mep", src: S_MARKET },
  { key: "point_data", label: "نقطه شبکه/تلویزیون و آیفون تصویری", unit: "نقطه", raw: 1_450_000, lab: 0.4, cls: "mep", src: S_MARKET },
  { key: "unit_panel", label: "تابلو برق واحد و مشاعات با کلید محافظ", unit: "واحد مسکونی", raw: 16_500_000, lab: 0.35, cls: "mep", src: S_MARKET },
  { key: "security_system", label: "دوربین مداربسته و اعلام سرقت", unit: "واحد مسکونی", raw: 21_500_000, lab: 0.35, cls: "mep", src: S_MARKET },
  { key: "lightning_arrest", label: "صاعقه‌گیر و سیستم ارتینگ", unit: "ساختمان", raw: 52_000_000, lab: 0.4, cls: "mep", src: S_MARKET },

  // ── نما و بازشوها ─────────────────────────────────────────
  { key: "facade_travertine", label: "نمای تراورتن درجه یک با اسکوپ", unit: "مترمربع", raw: 2_480_000, lab: 0.45, cls: "facade", src: S_MARKET },
  { key: "facade_brick", label: "نمای آجر نسوز با زیرسازی", unit: "مترمربع", raw: 1_320_000, lab: 0.45, cls: "facade", src: S_MARKET },
  { key: "facade_composite", label: "نمای ترکیبی سنگ، کامپوزیت و ترموود", unit: "مترمربع", raw: 2_180_000, lab: 0.42, cls: "facade", src: S_MARKET },
  { key: "facade_cement", label: "نمای سیمانی شسته/رنگی", unit: "مترمربع", raw: 515_000, lab: 0.5, cls: "facade", src: S_MARKET },
  { key: "scaffold", label: "داربست فلزی و بالابر نما", unit: "مترمربع", raw: 72_000, lab: 0.6, cls: "facade", src: S_MARKET },
  { key: "window_upvc", label: "پنجره UPVC دوجداره با یراق استاندارد", unit: "مترمربع", raw: 11_500_000, lab: 0.22, cls: "facade", src: S_MARKET, note: "مطابق مبحث ۱۹" },
  { key: "window_aluminum", label: "پنجره آلومینیوم ترمال‌بریک سه‌جداره", unit: "مترمربع", raw: 20_500_000, lab: 0.22, cls: "facade", src: S_MARKET },

  // ── آسانسور ──────────────────────────────────────────────
  { key: "elevator_base", label: "آسانسور کامل کششی با استاندارد ملی", unit: "دستگاه", raw: 1_250_000_000, lab: 0.18, cls: "mep", src: S_MARKET, note: "ظرفیت پایه ۴ نفر" },
  { key: "elevator_person", label: "ارتقای ظرفیت کابین و موتور", unit: "نفر اضافه", raw: 155_000_000, lab: 0.18, cls: "mep", src: S_MARKET },
  { key: "elevator_floor", label: "ریل، درب و توقف طبقات", unit: "طبقه", raw: 58_000_000, lab: 0.3, cls: "mep", src: S_MARKET },

  // ── محوطه ─────────────────────────────────────────────────
  { key: "paving_basic", label: "سنگ‌فرش حیاط و رمپ پارکینگ", unit: "مترمربع", raw: 840_000, lab: 0.35, cls: "finish", src: S_MARKET },
  { key: "paving_full", label: "فضای سبز، آبنما، نورپردازی و مبلمان", unit: "مترمربع", raw: 1_850_000, lab: 0.45, cls: "finish", src: S_MARKET },

  // ── خدمات مهندسی ثابت ─────────────────────────────────────
  { key: "geotech", label: "مطالعات ژئوتکنیک و آزمایش خاک", unit: "پروژه", raw: 16_500_000, lab: 0.3, cls: "fees", src: S_NEZAM, note: "الزام مبحث هفتم" },
  { key: "surveying", label: "نقشه‌برداری وضع موجود و پیاده‌سازی", unit: "پروژه", raw: 8_500_000, lab: 0.35, cls: "fees", src: S_NEZAM },

  // ── موارد ویژه (فیلترهای پیشرفته) ────────────────────────
  { key: "fnd_waterproof", label: "عایق رطوبتی بدنه فونداسیون + زهکش محیطی", unit: "مترمربع", raw: 425_000, lab: 0.45, cls: "earth", src: S_MARKET, note: "برای سطح آب زیرزمینی بالا" },
  { key: "smart_basic", label: "هوشمندسازی پایه واحد (روشنایی و ترموستات)", unit: "واحد مسکونی", raw: 29_000_000, lab: 0.3, cls: "mep", src: S_MARKET },
  { key: "smart_full", label: "خانه هوشمند کامل BMS هر واحد", unit: "واحد مسکونی", raw: 98_000_000, lab: 0.3, cls: "mep", src: S_MARKET },
  { key: "generator_set", label: "دیزل ژنراتور اضطراری مشاعات و آسانسور", unit: "واحد مسکونی", raw: 8_800_000, lab: 0.2, cls: "mep", src: S_MARKET, note: "ظرفیت ≈ ۳ کیلوولت‌آمپر بر واحد" },
  { key: "facade_classic", label: "ابزار، سرستون و قاب‌بندی نمای کلاسیک", unit: "مترمربع", raw: 520_000, lab: 0.55, cls: "facade", src: S_MARKET, note: "سبک رومی؛ GRC و سنگ تراش" },
];

/** Escalated to the 1405 reference date (material/wage split). */
export const CATALOG: CatalogItem[] = RAW.map(({ raw, lab, ...rest }) => ({
  ...rest,
  lab,
  price: r1k(raw * (1 - lab) * MAT_GROWTH + raw * lab * WAGE_GROWTH),
}));

export const PRICE_REFERENCE_DATE = "۱۴۰۵/۰۸/۲۸";
export const REFRESH_FACTORS = { MAT_GROWTH, WAGE_GROWTH };

export function catalogMap(): Map<string, CatalogItem> {
  return new Map(CATALOG.map((c) => [c.key, c]));
}
