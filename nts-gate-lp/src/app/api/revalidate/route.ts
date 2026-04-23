/**
 * POST /api/revalidate
 * 指定したパス（および記事 slug）の ISR キャッシュを即時パージする。
 *
 * 認証: x-internal-token ヘッダで REVALIDATE_SECRET と照合する。
 *       環境変数未設定時は 503 を返す（本番誤爆防止）。
 *
 * Body (いずれも optional):
 *   { "slugs": ["okayama-..."], "paths": ["/subsidies/articles"] }
 *
 * 使い方（Lambda から）:
 *   fetch(`${VERCEL_URL}/api/revalidate`, {
 *     method: "POST",
 *     headers: { "x-internal-token": secret, "content-type": "application/json" },
 *     body: JSON.stringify({ slugs: [newlyGeneratedSlug] }),
 *   });
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const DEFAULT_PATHS = ["/subsidies/articles"];

export async function POST(request: Request) {
  const expectedToken = process.env.REVALIDATE_SECRET?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 503 },
    );
  }

  const providedToken = request.headers.get("x-internal-token");
  if (providedToken !== expectedToken) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json().catch(() => ({}));
  } catch {
    payload = {};
  }
  const body = (payload ?? {}) as Record<string, unknown>;

  const rawSlugs = Array.isArray(body.slugs) ? body.slugs : [];
  const slugs: string[] = rawSlugs
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter((s) => /^[a-z0-9-]{1,80}$/.test(s));

  const rawPaths = Array.isArray(body.paths) ? body.paths : [];
  const extraPaths: string[] = rawPaths
    .filter((v): v is string => typeof v === "string")
    .map((s) => s.trim())
    .filter((s) => s.startsWith("/") && s.length < 200);

  const targets = new Set<string>([...DEFAULT_PATHS, ...extraPaths]);
  for (const slug of slugs) {
    targets.add(`/subsidies/articles/${slug}`);
  }

  const revalidated: string[] = [];
  const errors: Array<{ path: string; error: string }> = [];
  for (const path of targets) {
    try {
      revalidatePath(path);
      revalidated.push(path);
    } catch (e) {
      errors.push({
        path,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    revalidated,
    errors,
  });
}
