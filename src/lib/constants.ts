/** Domain types & option catalogs for the construction-cost estimator (Iran market, 1404). */

export type UsageType = "residential" | "mixed" | "commercial";
export type StructureType = "concrete" | "steel";
export type QualityLevel = "economic" | "standard" | "good" | "luxury";
export type HeatingSystem = "radiator" | "floorheat" | "ductsplit" | "chiller";
export type FacadeType = "travertine" | "brick" | "composite" | "cement";
export type WindowType = "upvc" | "aluminum";
export type LandscapeLevel = "none" | "basic" | "full";
export type LotPosition = "single" | "corner" | "triple";
export type DeedType = "official" | "contract";
export type CeilingHeight = "normal" | "tall";
export type SlabType = "joist" | "slab" | "deck";
export type WaterTable = "low" | "high";
export type FacadeStyle = "modern" | "classic" | "minimal";
export type SmartLevel = "none" | "basic" | "full";

export interface Province {
  id: string;
  label: string;
  coef: number;
}

/** All 31 provinces of Iran with a construction cost index coefficient. */
export const PROVINCES: Province[] = [
  { id: "tehran", label: "تهران", coef: 1.18 },
  { id: "alborz", label: "البرز", coef: 1.12 },
  { id: "isfahan", label: "اصفهان", coef: 1.05 },
  { id: "khorasan-razavi", label: "خراسان رضوی", coef: 1.04 },
  { id: "fars", label: "فارس", coef: 1.02 },
  { id: "khuzestan", label: "خوزستان", coef: 1.0 },
  { id: "azarbaijan-east", label: "آذربایجان شرقی", coef: 1.02 },
  { id: "gilan", label: "گیلان", coef: 1.03 },
  { id: "mazandaran", label: "مازندران", coef: 1.04 },
  { id: "qom", label: "قم", coef: 1.0 },
  { id: "yazd", label: "یزد", coef: 0.98 },
  { id: "kerman", label: "کرمان", coef: 0.97 },
  { id: "west-azarbaijan", label: "آذربایجان غربی", coef: 0.98 },
  { id: "hormozgan", label: "هرمزگان", coef: 1.02 },
  { id: "golestan", label: "گلستان", coef: 0.96 },
  { id: "hamadan", label: "همدان", coef: 0.96 },
  { id: "lorestan", label: "لرستان", coef: 0.94 },
  { id: "markazi", label: "مرکزی", coef: 0.96 },
  { id: "kurdistan", label: "کردستان", coef: 0.94 },
  { id: "ardabil", label: "اردبیل", coef: 0.95 },
  { id: "bushehr", label: "بوشهر", coef: 0.99 },
  { id: "zanjan", label: "زنجان", coef: 0.94 },
  { id: "qazvin", label: "قزوین", coef: 0.97 },
  { id: "semnan", label: "سمنان", coef: 0.95 },
  { id: "chaharmahal", label: "چهارمحال و بختیاری", coef: 0.93 },
  { id: "kohgiluyeh", label: "کهگیلویه و بویراحمد", coef: 0.93 },
  { id: "north-khorasan", label: "خراسان شمالی", coef: 0.93 },
  { id: "south-khorasan", label: "خراسان جنوبی", coef: 0.92 },
  { id: "sistan", label: "سیستان و بلوچستان", coef: 0.96 },
  { id: "ilam", label: "ایلام", coef: 0.92 },
];

export interface OptionDef<T extends string = string> {
  value: T;
  label: string;
  desc?: string;
  emoji?: string;
}

export const USAGE_OPTIONS: OptionDef<UsageType>[] = [
  { value: "residential", label: "مسکونی", desc: "آپارتمان یا خانه‌ی مسکونی", emoji: "🏢" },
  { value: "mixed", label: "مسکونی – تجاری", desc: "طبقات مسکونی روی تجاری/اداری", emoji: "🏬" },
  { value: "commercial", label: "تجاری – اداری", desc: "مجتمع تجاری، اداری یا خدماتی", emoji: "🏛️" },
];

export const STRUCTURE_OPTIONS: OptionDef<StructureType>[] = [
  { value: "concrete", label: "اسکلت بتنی", desc: "رایج‌ترین و مقرون‌به‌صرفه‌ترین؛ مطابق مبحث نهم", emoji: "🧱" },
  { value: "steel", label: "اسکلت فلزی", desc: "سرعت اجرای بالاتر و دهانه‌های بلندتر؛ مطابق مبحث دهم", emoji: "🏗️" },
];

export const QUALITY_OPTIONS: OptionDef<QualityLevel>[] = [
  { value: "economic", label: "اقتصادی", desc: "مصالح استاندارد با کمترین هزینه", emoji: "💡" },
  { value: "standard", label: "متوسط", desc: "کیفیت متعارف بازار مسکن ایران", emoji: "✅" },
  { value: "good", label: "خوب", desc: "برندهای معتبر ایرانی و خارجی", emoji: "⭐" },
  { value: "luxury", label: "لوکس", desc: "متریال درجه یک، طراحی خاص و هوشمندسازی", emoji: "👑" },
];

export const HEATING_OPTIONS: OptionDef<HeatingSystem>[] = [
  { value: "radiator", label: "پکیج و رادیاتور", desc: "رایج‌ترین سیستم گرمایش کشور", emoji: "🔥" },
  { value: "floorheat", label: "گرمایش از کف", desc: "آسایش حرارتی بالاتر", emoji: "♨️" },
  { value: "ductsplit", label: "داکت اسپلیت", desc: "سرمایش و گرمایش مرکزی هر واحد", emoji: "❄️" },
  { value: "chiller", label: "چیلر و فن‌کوئل", desc: "سیستم مرکزی ساختمان‌های بزرگ و لوکس", emoji: "🧊" },
];

export const FACADE_OPTIONS: OptionDef<FacadeType>[] = [
  { value: "travertine", label: "سنگ تراورتن", desc: "نمای کلاسیک و پرتقاضای بازار ایران", emoji: "🪨" },
  { value: "brick", label: "آجر نسوز نما", desc: "مدرن، بادوام و مقرون‌به‌صرفه", emoji: "🧱" },
  { value: "composite", label: "ترکیب سنگ و کامپوزیت", desc: "نمای مدرن با باکس و ترموود", emoji: "⬛" },
  { value: "cement", label: "سیمان شسته / رنگی", desc: "کم‌هزینه‌ترین گزینه‌ی نما", emoji: "🎨" },
];

export const WINDOW_OPTIONS: OptionDef<WindowType>[] = [
  { value: "upvc", label: "UPVC دو جداره", desc: "عایق صوت و حرارت؛ استاندارد رایج", emoji: "🪟" },
  { value: "aluminum", label: "آلومینیوم ترمال‌بریک", desc: "مقاومت و عمر بیشتر؛ مناسب لوکس", emoji: "🔲" },
];

export const LANDSCAPE_OPTIONS: OptionDef<LandscapeLevel>[] = [
  { value: "none", label: "بدون محوطه‌سازی", emoji: "⛔" },
  { value: "basic", label: "محوطه‌سازی ساده", desc: "کف‌سازی حیاط، فضای سبز پایه و روشنایی", emoji: "🌿" },
  { value: "full", label: "محوطه‌سازی کامل", desc: "فضای سبز طراحی‌شده، آبنما و مبلمان محوطه", emoji: "🌳" },
];

export const LOT_OPTIONS: OptionDef<LotPosition>[] = [
  { value: "single", label: "تک‌بر", desc: "یک گذر؛ دو طرف همسایه (نمای جلو و حیاط)", emoji: "🏘️" },
  { value: "corner", label: "نبش (دو بر)", desc: "دو ضلع آزاد — ارزش و هزینه نمای بیشتر", emoji: "🏙️" },
  { value: "triple", label: "سه‌بر", desc: "سه ضلع آزاد؛ بیشترین سطح نما", emoji: "🌆" },
];

export const DEED_OPTIONS: OptionDef<DeedType>[] = [
  { value: "official", label: "سند رسمی تک‌برگ", desc: "بدون محدودیت برای صدور پروانه", emoji: "✅" },
  { value: "contract", label: "قولنامه‌ای / در حال انتقال", desc: "استعلام شهرداری پیش از معامله توصیه می‌شود", emoji: "📝" },
];

export const CEILING_OPTIONS: OptionDef<CeilingHeight>[] = [
  { value: "normal", label: "ارتفاع معمول", desc: "۳٫۱ متر — استاندارد آپارتمان‌های ایران", emoji: "📏" },
  { value: "tall", label: "سقف بلند", desc: "۳٫۴۵ متر — لوکس‌تر؛ افزایش گچ، رنگ و نما", emoji: "🏰" },
];

export const SLAB_OPTIONS: OptionDef<SlabType>[] = [
  { value: "joist", label: "تیرچه بلوک", desc: "رایج‌ترین و اقتصادی‌ترین سقف", emoji: "🟫" },
  { value: "slab", label: "دال بتنی", desc: "صلبیت بالا؛ بتن و قالب‌بندی بیشتر", emoji: "🟦" },
  { value: "deck", label: "عرشه فولادی", desc: "سبک و سریع؛ مناسب اسکلت فلزی", emoji: "🟧" },
];

export const WATER_TABLE_OPTIONS: OptionDef<WaterTable>[] = [
  { value: "low", label: "سطح آب پایین", desc: "بدون تمهید ویژه آب‌بندی", emoji: "🏜️" },
  { value: "high", label: "سطح آب بالا", desc: "نیازمند عایق بدنه فونداسیون و زهکش", emoji: "💧" },
];

export const FACADE_STYLE_OPTIONS: OptionDef<FacadeStyle>[] = [
  { value: "modern", label: "مدرن", desc: "خطوط صاف، باکس و ترکیب مصالح", emoji: "🔳" },
  { value: "classic", label: "کلاسیک (رومی)", desc: "ابزار، سرستون و قاب‌بندی — پرهزینه‌تر", emoji: "🏛️" },
  { value: "minimal", label: "مینیمال", desc: "سطوح یکدست و کم‌جزئیات — کم‌هزینه‌تر", emoji: "◽" },
];

export const SMART_OPTIONS: OptionDef<SmartLevel>[] = [
  { value: "none", label: "بدون هوشمندسازی", emoji: "🚫" },
  { value: "basic", label: "هوشمندسازی پایه", desc: "روشنایی و کنترل گرمایش/سرمایش", emoji: "💡" },
  { value: "full", label: "خانه هوشمند کامل", desc: "BMS، پرده برقی، سناریو و امنیت", emoji: "🤖" },
];

export const ELEVATOR_PERSONS_OPTIONS = [4, 6, 8] as const;

export interface CalcInputs {
  provinceId: string;
  usageType: UsageType;
  /** Plot width (بر) in meters. */
  landWidth: number;
  /** Plot depth (طول) in meters. */
  landDepth: number;
  /** Kept for backward compatibility = width × depth. */
  landArea: number;
  lotPosition: LotPosition;
  deedType: DeedType;
  floors: number;
  unitsPerFloor: number;
  /** Commercial/administrative floors on top of residential ones. */
  commercialFloors: number;
  occupancyPct: number;
  parkingCount: number;
  hasBasement: boolean;
  structureType: StructureType;
  slabType: SlabType;
  ceilingHeight: CeilingHeight;
  waterTable: WaterTable;
  quality: QualityLevel;
  heatingSystem: HeatingSystem;
  facadeType: FacadeType;
  facadeStyle: FacadeStyle;
  windowType: WindowType;
  landscapeLevel: LandscapeLevel;
  smartLevel: SmartLevel;
  hasElevator: boolean;
  elevatorPersons: number;
  hasGenerator: boolean;
  /** Assumed annual price inflation during construction (%). */
  inflationPct: number;
}

export const DEFAULT_INPUTS: CalcInputs = {
  provinceId: "tehran",
  usageType: "residential",
  landWidth: 12,
  landDepth: 17,
  landArea: 204,
  lotPosition: "single",
  deedType: "official",
  floors: 5,
  unitsPerFloor: 2,
  commercialFloors: 0,
  occupancyPct: 60,
  parkingCount: 10,
  hasBasement: true,
  structureType: "concrete",
  slabType: "joist",
  ceilingHeight: "normal",
  waterTable: "low",
  quality: "standard",
  heatingSystem: "radiator",
  facadeType: "travertine",
  facadeStyle: "modern",
  windowType: "upvc",
  landscapeLevel: "basic",
  smartLevel: "none",
  hasElevator: true,
  elevatorPersons: 6,
  hasGenerator: false,
  inflationPct: 30,
};

/** Quality multipliers per work-class. */
export const QUALITY_MULTIPLIERS: Record<QualityLevel, Record<"structure" | "finish" | "mep" | "facade", number>> = {
  economic: { structure: 0.92, finish: 0.62, mep: 0.78, facade: 0.7 },
  standard: { structure: 1, finish: 1, mep: 1, facade: 1 },
  good: { structure: 1.06, finish: 1.4, mep: 1.24, facade: 1.35 },
  luxury: { structure: 1.18, finish: 2.6, mep: 2.0, facade: 2.5 },
};

/** Percentage-based statutory fees (of physical subtotal). */
export const FEE_RATES = {
  municipality: 0.055,
  nezam: 0.028,
  insuranceLab: 0.009,
  hse: 0.005,
  contingency: 0.05,
} as const;

export function provinceById(id: string): Province {
  return PROVINCES.find((p) => p.id === id) ?? PROVINCES[0];
}

export function labelFor(options: readonly OptionDef[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
