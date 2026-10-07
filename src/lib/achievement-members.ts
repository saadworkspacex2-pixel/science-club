import { eq, inArray, asc } from "drizzle-orm";
import { db } from "@/db";
import { achievementMembers, members, achievements } from "@/db/schema";
import { achievementCompatibleSelection } from "@/lib/compatible-entity-selects";
import { getAchievementDetailsMap } from "@/lib/achievement-details-store";

/** Replace the member list linked to an achievement */
export async function syncAchievementMembers(achievementId: number, memberIds: number[]) {
  const ids = Array.from(
    new Set(memberIds.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0))
  );
  await db.delete(achievementMembers).where(eq(achievementMembers.achievementId, achievementId));
  if (ids.length) {
    await db
      .insert(achievementMembers)
      .values(ids.map((memberId) => ({ achievementId, memberId })))
      .onConflictDoNothing();
  }
}

/** memberIds for a single achievement */
export async function getMemberIdsFor(achievementId: number): Promise<number[]> {
  const rows = await db
    .select({ memberId: achievementMembers.memberId })
    .from(achievementMembers)
    .where(eq(achievementMembers.achievementId, achievementId));
  return rows.map((r) => r.memberId);
}

/** Map of achievementId -> memberIds[] for a batch of achievements */
export async function getMemberIdMap(achievementIds: number[]) {
  const map = new Map<number, number[]>();
  if (!achievementIds.length) return map;
  const rows = await db
    .select()
    .from(achievementMembers)
    .where(inArray(achievementMembers.achievementId, achievementIds));
  for (const r of rows) {
    map.set(r.achievementId, [...(map.get(r.achievementId) ?? []), r.memberId]);
  }
  return map;
}

/** Full member records that took part in an achievement */
export async function getTeamForAchievement(achievementId: number) {
  const ids = await getMemberIdsFor(achievementId);
  if (!ids.length) return [];
  return db
    .select({
      id: members.id,
      name: members.name,
      role: members.role,
      photoUrl: members.photoUrl,
      className: members.className,
    })
    .from(members)
    .where(inArray(members.id, ids))
    .orderBy(asc(members.sortOrder));
}

/** Achievements linked to a member — powers the auto portfolio section */
export async function getAchievementsForMember(memberId: number) {
  const links = await db
    .select({ achievementId: achievementMembers.achievementId })
    .from(achievementMembers)
    .where(eq(achievementMembers.memberId, memberId));
  const ids = links.map((l) => l.achievementId);
  if (!ids.length) return [];
  const rows = await db
    .select(achievementCompatibleSelection)
    .from(achievements)
    .where(inArray(achievements.id, ids))
    .orderBy(asc(achievements.sortOrder));
  const detailsById = await getAchievementDetailsMap(rows.map((row) => row.id));
  return rows.map((row) => ({ ...row, ...(detailsById.get(row.id) ?? {}) }));
}
