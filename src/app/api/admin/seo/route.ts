import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession, isStaff } from "@/lib/auth";
import { getSeoSettings, saveSeoSettings, validateSeoSettings } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });
  return NextResponse.json({ settings: await getSeoSettings() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isStaff(session)) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as unknown;
  const validation = validateSeoSettings(body);
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    await saveSeoSettings(validation.settings);
    revalidatePath("/", "layout");
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
    return NextResponse.json({ ok: true, settings: validation.settings });
  } catch {
    return NextResponse.json({ error: "SEO সেটিংস ডাটাবেসে সংরক্ষণ করা যায়নি" }, { status: 500 });
  }
}
