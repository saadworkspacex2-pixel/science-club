import { config } from "dotenv";
import { existsSync } from "fs";
import path from "path";

/**
 * Loads durable overrides from .env.neon — the platform may rewrite `.env`
 * during bootstrap, so the production database URL and session secret live
 * in this separate file which is never touched.
 */
const overridePath = path.join(process.cwd(), ".env.neon");
if (existsSync(overridePath)) {
  config({ path: overridePath, override: false });
}

export function databaseUrl(): string {
  return (
    process.env.NEON_DATABASE_URL ||
    process.env.DATABASE_URL ||
    ""
  );
}
