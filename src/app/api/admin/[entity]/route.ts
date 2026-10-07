import { NextRequest, NextResponse } from "next/server";
import { ilike, or, asc, inArray, type Column } from "drizzle-orm";
import { db } from "@/db";
import { users, members, achievements } from "@/db/schema";
import { getSession, isStaff, hashPassword } from "@/lib/auth";
import { ENTITY_MAP } from "@/lib/server-entities";
import { syncAchievementMembers, getMemberIdMap } from "@/lib/achievement-members";
import {
  normalizeAchievementParticipants,
  participantMemberIds,
  validateAchievementParticipants,
} from "@/lib/achievement-participant-config";
import { normalizeMemberCertificates, validateMemberCertificates } from "@/lib/member-certificates";
import {
  achievementCompatibleSelection,
  memberCompatibleSelection,
} from "@/lib/compatible-entity-selects";
import { getAdminWriteError } from "@/lib/admin-db-errors";
import { getMemberCertificatesMap, saveMemberCertificates } from "@/lib/member-certificates-store";
import { getAchievementDetailsMap, saveAchievementDetails } from "@/lib/achievement-details-store";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ entity: string }> };

function sanitize(rows: Record<string, unknown>[], special?: string) {
  if (special !== "users") return rows;
  return rows.map(({ passwordHash: _p, ...rest }) => rest);
}

function pickBody(cfg: (typeof ENTITY_MAP)[string], body: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
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
  return data;
}

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });

  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const orderCol = (cfg.order ?? asc(cfg.table.id)) as never;
  const table = cfg.table as never;

  let rows: unknown[];
  if (entity === "achievements") {
    const query = db.select(achievementCompatibleSelection).from(achievements);
    if (q && cfg.search?.length) {
      const p = `%${q}%`;
      rows = await query.where(or(...cfg.search.map((c: Column) => ilike(c, p)))).orderBy(orderCol);
    } else {
      rows = await query.orderBy(orderCol);
    }
  } else if (entity === "members") {
    const query = db.select(memberCompatibleSelection).from(members);
    if (q && cfg.search?.length) {
      const p = `%${q}%`;
      rows = await query.where(or(...cfg.search.map((c: Column) => ilike(c, p)))).orderBy(orderCol);
    } else {
      rows = await query.orderBy(orderCol);
    }
  } else if (q && cfg.search?.length) {
    const p = `%${q}%`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = await (db.select().from(table as any) as any)
      .where(or(...cfg.search.map((c: Column) => ilike(c, p))))
      .orderBy(orderCol);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = await (db.select().from(table as any) as any).orderBy(orderCol);
  }

  let out = sanitize(rows as Record<string, unknown>[], cfg.special);
  if (entity === "achievements") {
    const achievementDetails = await getAchievementDetailsMap(out.map((row) => Number(row.id)));
    out = out.map((row) => ({
      ...row,
      ...(achievementDetails.get(Number(row.id)) ?? {}),
    }));
    const achievementIds = out.map((row) => Number(row.id));
    const memberIdMap = await getMemberIdMap(achievementIds);
    const linkedIds = Array.from(new Set([
      ...Array.from(memberIdMap.values()).flat(),
      ...out.flatMap((row) => normalizeAchievementParticipants(row.participants)
        .map((participant) => participant.memberId)
        .filter((memberId): memberId is number => memberId !== null)),
    ]));
    const linkedMembers = linkedIds.length
      ? await db
          .select({ id: members.id, name: members.name, role: members.role, photoUrl: members.photoUrl })
          .from(members)
          .where(inArray(members.id, linkedIds))
      : [];
    const membersById = new Map(linkedMembers.map((member) => [member.id, member]));

    out = out.map((row) => {
      const achievementId = Number(row.id);
      const stored = normalizeAchievementParticipants(row.participants);
      const linkedMemberIds = memberIdMap.get(achievementId) ?? [];
      const storedMemberIds = new Set(stored.map((participant) => participant.memberId).filter((memberId): memberId is number => memberId !== null));
      const legacyParticipants = linkedMemberIds
        .filter((memberId) => !storedMemberIds.has(memberId))
        .map((memberId, index) => {
          const member = membersById.get(memberId);
          return {
            id: `legacy-${memberId}-${index}`,
            memberId,
            name: member?.name ?? `সদস্য #${memberId}`,
            role: member?.role ?? "সদস্য",
            sector: "",
            result: "unknown" as const,
            award: "",
          };
        });
      const participants = [
        ...stored.map((participant) => {
          const member = participant.memberId ? membersById.get(participant.memberId) : undefined;
          return member
            ? { ...participant, name: member.name, role: member.role || participant.role }
            : participant;
        }),
        ...legacyParticipants,
      ];

      return { ...row, participants, memberIds: linkedMemberIds };
    });
  }
  if (entity === "members") {
    const certificatesByMember = await getMemberCertificatesMap(out.map((row) => Number(row.id)));
    out = out.map((row) => {
      const memberId = Number(row.id);
      return {
        ...row,
        certificates: certificatesByMember.has(memberId)
          ? certificatesByMember.get(memberId)
          : normalizeMemberCertificates(row.certificates),
      };
    });
  }

  return NextResponse.json({ rows: out });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg) return NextResponse.json({ error: "অজানা সেকশন" }, { status: 404 });
  if (entity === "messages") return NextResponse.json({ error: "সমর্থিত নয়" }, { status: 400 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = pickBody(cfg, body);
  let savedParticipants: ReturnType<typeof normalizeAchievementParticipants> | undefined;

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

  if (cfg.special === "users") {
    const password = String(body.password || "");
    if (password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }
    (data as Record<string, unknown>).passwordHash = hashPassword(password);
  }

  try {
    let row: Record<string, unknown>;
    if (entity === "members") {
      const memberData = { ...data };
      const hasCertificates = "certificates" in memberData;
      const certificates = memberData.certificates;
      delete memberData.certificates;
      const [savedMember] = await (db.insert(members) as any)
        .values(memberData)
        .returning({ id: members.id });
      if (!savedMember) return NextResponse.json({ error: "সদস্য সংরক্ষণ করা যায়নি" }, { status: 500 });
      if (hasCertificates) {
        try {
          await saveMemberCertificates(savedMember.id, certificates);
        } catch {
          return NextResponse.json({
            error: "সদস্য তৈরি হয়েছে, কিন্তু সার্টিফিকেটের তালিকা সংরক্ষণ হয়নি। বিদ্যমান settings টেবিলে লেখা যায়নি।",
          }, { status: 500 });
        }
      }
      row = { ...savedMember, ...(hasCertificates ? { certificates } : {}) };
    } else if (entity === "achievements") {
      const achievementData = { ...data };
      const detailKeys = ["organizerInfo", "olympiadWebsite", "mapEmbedUrl", "participants"] as const;
      const hasDetails = detailKeys.some((key) => key in achievementData);
      const details = {
        organizerInfo: typeof achievementData.organizerInfo === "string" ? achievementData.organizerInfo : "",
        olympiadWebsite: typeof achievementData.olympiadWebsite === "string" ? achievementData.olympiadWebsite : "",
        mapEmbedUrl: typeof achievementData.mapEmbedUrl === "string" ? achievementData.mapEmbedUrl : "",
        participants: savedParticipants ?? normalizeAchievementParticipants(achievementData.participants),
      };
      for (const key of detailKeys) delete achievementData[key];
      const [savedAchievement] = await (db.insert(achievements) as any)
        .values(achievementData)
        .returning({ id: achievements.id });
      if (!savedAchievement) return NextResponse.json({ error: "অর্জন সংরক্ষণ করা যায়নি" }, { status: 500 });
      if (hasDetails) {
        try {
          await saveAchievementDetails(savedAchievement.id, details);
        } catch {
          return NextResponse.json({
            error: "অর্জন তৈরি হয়েছে, কিন্তু অতিরিক্ত তথ্য সংরক্ষণ হয়নি। বিদ্যমান settings টেবিলে লেখা যায়নি।",
          }, { status: 500 });
        }
      }
      row = { ...savedAchievement, ...(hasDetails ? details : {}) };
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [savedRow] = await (db.insert(cfg.table as any) as any).values(data).returning();
      row = savedRow as Record<string, unknown>;
    }

    if (entity === "achievements") {
      const achievementId = Number(row.id);
      if (savedParticipants) {
        await syncAchievementMembers(achievementId, participantMemberIds(savedParticipants));
      } else if (Array.isArray(body.memberIds)) {
        await syncAchievementMembers(achievementId, body.memberIds as number[]);
      }
    }
    return NextResponse.json({ row: sanitize([row], cfg.special)[0] });
  } catch (e: unknown) {
    const failure = getAdminWriteError(e, entity);
    return NextResponse.json({ error: failure.error }, { status: failure.status });
  }
}
