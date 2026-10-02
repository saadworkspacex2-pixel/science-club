import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setAdminSession, clearAdminSession, getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "ইউজারনেম ও পাসওয়ার্ড দিন" }, { status: 400 });
    }
    const [user] = await db.select().from(users).where(eq(users.username, String(username)));
    if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
      return NextResponse.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, { status: 401 });
    }
    await setAdminSession(user.id, user.role);
    return NextResponse.json({ ok: true, name: user.name, role: user.role });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authed: false }, { status: 401 });
  return NextResponse.json({ authed: true, uid: session.uid, role: session.role });
}
