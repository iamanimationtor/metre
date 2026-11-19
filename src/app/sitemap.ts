import type { MetadataRoute } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { estimates } from "@/db/schema";
import { siteBase } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBase();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/calculator`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${base}/guide`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/methodology`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/history`, changeFrequency: "daily", priority: 0.6 },
  ];

  try {
    const rows = await db
      .select({ refCode: estimates.refCode, createdAt: estimates.createdAt })
      .from(estimates)
      .orderBy(desc(estimates.createdAt))
      .limit(200);
    return [
      ...staticPages,
      ...rows.map((r) => ({
        url: `${base}/report/${r.refCode}`,
        lastModified: r.createdAt,
        changeFrequency: "never" as const,
        priority: 0.4,
      })),
    ];
  } catch {
    return staticPages;
  }
}
