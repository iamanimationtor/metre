import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/** Liveness + database connectivity probe (used by Netlify/monitoring). */
export async function GET() {
  let database: "up" | "down" = "down";
  try {
    await db.execute(sql`select 1`);
    database = "up";
  } catch {
    /* fallthrough — app can still serve static content & client-side estimates */
  }
  return Response.json({
    ok: true,
    service: "hermimetr",
    database,
    time: new Date().toISOString(),
  });
}
