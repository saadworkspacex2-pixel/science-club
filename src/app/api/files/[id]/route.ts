import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

export const runtime = "nodejs";

// Serves an uploaded file stored in NEON PostgreSQL as base64
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isFinite(numId) || numId <= 0) {
      return new NextResponse("সঠিক ফাইল আইডি দিন", { status: 400 });
    }

    const rows = await db.select().from(siteFiles).where(eq(siteFiles.id, numId));
    const row = rows[0];
    if (!row || !row.data) {
      return new NextResponse("ফাইলটি পাওয়া যায়নি", { status: 404 });
    }

    // Strip any residual data: prefix
    const cleanBase64 = row.data.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(cleanBase64, "base64");
    const body = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

    const safeName = encodeURIComponent(row.name || `file-${row.id}`);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": row.mime || "image/jpeg",
        "Content-Length": String(buf.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename*=UTF-8''${safeName}`,
      },
    });
  } catch (e) {
    console.error("Error serving file from Neon:", e);
    return new NextResponse("ফাইল লোড করা সম্ভব হয়নি", { status: 500 });
  }
}
