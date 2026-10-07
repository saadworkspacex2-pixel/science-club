import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";

const CLASSES = ["৬", "৭", "৮", "৯", "১০"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { school, classLevel, fullName, roll, phone, whatsapp, instagram } = body;

  if (!school || typeof school !== "string") {
    return NextResponse.json({ error: "স্কুল নির্বাচন করুন" }, { status: 400 });
  }
  if (!CLASSES.includes(classLevel)) {
    return NextResponse.json({ error: "সঠিক শ্রেণি নির্বাচন করুন" }, { status: 400 });
  }
  if (!fullName || String(fullName).trim().length < 3) {
    return NextResponse.json({ error: "সম্পূর্ণ নাম লিখুন" }, { status: 400 });
  }
  if (!roll) {
    return NextResponse.json({ error: "ক্লাস রোল দিন" }, { status: 400 });
  }
  const phoneClean = String(phone || "").replace(/[\s-]/g, "");
  if (!/^(\+?880|0)1[3-9]\d{8}$/.test(phoneClean)) {
    return NextResponse.json({ error: "সঠিক ফোন নম্বর দিন" }, { status: 400 });
  }
  if (!whatsapp) {
    return NextResponse.json({ error: "হোয়াটসঅ্যাপ নম্বর দিন" }, { status: 400 });
  }

  await db.insert(applications).values({
    school: String(school).trim(),
    className: classLevel,
    fullName: String(fullName).trim(),
    classRoll: String(roll).trim(),
    phone: String(phone).trim(),
    whatsapp: String(whatsapp).trim(),
    instagram: instagram ? String(instagram).trim().replace(/^@/, "") : "",
    status: "pending",
  });

  return NextResponse.json({ ok: true });
}
