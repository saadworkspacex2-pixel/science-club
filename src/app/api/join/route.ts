import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";

const SCHOOLS = [
  "Bur Uttam Shaheed Samad School and College",
  "Cantt Board Girls School, Rangpur",
];

// naive in-memory rate limit
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (arr.length >= 5) return true;
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (limited(ip)) {
      return NextResponse.json({ error: "অতিরিক্ত চেষ্টা — কিছুক্ষণ পর আবার করুন" }, { status: 429 });
    }
    const b = await req.json();
    const clean = (v: unknown, max = 200) => String(v ?? "").trim().slice(0, max);
    const data = {
      school: clean(b.school),
      className: clean(b.className, 10),
      fullName: clean(b.fullName, 80),
      classRoll: clean(b.classRoll, 10),
      phone: clean(b.phone, 15),
      whatsapp: clean(b.whatsapp, 15),
      instagram: clean(b.instagram, 40),
    };
    if (!SCHOOLS.includes(data.school)) {
      return NextResponse.json({ error: "সঠিক স্কুল নির্বাচন করুন" }, { status: 400 });
    }
    if (!["৬", "৭", "৮", "৯", "১০"].includes(data.className)) {
      return NextResponse.json({ error: "সঠিক শ্রেণি নির্বাচন করুন" }, { status: 400 });
    }
    if (data.fullName.length < 3) {
      return NextResponse.json({ error: "পুরো নাম লিখুন" }, { status: 400 });
    }
    if (!/^[0-9+]{10,15}$/.test(data.phone)) {
      return NextResponse.json({ error: "সঠিক ফোন নম্বর দিন" }, { status: 400 });
    }
    if (!/^[0-9+]{10,15}$/.test(data.whatsapp)) {
      return NextResponse.json({ error: "সঠিক হোয়াটসঅ্যাপ নম্বর দিন" }, { status: 400 });
    }
    await db.insert(applications).values(data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "সার্ভার সমস্যা — আবার চেষ্টা করুন" }, { status: 500 });
  }
}
