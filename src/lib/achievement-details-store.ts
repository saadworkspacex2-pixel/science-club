import { eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import {
  normalizeAchievementParticipants,
  type AchievementParticipant,
} from "@/lib/achievement-participant-config";

const KEY_PREFIX = "achievement_details_v1:";

export type AchievementDetails = {
  organizerInfo: string;
  olympiadWebsite: string;
  mapEmbedUrl: string;
  participants: AchievementParticipant[];
};

function keyFor(achievementId: number) {
  return `${KEY_PREFIX}${achievementId}`;
}

function normalizeDetails(input: unknown): AchievementDetails {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    organizerInfo: typeof value.organizerInfo === "string" ? value.organizerInfo : "",
    olympiadWebsite: typeof value.olympiadWebsite === "string" ? value.olympiadWebsite : "",
    mapEmbedUrl: typeof value.mapEmbedUrl === "string" ? value.mapEmbedUrl : "",
    participants: normalizeAchievementParticipants(value.participants),
  };
}

/** Keeps additive achievement metadata in the existing settings table when columns are absent. */
export async function saveAchievementDetails(achievementId: number, details: unknown) {
  const value = JSON.stringify(normalizeDetails(details));
  await db
    .insert(settings)
    .values({ key: keyFor(achievementId), value })
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
}

/** Read no-migration achievement metadata for a batch of records. */
export async function getAchievementDetailsMap(achievementIds: number[]) {
  const ids = Array.from(new Set(achievementIds.filter((id) => Number.isSafeInteger(id) && id > 0)));
  const result = new Map<number, AchievementDetails>();
  if (!ids.length) return result;

  try {
    const rows = await db
      .select({ key: settings.key, value: settings.value })
      .from(settings)
      .where(inArray(settings.key, ids.map(keyFor)));

    for (const row of rows) {
      const achievementId = Number(row.key.slice(KEY_PREFIX.length));
      if (!ids.includes(achievementId)) continue;
      try {
        result.set(achievementId, normalizeDetails(JSON.parse(row.value)));
      } catch {
        // Ignore malformed sidecar data and use the native columns instead.
      }
    }
  } catch {
    // Keep public pages available if the optional sidecar cannot be read.
  }

  return result;
}

export async function resolveAchievementDetails(
  achievementId: number,
  nativeDetails: Partial<AchievementDetails>
): Promise<AchievementDetails> {
  const sidecar = await getAchievementDetailsMap([achievementId]);
  const native = normalizeDetails(nativeDetails);
  return sidecar.get(achievementId) ?? native;
}

export async function deleteAchievementDetails(achievementId: number) {
  await db.delete(settings).where(eq(settings.key, keyFor(achievementId)));
}
