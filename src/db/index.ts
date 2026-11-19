import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim();

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

// Do not fail the Next.js build just because the deploy environment has not
// been configured yet. Database-backed routes handle an unavailable database
// and the public pages can still be built and served.
export const pool: Pool | undefined = databaseUrl
  ? globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
      // Netlify Functions are short-lived/serverless; one connection per warm
      // instance avoids multiplying the default pool size under concurrency.
      max: 1,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    })
  : undefined;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db: NodePgDatabase = pool
  ? drizzle(pool)
  : new Proxy({} as NodePgDatabase, {
      get(_target, property) {
        throw new Error(
          `DATABASE_URL is not configured; database-backed features are unavailable (attempted ${String(property)}).`,
        );
      },
    });
