import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberAccounts } from "@/db/schema";
import { setMemberSession, clearMemberSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "ইউজারনেম ও পাসওয়ার্ড দিন" }, { status: 400 });
    }
    const [acc] = await db
      .select()
      .from(memberAccounts)
      .where(eq(memberAccounts.username, String(username)));
    if (!acc || !bcrypt.compareSync(String(password), acc.passwordHash)) {
      return NextResponse.json({ error: "ভুল ইউজারনেম বা পাসওয়ার্ড" }, { status: 401 });
    }
    await setMemberSession(acc.memberId, acc.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearMemberSession();
  return NextResponse.json({ ok: true });
}
