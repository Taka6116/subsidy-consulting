import iconv from "iconv-lite";

function normalizeCharset(input?: string | null): string | null {
  if (!input) return null;
  const v = input.trim().toLowerCase().replace(/['"]/g, "");
  if (v === "utf8") return "utf-8";
  if (v === "shift_jis" || v === "shift-jis" || v === "sjis" || v === "ms932") return "shift_jis";
  if (v === "euc-jp" || v === "eucjp") return "euc-jp";
  if (v === "iso-2022-jp" || v === "iso2022jp") return "iso-2022-jp";
  if (v.includes("utf-8")) return "utf-8";
  if (v.includes("shift")) return "shift_jis";
  if (v.includes("euc")) return "euc-jp";
  if (v.includes("iso-2022")) return "iso-2022-jp";
  return null;
}

function detectCharsetFromContentType(contentType?: string | null): string | null {
  if (!contentType) return null;
  const m = contentType.match(/charset\s*=\s*([^;]+)/i);
  return normalizeCharset(m?.[1] ?? null);
}

function detectCharsetFromHtmlMeta(headSnippet: string): string | null {
  const metaCharset = headSnippet.match(/<meta[^>]*charset=["']?\s*([^"'>\s]+)/i)?.[1];
  if (metaCharset) return normalizeCharset(metaCharset);

  const httpEquiv = headSnippet.match(
    /<meta[^>]*http-equiv=["']content-type["'][^>]*content=["'][^"']*charset=([^"'>\s;]+)/i,
  )?.[1];
  if (httpEquiv) return normalizeCharset(httpEquiv);

  return null;
}

export function detectCharset(buffer: Buffer, contentType?: string | null): string {
  const byHeader = detectCharsetFromContentType(contentType);
  if (byHeader) return byHeader;

  // 先頭4KBだけ UTF-8 で読み、meta charset を検出する
  const headSnippet = buffer.subarray(0, Math.min(buffer.length, 4096)).toString("utf-8");
  const byMeta = detectCharsetFromHtmlMeta(headSnippet);
  if (byMeta) return byMeta;

  return "utf-8";
}

export function decodeBufferToUtf8(buffer: Buffer, contentType?: string | null): string {
  const charset = detectCharset(buffer, contentType);
  if (charset === "utf-8") return buffer.toString("utf-8");
  return iconv.decode(buffer, charset);
}
