import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

export const runtime = "nodejs";

// Files are stored directly in the Neon database (site_files table) —
// works the same on Vercel, locally, everywhere. No external bucket needed.
export async function GET() {
  return NextResponse.json({
    driver: "db",
    blobAvailable: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    maxSize: 4 * 1024 * 1024,
    hint: "উপলোড সরাসরি ডাটাবেজে সংরক্ষিত হয় — ছবিগুলো স্বয়ংক্রিয়ভাবে কমপ্রেস হয়",
  });
}

const MAX_SIZE = 4 * 1024 * 1024; // 4MB — serverless request safety
const ALLOWED = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "text/plain",
  "application/zip",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "অননুমোদিত" }, { status: 401 });

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "ফাইল সর্বোচ্চ ৪ মেগাবাইটের হতে হবে — বড় ছবি নিলে সেটি স্বয়ংক্রিয়ভাবে ছোট হবে" },
        { status: 413 }
      );
    }
    const type = file.type || "application/octet-stream";
    if (!ALLOWED.includes(type)) {
      return NextResponse.json({ error: `এই ধরনের ফাইল (${type}) অনুমোদিত নয়` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rows = await db
      .insert(siteFiles)
      .values({
        name: file.name.slice(0, 150),
        mime: type,
        size: buffer.length,
        data: buffer.toString("base64"),
      })
      .returning({ id: siteFiles.id });

    return NextResponse.json({ url: `/api/files/${rows[0].id}`, type });
  } catch (e) {
    return NextResponse.json(
      { error: `আপলোড ব্যর্থ: ${e instanceof Error ? e.message : "অজানা ত্রুটি"}` },
      { status: 500 }
    );
  }
}
