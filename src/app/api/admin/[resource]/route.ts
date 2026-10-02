import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import * as s from "@/db/schema";
import { getAdminSession } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Cfg = {
  table: any;
  orderBy?: any;
  descOrder?: boolean;
  fields: string[];
  superOnly?: boolean;
};

const registry: Record<string, Cfg> = {
  slides: { table: s.slides, orderBy: s.slides.sortOrder, fields: ["imageUrl", "title", "subtitle", "sortOrder"] },
  members: {
    table: s.members, orderBy: s.members.sortOrder,
    fields: ["name", "className", "section", "roll", "role", "photoUrl", "bio", "achievements", "participations", "whatsapp", "facebook", "instagram", "isLeadership", "sortOrder"],
  },
  achievements: {
    table: s.achievements, orderBy: s.achievements.sortOrder,
    fields: ["title", "subtitle", "coverImage", "eventName", "location", "date", "prizes", "medals", "description", "photos", "sortOrder"],
  },
  projects: {
    table: s.projects, orderBy: s.projects.sortOrder,
    fields: ["title", "summary", "description", "imageUrl", "status", "successes", "failures", "futurePlans", "sortOrder"],
  },
  gallery: { table: s.galleryItems, orderBy: s.galleryItems.sortOrder, fields: ["kind", "url", "category", "title", "sortOrder"] },
  halloffame: { table: s.hallOfFame, orderBy: s.hallOfFame.sortOrder, fields: ["name", "photoUrl", "award", "description", "sortOrder"] },
  sponsors: { table: s.sponsors, orderBy: s.sponsors.sortOrder, fields: ["name", "logoUrl", "website", "sortOrder"] },
  news: { table: s.news, orderBy: s.news.createdAt, descOrder: true, fields: ["title", "body", "mediaUrl", "mediaKind", "isInternal"] },
  events: { table: s.events, orderBy: s.events.sortOrder, fields: ["title", "date", "location", "description", "imageUrl", "sortOrder"] },
  resources: { table: s.resources, orderBy: s.resources.createdAt, descOrder: true, fields: ["title", "category", "fileUrl", "description"] },
  applications: { table: s.applications, orderBy: s.applications.createdAt, descOrder: true, fields: ["status"] },
  users: { table: s.users, orderBy: s.users.id, fields: ["username", "name", "role", "passwordHash"], superOnly: true },
  memberaccounts: { table: s.memberAccounts, orderBy: s.memberAccounts.id, fields: ["memberId", "username", "passwordHash"] },
};

function pick(body: Record<string, unknown>, fields: string[]) {
  const out: Record<string, unknown> = {};
  for (const f of fields) if (f in body) out[f] = body[f];
  return out;
}

async function guard(resource: string) {
  const session = await getAdminSession();
  if (!session) return { error: NextResponse.json({ error: "অননুমোদিত" }, { status: 401 }) };
  const cfg = registry[resource];
  if (!cfg) return { error: NextResponse.json({ error: "রিসোর্স পাওয়া যায়নি" }, { status: 404 }) };
  if (cfg.superOnly && session.role !== "super_admin") {
    return { error: NextResponse.json({ error: "শুধুমাত্র সুপার অ্যাডমিন" }, { status: 403 }) };
  }
  return { cfg, session };
}

type Params = { params: Promise<{ resource: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { resource } = await params;
  if (resource === "settings") {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
    const rows = await db.select().from(s.settings);
    return NextResponse.json(rows);
  }
  const g = await guard(resource);
  if ("error" in g && g.error) return g.error;
  const cfg = g.cfg!;
  const rows = await db
    .select()
    .from(cfg.table)
    .orderBy(cfg.orderBy ? (cfg.descOrder ? desc(cfg.orderBy) : asc(cfg.orderBy)) : asc(cfg.table.id));
  // never leak hashes
  const safe = rows.map((r: any) => ({ ...r, passwordHash: undefined }));
  return NextResponse.json(safe);
}

export async function POST(req: Request, { params }: Params) {
  const { resource } = await params;
  const body = await req.json();

  if (resource === "settings") {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
    const key = String(body.key || "").slice(0, 60);
    if (!key) return NextResponse.json({ error: "key দরকার" }, { status: 400 });
    const value = String(body.value ?? "").slice(0, 5000);
    await db
      .insert(s.settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: s.settings.key, set: { value } });
    return NextResponse.json({ ok: true });
  }

  const g = await guard(resource);
  if ("error" in g && g.error) return g.error;
  const cfg = g.cfg!;
  const data = pick(body, cfg.fields);

  if ((resource === "users" || resource === "memberaccounts") && typeof body.password === "string" && body.password) {
    data.passwordHash = bcrypt.hashSync(String(body.password), 10);
  }

  try {
    if (cfg.fields.includes("sortOrder") && !("sortOrder" in data)) {
      const existing = await db.select().from(cfg.table);
      data.sortOrder = existing.length;
    }
    const rows: any[] = (await db.insert(cfg.table).values(data).returning()) as any[];
    const { passwordHash, ...safe } = rows[0] as any;
    return NextResponse.json(safe);
  } catch (e: any) {
    const msg = e?.code === "23505" ? "এই ইউজারনেমটি আগে থেকেই আছে" : "তৈরি করা যায়নি";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const { resource } = await params;
  const body = await req.json();
  const g = await guard(resource);
  if ("error" in g && g.error) return g.error;
  const cfg = g.cfg!;

  // bulk reorder: { order: [{id, sortOrder}, ...] }
  if (Array.isArray(body.order)) {
    for (const o of body.order) {
      if (o && typeof o.id === "number" && cfg.fields.includes("sortOrder")) {
        await db.update(cfg.table).set({ sortOrder: Number(o.sortOrder) || 0 }).where(eq(cfg.table.id, o.id));
      }
    }
    return NextResponse.json({ ok: true });
  }

  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id দরকার" }, { status: 400 });
  const data = pick(body, cfg.fields);

  if (resource === "users" || resource === "memberaccounts") {
    delete data.passwordHash; // never allow raw overwrite
    if (typeof body.password === "string" && body.password) {
      data.passwordHash = bcrypt.hashSync(String(body.password), 10);
    }
  }

  const rows: any[] = (await db
    .update(cfg.table)
    .set(data)
    .where(eq(cfg.table.id, id))
    .returning()) as any[];
  if (!rows[0]) return NextResponse.json({ error: "পাওয়া যায়নি" }, { status: 404 });
  const { passwordHash, ...safe } = rows[0] as any;
  return NextResponse.json(safe);
}

export async function DELETE(req: Request, { params }: Params) {
  const { resource } = await params;
  const body = await req.json();
  const g = await guard(resource);
  if ("error" in g && g.error) return g.error;
  const cfg = g.cfg!;
  const id = Number(body.id);
  if (!id) return NextResponse.json({ error: "id দরকার" }, { status: 400 });
  await db.delete(cfg.table).where(eq(cfg.table.id, id));
  return NextResponse.json({ ok: true });
}
