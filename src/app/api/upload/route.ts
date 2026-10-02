import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

export const runtime = "nodejs";

// All files are stored directly inside NEON PostgreSQL (site_files table).
// This guarantees 100% compatibility on Vercel, localhost, and everywhere
// with zero external storage tokens or read-only filesystem issues.

const MAX_BASE64_LENGTH = 15 * 1024 * 1024; // ~11MB file limit

const ALLOWED_MIMES = new Set([
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
]);

export async function GET() {
  return NextResponse.json({
    status: "ready",
    storage: "neon-postgres",
    table: "site_files",
    maxSizeMB: 10,
  });
}

export async function POST(req: Request) {
  // 1. Verify admin authentication
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "আপনার সেশনের মেয়াদ শেষ হয়েছে — অনুগ্রহ করে পুনরায় লগইন করুন" },
      { status: 401 }
    );
  }

  try {
    let name = "file";
    let mime = "application/octet-stream";
    let cleanBase64 = "";

    const contentType = req.headers.get("content-type") || "";

    // 2. Handle JSON payload (preferred, standard Base64 from client)
    if (contentType.includes("application/json")) {
      const json = await req.json();
      name = String(json.name || "image.jpg").slice(0, 150);
      mime = String(json.mime || "image/jpeg").toLowerCase();
      const rawData = String(json.data || "");

      // Strip data URI prefix if present (e.g. data:image/jpeg;base64,...)
      cleanBase64 = rawData.replace(/^data:[^;]+;base64,/, "");
    }
    // 3. Fallback: Handle FormData payload
    else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
      }
      name = file.name.slice(0, 150);
      mime = (file.type || "application/octet-stream").toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      return NextResponse.json(
        { error: "অননুমোদিত Content-Type — application/json প্রয়োজন" },
        { status: 400 }
      );
    }

    if (!cleanBase64 || cleanBase64.length < 10) {
      return NextResponse.json({ error: "ফাইলের তথ্য খালি পাওয়া গেছে" }, { status: 400 });
    }

    if (cleanBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "ফাইলটি ১০ মেগাবাইটের চেয়ে বড় — দয়া করে ছোট ফাইল আপলোড করুন" },
        { status: 413 }
      );
    }

    // MIME type check
    if (!ALLOWED_MIMES.has(mime) && !mime.startsWith("image/")) {
      return NextResponse.json(
        { error: `এই ধরনের ফাইল (${mime}) সিস্টেমে অনুমোদিত নয়` },
        { status: 400 }
      );
    }

    const byteSize = Math.round(cleanBase64.length * 0.75);

    // 4. Save directly into NEON PostgreSQL
    const rows = await db
      .insert(siteFiles)
      .values({
        name,
        mime,
        size: byteSize,
        data: cleanBase64,
      })
      .returning({ id: siteFiles.id });

    if (!rows[0]) {
      throw new Error("ডাটাবেজে ফাইল সংরক্ষণ করা যায়নি");
    }

    const fileUrl = `/api/files/${rows[0].id}`;

    return NextResponse.json({
      ok: true,
      url: fileUrl,
      id: rows[0].id,
      name,
      type: mime,
      size: byteSize,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ডাটাবেজ ত্রুটি";
    return NextResponse.json({ error: `আপলোড ব্যর্থ: ${message}` }, { status: 500 });
  }
}
