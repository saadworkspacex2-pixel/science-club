import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { achievements, members } from "@/db/schema";
import { getSession, isStaff, hashPassword } from "@/lib/auth";
import { ENTITY_MAP } from "@/lib/server-entities";
import { syncAchievementMembers } from "@/lib/achievement-members";
import {
  normalizeAchievementParticipants,
  participantMemberIds,
  validateAchievementParticipants,
  type AchievementParticipant,
} from "@/lib/achievement-participant-config";
import { validateMemberCertificates } from "@/lib/member-certificates";
import { getAdminWriteError } from "@/lib/admin-db-errors";
import { deleteMemberCertificates, saveMemberCertificates } from "@/lib/member-certificates-store";
import {
  deleteAchievementDetails,
  resolveAchievementDetails,
  saveAchievementDetails,
} from "@/lib/achievement-details-store";
import { achievementCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ entity: string; id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity, id } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  let savedParticipants: AchievementParticipant[] | undefined;
  for (const key of cfg.writable) {
    if (!(key in body)) continue;
    let v = body[key];
    if (cfg.ints?.includes(key)) {
      v = v === "" || v === null || v === undefined ? null : Number(v);
    } else if (cfg.bools?.includes(key)) {
      v = Boolean(v);
    } else if (typeof v === "string") {
      v = v.trim();
    }
    data[key] = v;
  }

  if (entity === "achievements" && "participants" in body) {
    const validated = validateAchievementParticipants(body.participants);
    if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });
    savedParticipants = validated.participants;
    data.participants = savedParticipants;
  }
  if (entity === "members" && "certificates" in body) {
    const validated = validateMemberCertificates(body.certificates);
    if ("error" in validated) return NextResponse.json({ error: validated.error }, { status: 400 });
    data.certificates = validated.certificates;
  }

  if (cfg.special === "users" && body.password) {
    const password = String(body.password);
    if (password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }
    data.passwordHash = hashPassword(password);
  }

  if (entity === "achievements" && savedParticipants === undefined && Array.isArray(body.memberIds)) {
    await syncAchievementMembers(Number(id), body.memberIds as number[]);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ row: { id: Number(id) } });
    }
  }

  try {
    if (entity === "members") {
      const memberData = { ...data };
      const hasCertificates = "certificates" in memberData;
      const certificates = memberData.certificates;
      delete memberData.certificates;

      let savedMember: { id: number } | undefined;
      if (Object.keys(memberData).length) {
        const [updated] = await (db.update(members) as any)
          .set(memberData)
          .where(eq(members.id, Number(id)))
          .returning({ id: members.id });
        savedMember = updated;
      } else {
        const [existing] = await db
          .select({ id: members.id })
          .from(members)
          .where(eq(members.id, Number(id)))
          .limit(1);
        savedMember = existing;
      }
      if (!savedMember) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });

      if (hasCertificates) {
        try {
          await saveMemberCertificates(savedMember.id, certificates);
        } catch {
          return NextResponse.json({
            error: "সদস্যের তথ্য আপডেট হয়েছে, কিন্তু সার্টিফিকেটের তালিকা সংরক্ষণ হয়নি। বিদ্যমান settings টেবিলে লেখা যায়নি।",
          }, { status: 500 });
        }
      }
      return NextResponse.json({ row: { ...savedMember, ...(hasCertificates ? { certificates } : {}) } });
    }

    if (entity === "achievements") {
      const achievementId = Number(id);
      const achievementData = { ...data };
      const detailKeys = ["organizerInfo", "olympiadWebsite", "mapEmbedUrl", "participants"] as const;
      const hasDetails = detailKeys.some((key) => key in achievementData);
      const [currentAchievement] = hasDetails
        ? await db.select({
            id: achievements.id,
            organizerInfo: achievementCompatibleSelection.organizerInfo,
            olympiadWebsite: achievementCompatibleSelection.olympiadWebsite,
            mapEmbedUrl: achievementCompatibleSelection.mapEmbedUrl,
            participants: achievementCompatibleSelection.participants,
          }).from(achievements).where(eq(achievements.id, achievementId)).limit(1)
        : [];
      if (hasDetails && !currentAchievement) {
        return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
      }
      const existingDetails = hasDetails && currentAchievement
        ? await resolveAchievementDetails(achievementId, currentAchievement)
        : undefined;
      const details = {
        organizerInfo: typeof achievementData.organizerInfo === "string"
          ? achievementData.organizerInfo
          : existingDetails?.organizerInfo ?? "",
        olympiadWebsite: typeof achievementData.olympiadWebsite === "string"
          ? achievementData.olympiadWebsite
          : existingDetails?.olympiadWebsite ?? "",
        mapEmbedUrl: typeof achievementData.mapEmbedUrl === "string"
          ? achievementData.mapEmbedUrl
          : existingDetails?.mapEmbedUrl ?? "",
        participants: savedParticipants
          ?? ("participants" in achievementData
            ? normalizeAchievementParticipants(achievementData.participants)
            : existingDetails?.participants ?? []),
      };
      for (const key of detailKeys) delete achievementData[key];

      let savedAchievement: { id: number } | undefined;
      if (Object.keys(achievementData).length) {
        const [updated] = await (db.update(achievements) as any)
          .set(achievementData)
          .where(eq(achievements.id, achievementId))
          .returning({ id: achievements.id });
        savedAchievement = updated;
      } else {
        const [existing] = await db
          .select({ id: achievements.id })
          .from(achievements)
          .where(eq(achievements.id, achievementId))
          .limit(1);
        savedAchievement = existing;
      }
      if (!savedAchievement) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });

      if (hasDetails) {
        try {
          await saveAchievementDetails(achievementId, details);
        } catch {
          return NextResponse.json({
            error: "অর্জনের তথ্য আপডেট হয়েছে, কিন্তু অতিরিক্ত তথ্য সংরক্ষণ হয়নি। বিদ্যমান settings টেবিলে লেখা যায়নি।",
          }, { status: 500 });
        }
      }
      if (savedParticipants !== undefined) {
        await syncAchievementMembers(achievementId, participantMemberIds(savedParticipants));
      }
      return NextResponse.json({ row: { ...savedAchievement, ...(hasDetails ? details : {}) } });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await (db.update(cfg.table as any) as any)
      .set(data)
      .where(eq(cfg.table.id, Number(id)))
      .returning();
    if (!row) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
    if (cfg.special === "users") {
      const rec = row as Record<string, unknown>;
      delete rec.passwordHash;
    }
    return NextResponse.json({ row });
  } catch (e: unknown) {
    const failure = getAdminWriteError(e, entity);
    return NextResponse.json({ error: failure.error }, { status: failure.status });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity, id } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db.delete(cfg.table as any) as any).where(eq(cfg.table.id, Number(id)));
  if (entity === "members") {
    await deleteMemberCertificates(Number(id)).catch(() => undefined);
  } else if (entity === "achievements") {
    await deleteAchievementDetails(Number(id)).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
