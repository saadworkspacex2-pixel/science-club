import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import path from "path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteFiles } from "@/db/schema";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  pdf: "application/pdf",
};

export const dynamic = "force-dynamic";

function responseForStoredFile(
  row: typeof siteFiles.$inferSelect,
  legacyId = false
) {
  const base64 = row.data.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");
  const fileName = row.name || `file-${row.id}`;
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": row.mime || (legacyId ? "image/jpeg" : "application/octet-stream"),
      "Content-Length": String(buffer.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": legacyId
        ? `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`
        : `inline; filename="${fileName}"`,
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const safe = path.basename(decodeURIComponent(name));
    if (!safe || safe.includes("..")) {
      return new NextResponse("Not found", { status: 404 });
    }

    // 1) Local disk first
    const file = path.join(process.cwd(), "public", "uploads", safe);
    if (existsSync(file)) {
      const st = await stat(file);
      const ext = safe.split(".").pop()?.toLowerCase() ?? "";
      const type = TYPES[ext] ?? "application/octet-stream";
      const webStream = Readable.toWeb(createReadStream(file)) as ReadableStream;
      return new NextResponse(webStream, {
        headers: {
          "Content-Type": type,
          "Content-Length": String(st.size),
          "Cache-Control": "public, max-age=31536000, immutable",
          "Content-Disposition": `inline; filename="${safe}"`,
        },
      });
    }

    // Legacy URLs used numeric site_files IDs. Keep serving those through this
    // single dynamic route so Next.js does not need a competing [id] segment.
    if (/^\d+$/.test(safe)) {
      const [legacyRow] = await db
        .select()
        .from(siteFiles)
        .where(eq(siteFiles.id, Number(safe)))
        .limit(1);
      if (legacyRow) {
        if (!legacyRow.data) return new NextResponse("Not found", { status: 404 });
        return responseForStoredFile(legacyRow, true);
      }
    }

    // 2) Durable database storage fallback (site_files), addressed by filename
    const [row] = await db
      .select()
      .from(siteFiles)
      .where(eq(siteFiles.name, safe))
      .limit(1);

    if (!row) return new NextResponse("Not found", { status: 404 });
    return responseForStoredFile(row);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
