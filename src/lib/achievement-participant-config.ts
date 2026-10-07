export const PARTICIPANT_RESULTS = [
  { value: "awarded", label: "পুরস্কার পেয়েছে" },
  { value: "no_award", label: "অংশ নিয়েছে, পুরস্কার পায়নি" },
  { value: "participated", label: "অংশগ্রহণ করেছে" },
  { value: "unknown", label: "ফল উল্লেখ নেই" },
] as const;

export type ParticipantResult = (typeof PARTICIPANT_RESULTS)[number]["value"];

export type AchievementParticipant = {
  id: string;
  memberId: number | null;
  name: string;
  role: string;
  sector: string;
  result: ParticipantResult;
  award: string;
};

export const MAX_ACHIEVEMENT_PARTICIPANTS = 100;

export function normalizeAchievementParticipants(input: unknown): AchievementParticipant[] {
  if (!Array.isArray(input)) return [];
  const allowedResults = new Set<string>(PARTICIPANT_RESULTS.map((item) => item.value));

  return input.slice(0, MAX_ACHIEVEMENT_PARTICIPANTS).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    const rawMemberId = Number(value.memberId);
    const memberId = Number.isInteger(rawMemberId) && rawMemberId > 0 ? rawMemberId : null;
    const rawId = typeof value.id === "string" ? value.id.trim() : "";
    const id = /^[a-zA-Z0-9_-]{1,80}$/.test(rawId) ? rawId : `participant-${index + 1}`;
    const result = typeof value.result === "string" && allowedResults.has(value.result)
      ? value.result as ParticipantResult
      : "unknown";

    return [{
      id,
      memberId,
      name: typeof value.name === "string" ? value.name.trim().slice(0, 120) : "",
      role: typeof value.role === "string" ? value.role.trim().slice(0, 100) : "",
      sector: typeof value.sector === "string" ? value.sector.trim().slice(0, 120) : "",
      result,
      award: typeof value.award === "string" ? value.award.trim().slice(0, 180) : "",
    }];
  });
}

export function participantMemberIds(participants: AchievementParticipant[]) {
  return Array.from(new Set(
    participants
      .map((participant) => participant.memberId)
      .filter((memberId): memberId is number => Number.isInteger(memberId) && (memberId ?? 0) > 0)
  ));
}

export function validateAchievementParticipants(input: unknown):
  | { participants: AchievementParticipant[] }
  | { error: string } {
  if (!Array.isArray(input) || input.length > MAX_ACHIEVEMENT_PARTICIPANTS) {
    return { error: `সর্বোচ্চ ${MAX_ACHIEVEMENT_PARTICIPANTS} জন শিক্ষার্থী যোগ করা যাবে` };
  }
  const participants = normalizeAchievementParticipants(input);
  if (participants.length !== input.length) {
    return { error: "অংশগ্রহণকারীর তালিকার তথ্য সঠিক নয়" };
  }
  if (participants.some((participant) => !participant.name.trim())) {
    return { error: "প্রতিটি শিক্ষার্থীর নাম লিখুন" };
  }
  return { participants };
}
