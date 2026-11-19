import { NextResponse } from "next/server";
import { db } from "@/db";
import { priceOverrides } from "@/db/schema";
import { CATALOG } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  let overrides: Record<string, number> = {};
  try {
    const rows = await db.select().from(priceOverrides);
    for (const r of rows) overrides[r.itemKey] = r.adjustPct;
  } catch {
    /* ignore */
  }
  return NextResponse.json({ catalog: CATALOG, overrides });
}

export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  }
  const { itemKey, adjustPct } = (body ?? {}) as { itemKey?: string; adjustPct?: number };
  if (!itemKey || typeof adjustPct !== "number" || !CATALOG.some((c) => c.key === itemKey)) {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }
  const pct = Math.max(-80, Math.min(200, Math.round(adjustPct)));
  try {
    await db
      .insert(priceOverrides)
      .values({ itemKey, adjustPct: pct })
      .onConflictDoUpdate({ target: priceOverrides.itemKey, set: { adjustPct: pct, updatedAt: new Date() } });
    return NextResponse.json({ ok: true, itemKey, adjustPct: pct });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ذخیره تغییرات ناموفق بود" }, { status: 500 });
  }
}
