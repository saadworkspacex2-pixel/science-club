import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { normalizeMemberCertificates, type MemberCertificate } from "@/lib/member-certificates";

const KEY_PREFIX = "member_certificates_v1:";

function keyFor(memberId: number) {
  return `${KEY_PREFIX}${memberId}`;
}

/**
 * Keeps certificate metadata in the existing settings key/value table, so the
 * certificate feature can work on installations where the additive members
 * column has not been applied yet.
 */
export async function saveMemberCertificates(memberId: number, certificates: unknown) {
  const value = JSON.stringify(normalizeMemberCertificates(certificates));
  await db
    .insert(settings)
    .values({ key: keyFor(memberId), value })
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
}

/** Read any no-migration certificate records for a batch of members. */
export async function getMemberCertificatesMap(memberIds: number[]) {
  const ids = Array.from(new Set(memberIds.filter((id) => Number.isSafeInteger(id) && id > 0)));
  const result = new Map<number, MemberCertificate[]>();
  if (!ids.length) return result;

  try {
    const rows = await db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, ids.map(keyFor)));

    for (const row of rows) {
      const memberId = Number(row.key.slice(KEY_PREFIX.length));
      if (!ids.includes(memberId)) continue;
      try {
        result.set(memberId, normalizeMemberCertificates(JSON.parse(row.value)));
      } catch {
        // Ignore malformed sidecar data and let the native column be used.
      }
    }
  } catch {
    // Public reads must continue to work if the optional sidecar is unavailable.
  }

  return result;
}

/** Sidecar values take precedence; otherwise use the native column when present. */
export async function resolveMemberCertificates(memberId: number, nativeValue: unknown) {
  const sidecar = await getMemberCertificatesMap([memberId]);
  return sidecar.has(memberId) ? sidecar.get(memberId)! : normalizeMemberCertificates(nativeValue);
}

export async function deleteMemberCertificates(memberId: number) {
  await db.delete(settings).where(eq(settings.key, keyFor(memberId)));
}
