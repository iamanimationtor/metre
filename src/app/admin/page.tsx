import type { Metadata } from "next";
import { count, desc, sql } from "drizzle-orm";
import AdminTabs from "@/components/admin/AdminTabs";
import IndexPanel from "@/components/admin/IndexPanel";
import PriceEditor from "@/components/admin/PriceEditor";
import StatsPanel, { type AdminStats } from "@/components/admin/StatsPanel";
import { CATALOG } from "@/lib/catalog";
import { loadIndexState } from "@/lib/indices";
import { loadOverrides } from "@/lib/overrides";
import { db } from "@/db";
import { estimates } from "@/db/schema";

export const metadata: Metadata = {
  title: "مدیریت سامانه",
};

export const dynamic = "force-dynamic";

const EMPTY: AdminStats = { totalReports: 0, avgGrand: 0, avgPerSqm: 0, byQuality: [], byStructure: [], byProvince: [], recent: [] };

async function collectStats(): Promise<AdminStats> {
  try {
    const totals = await db
      .select({
        n: count(),
        avgGrand: sql<string>`coalesce(avg(${estimates.grandTotal}::bigint), 0)`,
        avgPer: sql<string>`coalesce(avg(${estimates.costPerSqm}::bigint), 0)`,
      })
      .from(estimates);

    const byQualityRaw = await db
      .select({ label: estimates.qualityLabel, n: count(), avgPer: sql<string>`avg(${estimates.costPerSqm}::bigint)` })
      .from(estimates)
      .groupBy(estimates.qualityLabel);

    const byStructureRaw = await db
      .select({ label: estimates.structureLabel, n: count(), avgPer: sql<string>`avg(${estimates.costPerSqm}::bigint)` })
      .from(estimates)
      .groupBy(estimates.structureLabel);

    const byProvinceRaw = await db
      .select({ label: estimates.provinceLabel, n: count() })
      .from(estimates)
      .groupBy(estimates.provinceLabel)
      .orderBy(desc(count()))
      .limit(6);

    const recentRaw = await db
      .select({
        refCode: estimates.refCode,
        provinceLabel: estimates.provinceLabel,
        qualityLabel: estimates.qualityLabel,
        floors: estimates.floors,
        totalUnits: estimates.totalUnits,
        grandTotal: estimates.grandTotal,
        costPerSqm: estimates.costPerSqm,
        createdAt: estimates.createdAt,
      })
      .from(estimates)
      .orderBy(desc(estimates.createdAt))
      .limit(8);

    return {
      totalReports: totals[0]?.n ?? 0,
      avgGrand: Math.round(Number(totals[0]?.avgGrand ?? 0)),
      avgPerSqm: Math.round(Number(totals[0]?.avgPer ?? 0)),
      byQuality: byQualityRaw.map((r) => ({ label: r.label, n: r.n, avgPer: Math.round(Number(r.avgPer ?? 0)) })),
      byStructure: byStructureRaw.map((r) => ({ label: r.label, n: r.n, avgPer: Math.round(Number(r.avgPer ?? 0)) })),
      byProvince: byProvinceRaw.map((r) => ({ label: r.label, n: r.n })),
      recent: recentRaw,
    };
  } catch (err) {
    console.error(err);
    return EMPTY;
  }
}

export default async function AdminPage() {
  let overrides: Record<string, number> = {};
  try {
    overrides = await loadOverrides();
  } catch {
    /* ignore */
  }
  const [stats, indexState] = await Promise.all([collectStats(), loadIndexState().catch(() => null)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">⚙️ مرکز مدیریت سامانه</h1>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          قیمت‌ها با شاخص‌های زنده مصالح و دستمزد به‌صورت خودکار به‌روز می‌شوند (مبنا: ۲۸ آبان ۱۴۰۵)؛
          هر تغییری بلافاصله در همه برآوردهای جدید اعمال می‌شود.
        </p>
      </header>
      <div className="mt-8">
        <AdminTabs
          indexSlot={<IndexPanel initial={indexState} />}
          priceSlot={<PriceEditor initialOverrides={overrides} />}
          statsSlot={<StatsPanel stats={stats} />}
        />
      </div>
      <p className="mt-8 text-[11px] leading-6 text-slate-400">
        💡 قیمت‌های پیش‌فرض میانگین بازار سال ۱۴۰۴ هستند؛ درصد تعدیل هر آیتم نسبت به همان پایه ذخیره می‌شود و با دکمه بازنشانی به صفر برمی‌گردد.
      </p>
    </div>
  );
}
