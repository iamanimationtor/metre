import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { estimates } from "@/db/schema";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  try {
    const rows = await db.select().from(estimates).where(eq(estimates.refCode, ref)).limit(1);
    if (rows.length === 0) {
      return NextResponse.json({ error: "گزارشی با این کد پیدا نشد" }, { status: 404 });
    }
    return NextResponse.json({ item: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطا در دریافت گزارش" }, { status: 500 });
  }
}
