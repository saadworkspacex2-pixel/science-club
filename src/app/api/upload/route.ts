import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSession, isStaff } from "@/lib/auth";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

const MAX_SIZE = 80 * 1024 * 1024; // 80MB
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
];

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov",
  "application/pdf": ".pdf",
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!isStaff(session)) {
    return NextResponse.json({ error: "অননুমোদিত — আবার লগইন করুন" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "ফাইল পাওয়া যায়নি" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "এই ধরনের ফাইল সমর্থিত নয়" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "ফাইল ৮০ মেগাবাইটের বেশি" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString("hex")}${EXT[file.type]}`;

    // Primary: local disk (/public/uploads)
    try {
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), buffer);
      return NextResponse.json({ url: `/api/files/${name}`, type: file.type, stored: "disk" });
    } catch {
      // Fallback: durable database storage (site_files) when the runtime FS is read-only
      await db.insert(siteFiles).values({
        name,
        mime: file.type,
        size: buffer.length,
        data: buffer.toString("base64"),
      });
      return NextResponse.json({ url: `/api/files/${name}`, type: file.type, stored: "db" });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "অজানা ত্রুটি";
    return NextResponse.json({ error: `আপলোড ব্যর্থ: ${msg}` }, { status: 500 });
  }
}
