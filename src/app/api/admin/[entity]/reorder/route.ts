import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { getSession, isStaff } from "@/lib/auth";
import { ENTITY_MAP } from "@/lib/server-entities";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const { entity } = await params;
  const cfg = ENTITY_MAP[entity];
  if (!cfg || !cfg.order) return NextResponse.json({ error: "সমর্থিত নয়" }, { status: 404 });

  const { ids } = (await req.json().catch(() => ({}))) as { ids?: number[] };
  if (!Array.isArray(ids)) return NextResponse.json({ error: "ভুল ডেটা" }, { status: 400 });

  await Promise.all(
    ids.map((id, i) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db.update(cfg.table as any) as any).set({ sortOrder: i }).where(eq(cfg.table.id, id))
    )
  );
  return NextResponse.json({ ok: true });
}
