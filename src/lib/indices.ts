/**
 * Automatic price-index system — modeled on سازمان برنامه «شاخص‌های تعدیل».
 * Two live indices (materials & wages) sit on top of the catalog whose
 * reference date is ۱۴۰۵/۰۸/۲۸. Between manual updates an AUTOMATIC monthly
 * drift compounds forward, so estimates are always current without editing
 * dozens of prices. Admin can bake the drift into the stored index anytime.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings, priceIndices } from "@/db/schema";

export const INDEX_BASE = 100;
export const REFERENCE_DATE_FA = "۲۸ آبان ۱۴۰۵";
export const DEFAULT_MONTHLY_DRIFT = 2.5; // % per month auto-escalation

export interface IndexState {
  materialBase: number;
  wageBase: number;
  driftPct: number;
  updatedAt: string | null;
  monthsSinceUpdate: number;
  /** Effective multipliers applied to catalog prices right now. */
  materialRatio: number;
  wageRatio: number;
}

const NEUTRAL: IndexState = {
  materialBase: INDEX_BASE,
  wageBase: INDEX_BASE,
  driftPct: DEFAULT_MONTHLY_DRIFT,
  updatedAt: null,
  monthsSinceUpdate: 0,
  materialRatio: 1,
  wageRatio: 1,
};

const MONTH_MS = 30.44 * 24 * 3600 * 1000;
const round3 = (n: number) => Math.round(n * 1000) / 1000;

async function ensureSeeded() {
  await db.insert(priceIndices).values({ kind: "material", value: INDEX_BASE }).onConflictDoNothing({ target: priceIndices.kind });
  await db.insert(priceIndices).values({ kind: "wage", value: INDEX_BASE }).onConflictDoNothing({ target: priceIndices.kind });
  await db
    .insert(appSettings)
    .values({ key: "monthly_drift_pct", value: String(DEFAULT_MONTHLY_DRIFT) })
    .onConflictDoNothing({ target: appSettings.key });
}

function monthsBetween(date: Date): number {
  return Math.max(0, (Date.now() - date.getTime()) / MONTH_MS);
}

/** Read current state incl. automatic drift accrued since the last update. */
export async function loadIndexState(): Promise<IndexState> {
  try {
    await ensureSeeded();
    const rows = await db.select().from(priceIndices);
    const mat = rows.find((r) => r.kind === "material");
    const wag = rows.find((r) => r.kind === "wage");
    const settings = await db.select().from(appSettings).where(eq(appSettings.key, "monthly_drift_pct")).limit(1);
    const driftPct = Number(settings[0]?.value ?? DEFAULT_MONTHLY_DRIFT) || DEFAULT_MONTHLY_DRIFT;
    const updatedAt = mat?.updatedAt ?? null;
    const months = updatedAt ? monthsBetween(new Date(updatedAt)) : 0;
    const driftFactor = Math.pow(1 + driftPct / 100, months);
    return {
      materialBase: mat?.value ?? INDEX_BASE,
      wageBase: wag?.value ?? INDEX_BASE,
      driftPct,
      updatedAt: updatedAt ? new Date(updatedAt).toISOString() : null,
      monthsSinceUpdate: round3(months),
      materialRatio: round3(((mat?.value ?? INDEX_BASE) / INDEX_BASE) * driftFactor),
      wageRatio: round3(((wag?.value ?? INDEX_BASE) / INDEX_BASE) * driftFactor),
    };
  } catch {
    return NEUTRAL;
  }
}

/** Set an index value manually (resets the drift clock to now). */
export async function setIndexValue(kind: "material" | "wage", value: number): Promise<IndexState> {
  const v = Math.min(400, Math.max(40, Math.round(value * 10) / 10));
  await ensureSeeded();
  await db.update(priceIndices).set({ value: v, updatedAt: new Date() }).where(eq(priceIndices.kind, kind));
  return loadIndexState();
}

export async function setDriftPct(pct: number): Promise<IndexState> {
  const v = Math.min(15, Math.max(0, Math.round(pct * 10) / 10));
  await ensureSeeded();
  await db
    .update(appSettings)
    .set({ value: String(v), updatedAt: new Date() })
    .where(eq(appSettings.key, "monthly_drift_pct"));
  return loadIndexState();
}

/** «به‌روزرسانی تا امروز»: bake ONLY the accrued automatic drift into stored values, reset clock. */
export async function bakeDrift(): Promise<IndexState> {
  const state = await loadIndexState();
  await ensureSeeded();
  const driftFactor = Math.pow(1 + state.driftPct / 100, state.monthsSinceUpdate);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  const now = new Date();
  await db
    .update(priceIndices)
    .set({ value: r1(state.materialBase * driftFactor), updatedAt: now })
    .where(eq(priceIndices.kind, "material"));
  await db
    .update(priceIndices)
    .set({ value: r1(state.wageBase * driftFactor), updatedAt: now })
    .where(eq(priceIndices.kind, "wage"));
  return loadIndexState();
}
