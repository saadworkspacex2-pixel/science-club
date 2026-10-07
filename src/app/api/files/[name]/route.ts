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

    // 2) Durable database storage fallback (site_files)
    const [row] = await db
      .select()
      .from(siteFiles)
      .where(eq(siteFiles.name, safe))
      .limit(1);

    if (!row) {
      return new NextResponse("Not found", { status: 404 });
    }

    const buffer = Buffer.from(row.data, "base64");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": row.mime || "application/octet-stream",
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${row.name}"`,
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
