import { NextRequest, NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { achievements, members, projects, news, resources } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ groups: {} });
  const p = `%${q}%`;

  const [ach, mem, proj, nw, res] = await Promise.all([
    db
      .select({ id: achievements.id, title: achievements.title, sub: achievements.eventName })
      .from(achievements)
      .where(or(ilike(achievements.title, p), ilike(achievements.subtitle, p)))
      .limit(4),
    db
      .select({ id: members.id, title: members.name, sub: members.role })
      .from(members)
      .where(or(ilike(members.name, p), ilike(members.role, p)))
      .limit(4),
    db
      .select({ id: projects.id, title: projects.title, sub: projects.status })
      .from(projects)
      .where(or(ilike(projects.title, p), ilike(projects.summary, p)))
      .limit(4),
    db
      .select({ id: news.id, title: news.title, sub: news.tag })
      .from(news)
      .where(ilike(news.title, p))
      .limit(4),
    db
      .select({ id: resources.id, title: resources.title, sub: resources.category })
      .from(resources)
      .where(ilike(resources.title, p))
      .limit(4),
  ]);

  return NextResponse.json({
    groups: { achievements: ach, members: mem, projects: proj, news: nw, resources: res },
  });
}
