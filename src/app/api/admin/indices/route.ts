import { NextResponse } from "next/server";
import { bakeDrift, loadIndexState, setDriftPct, setIndexValue } from "@/lib/indices";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ state: await loadIndexState() });
  } catch {
    return NextResponse.json({ state: null });
  }
}

export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بدنه درخواست نامعتبر است" }, { status: 400 });
  }
  const b = (body ?? {}) as { kind?: string; value?: number; driftPct?: number; bake?: boolean };
  try {
    if (b.bake) return NextResponse.json({ state: await bakeDrift() });
    if (typeof b.driftPct === "number") return NextResponse.json({ state: await setDriftPct(b.driftPct) });
    if ((b.kind === "material" || b.kind === "wage") && typeof b.value === "number") {
      return NextResponse.json({ state: await setIndexValue(b.kind, b.value) });
    }
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "به‌روزرسانی شاخص ناموفق بود" }, { status: 500 });
  }
}
