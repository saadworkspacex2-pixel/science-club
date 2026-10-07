const MIGRATION_COLUMNS = {
  achievements: ["organizer_info", "olympiad_website", "map_embed_url", "participants"],
  members: ["certificates"],
} as const;

function collectDatabaseError(error: unknown) {
  const messages: string[] = [];
  const codes: string[] = [];
  const pending: unknown[] = [error];
  const seen = new Set<object>();

  // Drizzle wraps PostgreSQL errors in DrizzleQueryError.cause, so inspect the
  // nested cause as well as the outer query error and any driver-specific cause.
  while (pending.length && messages.length < 12) {
    const current = pending.shift();
    if (typeof current === "string") {
      messages.push(current);
      continue;
    }
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);

    const record = current as Record<string, unknown>;
    if (typeof record.message === "string") messages.push(record.message);
    if (typeof record.code === "string") codes.push(record.code);
    if (record.cause !== undefined) pending.push(record.cause);
    if (record.original !== undefined) pending.push(record.original);
  }

  return {
    message: messages.join("\n").toLowerCase(),
    code: codes.find((code) => code === "42703"), // PostgreSQL undefined_column
  };
}

/** Turn missing-column errors for the optional feature fields into an actionable admin message. */
export function getAdminWriteError(error: unknown, entity: string) {
  const { message, code } = collectDatabaseError(error);
  const missingColumn = code === "42703" || message.includes("does not exist");

  if (missingColumn) {
    if (MIGRATION_COLUMNS.achievements.some((column) => message.includes(column))) {
      return {
        error: "অর্জনের অতিরিক্ত তথ্য সংরক্ষণ করতে আগে src/db/migrations/2026-10-03-achievement-details.sql মাইগ্রেশনটি চালাতে হবে।",
        status: 409,
      };
    }
    if (entity === "members" && MIGRATION_COLUMNS.members.some((column) => message.includes(column))) {
      return {
        error: "সদস্যের সার্টিফিকেট সংরক্ষণ করতে আগে src/db/migrations/2026-10-03-member-certificates.sql মাইগ্রেশনটি চালাতে হবে।",
        status: 409,
      };
    }
  }

  if (message.includes("unique")) {
    return { error: "এই মানটি আগে থেকেই আছে", status: 400 };
  }
  return { error: "ত্রুটি হয়েছে", status: 400 };
}
