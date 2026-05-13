import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const CARDGRID_DIR = path.join(process.cwd(), "LP_cardgrid_pictures");

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

function sanitizeSegment(value: string): string {
  const decoded = decodeURIComponent(value);
  if (decoded.includes("..") || decoded.includes("/") || decoded.includes("\\")) {
    return "";
  }
  return decoded.trim();
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ file: string }> },
) {
  const params = await context.params;
  const file = sanitizeSegment(params.file);

  if (!file) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  const ext = path.extname(file).toLowerCase();
  const contentType = CONTENT_TYPE_MAP[ext];
  if (!contentType) {
    return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
  }

  const absPath = path.join(CARDGRID_DIR, file);
  if (!absPath.startsWith(CARDGRID_DIR)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!fs.existsSync(absPath)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const data = fs.readFileSync(absPath);
  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
