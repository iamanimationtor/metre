/** Client-side BOM exporters (Excel-compatible CSV with UTF-8 BOM & JSON). */
import type { EstimateResult } from "./engine";
import { buildBom } from "./takeoff";

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const line = (cells: (string | number)[]) => cells.map(csvEscape).join(",");

export function buildCsv(res: EstimateResult, refCode?: string): string {
  const rows: string[] = [];
  const i = res.inputs;
  const d = res.derived;

  // ── Header & configuration ───────────────────────────────
  rows.push(line(["گزارش متره و برآورد هزینه ساخت — HERMIMETR"]));
  rows.push(line([`کد پیگیری:${refCode ?? "—"}`, `منطقه:${res.regionLabel} (ضریب ${res.regionCoef})`, `تاریخ:${new Date().toLocaleDateString("fa-IR")}`]));
  rows.push("");
  rows.push(line(["— مشخصات ورودی —"]));
  rows.push(line(["بر × طول زمین (متر)", `${d.landWidth}×${d.landDepth}`, "مساحت زمین (م²)", d.landArea, "سطح اشغال (%)", i.occupancyPct, "موقعیت قطعه", i.lotPosition]));
  rows.push(line(["طبقات مسکونی", i.floors, "طبقات تجاری", i.commercialFloors, "واحد در طبقه", i.unitsPerFloor, "کل واحدها", d.totalUnits]));
  rows.push(line(["اسکلت", i.structureType, "سقف", i.slabType, "ارتفاع طبقه", i.ceilingHeight, "کیفیت", i.quality]));
  rows.push(line(["زیربنای کل (م²)", d.builtUpArea, "نما", `${i.facadeType}/${i.facadeStyle}`, "پنجره", i.windowType, "گرمایش", i.heatingSystem]));
  rows.push("");

  // ── Items ────────────────────────────────────────────────
  rows.push(line(["— ریز اقلام متره —"]));
  rows.push(line(["گروه", "شرح آیتم", "مقدار", "واحد", "قیمت واحد (تومان)", "جمع کل (تومان)", "دستمزد", "مصالح", "فرمول محاسبه", "منبع قیمت"]));
  for (const g of res.groups) {
    for (const it of g.items) {
      rows.push(line([g.title, it.label, it.qty, it.unit, it.unitPrice, it.total, it.lab, it.mat, it.formula, `${it.src}${it.note ? ` — ${it.note}` : ""}`]));
    }
    rows.push(line([`جمع گروه: ${g.title}`, "", "", "", "", g.total, g.lab, g.mat, "", ""]));
  }
  rows.push("");

  // ── Totals ───────────────────────────────────────────────
  rows.push(line(["— خلاصه مالی —"]));
  rows.push(line(["هزینه‌های فیزیکی", res.baseTotal, "مجوزها و عوارض", res.feesTotal, "ذخیره احتیاطی", res.contingency, "برآورد نهایی (تومان)", res.grandTotal]));
  rows.push(line(["هر مترمربع (تومان)", res.costPerSqm, "سهم دستمزد", res.splits.labor, "سهم مصالح", res.splits.material, "سایر", res.splits.other]));
  if (res.timeline?.inflatedTotal > res.grandTotal) {
    rows.push(line([`برآورد اسمی با تورم ${res.timeline.inflationPct}٪ سالانه`, res.timeline.inflatedTotal, "مدت اجرا (ماه)", res.timeline.months, "", "", "", ""]));
  }
  rows.push("");

  // ── Schedule ─────────────────────────────────────────────
  if (res.timeline?.schedule?.length) {
    rows.push(line(["— برنامه زمان‌بندی —"]));
    rows.push(line(["فعالیت", "شروع (ماه)", "پایان (ماه)", "مدت (روز)", "هزینه (تومان)"]));
    for (const e of res.timeline.schedule) {
      const cost = res.groups.find((g) => g.id === e.id)?.total ?? 0;
      rows.push(line([e.title, Math.ceil(e.span.start / 30), Math.ceil(e.span.end / 30), e.span.days, cost]));
    }
    rows.push("");
  }

  // ── Component-level BOM ──────────────────────────────────
  const bom = buildBom(res);
  rows.push(line(["— ریزِ ریز مصالح و ملزومات (دانه به دانه) —"]));
  rows.push(line(["کد", "بخش", "شرح کالا", "مقدار", "واحد", "قیمت مرجع واحد (تومان)", "برآورد خرید (تومان)", "مبنای محاسبه"]));
  for (const s of bom.sections) {
    for (const r of s.rows) {
      rows.push(line([r.code, s.title, r.title, r.qty, r.unit, r.unitPrice, r.total, r.basis]));
    }
    rows.push(line([`جمع بخش: ${s.title}`, "", "", "", "", "", s.total, ""]));
  }
  rows.push(line(["جمع کل خرید مواد (تومان)", bom.grandTotal, "", "", "", "", "", ""]));
  rows.push("");

  // ── Equipment purchases ──────────────────────────────────
  rows.push(line(["— فهرست خرید تجهیزات و دستگاه‌ها —"]));
  rows.push(line(["شرح", "مقدار", "واحد", "توضیح"]));
  for (const e of bom.equipment) rows.push(line([e.title, e.qty, e.unit, e.note]));
  rows.push("");

  // ── Tools & machinery ────────────────────────────────────
  rows.push(line(["— ماشین‌آلات و ابزار کارگاهی —"]));
  rows.push(line(["شرح", "نیاز تقریبی", "مبنا"]));
  for (const t of bom.tools) rows.push(line([t.title, t.qtyText, t.basis]));
  rows.push("");

  // ── Labor plan ───────────────────────────────────────────
  rows.push(line(["— برنامه نیروی انسانی —"]));
  rows.push(line(["تخصص", "نفر-روز", "ماه تک‌اکیپ"]));
  for (const l of bom.labor) rows.push(line([l.trade, l.personDays, l.teamMonths]));
  rows.push(line(["جمع نفر-روز", bom.totalPersonDays, "", ""]));
  rows.push("");

  // ── Points ───────────────────────────────────────────────
  const p = res.points;
  rows.push(line(["— شمارش نقاط تأسیساتی —"]));
  rows.push(line(["پریز", p.outlets, "کلید", p.switches, "روشنایی", p.lightPoints, "شبکه/TV", p.dataPoints]));
  rows.push(line(["شیرآلات", p.faucets, "فرنگی", p.wcs, "دوش", p.showers, "پره رادیاتور", p.radiatorSections]));

  return "\uFEFF" + rows.join("\r\n");
}

export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export function exportCsv(res: EstimateResult, refCode?: string) {
  downloadText(`متره-برآورد-${refCode ?? "ساختمان"}.csv`, buildCsv(res, refCode), "text/csv");
}

export function exportJson(res: EstimateResult, refCode?: string) {
  const payload = { schemaVersion: 3, refCode, exportedAt: new Date().toISOString(), result: res };
  downloadText(`متره-برآورد-${refCode ?? "ساختمان"}.json`, JSON.stringify(payload, null, 2), "application/json");
}
