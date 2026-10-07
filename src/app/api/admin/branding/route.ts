import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSession, isStaff } from "@/lib/auth";
import { BRANDING_KEYS, getBranding } from "@/lib/settings";
import {
  isSiteFontKey,
  MAX_FIXED_LOGOS,
  normalizeFixedLogos,
} from "@/lib/branding-config";

export const dynamic = "force-dynamic";

const SIMPLE_LIMITS: Record<string, number> = {
  club_logo: 2048,
  school_logo: 2048,
  club_name: 120,
  school_name: 180,
};

export async function GET() {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
  return NextResponse.json({ branding: await getBranding() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const entries: { key: string; value: string }[] = [];

  for (const key of BRANDING_KEYS) {
    if (!(key in body)) continue;

    if (key === "site_font") {
      if (!isSiteFontKey(body[key])) {
        return NextResponse.json({ error: "সঠিক ফন্ট নির্বাচন করুন" }, { status: 400 });
      }
      entries.push({ key, value: body[key] });
      continue;
    }

    if (key === "fixed_logos") {
      let placements = body[key];
      if (typeof placements === "string") {
        try {
          placements = JSON.parse(placements);
        } catch {
          return NextResponse.json({ error: "লোগো পজিশনের তথ্য সঠিক নয়" }, { status: 400 });
        }
      }
      if (!Array.isArray(placements) || placements.length > MAX_FIXED_LOGOS) {
        return NextResponse.json({ error: `সর্বোচ্চ ${MAX_FIXED_LOGOS}টি ফিক্সড লোগো যোগ করা যাবে` }, { status: 400 });
      }
      const normalized = normalizeFixedLogos(placements);
      if (normalized.length !== placements.length) {
        return NextResponse.json({ error: "প্রতিটি লোগোর ছবি, পেজ ও অবস্থান যাচাই করুন" }, { status: 400 });
      }
      entries.push({ key, value: JSON.stringify(normalized) });
      continue;
    }

    const rawValue = body[key];
    if (typeof rawValue !== "string") {
      return NextResponse.json({ error: "সেটিংসের মান টেক্সট হওয়া উচিত" }, { status: 400 });
    }
    const value = rawValue.trim();
    if (value.length > (SIMPLE_LIMITS[key] ?? 2048)) {
      return NextResponse.json({ error: "একটি সেটিংসের মান অনুমোদিত সীমার চেয়ে বড়" }, { status: 400 });
    }
    entries.push({ key, value });
  }

  if (!entries.length) {
    return NextResponse.json({ error: "কোনো পরিবর্তন পাওয়া যায়নি" }, { status: 400 });
  }

  for (const entry of entries) {
    await db
      .insert(settings)
      .values(entry)
      .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
  }

  return NextResponse.json({ ok: true, branding: await getBranding() });
}
