import { NextResponse } from "next/server";
import { db } from "@/db";
import { estimates } from "@/db/schema";
import { computeEstimate, type Overrides } from "@/lib/engine";
import { loadIndexState } from "@/lib/indices";
import { loadOverrides } from "@/lib/overrides";
import { USAGE_OPTIONS, STRUCTURE_OPTIONS, QUALITY_OPTIONS, provinceById, labelFor } from "@/lib/constants";
import type { CalcInputs } from "@/lib/constants";

export const runtime = "nodejs";

function makeRef(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BC-${Date.now().toString(36).toUpperCase().slice(-5)}${rand}`;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "ورودی محاسبه ارسال نشده است" }, { status: 400 });
  }
  const inputs = body as CalcInputs;

  let overrides: Overrides = {};
  let scale = { material: 1, wage: 1 };
  try {
    overrides = await loadOverrides();
    const idx = await loadIndexState();
    scale = { material: idx.materialRatio, wage: idx.wageRatio };
  } catch {
    /* DB unavailable: fall back to reference-date catalog prices */
  }

  const result = computeEstimate(inputs, overrides, { scale });
  const refCode = makeRef();

  const meta = {
    derived: result.derived,
    scenarios: result.scenarios,
    regionCoef: result.regionCoef,
    baseTotal: result.baseTotal,
    contingency: result.contingency,
    unitLayout: result.unitLayout,
    timeline: result.timeline,
    points: result.points,
    splits: result.splits,
    indexNote: result.indexNote ?? null,
  };

  let saved = false;
  try {
    await db.insert(estimates).values({
      refCode,
      inputsJson: { ...result.inputs },
      provinceLabel: provinceById(result.inputs.provinceId).label,
      usageLabel: labelFor(USAGE_OPTIONS, result.inputs.usageType),
      structureLabel: labelFor(STRUCTURE_OPTIONS, result.inputs.structureType),
      qualityLabel: labelFor(QUALITY_OPTIONS, result.inputs.quality),
      landArea: result.inputs.landArea,
      floors: result.inputs.floors,
      totalUnits: result.derived.totalUnits,
      builtUpArea: result.derived.builtUpArea,
      baseTotal: String(result.baseTotal),
      feesTotal: String(result.feesTotal),
      grandTotal: String(result.grandTotal),
      costPerSqm: String(result.costPerSqm),
      groupsJson: result.groups,
      metaJson: meta,
    });
    saved = true;
  } catch (err) {
    console.error("Failed to persist estimate:", err);
  }

  return NextResponse.json({ refCode: saved ? refCode : null, result, saved });
}
