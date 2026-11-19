/**
 * Component-level takeoff (ریزِ ریز مصالح) — breaks every composite work item
 * into individual raw materials, consumables, purchased equipment, tools and
 * labor requirements, following standard Iranian consumption norms.
 * Reference prices: میانگین بازار آبان ۱۴۰۵ (تومان); scales by live indices.
 */
import type { EstimateResult } from "./engine";
import { faNum } from "./format";

export interface BomRow {
  code: string;
  title: string;
  qty: number;
  unit: string;
  /** Market unit price (toman). */
  unitPrice: number;
  /** Estimated supply cost (toman). */
  total: number;
  basis: string;
}

export interface BomSection {
  id: string;
  title: string;
  emoji: string;
  color: string;
  rows: BomRow[];
  total: number;
}

export interface EquipmentRow {
  title: string;
  qty: number;
  unit: string;
  total: number;
  note: string;
}

export interface ToolRow {
  title: string;
  qtyText: string;
  basis: string;
}

export interface LaborRow {
  trade: string;
  emoji: string;
  personDays: number;
  teamMonths: number;
}

export interface FullBom {
  sections: BomSection[];
  grandTotal: number;
  equipment: EquipmentRow[];
  tools: ToolRow[];
  labor: LaborRow[];
  totalPersonDays: number;
}

/* ── مرجع قیمت مواد خام — آبان ۱۴۰۵ (تومان) ─────────────── */
const P: Record<string, number> = {
  cement_bag: 100_000, // کیسه ۵۰ کیلویی تیپ ۲
  sand_m3: 520_000,
  gravel_m3: 650_000,
  admix_kg: 95_000, // روان‌کننده
  rebar_kg: 49_500,
  wire_kg: 95_000, // مفتول گره‌زنی
  spacer_pc: 9_000,
  steel_kg: 86_000,
  electrode_kg: 195_000,
  bolt_pc: 145_000,
  antirust_l: 285_000,
  formoil_l: 185_000,
  nail_kg: 78_000,
  lica_pc: 42_000, // بلوک لیکا ۲۰
  sofal_pc: 18_500, // سفال تیغه ۱۰
  gypsum_bag: 95_000, // کیسه ۴۰ کیلویی
  tile_m2: 560_000, // پرسلان درجه یک
  adhesive_bag: 245_000, // چسب کاشی ۲۵ کیلویی
  grout_kg: 66_000, // پودر بندکشی
  qr_kg: 190_000, // عایق قیری سرد
  isogam_roll: 1_980_000,
  mastic_kg: 62_000,
  flashing_m: 345_000, // ورق گالوانیزه فلاشینگ
  primer_l: 98_000,
  paint_l: 140_000, // اکرلیک/روغنی
  putty_kg: 24_000, // بتونه و ماستیک
  travertine_m2: 1_450_000,
  scope_pc: 88_000, // اسکوپ نگهدارنده سنگ
  foam_can: 325_000, // فوم پلی‌اورتان
  silicone_tube: 195_000,
  pex_m: 99_000, // پنج‌لایه ۱۶/۲۰
  pvc110_m: 198_000,
  pvc63_m: 128_000,
  gas34_m: 175_000, // لوله گاز ¾
  gas12_m: 138_000, // لوله گاز ½
  gasvalve_pc: 660_000,
  fitting_pc: 92_000, // میانگین انواع اتصال
  cable25_m: 47_000,
  cable15_m: 33_000,
  cable4_m: 80_000,
  cat6_m: 29_000,
  coax_m: 33_000,
  conduit_m: 27_000,
  jbox_pc: 46_000,
  outlet_pc: 285_000,
  switch_pc: 255_000,
  luminaire_pc: 980_000,
  mcb_pc: 560_000,
  rcd_pc: 2_450_000,
  earthing_set: 3_300_000,
  thermhead_pc: 1_380_000,
  flordrain_pc: 460_000,
  shotcrete_m3: 6_800_000,
  mesh_m2: 135_000,
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const r1k = (n: number) => Math.round(n / 1000) * 1000;

let seq = 0;
function row(code: string, title: string, qtyRaw: number, unit: string, priceKey: string, basis: string, scale = 1): BomRow {
  const qty = Math.max(0, r2(qtyRaw));
  const unitPrice = r1k((P[priceKey] ?? 0) * scale);
  return { code: `${code}-${String(++seq).padStart(2, "0")}`, title, qty, unit, unitPrice, total: r1k(qty * unitPrice), basis };
}

const fa = (n: number) => faNum(n);

export function buildBom(res: EstimateResult, scale = 1): FullBom {
  seq = 0;
  const d = res.derived;
  const U = res.unitLayout;
  const i = res.inputs;
  const isConcrete = i.structureType === "concrete";
  const units = d.totalUnits;

  const itemQty = (key: string) => res.groups.flatMap((g) => g.items).filter((it) => it.key === key).reduce((s, it) => s + it.qty, 0);
  const grpLab = (id: string) => res.groups.find((g) => g.id === id)?.lab ?? 0;

  // مقادیر پایه از موتور
  const concF = itemQty("concrete_fnd"), concC = itemQty("concrete_col"), concS = itemQty("concrete_slab");
  const concAll = concF + concC + concS;
  const rebAll = itemQty("rebar_fnd") + itemQty("rebar_col") + itemQty("rebar_slab");
  const steelAll = itemQty("steel_profile");
  const formwork = itemQty("formwork");
  const extWall = itemQty("wall_ext"), intWall = itemQty("wall_int");
  const plaster = itemQty("plaster_combo");
  const tiles = itemQty("tiling_wet");
  const wetFloor = itemQty("wet_waterproof");
  const floorArea = itemQty("flooring");
  const paintArea = itemQty("paint");
  const roofArea = itemQty("roof_insulation");
  const parapet = itemQty("roof_parapet");
  const facadeArea = itemQty(`facade_${i.facadeType}`) || d.facadeArea * 0.82;
  const winArea = itemQty(`window_${i.windowType}`) || d.windowArea;
  const winCount = Math.max(1, Math.round(winArea / 2.2));
  const p = res.points;
  const cabinetRuns = itemQty("cabinet_run");
  const radSections = p.radiatorSections;
  const radSets = radSections > 0 ? Math.max(units, Math.ceil(radSections / 10)) : 0;

  const sec = (id: string, title: string, emoji: string, color: string, rows: BomRow[]): BomSection => ({
    id, title, emoji, color, rows, total: rows.reduce((s, x) => s + x.total, 0),
  });

  /* ── ۱. بتن و بتن‌ریزی ─────────────────────────────── */
  const cementKg = concAll * 350 * 1.03;
  const c1 = sec("concrete", "بتن و مصرفی بتن‌ریزی", "🚛", "#dc2626", [
    row("CEM", "سیمان پرتلند تیپ ۲ (کیسه ۵۰ کیلویی)", cementKg / 50, "کیسه", "cement_bag", `${fa(Math.round(concAll))} م³ بتن × ۳۵۰ کیلو بر م³`, scale),
    row("SND", "ماسه شسته بتن", concAll * 0.6, "مترمکعب", "sand_m3", "۰٫۶ م³ بر مترمکعب بتن", scale),
    row("GRV", "شن بادامی (۲۵ میلی‌متر)", concAll * 0.8, "مترمکعب", "gravel_m3", "۰٫۸ م³ بر مترمکعب بتن", scale),
    row("ADM", "افزودنی روان‌کننده بتن", cementKg * 0.007, "کیلوگرم", "admix_kg", "۰٫۷٪ وزن سیمان", scale),
    row("SPC", "فاصل‌نگهدار آرماتور (اسپیسر)", floorArea * 4, "عدد", "spacer_pc", "۴ عدد بر مترمربع سقف", scale),
  ]);

  /* ── ۲. میلگرد و فولاد ─────────────────────────────── */
  const steelRows: BomRow[] = [
    row("REB", "میلگرد A3/A4 شاخه‌ای (با ۵٪ پرت لحاظ‌شده)", rebAll, "کیلوگرم", "rebar_kg", "جمع سه بخش فونداسیون، ستون و سقف", scale),
    row("WIR", "مفتول سیاه گره‌زنی", rebAll * 0.008, "کیلوگرم", "wire_kg", "۸ گرم بر کیلو میلگرد", scale),
  ];
  if (steelAll > 0) {
    steelRows.push(
      row("STL", "پروفیل و ورق ST37", steelAll, "کیلوگرم", "steel_kg", "ستون، تیر و مهاربندها", scale),
      row("ELD", "الکترود جوشکاری E6018/E7018", steelAll * 0.012, "کیلوگرم", "electrode_kg", "۱۲ گرم بر کیلو پروفیل", scale),
      row("BLT", "پیچ‌مهره و اتصال فلزی", steelAll * 0.02, "عدد", "bolt_pc", "حدود ۲٪ وزن سازه", scale),
      row("ANT", "ضد زنگ صنعتی سازه فلزی", steelAll * 0.14, "لیتر", "antirust_l", "دو دست روی ۱۴ م² بر تن", scale),
    );
  }
  const c2 = sec("steel", "میلگرد، فولاد و جوش", "🪛", "#b91c1c", steelRows);

  /* ── ۳. قالب‌بندی ──────────────────────────────────── */
  const c3 = sec("formwork", "قالب‌بندی و متعلقات", "📐", "#ea580c", [
    row("FMO", "روغن قالب (جداساز)", formwork * 0.1, "لیتر", "formoil_l", "۰٫۱ لیتر بر مترمربع قالب", scale),
    row("NLS", "میخ و سیم مفتول قالب‌بندی", formwork * 0.25, "کیلوگرم", "nail_kg", "۲۵۰ گرم بر مترمربع", scale),
  ]);

  /* ── ۴. سازه نگهبان (در صورت زیرزمین) ──────────────── */
  const retArea = itemQty("retaining");
  const c4: BomSection | null = retArea > 0
    ? sec("retain", "مصالح سازه نگهبان گود", "🛡️", "#a16207", [
        row("SHT", "بتن شاتکریت دیواره گود", retArea * 0.08, "مترمکعب", "shotcrete_m3", "ضخامت متوسط ۸ سانتی‌متر", scale),
        row("MSH", "مش جوشی تقویتی شاتکریت", retArea * 1.05, "مترمربع", "mesh_m2", "یک لایه با اورلپ", scale),
        ...(i.waterTable === "high"
          ? [row("QRF", "عایق قیری بدنه فونداسیون", retArea * 1.1, "کیلوگرم", "qr_kg", "دو لایه اندود بر سطح بیرونی", scale)]
          : []),
      ])
    : null;

  /* ── ۵. دیوارچینی ─────────────────────────────────── */
  const c5 = sec("walls", "بلوک، سفال و ملات دیوارچینی", "🧱", "#ca8a04", [
    row("LIC", "بلوک لیکا/سیمانی ۲۰ (دیوار خارجی)", extWall * 12.5 * 1.03, "عدد", "lica_pc", "۱۲٫۵ بلوک بر م² با ۳٪ پرت", scale),
    row("SOF", "سفال/بلوک سبک تیغه ۱۰", intWall * 25 * 1.03, "عدد", "sofal_pc", "۲۵ سفال بر م² با ۳٪ پرت", scale),
    row("CEW", "سیمان ملات دیوارچینی", (extWall + intWall) * 5, "کیسه", "cement_bag", "≈۵ کیلو سیمان بر م²", scale),
    row("SAW", "ماسه ملات دیوارچینی", (extWall + intWall) * 0.03, "مترمکعب", "sand_m3", "≈۳۰ لیتر بر م²", scale),
  ]);

  /* ── ۶. گچ‌کاری ───────────────────────────────────── */
  const c6 = sec("plaster", "گچ و خاک گچ‌کاری", "⚪", "#0d9488", [
    row("GYP", "گچ ساختمانی (کیسه ۴۰ کیلویی)", plaster * 0.3, "کیسه", "gypsum_bag", "۱۲ کیلو بر م² گچ‌وخاک و سفید", scale),
    row("PLS", "ماسه/خاک بادی اندود", plaster * 0.014, "مترمکعب", "sand_m3", "لایه میانگین ۱۴ میلی‌متری", scale),
  ]);

  /* ── ۷. کاشی، عایق سرویس و کف‌سازی ─────────────────── */
  const c7 = sec("tiles", "کاشی، چسب، عایق و کف‌سازی", "🔲", "#16a34a", [
    row("TIL", "کاشی و سرامیک درجه یک", tiles * 1.08, "مترمربع", "tile_m2", "با ۸٪ پرت برش", scale),
    row("ADH", "چسب کاشی پودری (کیسه ۲۵ کیلویی)", tiles * 5 / 25, "کیسه", "adhesive_bag", "۵ کیلو بر م²", scale),
    row("GRT", "پودر بندکشی آنتی‌باکتریال", tiles * 0.6, "کیلوگرم", "grout_kg", "۶۰۰ گرم بر م²", scale),
    row("QRW", "عایق رطوبتی سرد سرویس‌ها", wetFloor * 1.5, "کیلوگرم", "qr_kg", "۱٫۵ کیلو بر م² (دو دست)", scale),
    row("FDT", "سرامیک کف واحدها و مشاعات", floorArea * 1.08, "مترمربع", "tile_m2", "سطوح مفید کف + ۸٪ پرت", scale),
    row("FDC", "سیمان و ماسه کفسازی/ملات نصب", floorArea * 4 / 50, "کیسه", "cement_bag", "بستر ملاتی ≈۴ کیلو سیمان بر م²", scale),
  ]);

  /* ── ۸. نقاشی ──────────────────────────────────────── */
  const c8 = sec("paint", "رنگ، پرایمر و بتونه", "🎨", "#7c3aed", [
    row("PRM", "پرایمر و آستر", paintArea * 0.12, "لیتر", "primer_l", "یک دست آستر", scale),
    row("PNT", "رنگ نهایی اکرلیک/روغنی", paintArea * 0.28, "لیتر", "paint_l", "دو دست رنگ پوششی", scale),
    row("PTY", "بتونه و ماستیک درزگیری", paintArea * 0.35, "کیلوگرم", "putty_kg", "۳۵۰ گرم بر م²", scale),
  ]);

  /* ── ۹. ایزوگام بام ────────────────────────────────── */
  const c9 = sec("roof", "عایق بام و فلاشینگ", "☂️", "#0891b2", [
    row("ISO", "رول ایزوگام دولایه", Math.ceil(roofArea / 10) * 1.1, "رول ۱۰ متری", "isogam_roll", "با ۱۰٪ اورلپ درزها", scale),
    row("MST", "ماستیک و پرایمر عایق‌کاری", roofArea * 0.4, "کیلوگرم", "mastic_kg", "۴۰۰ گرم بر م²", scale),
    row("FLS", "ورق فلاشینگ گالوانیزه جان‌پناه", parapet * 1.05, "مترطول", "flashing_m", "دورتادور بام + ۵٪ دورریز", scale),
  ]);

  /* ── ۱۰. نما ───────────────────────────────────────── */
  const facadeRows: BomRow[] = [];
  if (i.facadeType === "travertine" || i.facadeType === "composite") {
    facadeRows.push(row("TRV", "سنگ تراورتن/اسلب نما", facadeArea * 1.06, "مترمربع", "travertine_m2", "با ۶٪ پرت و قناسی", scale));
    facadeRows.push(row("SCP", "اسکوپ و انکر نگهدارنده سنگ", facadeArea * 6, "عدد", "scope_pc", "۶ عدد بر م² مطابق ضوابط نما", scale));
  } else if (i.facadeType === "brick") {
    facadeRows.push(row("BRK", "آجر نسوز نما", facadeArea * 52, "عدد", "sofal_pc", "۵۲ آجر بر م² (مدل ۲۰×۵)", scale));
  } else {
    facadeRows.push(row("CMT", "سیمان نمای شسته/رنگی", facadeArea * 6 / 50, "کیسه", "cement_bag", "اندود سیمانی ≈۶ کیلو بر م²", scale));
  }
  const c10 = sec("facade", "مصالح اجراشده نما", "🪨", "#0f766e", facadeRows);

  /* ── ۱۱. پنجره ─────────────────────────────────────── */
  const c11 = sec("windows", "پنجره، شیشه و آب‌بندی", "🪟", "#2563eb", [
    row("FRM", "فوم و چسب آب‌بندی فریم", winCount * 1.5, "قوطی", "foam_can", "۱٫۵ قوطی بر بازشو", scale),
    row("SIL", "سیلیکون و ماستیک درز پنجره", winCount, "تیوب", "silicone_tube", "یک تیوب بر بازشو", scale),
    ...(winArea > 0 && i.windowType === "aluminum" ? [row("GLS", "شیشه سه‌جداره سکوریت", winArea * 0.9, "مترمربع", "tile_m2", "سطح خالص شیشه", scale)] : []),
  ]);

  /* ── ۱۲. برق ───────────────────────────────────────── */
  const circuitPts = p.outlets + p.switches + p.lightPoints + p.dataPoints;
  const c12 = sec("elec", "سیم، کابل، کلکتور و متعلقات برق", "⚡", "#b45309", [
    row("C25", "سیم افشان ۲٫۵ mm (پریزها)", p.outlets * 10, "متر", "cable25_m", "۱۰ متر مسیر بر نقطه پریز", scale),
    row("C15", "سیم افشان ۱٫۵ mm (روشنایی)", (p.lightPoints + p.switches) * 6, "متر", "cable15_m", "۶ متر بر نقطه روشنایی/کلید", scale),
    row("C4", "سیم ۴ mm (کولر/داکت و اصلی)", units * 18, "متر", "cable4_m", "مسیرهای قدرتی هر واحد", scale),
    row("CAT", "کابل شبکه Cat6 و تلویزیون", p.dataPoints * 22, "متر", "cat6_m", "۲۲ متر بر نقطه ضعیف", scale),
    row("CNK", "لوله خرطومی و PVC برق", circuitPts * 3.2, "متر", "conduit_m", "۳٫۲ متر بر نقطه", scale),
    row("JBX", "قوطی و جعبه انشعاب", circuitPts * 0.45, "عدد", "jbox_pc", "۰٫۴۵ عدد بر نقطه", scale),
    row("OUT", "مکانیزم پریز ارت‌دار", p.outlets, "عدد", "outlet_pc", "شمارش دقیق از پلان واحدها", scale),
    row("SWT", "مکانیزم کلید تبدیل/ساده", p.switches, "عدد", "switch_pc", "شمارش دقیق از پلان واحدها", scale),
    row("LUM", "چراغ، هالوژن و پنل LED", p.lightPoints, "عدد", "luminaire_pc", "یک چراغ بر نقطه روشنایی", scale),
    row("MCB", "کلید مینیاتوری و محافظ جان", units * 9 + 4, "عدد", "mcb_pc", "≈۹ مدار بر واحد + تابلو اصلی", scale),
    row("RCD", "محافظ جان RCCB اصلی", units + 2, "عدد", "rcd_pc", "یک عدد بر واحد + مشاعات", scale),
    row("ERT", "ست چاه ارت و صاعقه‌گیر", 1, "ست", "earthing_set", "مبحث ۱۳ مقررات ملی", scale),
  ]);

  /* ── ۱۳. مکانیک: لوله‌کشی آب و فاضلاب ──────────────── */
  const pexLen = r2(U.netArea * units * 1.1 + d.builtUpArea * 0.25);
  const sewerLen = r2(units * 14 + i.floors * 6);
  const c13 = sec("mech", "لوله‌کشی آب، فاضلاب و گاز", "🚿", "#0284c7", [
    row("PEX", "لوله پنج‌لایه ۱۶ و ۲۰", pexLen, "متر", "pex_m", "شعب آب سرد/گرم واحدها + رایزر", scale),
    row("PV1", "لوله پولیکا فاضلاب ۱۱۰", sewerLen * 0.55, "متر", "pvc110_m", "رایزر و افقی اصلی", scale),
    row("PV6", "لوله پولیکا ۶۳ (تخلیه و ونت)", sewerLen * 0.45, "متر", "pvc63_m", "شعب سرویس‌ها و هواکش", scale),
    row("GS3", "لوله فولادی گاز ¾ اینچ", units * 16, "متر", "gas34_m", "علمک تا آشپزخانه و پکیج هر واحد", scale),
    row("GS1", "لوله گاز ½ اینچ شعب داخلی", units * 7, "متر", "gas12_m", "انشعاب اجاق و وسایل", scale),
    row("GVV", "شیر توپی گاز و رگولاتور", units * 4, "عدد", "gasvalve_pc", "طبق استاندارد شرکت گاز", scale),
    row("FIT", "اتصالات (زانو، سه‌راه، کوپلینگ)", Math.round((pexLen + sewerLen + units * 23) * 0.55), "عدد", "fitting_pc", "≈۵۵٪ طول لوله‌کشی کل", scale),
    row("FLD", "کف‌شور استیل سرویس و بام", units * U.bathrooms + i.floors, "عدد", "flordrain_pc", "یکی برای هر سرویس + بام طبقات", scale),
    ...(radSets > 0 ? [row("THV", "شیر ترموستاتیک و قفل رادیاتور", radSets * 2, "عدد", "thermhead_pc", "رفت و برگشت هر دستگاه رادیاتور", scale)] : []),
  ]);

  /* ── ۱۴. خرید تجهیزات (از اقلام موتور) ─────────────── */
  const equipFromItem = (key: string, title: string, unit: string): EquipmentRow | null => {
    const it = res.groups.flatMap((g) => g.items).find((x) => x.key === key);
    if (!it || it.total <= 0) return null;
    return { title, qty: it.qty, unit, total: it.total, note: it.src };
  };
  const equipment: EquipmentRow[] = [
    equipFromItem("pkg_boiler", "پکیج دیواری فن‌دار", "دستگاه"),
    radSets > 0 ? { title: "دستگاه رادیاتور آلومینیومی مونتاژشده", qty: radSets, unit: "دستگاه", total: 0, note: `${faNum(radSections)} پره توزیع‌شده` } : null,
    equipFromItem("hvac_chiller", "چیلر، فن‌کوئل و کانال", "مترمربع"),
    equipFromItem("hvac_ductsplit", "داکت اسپلیت کانالی", "دستگاه"),
    equipFromItem("hvac_floorheat", "پکیجه گرمایش از کف", "دستگاه"),
    equipFromItem("elevator_base", "دستگاه آسانسور کامل", "دستگاه"),
    equipFromItem("water_tank", "منبع آب، پمپ و بوستر", "واحد"),
    equipFromItem("generator_set", "دیزل ژنراتور اضطراری", "واحد"),
    equipFromItem("smart_basic", "پکیج هوشمندسازی پایه", "واحد"),
    equipFromItem("smart_full", "سامانه BMS خانه هوشمند", "واحد"),
    equipFromItem("unit_panel", "تابلو برق مجهز", "عدد"),
    equipFromItem("security_system", "دستگاه DVR و دوربین", "واحد"),
  ].filter((x): x is EquipmentRow => x !== null);

  /* ── ۱۵. ماشین‌آلات و ابزار کارگاهی ────────────────── */
  const tools: ToolRow[] = [
    { title: "اجاره بالابر/تاور کرین", qtyText: `≈ ${faNum(res.timeline.months)} ماه`, basis: "تمام دوره اسکلت تا نما" },
    { title: "پمپ دکل بتن", qtyText: `${faNum(itemQty("pump_pour"))} مرحله`, basis: "فونداسیون و سقف‌ها" },
    { title: "ویبراتور بتن", qtyText: "۲ دستگاه", basis: "همراه هر بتن‌ریزی" },
    { title: "میکسر و تراکم‌دهنده ملات", qtyText: "۱ دستگاه", basis: "دیوارچینی و کفسازی" },
    { title: "خم‌کن و برش میلگرد", qtyText: "۱ ست", basis: f`${rebAll} کیلو میلگرد` },
    { title: i.structureType === "steel" ? "دستگاه جوش اینورتر" : "دستگاه جوش الکترودی", qtyText: i.structureType === "steel" ? "۳ دستگاه" : "۱ دستگاه", basis: "اسکلت و اتصالات" },
    { title: "دریل/چکش تخریب (هیلتی)", qtyText: "۲ دستگاه", basis: "نصب و تأسیسات" },
    { title: "داربست فلزی", qtyText: `${faNum(d.facadeArea + 200)} مترمربع`, basis: "نما + مشاعات" },
    { title: "تراز لیزری و دوربین نقشه‌برداری", qtyText: "۱ ست", basis: "پیاده‌سازی و کنترل شاقولی" },
    { title: "ژنراتور موقت کارگاهی", qtyText: "۱ دستگاه", basis: "برق اضطراری اجرا" },
    { title: "ابزار دستی اکیپ نازک‌کاری (ماله، شمشه، کاردک)", qtyText: "به تعداد اکیپ‌ها", basis: "گچ، کاشی و نقاشی" },
    { title: "فنر و دستگاه تست لوله و نشت‌یابی", qtyText: "۱ ست", basis: "تحویل تأسیسات" },
  ];

  /* ── ۱۶. نیروی انسانی (نفر-روز از دستمزدها) ────────── */
  const DAILY_WAGE = 3_900_000; // مزد روزانه استادکار ماهر — پاییز ۱۴۰۵
  const fin = grpLab("finish");
  const mk = (trade: string, emoji: string, amount: number): LaborRow => {
    const personDays = Math.round(amount / DAILY_WAGE);
    return { trade, emoji, personDays, teamMonths: Math.round((personDays / 26) * 10) / 10 };
  };
  const labor: LaborRow[] = [
    mk("اپراتور ماشین‌آلات و خاکبرداری", "⛏️", grpLab("earth")),
    mk("آرماتوربند و جوشکار اسکلت", "🪛", grpLab("skeleton") * 0.34),
    mk("قالب‌بند", "📐", grpLab("skeleton") * 0.3),
    mk("بتن‌ریز", "🚛", grpLab("skeleton") * 0.24),
    mk("بنا و دیوارچین", "🧱", grpLab("walls")),
    mk("نصاب نما و عایق‌کار", "🪨", grpLab("facade") + grpLab("roof")),
    mk("گچ‌کار", "⚪", fin * 0.38),
    mk("کاشی‌کار و سنگ‌کار", "🔲", fin * 0.3),
    mk("نقاش ساختمان", "🎨", fin * 0.18),
    mk("کف‌ساز و نصاب درب/کابینت", "🚪", fin * 0.14 + grpLab("joinery")),
    mk("لوله‌کش و نصاب تأسیسات", "🚿", grpLab("mech")),
    mk("برق‌کار و نصاب جریان ضعیف", "⚡", grpLab("elec")),
    mk("کارگر ساده و خدمات کارگاه", "🧰", grpLab("site") * 0.7 + grpLab("vertical") * 0.2),
  ].filter((l) => l.personDays > 0);

  const sections = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13].filter((x): x is BomSection => x !== null);
  const grandTotal = sections.reduce((s, x) => s + x.total, 0);
  const totalPersonDays = labor.reduce((s, l) => s + l.personDays, 0);

  return { sections, grandTotal, equipment, tools, labor, totalPersonDays };
}

// tiny tagged helper for Persian numeric interpolation in basis strings
function f(parts: TemplateStringsArray, ...vals: number[]): string {
  return parts.reduce((acc, part, idx) => acc + part + (idx < vals.length ? faNum(vals[idx]) : ""), "");
}
