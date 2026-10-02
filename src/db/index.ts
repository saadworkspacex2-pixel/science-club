import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Lazily initialized so `next build` can safely import this module
// (page-data collection) even when DATABASE_URL isn't set at build time.
// Connections are only opened on the first real query (request time).

let _db: ReturnType<typeof drizzle> | null = null;

function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error(
      "DATABASE_URL is required — add it to your environment variables " +
        "(locally in .env, on Vercel in Project → Settings → Environment Variables)."
    );
  }

  // node-postgres does not support libpq's `channel_binding` param — strip it
  const connectionString = rawUrl.replace(/&?channel_binding=[^&]*/g, "");
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

  const pool = new Pool({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
    max: 5,
  });

  _db = drizzle(pool);
  return _db;
}

// Proxy forwards every method call (bound) to the lazily created client
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    const target = getDb() as unknown as Record<PropertyKey, unknown>;
    const value = target[prop];
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(target) : value;
  },
});
