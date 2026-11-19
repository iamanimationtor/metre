import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { estimates } from "@/db/schema";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await db
      .select({
        refCode: estimates.refCode,
        createdAt: estimates.createdAt,
        provinceLabel: estimates.provinceLabel,
        usageLabel: estimates.usageLabel,
        structureLabel: estimates.structureLabel,
        qualityLabel: estimates.qualityLabel,
        landArea: estimates.landArea,
        floors: estimates.floors,
        totalUnits: estimates.totalUnits,
        builtUpArea: estimates.builtUpArea,
        grandTotal: estimates.grandTotal,
        costPerSqm: estimates.costPerSqm,
      })
      .from(estimates)
      .orderBy(desc(estimates.createdAt))
      .limit(24);
    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ items: [] });
  }
}
