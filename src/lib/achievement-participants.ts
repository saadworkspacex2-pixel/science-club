import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { members } from "@/db/schema";
import {
  normalizeAchievementParticipants,
  type AchievementParticipant,
} from "@/lib/achievement-participant-config";
import { getTeamForAchievement } from "@/lib/achievement-members";

export type AchievementParticipantProfile = AchievementParticipant & {
  photoUrl: string;
  className: string;
};

export async function getAchievementParticipantProfiles(
  achievementId: number,
  rawParticipants: unknown
): Promise<AchievementParticipantProfile[]> {
  const participants = normalizeAchievementParticipants(rawParticipants);

  // Merge legacy member links so old records remain visible until re-saved.
  const legacyMembers = await getTeamForAchievement(achievementId);
  const storedMemberIds = new Set(participants.map((participant) => participant.memberId).filter((memberId): memberId is number => memberId !== null));
  const combined = [
    ...participants,
    ...legacyMembers
      .filter((member) => !storedMemberIds.has(member.id))
      .map((member, index) => ({
        id: `legacy-${member.id}-${index}`,
        memberId: member.id,
        name: member.name,
        role: member.role,
        sector: "",
        result: "unknown" as const,
        award: "",
      })),
  ];

  const memberIds = Array.from(new Set(
    combined
      .map((participant) => participant.memberId)
      .filter((memberId): memberId is number => memberId !== null)
  ));
  const linkedMembers = memberIds.length
    ? await db
        .select({ id: members.id, name: members.name, role: members.role, photoUrl: members.photoUrl, className: members.className })
        .from(members)
        .where(inArray(members.id, memberIds))
    : [];
  const membersById = new Map(linkedMembers.map((member) => [member.id, member]));

  return combined.map((participant) => {
    const member = participant.memberId ? membersById.get(participant.memberId) : undefined;
    return {
      ...participant,
      name: member?.name || participant.name,
      role: member?.role || participant.role,
      photoUrl: member?.photoUrl || "",
      className: member?.className || "",
    };
  });
}
