/**
 * AWS Lambda エントリポイント: jGrants 検知 → 記事生成 → ISR パージ を 1 本で実行する。
 *
 * トリガー: EventBridge Scheduler（15 分間隔など）
 * ランタイム: Node.js 20.x
 * 依存: pg のみ（AWS SDK は不要、Bedrock は Vercel API 側で実行）
 *
 * 処理:
 *  1. jGrants API を叩いて新規 / 継続中の補助金を取得
 *  2. RDS に UPSERT（新規行に対しては content_jobs に pending を積む）
 *  3. content_jobs.article.pending を 5 件まで選び、Vercel の POST /api/articles/generate を叩く
 *  4. 生成された slug を束ねて POST /api/revalidate で ISR を即時パージ
 *  5. sync_logs にサマリを残す
 *
 * 必要な環境変数（Lambda の環境変数 or Secrets Manager 経由で注入）:
 *   DATABASE_URL            Amazon RDS PostgreSQL の接続文字列
 *   VERCEL_APP_URL          例: https://nts-gate-lp.vercel.app （末尾スラッシュなし）
 *   ARTICLE_GENERATE_TOKEN  POST /api/articles/generate 認証用
 *   REVALIDATE_SECRET       POST /api/revalidate 認証用
 *   DRAIN_LIMIT             1 回で消化する最大件数（デフォルト 5）
 *   SYNC_USER_AGENT         jGrants へ送る User-Agent（礼儀作法用、例: "nts-lambda/1.0 (contact: ops@...)"）
 */
import pg from "pg";
import { randomUUID } from "node:crypto";

const LOG = "[article-pipeline]";
const JGRANTS_BASE = "https://api.jgrants-portal.go.jp/exp/v1/public";

// -----------------------------------------------------------------------------
// jGrants fetcher（sync-jgrants.mjs と同等のロジックを埋め込み版で保持）
// -----------------------------------------------------------------------------
function extractItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

const resolveExternalId = (g) =>
  g?.id ?? g?.subsidyId ?? g?.subsidy_id ?? g?.jgrantsId ?? g?.jgrants_id ?? null;
const resolveName = (g) => g?.title ?? "不明";
const resolveDescription = (g) =>
  g?.summary ?? g?.outline ?? g?.description ?? null;
const resolveDeadlineRaw = (g) => g?.acceptance_end_datetime ?? null;

function resolveMaxAmountLabel(g) {
  const n = Number(g?.subsidy_max_limit);
  if (Number.isFinite(n) && n > 0) return `最大${n.toLocaleString("ja-JP")}円`;
  return null;
}

function resolveTargetIndustries(g) {
  const c =
    g?.targetIndustries ??
    g?.target_industries ??
    g?.industries ??
    g?.targetIndustry;
  if (Array.isArray(c)) {
    return c.map((v) => String(v).trim()).filter((v) => v);
  }
  if (typeof c === "string" && c.trim()) return [c.trim()];
  return [];
}

function parseDeadline(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function fetchAllOpenGrants(userAgent) {
  const results = [];
  const seen = new Set();
  let offset = 0;
  const limit = 100;
  let prevSig = null;
  const MAX_LOOPS = 200;
  let loops = 0;

  while (true) {
    loops += 1;
    if (loops > MAX_LOOPS) break;

    const params = new URLSearchParams({
      keyword: "補助金",
      sort: "created_date",
      order: "DESC",
      acceptance: "1",
      limit: String(limit),
      offset: String(offset),
    });
    const res = await fetch(`${JGRANTS_BASE}/subsidies?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": userAgent,
      },
    });
    if (!res.ok) {
      throw new Error(`jGrants API error: ${res.status} ${res.statusText}`);
    }
    const payload = await res.json();
    const items = extractItems(payload);
    const sig = `${items.length}:${items
      .map((i) => resolveExternalId(i) ?? "")
      .join("|")}`;
    if (sig === prevSig) break;
    prevSig = sig;

    let added = 0;
    for (const it of items) {
      const id = resolveExternalId(it) ?? `${resolveName(it)}::x`;
      if (seen.has(id)) continue;
      seen.add(id);
      results.push(it);
      added += 1;
    }
    if (items.length === 0 || added === 0 || items.length < limit) break;
    offset += limit;
    await new Promise((r) => setTimeout(r, 100));
  }
  return results;
}

function filterOpen(grants) {
  const now = new Date();
  return grants.filter((g) => {
    const d = parseDeadline(resolveDeadlineRaw(g));
    if (d && d < now) return false;
    return true;
  });
}

/** 2050年より先の期限は jGrants のデータ不備とみなし null に補正 */
const DEADLINE_SANITY_MAX = new Date("2050-01-01");

/** rawPayload.target_area_search から都道府県を抽出。"全国" は null */
function resolvePrefecture(grant) {
  const area = grant?.target_area_search ?? null;
  if (!area || area.trim() === "全国" || area.trim() === "") return null;
  return area.trim();
}

async function upsertGrant(client, grant) {
  const externalId = resolveExternalId(grant);
  const name = resolveName(grant);
  const description = resolveDescription(grant);
  const maxAmountLabel = resolveMaxAmountLabel(grant);
  const deadlineRaw = resolveDeadlineRaw(grant);
  const deadlineRaw2 = parseDeadline(deadlineRaw);
  // 2050年超えは異常値として null に補正
  const deadline =
    deadlineRaw2 && deadlineRaw2 > DEADLINE_SANITY_MAX ? null : deadlineRaw2;
  const targetIndustries = resolveTargetIndustries(grant);
  const targetIndustryNote = grant?.target_area_search ?? null;
  const prefecture = resolvePrefecture(grant);

  const query = `
    INSERT INTO "SubsidyGrant" (
      id, "externalId", name, description,
      "maxAmountLabel", "deadlineLabel",
      deadline, status, source,
      "targetIndustries", "targetIndustryNote", prefecture, "rawPayload", "updatedAt", "syncedAt"
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'open','jgrants',$8,$9,$10,$11::jsonb,NOW(),NOW())
    ON CONFLICT ("externalId") DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      "maxAmountLabel" = EXCLUDED."maxAmountLabel",
      "deadlineLabel" = EXCLUDED."deadlineLabel",
      deadline = EXCLUDED.deadline,
      "targetIndustries" = EXCLUDED."targetIndustries",
      "targetIndustryNote" = EXCLUDED."targetIndustryNote",
      prefecture = EXCLUDED.prefecture,
      "rawPayload" = EXCLUDED."rawPayload",
      source = 'jgrants',
      status = 'open',
      "updatedAt" = NOW()
    RETURNING id, (xmax = 0) AS is_new
  `;
  const values = [
    randomUUID(),
    externalId,
    name,
    description,
    maxAmountLabel,
    deadlineRaw ? String(deadlineRaw) : null,
    deadline,
    targetIndustries,
    targetIndustryNote,
    prefecture,
    JSON.stringify(grant),
  ];
  const result = await client.query(query, values);
  return result.rows[0];
}

async function enqueueArticleJob(client, subsidyId) {
  await client.query(
    `
    INSERT INTO content_jobs (id, subsidy_id, job_type, status, triggered_at)
    VALUES ($1, $2, 'article', 'pending', NOW())
    ON CONFLICT (subsidy_id, job_type) DO NOTHING
    `,
    [randomUUID(), subsidyId],
  );
}

async function selectPendingJobs(client, limit) {
  const res = await client.query(
    `
    SELECT subsidy_id
    FROM content_jobs
    WHERE job_type = 'article' AND status = 'pending'
    ORDER BY triggered_at ASC
    LIMIT $1
    `,
    [limit],
  );
  return res.rows.map((r) => r.subsidy_id);
}

// -----------------------------------------------------------------------------
// Vercel API 呼び出し
// -----------------------------------------------------------------------------
async function callGenerate({ vercelUrl, token, subsidyId }) {
  const res = await fetch(`${vercelUrl}/api/articles/generate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": token,
    },
    body: JSON.stringify({ subsidyId }),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { ok: false, error: text.slice(0, 200) };
  }
  return { httpStatus: res.status, ...json };
}

async function callRevalidate({ vercelUrl, secret, slugs }) {
  const res = await fetch(`${vercelUrl}/api/revalidate`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": secret,
    },
    body: JSON.stringify({ slugs }),
  });
  const text = await res.text();
  try {
    return { httpStatus: res.status, ...JSON.parse(text) };
  } catch {
    return { httpStatus: res.status, ok: false, error: text.slice(0, 200) };
  }
}

// -----------------------------------------------------------------------------
// Lambda handler
// -----------------------------------------------------------------------------
export async function handler(event = {}) {
  const startedAt = Date.now();
  const DATABASE_URL = process.env.DATABASE_URL;
  const VERCEL_APP_URL = (process.env.VERCEL_APP_URL ?? "").replace(/\/$/, "");
  const ARTICLE_GENERATE_TOKEN = process.env.ARTICLE_GENERATE_TOKEN;
  const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;
  const DRAIN_LIMIT = Number(process.env.DRAIN_LIMIT ?? 5) || 5;
  const SYNC_USER_AGENT =
    process.env.SYNC_USER_AGENT ?? "nts-gate-lp-sync/1.0";

  if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!VERCEL_APP_URL) throw new Error("VERCEL_APP_URL is required");
  if (!ARTICLE_GENERATE_TOKEN)
    throw new Error("ARTICLE_GENERATE_TOKEN is required");
  if (!REVALIDATE_SECRET) throw new Error("REVALIDATE_SECRET is required");

  const { Client } = pg;
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const report = {
    ok: true,
    event,
    sync: { fetched: 0, newGrants: 0, updatedGrants: 0 },
    generate: { picked: 0, published: 0, rejected: 0, failed: 0, details: [] },
    revalidate: null,
    elapsedMs: 0,
  };

  try {
    await client.connect();

    // ----- 1) sync -----
    const allGrants = await fetchAllOpenGrants(SYNC_USER_AGENT);
    const filtered = filterOpen(allGrants);
    report.sync.fetched = filtered.length;

    for (const g of filtered) {
      const row = await upsertGrant(client, g);
      if (row.is_new) {
        report.sync.newGrants += 1;
        await enqueueArticleJob(client, row.id);
      } else {
        report.sync.updatedGrants += 1;
      }
    }
    console.log(`${LOG} synced new=${report.sync.newGrants} updated=${report.sync.updatedGrants}`);

    // ----- 2) drain pending jobs -----
    const pendingIds = await selectPendingJobs(client, DRAIN_LIMIT);
    report.generate.picked = pendingIds.length;
    const publishedSlugs = [];

    for (const subsidyId of pendingIds) {
      try {
        const result = await callGenerate({
          vercelUrl: VERCEL_APP_URL,
          token: ARTICLE_GENERATE_TOKEN,
          subsidyId,
        });
        if (result.httpStatus >= 200 && result.httpStatus < 300 && result.ok) {
          if (result.status === "published") {
            report.generate.published += 1;
            if (result.slug) publishedSlugs.push(result.slug);
          } else {
            report.generate.rejected += 1;
          }
          report.generate.details.push({
            subsidyId,
            status: result.status,
            slug: result.slug ?? null,
            violations: result.violations ?? [],
          });
        } else {
          report.generate.failed += 1;
          report.generate.details.push({
            subsidyId,
            status: "http-failed",
            httpStatus: result.httpStatus,
            error: result.error ?? "",
          });
        }
      } catch (e) {
        report.generate.failed += 1;
        report.generate.details.push({
          subsidyId,
          status: "exception",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    console.log(
      `${LOG} generated published=${report.generate.published} rejected=${report.generate.rejected} failed=${report.generate.failed}`,
    );

    // ----- 3) revalidate（公開した分だけ即時パージ） -----
    if (publishedSlugs.length > 0) {
      report.revalidate = await callRevalidate({
        vercelUrl: VERCEL_APP_URL,
        secret: REVALIDATE_SECRET,
        slugs: publishedSlugs,
      });
      console.log(
        `${LOG} revalidated slugs=${publishedSlugs.join(",")} ok=${report.revalidate.ok}`,
      );
    }

    // ----- 4) sync_logs 記録 -----
    await client.query(
      `
      INSERT INTO sync_logs (id, synced_at, records_fetched, records_upserted, error_message)
      VALUES ($1, NOW(), $2, $3, NULL)
      `,
      [
        randomUUID(),
        report.sync.fetched,
        report.sync.newGrants + report.sync.updatedGrants,
      ],
    );
  } catch (e) {
    report.ok = false;
    report.error = e instanceof Error ? e.message : String(e);
    console.error(`${LOG} FAILED`, e);
    try {
      await client.query(
        `
        INSERT INTO sync_logs (id, synced_at, records_fetched, records_upserted, error_message)
        VALUES ($1, NOW(), $2, $3, $4)
        `,
        [
          randomUUID(),
          report.sync.fetched,
          report.sync.newGrants + report.sync.updatedGrants,
          report.error,
        ],
      );
    } catch {
      // ignore
    }
    throw e; // Lambda 側にも失敗を伝播（EventBridge のエラーメトリクスに載る）
  } finally {
    report.elapsedMs = Date.now() - startedAt;
    await client.end().catch(() => {});
    console.log(`${LOG} report`, JSON.stringify(report));
  }

  return report;
}

// ローカル動作確認用（Node から直接 `node lambda/article-pipeline/index.mjs` で呼べる）
// Windows / Linux 両対応のため fileURLToPath で比較
import { fileURLToPath } from "node:url";
const isDirectInvocation = (() => {
  // Lambda 環境では AWS_LAMBDA_FUNCTION_NAME が必ず設定されるため、
  // その場合は絶対にローカル起動扱いにしない。
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  try {
    const selfPath = fileURLToPath(import.meta.url);
    const argvPath = process.argv[1] ?? "";
    return selfPath === argvPath;
  } catch {
    return false;
  }
})();

if (isDirectInvocation) {
  (async () => {
    const dotenv = await import("dotenv");
    const path = await import("node:path");
    dotenv.default.config({ path: path.resolve(process.cwd(), ".env.local") });
    dotenv.default.config({ path: path.resolve(process.cwd(), ".env") });

    try {
      const r = await handler({ source: "local" });
      console.log(JSON.stringify(r, null, 2));
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
