/**
 * ユーザー指定URLから HTML をベストエフォートで取得し、プレーンテキスト抜粋を返す。
 * 失敗・拒否時は空文字。SSRF 緩和のためプロトコル・ホスト・ポートを制限する。
 */

const DEFAULT_TIMEOUT_MS = 6_000;
const MAX_RESPONSE_BYTES = 400_000;
const MAX_EXCERPT_CHARS = 2_500;

function stripHtmlToText(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isBlockedHostname(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "0.0.0.0") return true;
  if (h === "::1" || h.startsWith("[::1")) return true;
  if (h.startsWith("fe80:") || h.startsWith("[fe80:")) return true;
  if (h.startsWith("fc00:") || h.startsWith("[fc00:")) return true;

  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

async function readBodyWithByteLimit(res: Response, maxBytes: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const dec = new TextDecoder();
  let total = 0;
  let out = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      out += dec.decode(value, { stream: true });
      if (total >= maxBytes) {
        await reader.cancel().catch(() => {});
        break;
      }
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
  return out;
}

/**
 * @param rawUrl ユーザー入力のURL（http/https または https 省略のドメイン）
 */
export async function fetchWebsiteExcerpt(
  rawUrl: string,
  options?: { timeoutMs?: number },
): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  let url: URL;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    url = new URL(withProto);
  } catch {
    return "";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return "";
  if (isBlockedHostname(url.hostname)) return "";

  const port = url.port;
  if (port && port !== "80" && port !== "443") return "";

  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
        "User-Agent": "NTS-Gate-LP/subsidy-check (best-effort excerpt; contact operator)",
      },
      cache: "no-store",
    });

    if (!res.ok) return "";

    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    if (!ct.includes("text/html") && !ct.includes("text/plain")) return "";

    const raw = await readBodyWithByteLimit(res, MAX_RESPONSE_BYTES);
    const plain = stripHtmlToText(raw);
    return plain.slice(0, MAX_EXCERPT_CHARS);
  } catch {
    return "";
  } finally {
    clearTimeout(tid);
  }
}
