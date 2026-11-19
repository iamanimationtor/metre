import { db } from "@/db";
import { priceOverrides } from "@/db/schema";
import type { Overrides } from "./engine";

/** Load admin price adjustments from DB; empty map if table unavailable. */
export async function loadOverrides(): Promise<Overrides> {
  try {
    const rows = await db.select().from(priceOverrides);
    const map: Overrides = {};
    for (const row of rows) map[row.itemKey] = row.adjustPct;
    return map;
  } catch {
    return {};
  }
}
