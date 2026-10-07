import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, memberAccounts } from "@/db/schema";
import { verifyPassword, setSessionCookie, type Role } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "ইউজারনেম ও পাসওয়ার্ড দিন" }, { status: 400 });
  }
  const uname = String(username).trim();

  // 1) Staff / unified users table
  const [user] = await db.select().from(users).where(eq(users.username, uname)).limit(1);
  if (user && user.active && verifyPassword(String(password), user.passwordHash)) {
    const role = (user.role || "editor") as Role;
    await setSessionCookie({ u: user.username, r: role, n: user.name, mid: user.memberId ?? null });
    return NextResponse.json({ ok: true, role, name: user.name });
  }

  // 2) Member accounts (linked to members table)
  const [acc] = await db.select().from(memberAccounts).where(eq(memberAccounts.username, uname)).limit(1);
  if (acc && verifyPassword(String(password), acc.passwordHash)) {
    await setSessionCookie({ u: acc.username, r: "member", n: acc.username, mid: acc.memberId });
    return NextResponse.json({ ok: true, role: "member", name: acc.username });
  }

  return NextResponse.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, { status: 401 });
}
