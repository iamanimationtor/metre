/**
 * Quantity takeoff & cost estimation engine (متره و برآورد) — v3.
 * Geometry is derived from real plot dimensions (width × depth), lot position
 * (exposed facades), floor heights and slab system. MEP is point-count based,
 * prices follow فهرست بهای سازمان برنامه and the 1404 market. Construction-phase
 * inflation escalation produces a nominal cashflow curve.
 */
import { catalogMap, type CatalogItem } from "./catalog";
import { DEFAULT_INPUTS, FEE_RATES, QUALITY_MULTIPLIERS, provinceById, type CalcInputs, type QualityLevel } from "./constants";
import { designUnit, type UnitLayout } from "./layout";
import { faNum } from "./format";

export interface ItemRow {
  key: string;
  label: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
  mat: number;
  lab: number;
  src: string;
  formula: string;
  note?: string;
}

export interface SchedSpan {
  start: number;
  end: number;
  days: number;
}

export interface GroupRow {
  id: string;
  title: string;
  emoji: string;
  color: string;
  items: ItemRow[];
  total: number;
  mat: number;
  lab: number;
  sched?: SchedSpan;
}

export interface ScenarioPoint {
  quality: QualityLevel;
  label: string;
  grand: number;
  perSqm: number;
}

export interface DerivedGeometry {
  landWidth: number;
  landDepth: number;
  landArea: number;
  footWidth: number;
  footDepth: number;
  footprint: number;
  basementArea: number;
  grossFloorArea: number;
  commercialArea: number;
  builtUpArea: number;
  totalUnits: number;
  unitAvgArea: number;
  plotPerimeter: number;
  perimeterOccupied: number;
  /** Sum of exposed facade widths based on lot position. */
  facadeExposedLength: number;
  floorHeight: number;
  buildingHeight: number;
  facadeArea: number;
  windowArea: number;
  excavationVolume: number;
  extWallArea: number;
  partitionArea: number;
  plasterArea: number;
  paintArea: number;
  tileArea: number;
  wetFloorArea: number;
}

export interface PointsSummary {
  outlets: number;
  switches: number;
  lightPoints: number;
  dataPoints: number;
  faucets: number;
  wcs: number;
  showers: number;
  kitchenSinks: number;
  radiatorSections: number;
  cabinetRuns: number;
  interiorDoors: number;
  entryDoors: number;
}

export interface CashflowPoint {
  month: number;
  amount: number;
  cum: number;
}

export interface TimelineInfo {
  totalDays: number;
  months: number;
  schedule: { id: string; title: string; emoji: string; color: string; span: SchedSpan }[];
  cashflow: CashflowPoint[];
  /** Nominal total after construction-phase inflation escalation. */
  inflatedTotal: number;
  inflationPct: number;
}

export interface Splits {
  material: number;
  labor: number;
  other: number;
}

export interface EstimateResult {
  inputs: CalcInputs;
  derived: DerivedGeometry;
  regionCoef: number;
  regionLabel: string;
  unitLayout: UnitLayout;
  groups: GroupRow[];
  baseTotal: number;
  feesTotal: number;
  contingency: number;
  grandTotal: number;
  costPerSqm: number;
  scenarios: ScenarioPoint[];
  splits: Splits;
  points: PointsSummary;
  timeline: TimelineInfo;
  /** Transparency note when live market indices changed base prices. */
  indexNote?: string;
}

export type Overrides = Record<string, number>; // itemKey -> percent delta

const r1k = (n: number) => Math.round(n / 1000) * 1000;
const r2 = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const cdiv = (a: number, b: number) => Math.max(1, Math.ceil(a / b));
const half = (n: number) => Math.round(n * 2) / 2;

interface Ctx {
  city: number;
  qm: Record<"structure" | "finish" | "mep" | "facade", number>;
  price: (item: CatalogItem) => number;
}

interface ItemOpts {
  unit?: string;
  fixedQty?: boolean;
  label?: string;
  note?: string;
  waste?: number;
}

export function computeEstimate(
  rawInputs: CalcInputs,
  overrides: Overrides,
  opts?: { skipScenarios?: boolean; scale?: { material: number; wage: number } },
): EstimateResult {
  const scale = opts?.scale ?? { material: 1, wage: 1 };
  const inputs = sanitize(rawInputs);
  const map = catalogMap();
  const province = provinceById(inputs.provinceId);
  const city = province.coef;
  const qm = QUALITY_MULTIPLIERS[inputs.quality];

  const ctx: Ctx = {
    city,
    qm,
    price: (it) => {
      const adj = 1 + (overrides[it.key] ?? 0) / 100;
      const clsMult =
        it.cls === "structure" || it.cls === "earth"
          ? qm.structure
          : it.cls === "finish"
            ? qm.finish
            : it.cls === "mep"
              ? qm.mep
              : it.cls === "facade"
                ? qm.facade
                : 1;
      // Live market indices (auto-updated): split escalation for material & labor shares
      const indexScale = (1 - it.lab) * scale.material + it.lab * scale.wage;
      return r1k(it.price * adj * city * clsMult * indexScale);
    },
  };

  // ── Real plot geometry ─────────────────────────────────────
  const landWidth = inputs.landWidth;
  const landDepth = inputs.landDepth;
  const landArea = Math.round(landWidth * landDepth);
  const footWidth = half(landWidth);
  const footDepth = Math.max(6, half(landDepth * (inputs.occupancyPct / 100)));
  const footprint = Math.round(footWidth * footDepth);
  const plotPerimeter = r2(2 * (landWidth + landDepth));
  const perimeterOccupied = r2(2 * (footWidth + footDepth));
  const sideExtra = inputs.lotPosition === "corner" ? footDepth : inputs.lotPosition === "triple" ? 2 * footDepth : 0;
  const facadeExposedLength = r2(2 * footWidth + sideExtra); // front + rear (+ free sides)

  const floorHeight = inputs.ceilingHeight === "tall" ? 3.45 : 3.1;
  const basementArea = inputs.hasBasement ? Math.round(footprint * 0.9) : 0;
  const grossFloorArea = Math.round(footprint * inputs.floors * 1.05);
  const commercialArea = Math.round(footprint * inputs.commercialFloors * 1.02);
  const builtUpArea = grossFloorArea + basementArea + commercialArea;
  const totalUnits = Math.max(1, Math.round(inputs.unitsPerFloor * inputs.floors));
  const unitAvgArea = r2((footprint * 0.88) / Math.max(1, inputs.unitsPerFloor));

  const buildingHeight = r2(inputs.floors * floorHeight + inputs.commercialFloors * 3.8 + 1.5);
  const facadeArea = Math.round(facadeExposedLength * buildingHeight);
  const windowArea = Math.round(facadeArea * 0.18);
  const excavationDepth = inputs.hasBasement ? 3.4 : 1.3;
  const excavationVolume = Math.round(footprint * excavationDepth * 1.08);

  const U = designUnit(unitAvgArea);
  const H_int = inputs.ceilingHeight === "tall" ? 3.25 : 2.9;
  const wallHeight = inputs.floors * floorHeight + inputs.commercialFloors * 3.6;
  const extWallArea = Math.round(perimeterOccupied * wallHeight * 0.76); // −24% openings
  const sharedPartitionLen = r2(inputs.floors * 7 + inputs.commercialFloors * 8 + Math.sqrt(footprint) * 0.5);
  const partitionLenTotal = r2(U.partitionLength * totalUnits + sharedPartitionLen);
  const partitionArea = Math.round(partitionLenTotal * H_int * 2);
  const ceilingArea = Math.round(grossFloorArea * 0.88 + commercialArea * 0.9);
  const plasterArea = Math.round(extWallArea + partitionArea + ceilingArea);
  const tileArea = Math.round(U.tileArea * totalUnits + 12);
  const wetFloorArea = Math.round(U.wetFloorArea * totalUnits + 8);
  const paintArea = Math.round(Math.max(plasterArea - tileArea, 0) * 0.92);

  const derived: DerivedGeometry = {
    landWidth, landDepth, landArea, footWidth, footDepth, footprint, basementArea,
    grossFloorArea, commercialArea, builtUpArea, totalUnits, unitAvgArea,
    plotPerimeter, perimeterOccupied, facadeExposedLength, floorHeight, buildingHeight,
    facadeArea, windowArea, excavationVolume, extWallArea, partitionArea, plasterArea,
    paintArea, tileArea, wetFloorArea,
  };

  const mk = (key: string, qtyRaw: number, formula: string, o: ItemOpts = {}): ItemRow => {
    const cat = map.get(key)!;
    const qty = r2(qtyRaw * (o.waste ?? 1));
    const unitPrice = ctx.price(cat);
    const total = r1k(qty * unitPrice);
    const lab = r1k(total * cat.lab);
    return {
      key,
      label: o.label ?? cat.label,
      qty: o.fixedQty ? qtyRaw : qty,
      unit: o.unit ?? cat.unit,
      unitPrice,
      total,
      mat: total - lab,
      lab,
      src: cat.src,
      formula: o.waste && o.waste > 1 ? `${formula} (با ${faNum(Math.round((o.waste - 1) * 100))}٪ پرت)` : formula,
      note: o.note ?? cat.note,
    };
  };

  const groupBase = (id: string, title: string, emoji: string, color: string, items: ItemRow[]): GroupRow => {
    const total = items.reduce((s, i) => s + i.total, 0);
    return { id, title, emoji, color, items, total, mat: items.reduce((s, i) => s + i.mat, 0), lab: items.reduce((s, i) => s + i.lab, 0) };
  };

  const B = Math.max(1, builtUpArea);

  // ── A. خدمات مهندسی اولیه ────────────────────────────────
  const gServices = groupBase("services", "خدمات مهندسی و مطالعات اولیه", "📐", "#0ea5e9", [
    mk("geotech", 1, "الزامی مطابق مبحث ۷ مقررات ملی", { fixedQty: true }),
    mk("surveying", 1, `نقشه‌برداری قطعه ${faDecimalTrim(landWidth)}×${faDecimalTrim(landDepth)} متر`, { fixedQty: true }),
  ]);

  // ── B. گودبرداری و پایدارسازی ────────────────────────────
  const earthItems: ItemRow[] = [
    mk("excavation", excavationVolume, `زیربنای اشغال ${faNum(footprint)} م² (${faDecimalTrim(footWidth)}×${faDecimalTrim(footDepth)}) × عمق ${excavationDepth.toLocaleString("fa-IR")} متر`),
    mk("leveling", footprint, `بتن مگر و کرسی به مساحت ${faNum(footprint)} م²`),
  ];
  if (inputs.hasBasement) {
    earthItems.push(mk("retaining", r2(perimeterOccupied * excavationDepth * 0.95), `محیط واقعی گود ${faNum(perimeterOccupied)} م × عمق ${excavationDepth.toLocaleString("fa-IR")} متر`));
  }
  if (inputs.waterTable === "high") {
    earthItems.push(mk("fnd_waterproof", r2(perimeterOccupied * excavationDepth * 0.9), "بدنه‌های در تماس با خاک + زهکش محیطی (سطح آب بالا)", { waste: 1.05 }));
  }
  const gEarth = groupBase("earth", "گودبرداری و سازه نگهبان", "⛏️", "#a16207", earthItems);

  // ── C. فونداسیون و اسکلت ─────────────────────────────────
  const isConcrete = inputs.structureType === "concrete";
  const slabConcAdj = inputs.slabType === "slab" ? 0.03 : inputs.slabType === "deck" ? -0.05 : 0;
  const formMult = inputs.slabType === "slab" ? 1.18 : inputs.slabType === "deck" ? 0.82 : 1;
  const concRate = Math.max(0.25, (isConcrete ? 0.48 : 0.3) + slabConcAdj);
  const rebRate = isConcrete ? 47 : 33;
  const concTotal = r2(B * concRate);
  const rebTotal = Math.round(B * rebRate);
  const slabNote = inputs.slabType === "deck" ? "سقف عرشه فولادی: دال نازک‌تر" : inputs.slabType === "slab" ? "دال بتنی: حجم سقف بیشتر" : undefined;
  const skeletonItems: ItemRow[] = [
    mk("concrete_fnd", concTotal * (isConcrete ? 0.3 : 0.6), `${isConcrete ? "۳۰" : "۶۰"}٪ از ${concTotal.toLocaleString("fa-IR")} م³ بتن کل (نرخ ${concRate.toLocaleString("fa-IR")} م³/m²)`, { waste: 1.03 }),
    mk("concrete_col", concTotal * (isConcrete ? 0.22 : 0.1), "سهم ستون‌ها و دیوارهای برشی", { waste: 1.03 }),
    mk("concrete_slab", concTotal * (isConcrete ? 0.48 : 0.3), "سهم سقف‌ها و تیرهای طبقات", { waste: 1.03, note: slabNote }),
    mk("rebar_fnd", rebTotal * 0.33, `۳۳٪ از ${faNum(rebTotal)} کیلوگرم میلگرد کل`, { waste: 1.05 }),
    mk("rebar_col", rebTotal * 0.24, "سهم ستون‌ها و برشی", { waste: 1.05 }),
    mk("rebar_slab", rebTotal * 0.43, "سهم سقف و تیرها", { waste: 1.05 }),
  ];
  if (!isConcrete) {
    const stl = Math.round(B * 41);
    skeletonItems.push(
      mk("steel_profile", Math.round(stl * 0.45), `۴۵٪ از ${faNum(stl)} کیلوگرم فولاد ST37`, { label: "پروفیل ST37 ستون‌ها با ساخت و نصب", waste: 1.04 }),
      mk("steel_profile", stl - Math.round(stl * 0.45), "سهم تیرها، مهاربندها و زانو", { label: "پروفیل ST37 تیرها و مهاربندی", waste: 1.04 }),
      mk("steel_conn", B, `اتصالات به مساحت کل زیربنا (${faNum(B)} م²)`),
    );
  }
  skeletonItems.push(
    mk("formwork", r2(B * (isConcrete ? 1.15 : 0.8) * formMult), `${isConcrete ? "۱٫۱۵" : "۰٫۸"} برابر زیربنا × ضریب نوع سقف (${formMult.toLocaleString("fa-IR")})`, { note: slabNote }),
    mk("crane_hoist", inputs.floors + inputs.commercialFloors + (inputs.hasBasement ? 1 : 0), "به ازای هر تراز اجرایی", { fixedQty: true }),
    mk("pump_pour", inputs.floors + inputs.commercialFloors + 2, "فونداسیون + سقف طبقات + خرپشت", { fixedQty: true }),
  );
  const gSkeleton = groupBase("skeleton", "فونداسیون و اسکلت", "🏗️", "#dc2626", skeletonItems);

  // ── D. دیوارچینی ─────────────────────────────────────────
  const gWalls = groupBase("walls", "دیوارچینی و تیغه‌کشی", "🧱", "#ea580c", [
    mk("wall_ext", extWallArea, `محیط ${faNum(perimeterOccupied)} م × ارتفاع ${faNum(wallHeight)} م − ۲۴٪ بازشو`, { waste: 1.03 }),
    mk("wall_int", partitionLenTotal * H_int, `طول تیغه ${faNum(partitionLenTotal)} م × ${H_int.toLocaleString("fa-IR")} م (از پلان واحدها)`, { waste: 1.03 }),
  ]);

  // ── E. بام ────────────────────────────────────────────────
  const gRoof = groupBase("roof", "عایق‌کاری بام و جان‌پناه", "☂️", "#0891b2", [
    mk("roof_insulation", footprint, `عرشه بام (${faNum(footprint)} م²)`, { waste: 1.05 }),
    mk("roof_parapet", perimeterOccupied, `دورتادور بام (${faNum(perimeterOccupied)} مترطول)`),
  ]);

  // ── F. تأسیسات مکانیکی ───────────────────────────────────
  const mechItems: ItemRow[] = [
    mk("mech_base", B, `لوله‌کشی زیرساخت بر مبنای ${faNum(B)} م² زیربنا`),
    mk("gas_piping", totalUnits, `یک انشعاب کامل برای هر واحد (${faNum(totalUnits)})`, { fixedQty: true }),
    mk("water_tank", totalUnits, `ظرفیت ذخیره متناسب با ${faNum(totalUnits)} واحد`, { fixedQty: true }),
  ];
  if (inputs.heatingSystem === "radiator") {
    mechItems.push(
      mk("pkg_boiler", totalUnits, `پکیج مستقل برای هر واحد (${faNum(totalUnits)})`, { fixedQty: true }),
      mk("radiator_section", U.radiatorSections * totalUnits, `بار حرارتی ${faNum(U.netArea * 130)} kcal/h ÷ ۱۳۵ ≈ ${faNum(U.radiatorSections)} پره × ${faNum(totalUnits)} واحد`, { waste: 1.02 }),
    );
  } else {
    const hvacKey = `hvac_${inputs.heatingSystem}`;
    mechItems.push(
      mk(hvacKey, inputs.heatingSystem === "chiller" ? B : totalUnits, inputs.heatingSystem === "chiller" ? `سیستم مرکزی به مساحت ${faNum(B)} م²` : `یک دستگاه کامل برای هر واحد (${faNum(totalUnits)})`, { fixedQty: inputs.heatingSystem !== "chiller" }),
    );
  }
  mechItems.push(
    mk("fixture_faucet", U.faucets * totalUnits, `هر واحد ${faNum(U.faucets)} ست شیرآلات × ${faNum(totalUnits)} واحد`, { fixedQty: true }),
    mk("fixture_wc", U.wcs * totalUnits, `هر واحد ${faNum(U.wcs)} فرنگی/ایرانی × ${faNum(totalUnits)}`, { fixedQty: true }),
    mk("fixture_shower", U.showers * totalUnits, `هر واحد ${faNum(U.showers)} دوش/وان × ${faNum(totalUnits)}`, { fixedQty: true }),
    mk("fixture_kitchensink", totalUnits, "سینک دولگنه هر واحد", { fixedQty: true }),
    mk("fixture_washer", totalUnits, "انواع لباس‌شویی هر واحد", { fixedQty: true }),
  );
  if (inputs.smartLevel === "basic") mechItems.push(mk("smart_basic", totalUnits, `کنترل روشنایی و اقلیم برای ${faNum(totalUnits)} واحد`, { fixedQty: true }));
  if (inputs.smartLevel === "full") mechItems.push(mk("smart_full", totalUnits, `BMS کامل برای ${faNum(totalUnits)} واحد`, { fixedQty: true }));
  if (inputs.hasGenerator) mechItems.push(mk("generator_set", totalUnits, `ظرفیت ≈ ${faNum(totalUnits * 3)} kVA (سه kVA بر واحد)`, { fixedQty: true }));
  if (inputs.floors >= 6 || inputs.usageType !== "residential" || inputs.commercialFloors > 0) {
    mechItems.push(mk("fire_fighting", B, "الزام ضوابط آتش‌نشانی (بلندمرتبه/غیرمسکونی/طبقات تجاری)"));
  }
  const gMech = groupBase("mech", "تأسیسات مکانیکی، گرمایش و بهداشتی", "🔧", "#7c3aed", mechItems);

  // ── G. تأسیسات برقی ──────────────────────────────────────
  const commArea = commercialArea;
  const outletPts = U.outlets * totalUnits + Math.round(commArea * 0.08);
  const switchPts = U.switches * totalUnits + Math.round(commArea * 0.04);
  const lightPts = U.lightPoints * totalUnits + inputs.floors * 8 + inputs.commercialFloors * 14 + Math.round(commArea * 0.05);
  const dataPts = U.dataPoints * totalUnits + 4 + Math.round(commArea * 0.02);
  const gElec = groupBase("elec", "تأسیسات برقی و جریان ضعیف", "⚡", "#ca8a04", [
    mk("elec_infra", B, "لوله‌گذاری و سینه‌کشی کل زیربنا"),
    mk("point_outlet", outletPts, `واحدها (${faNum(U.outlets * totalUnits)}) + فضاهای تجاری/مشترک`, { fixedQty: true }),
    mk("point_switch", switchPts, "کلیدهای روشنایی واحدها و مشاعات", { fixedQty: true }),
    mk("point_light", lightPts, "روشنایی داخلی + مشاعات هر طبقه (۸ نقطه) + تجاری", { fixedQty: true }),
    mk("point_data", dataPts, "تلویزیون/شبکه/دوربین", { fixedQty: true }),
    mk("unit_panel", totalUnits + 1, "تابلوی واحدها + تابلو اصلی", { fixedQty: true }),
    mk("security_system", totalUnits, "دوربین و اعلام سرقت هر واحد", { fixedQty: true }),
    mk("lightning_arrest", 1, "صاعقه‌گیر و چاه ارت (مبحث ۱۳)", { fixedQty: true }),
  ]);

  // ── H. نازک‌کاری ─────────────────────────────────────────
  const finishItems: ItemRow[] = [
    mk("plaster_combo", plasterArea, `دیوار خارجی ${faNum(extWallArea)} + تیغه دورو ${faNum(partitionArea)} + سقف ${faNum(ceilingArea)} م²`),
    mk("wet_waterproof", wetFloorArea, `کف مرطوب واحدها ${faNum(Math.round(U.wetFloorArea * totalUnits))} + مشاعات`, { waste: 1.05 }),
    mk("tiling_wet", tileArea, `شیت‌بندی سرویس‌ها (${faNum(Math.round(U.tileArea))} م² بر واحد)`, { waste: 1.08 }),
    mk("flooring", ceilingArea, `سطوح مفید کف (${faNum(ceilingArea)} م²؛ پارکینگ جدا دیده شده)`, { waste: 1.08 }),
    mk("paint", paintArea, "سطوح گچی پس از کسر کاشی‌کاری‌ها", { waste: 1.05 }),
  ];
  if (inputs.quality === "good" || inputs.quality === "luxury") {
    finishItems.splice(1, 0, mk("konaf", r2(grossFloorArea * 0.42), "پذیرایی و اتاق‌های اصلی (۴۲٪ زیربنای طبقات)"));
  }
  const gFinish = groupBase("finish", "نازک‌کاری داخلی", "🎨", "#16a34a", finishItems);

  // ── I. درب و کابینت ──────────────────────────────────────
  const gJoinery = groupBase("joinery", "درب، کابینت و کمدها", "🚪", "#9333ea", [
    mk("door_entry", totalUnits, "یک درب ضد سرقت برای هر واحد", { fixedQty: true }),
    mk("door_interior", U.interiorDoors * totalUnits, `هر واحد ${faNum(U.interiorDoors)} درب داخلی × ${faNum(totalUnits)}`, { fixedQty: true }),
    mk("cabinet_run", r2(U.cabinetRuns * totalUnits), `${U.cabinetRuns.toLocaleString("fa-IR")} مترطول بر واحد × ${faNum(totalUnits)}`),
    mk("countertop_run", r2(U.cabinetRuns * totalUnits), "به طول مسیر کابینت‌ها"),
    mk("wardrobe_unit", totalUnits, "کمدهای اتاق‌خواب هر واحد", { fixedQty: true }),
  ]);

  // ── J. نما و بازشوها — جداره‌های واقعاً آزاد ─────────────
  const styleCoef = inputs.facadeStyle === "classic" ? 1.12 : inputs.facadeStyle === "minimal" ? 0.9 : 1;
  const windowCount = totalUnits * (U.rooms.length - 1) + inputs.floors * 2 + inputs.commercialFloors * 3;
  const facadeItems: ItemRow[] = [
    mk(`facade_${inputs.facadeType}`, r2(facadeArea * 0.82 * styleCoef), `جداره‌های آزاد ${faNum(facadeExposedLength)} م × ارتفاع ${buildingHeight.toLocaleString("fa-IR")} م × ۰٫۸۲ × ضریب سبک`, { note: `${faNum(windowCount)} بازشو · موقعیت قطعه: ${lotFa(inputs.lotPosition)}` }),
    mk("scaffold", facadeArea, `داربست به مساحت نمای اجراشده (${faNum(facadeArea)} م²)`),
    mk(`window_${inputs.windowType}`, windowArea, `میانگین ${(windowArea / Math.max(1, windowCount)).toLocaleString("fa-IR", { maximumFractionDigits: 1 })} م² × ${faNum(windowCount)} بازشو`),
  ];
  if (inputs.facadeStyle === "classic") {
    facadeItems.push(mk("facade_classic", r2(facadeArea * 0.45), "ابزارهای GRC، سرستون و قاب پنجره‌ها"));
  }
  const gFacade = groupBase("facade", "نما، پنجره و بازشوها", "🪟", "#0d9488", facadeItems);

  // ── K. آسانسور و مشاعات ──────────────────────────────────
  const verticalItems: ItemRow[] = [mk("stair_finish", (inputs.floors + inputs.commercialFloors) * 2, `${faNum(inputs.floors + inputs.commercialFloors)} طبقه × ۲ بازو`, { fixedQty: true })];
  if (inputs.hasElevator) {
    verticalItems.unshift(mk("elevator_base", 1, "یک دستگاه کامل با استاندارد ملی", { fixedQty: true }));
    const extra = Math.max(0, inputs.elevatorPersons - 4);
    if (extra > 0) verticalItems.push(mk("elevator_person", extra, `ارتقا از ۴ به ${faNum(inputs.elevatorPersons)} نفر`, { fixedQty: true }));
    verticalItems.push(mk("elevator_floor", inputs.floors + inputs.commercialFloors, `توقف در ${faNum(inputs.floors + inputs.commercialFloors)} طبقه`, { fixedQty: true }));
  }
  verticalItems.push(mk("lobby_decor", totalUnits, "سهم هر واحد از لابی و مشاعات", { fixedQty: true }));
  const gVertical = groupBase("vertical", "آسانسور، راه‌پله و مشاعات", "🛗", "#2563eb", verticalItems);

  // ── L. محوطه ─────────────────────────────────────────────
  const yardArea = Math.max(0, Math.round((landArea - footprint) * 0.8));
  const landscapeItems: ItemRow[] = [];
  if (yardArea > 0) {
    if (inputs.landscapeLevel !== "none") {
      landscapeItems.push(mk(inputs.landscapeLevel === "full" ? "paving_full" : "paving_basic", yardArea, `محوطه آزاد حیاط (${faNum(yardArea)} م²)`));
    }
    if (basementArea > 0) {
      landscapeItems.push(mk("paving_basic", basementArea, `کفسازی پارکینگ زیرزمین (${faNum(basementArea)} م²)`));
    }
    landscapeItems.push(mk("fence_wall", plotPerimeter, `دور زمین ${faDecimalTrim(landWidth)}×${faDecimalTrim(landDepth)} = ${faNum(plotPerimeter)} مترطول`));
  }
  const gLandscape = landscapeItems.length > 0 ? groupBase("landscape", "محوطه، پارکینگ و حصار", "🌳", "#65a30d", landscapeItems) : null;

  // ── M. کارگاه ────────────────────────────────────────────
  const gSite = groupBase("site", "حمل نخاله و هزینه‌های کارگاهی", "🚛", "#78716c", [
    mk("waste_removal", B, "متناسب با حجم عملیات زیربنا"),
    mk("site_services", B, "آب، برق و اسکان موقت کارگری"),
  ]);

  const physicalGroups = [gServices, gEarth, gSkeleton, gWalls, gRoof, gMech, gElec, gFinish, gJoinery, gFacade, gVertical, ...(gLandscape ? [gLandscape] : []), gSite];

  // ── Pass 2: حقوقی — با سهم کاربری تجاری ──────────────────
  const baseTotal = physicalGroups.reduce((s, g) => s + g.total, 0);
  const commercialShare = inputs.usageType === "commercial"
    ? Math.max(0.75, commercialArea / B)
    : inputs.usageType === "mixed"
      ? Math.max(0.3, commercialArea / B)
      : commercialArea / B;
  const munMulti = 1 + 0.35 * commercialShare;
  const feeItem = (key: string, label: string, total: number, formula: string, src: string, note?: string): ItemRow => ({
    key, label, qty: 1, unit: "پروژه", unitPrice: total, total, mat: 0, lab: 0, src, formula, note,
  });
  const feeItems: ItemRow[] = [
    feeItem("fee_municipality", "عوارض صدور پروانه و نوسازی شهرداری", r1k(baseTotal * FEE_RATES.municipality * munMulti), `${faPercent(FEE_RATES.municipality * munMulti)} هزینه‌های فیزیکی (ضریب کاربری ×${munMulti.toLocaleString("fa-IR", { maximumFractionDigits: 2 })})`, "تعرفه عوارض شهرداری ۱۴۰۴"),
    feeItem("fee_nezam", "حق طراحی و نظارت نظام مهندسی", r1k(baseTotal * FEE_RATES.nezam), `${faPercent(FEE_RATES.nezam)} هزینه‌های فیزیکی`, "تعرفه سازمان نظام مهندسی"),
    feeItem("fee_insurance", "بیمه مسئولیت مدنی و آزمایش‌های فنی", r1k(baseTotal * FEE_RATES.insuranceLab), `${faPercent(FEE_RATES.insuranceLab)} هزینه‌های فیزیکی`, "بیمه تمام‌خطر + آزمایش بتن و جوش"),
    feeItem("fee_hse", "ایمنی، حصارکشی و HSE کارگاه", r1k(baseTotal * FEE_RATES.hse), `${faPercent(FEE_RATES.hse)} هزینه‌های فیزیکی (مبحث ۱۲)`, "شرکت بیمه و الزامات اداره کار"),
  ];
  const feesTotal = feeItems.reduce((s, i) => s + i.total, 0);
  const contingency = r1k((baseTotal + feesTotal) * FEE_RATES.contingency);
  const gFees = groupBase("permits", "مجوزها و عوارض قانونی", "📜", "#4f46e5", feeItems);
  const gCont = groupBase("contingency", "پیش‌بینی‌نشده و تعدیل قیمت", "🛡️", "#64748b", [
    feeItem("contingency_item", "ذخیره احتیاطی و نوسان بازار مصالح", contingency, `${faPercent(FEE_RATES.contingency)} جمع هزینه‌ها`, "رویه رایج پیمانکاری"),
  ]);
  const grandTotal = baseTotal + feesTotal + contingency;
  const costPerSqm = Math.round(grandTotal / B / 10000) * 10000;

  const groups = [...physicalGroups, gFees, gCont];
  const splits: Splits = {
    material: groups.reduce((s, g) => s + g.mat, 0),
    labor: groups.reduce((s, g) => s + g.lab, 0),
    other: gFees.total + gCont.total,
  };

  const points: PointsSummary = {
    outlets: outletPts,
    switches: switchPts,
    lightPoints: lightPts,
    dataPoints: dataPts,
    faucets: U.faucets * totalUnits,
    wcs: U.wcs * totalUnits,
    showers: U.showers * totalUnits,
    kitchenSinks: totalUnits,
    radiatorSections: inputs.heatingSystem === "radiator" ? U.radiatorSections * totalUnits : 0,
    cabinetRuns: r2(U.cabinetRuns * totalUnits),
    interiorDoors: U.interiorDoors * totalUnits,
    entryDoors: totalUnits,
  };

  const timeline = buildTimeline(inputs, derived, plasterArea, paintArea, ceilingArea, facadeArea, windowArea, yardArea, totalUnits, groups, grandTotal);
  const spanMap = new Map(timeline.schedule.map((s) => [s.id, s.span]));
  for (const g of groups) g.sched = spanMap.get(g.id);

  let scenarios: ScenarioPoint[] = [];
  if (!opts?.skipScenarios) {
    scenarios = (Object.keys(QUALITY_MULTIPLIERS) as QualityLevel[]).map((q) => {
      if (q === inputs.quality) return { quality: q, label: qualityLabel(q), grand: grandTotal, perSqm: costPerSqm };
      const sub = computeEstimate({ ...inputs, quality: q }, overrides, { skipScenarios: true, scale });
      return { quality: q, label: qualityLabel(q), grand: sub.grandTotal, perSqm: sub.costPerSqm };
    });
  }

  const indexNote =
    scale.material !== 1 || scale.wage !== 1
      ? `قیمت‌ها با شاخص خودکار بازار به‌روز شده‌اند — مصالح ×${scale.material.toLocaleString("fa-IR", { maximumFractionDigits: 3 })}، دستمزد ×${scale.wage.toLocaleString("fa-IR", { maximumFractionDigits: 3 })} نسبت به مبنای ۲۸ آبان ۱۴۰۵.`
      : undefined;

  return {
    inputs, derived, regionCoef: city, regionLabel: province.label, unitLayout: U,
    groups, baseTotal, feesTotal, contingency, grandTotal, costPerSqm,
    scenarios, splits, points, timeline, indexNote,
  };
}

/* ─────────────────── Timeline + inflation ─────────────────── */
function buildTimeline(
  inputs: CalcInputs,
  d: DerivedGeometry,
  plasterArea: number,
  paintArea: number,
  floorArea: number,
  facadeArea: number,
  windowArea: number,
  yardArea: number,
  units: number,
  groups: GroupRow[],
  grandTotal: number,
): TimelineInfo {
  const totalFloors = inputs.floors + inputs.commercialFloors;
  const permitLead = 45;
  const earthDays = cdiv(d.excavationVolume, 150) + (inputs.hasBasement ? cdiv(d.perimeterOccupied * 3.4, 22) : 0) + (inputs.waterTable === "high" ? 10 : 0) + 8;
  const earthStart = permitLead;
  const earthEnd = earthStart + earthDays;

  const skelDays = inputs.structureType === "concrete"
    ? totalFloors * 17 + (inputs.hasBasement ? 28 : 0) + 12
    : totalFloors * 11 + (inputs.hasBasement ? 26 : 0) + 10;
  const skelStart = earthEnd - 5;
  const skelEnd = skelStart + skelDays;

  const wallDays = cdiv(d.extWallArea + d.partitionArea / 2, 110);
  const wallStart = Math.max(skelStart + Math.round(skelDays * 0.45), earthEnd);
  const wallEnd = wallStart + wallDays;

  const mepRoughDays = cdiv(d.builtUpArea, 55);
  const mepStart = skelStart + Math.round(skelDays * 0.5);
  const mepEnd = mepStart + mepRoughDays + Math.round(cdiv(plasterArea, 170) * 0.5);

  const finishDays = cdiv(plasterArea, 170) + cdiv(floorArea, 75) + cdiv(paintArea, 220) + units * 3 + 18;
  const finishStart = Math.max(wallEnd - 12, skelEnd - totalFloors * 5);
  const finishEnd = finishStart + finishDays;

  const facadeDays = cdiv(facadeArea, 38);
  const facadeStart = skelEnd - 10;
  const facadeEnd = facadeStart + facadeDays;
  const winEnd = facadeStart + Math.round(facadeDays * 0.7) + cdiv(windowArea, 26);

  const elevEnd = Math.max(finishEnd, facadeEnd) + 5;
  const landDays = yardArea > 0 ? cdiv(yardArea, 28) + 10 : 0;
  const landEnd = Math.max(finishEnd, facadeEnd, elevEnd) + landDays;

  const commission = 20;
  const totalDays = Math.max(finishEnd, facadeEnd, winEnd, elevEnd, landEnd) + commission;

  const mkSpan = (start: number, end: number): SchedSpan => ({ start: Math.max(0, start), end, days: end - start });
  const entries: TimelineInfo["schedule"] = [
    { id: "services", title: "مجوزها و مطالعات", emoji: "📐", color: "#0ea5e9", span: mkSpan(0, permitLead + 20) },
    { id: "earth", title: "گودبرداری و سازه نگهبان", emoji: "⛏️", color: "#a16207", span: mkSpan(earthStart, earthEnd) },
    { id: "skeleton", title: "فونداسیون و اسکلت", emoji: "🏗️", color: "#dc2626", span: mkSpan(skelStart, skelEnd) },
    { id: "walls", title: "دیوارچینی", emoji: "🧱", color: "#ea580c", span: mkSpan(wallStart, wallEnd) },
    { id: "roof", title: "عایق بام", emoji: "☂️", color: "#0891b2", span: mkSpan(skelEnd - 6, skelEnd + 6) },
    { id: "mech", title: "تأسیسات مکانیکی", emoji: "🔧", color: "#7c3aed", span: mkSpan(mepStart, Math.max(mepEnd, finishEnd - 15)) },
    { id: "elec", title: "تأسیسات برقی", emoji: "⚡", color: "#ca8a04", span: mkSpan(mepStart, Math.max(mepEnd + 10, finishEnd - 10)) },
    { id: "finish", title: "نازک‌کاری", emoji: "🎨", color: "#16a34a", span: mkSpan(finishStart, finishEnd) },
    { id: "joinery", title: "درب و کابینت", emoji: "🚪", color: "#9333ea", span: mkSpan(finishStart + Math.round(finishDays * 0.45), finishEnd + 6) },
    { id: "facade", title: "نما و پنجره", emoji: "🪟", color: "#0d9488", span: mkSpan(facadeStart, Math.max(facadeEnd, winEnd)) },
    { id: "vertical", title: "آسانسور و مشاعات", emoji: "🛗", color: "#2563eb", span: mkSpan(Math.max(facadeStart, finishStart + 20), elevEnd) },
  ];
  if (groups.some((g) => g.id === "landscape")) {
    entries.push({ id: "landscape", title: "محوطه‌سازی", emoji: "🌳", color: "#65a30d", span: mkSpan(Math.max(finishEnd - 15, facadeStart + 20), landEnd) });
  }
  entries.push({ id: "site", title: "تحویل و رفع نقص", emoji: "🚛", color: "#78716c", span: mkSpan(totalDays - commission - 10, totalDays) });

  // Base monthly buckets (today-price)
  const months = Math.max(1, Math.ceil(totalDays / 30));
  const buckets = Array.from({ length: months }, () => 0);
  for (const e of entries) {
    const g = groups.find((gr) => gr.id === e.id);
    const cost = g?.total ?? 0;
    if (cost <= 0) continue;
    const s = e.span.start / 30;
    const en = Math.max(e.span.end / 30, s + 0.5);
    for (let m = 0; m < months; m++) {
      const lo = Math.max(m, s);
      const hi = Math.min(m + 1, en);
      if (hi > lo) buckets[m] += (cost * (hi - lo)) / (en - s);
    }
  }
  const scheduledSum = entries.reduce((sum, e) => sum + (groups.find((g) => g.id === e.id)?.total ?? 0), 0);
  const flat = (grandTotal - scheduledSum) / months;
  for (let m = 0; m < months; m++) buckets[m] += flat;

  // Inflation escalation (monthly compounding)
  const monthlyRate = inputs.inflationPct > 0 ? Math.pow(1 + inputs.inflationPct / 100, 1 / 12) - 1 : 0;
  let acc = 0;
  let inflatedTotal = 0;
  const cashflow: CashflowPoint[] = buckets.map((base, i) => {
    const nominal = base * Math.pow(1 + monthlyRate, i);
    const amount = Math.round(nominal / 1_000_000) * 1_000_000;
    acc += amount;
    inflatedTotal += amount;
    return { month: i + 1, amount, cum: acc };
  });

  return { totalDays, months, schedule: entries, cashflow, inflatedTotal, inflationPct: inputs.inflationPct };
}

/* ─────────────────── helpers ─────────────────── */
function qualityLabel(q: QualityLevel): string {
  return q === "economic" ? "اقتصادی" : q === "standard" ? "متوسط" : q === "good" ? "خوب" : "لوکس";
}

function lotFa(p: CalcInputs["lotPosition"]): string {
  return p === "corner" ? "نبش (دو بر)" : p === "triple" ? "سه‌بر" : "تک‌بر";
}

function faPercent(x: number): string {
  return `${faNum(Math.round(x * 1000) / 10)} درصد`;
}

function faDecimalTrim(n: number): string {
  return n.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

export function sanitize(inputs: CalcInputs): CalcInputs {
  const d = { ...DEFAULT_INPUTS, ...(inputs ?? {}) };
  const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : NaN);
  return {
    ...d,
    provinceId: typeof d.provinceId === "string" ? d.provinceId : "tehran",
    landWidth: clamp(half(num(d.landWidth) || 12), 5, 120),
    landDepth: clamp(half(num(d.landDepth) || 17), 8, 250),
    landArea: Math.round((num(d.landWidth) || 12) * (num(d.landDepth) || 17)),
    floors: clamp(Math.round(num(d.floors) || 1), 1, 25),
    commercialFloors: clamp(Math.round(num(d.commercialFloors) || 0), 0, 6),
    unitsPerFloor: clamp(Math.round(num(d.unitsPerFloor) || 1), 1, 20),
    occupancyPct: clamp(Math.round(num(d.occupancyPct) || 60), 30, 100),
    parkingCount: clamp(Math.round(num(d.parkingCount) || 0), 0, 200),
    elevatorPersons: clamp(Math.round(num(d.elevatorPersons) || 6), 4, 8),
    inflationPct: clamp(Math.round(num(d.inflationPct) || 0), 0, 60),
  };
}
