import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const VIDEO_FONT_FAMILY = "Noto Sans CJK JP Local";

const FONT_FILE_NAME = "NotoSansCJKjp-Regular.otf";

export function resolveVideoFontPath(): string | null {
  const envPath = process.env.VIDEO_FONT_PATH?.trim();
  if (envPath && existsSync(envPath)) return envPath;

  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "public", "fonts", FONT_FILE_NAME),
    path.join(cwd, ".next", "server", "public", "fonts", FONT_FILE_NAME),
    path.join(cwd, "..", "public", "fonts", FONT_FILE_NAME),
    "/var/task/public/fonts/NotoSansCJKjp-Regular.otf",
    "/var/task/nts-gate-lp/public/fonts/NotoSansCJKjp-Regular.otf",
  ];

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export function resolveVideoFontsDir(): string | null {
  const fontPath = resolveVideoFontPath();
  return fontPath ? path.dirname(fontPath) : null;
}

export function svgFontFaceStyle(): string {
  const fontPath = resolveVideoFontPath();
  if (!fontPath) return "";

  const fontUrl = pathToFileURL(fontPath).href;
  return `<style><![CDATA[
@font-face {
  font-family: '${VIDEO_FONT_FAMILY}';
  src: url('${fontUrl}') format('opentype');
  font-weight: 400 900;
}
text {
  font-family: '${VIDEO_FONT_FAMILY}', 'Noto Sans JP', sans-serif;
}
]]></style>`;
}
