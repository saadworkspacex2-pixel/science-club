import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

export const runtime = "nodejs";

// Serves an uploaded file stored in the database as base64
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isFinite(numId)) {
    return new NextResponse("Invalid id", { status: 400 });
  }
  const rows = await db.select().from(siteFiles).where(eq(siteFiles.id, numId));
  const row = rows[0];
  if (!row) return new NextResponse("Not found", { status: 404 });

  const buf = Buffer.from(row.data, "base64");
  const body = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return new NextResponse(body, {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(buf.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(row.name)}`,
    },
  });
}
