import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json().catch(() => ({}));
  if (!name || !message || String(message).trim().length < 5) {
    return NextResponse.json({ error: "নাম ও বার্তা দিন" }, { status: 400 });
  }
  await db.insert(messages).values({
    name: String(name).trim(),
    email: email ? String(email).trim() : "",
    message: String(message).trim(),
  });
  return NextResponse.json({ ok: true });
}
