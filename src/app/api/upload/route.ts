import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";

// Ensures site_files table exists in NEON PostgreSQL on demand
let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_files (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'file',
        mime TEXT NOT NULL DEFAULT 'application/octet-stream',
        size INTEGER NOT NULL DEFAULT 0,
        data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    tableEnsured = true;
  } catch (e) {
    console.error("Failed to ensure site_files table:", e);
  }
}

const MAX_BASE64_LENGTH = 15 * 1024 * 1024; // ~11MB limit

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
  await ensureTable();
  return NextResponse.json({
    status: "ready",
    storage: "neon-postgres",
    table: "site_files",
  });
}

export async function POST(req: Request) {
  // 1. Verify admin session
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "আপনার সেশনের মেয়াদ শেষ হয়েছে — অনুগ্রহ করে লগইন করুন" },
      { status: 401 }
    );
  }

  // 2. Ensure table exists in Neon
  await ensureTable();

  try {
    let name = "file.jpg";
    let mime = "image/jpeg";
    let cleanBase64 = "";

    const contentType = req.headers.get("content-type") || "";

    // Handle JSON payload (Base64)
    if (contentType.includes("application/json")) {
      const json = await req.json();
      name = String(json.name || "image.jpg").slice(0, 150);
      mime = String(json.mime || "image/jpeg").toLowerCase();
      const rawData = String(json.data || "");
      cleanBase64 = rawData.replace(/^data:[^;]+;base64,/, "");
    }
    // Handle FormData payload (Multipart)
    else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
      }
      name = file.name.slice(0, 150);
      mime = (file.type || "image/jpeg").toLowerCase();
      const arrayBuffer = await file.arrayBuffer();
      cleanBase64 = Buffer.from(arrayBuffer).toString("base64");
    } else {
      return NextResponse.json(
        { error: "অননুমোদিত Content-Type" },
        { status: 400 }
      );
    }

    if (!cleanBase64 || cleanBase64.length < 5) {
      return NextResponse.json({ error: "ফাইলের তথ্য খালি" }, { status: 400 });
    }

    if (cleanBase64.length > MAX_BASE64_LENGTH) {
      return NextResponse.json(
        { error: "ফাইলটি অতিরিক্ত বড় (১০ মেগাবাইটের বেশি)" },
        { status: 413 }
      );
    }

    // MIME type validation
    if (!ALLOWED_MIMES.has(mime) && !mime.startsWith("image/")) {
      return NextResponse.json(
        { error: `এই ধরনের ফাইল (${mime}) সিস্টেমে অনুমোদিত নয়` },
        { status: 400 }
      );
    }

    const byteSize = Math.round(cleanBase64.length * 0.75);

    // Save directly into NEON PostgreSQL
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
    console.error("Upload route error:", e);
    const message = e instanceof Error ? e.message : "ডাটাবেজ ত্রুটি";
    return NextResponse.json({ error: `আপলোড ব্যর্থ: ${message}` }, { status: 500 });
  }
}
