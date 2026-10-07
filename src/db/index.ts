import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseUrl } from "@/lib/env";

const rawUrl = databaseUrl();

if (!rawUrl) {
  throw new Error("DATABASE_URL is required");
}

/** node-postgres cannot forward libpq-only params like channel_binding */
function sanitizeUrl(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.delete("channel_binding");
    return u.toString();
  } catch {
    return url;
  }
}

const needsSsl = /sslmode=(require|verify-ca|verify-full)|neon\.tech|supabase|aiven|render/i.test(
  rawUrl
);

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: sanitizeUrl(rawUrl),
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
