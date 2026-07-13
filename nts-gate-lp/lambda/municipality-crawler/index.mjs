/**
 * AWS Lambda: 自治体クローラー実行オーケストレーター
 *
 * - municipalities から対象自治体を priority + last_crawled_at で抽出
 * - Vercel 側 crawler エンドポイントを呼び出し（crawler基盤はVercel側で実行）
 * - 結果を SubsidyGrant に UPSERT（source="municipality"）
 * - 新規行には content_jobs(article/lp/video) を投入
 * - municipality_crawl_results に実行ログを書き込み
 *
 * 必須環境変数:
 *   DATABASE_URL
 *   VERCEL_APP_URL                 例: https://nts-gate-lp.vercel.app
 *   MUNICIPALITY_CRAWLER_TOKEN     Vercel内部API用トークン
 *
 * 任意環境変数:
 *   MUNICIPALITY_BATCH_SIZE        default: 50
 *   MUNICIPALITY_CRAWLER_ENDPOINT  default: /api/internal/crawler/municipality
 *   MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD default: 0.6
 */
import pg from "pg";
import { randomUUID, createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const LOG = "[municipality-crawler]";
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_ENDPOINT = "/api/internal/crawler/municipality";
const MAX_TITLE_LEN = 400;
const MAX_DESC_LEN = 20_000;
const MAX_INSTITUTION_LEN = 255;

function getJstHour(now = new Date()) {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.getUTCHours();
}

function isNightWindowJst(now = new Date()) {
  const hour = getJstHour(now);
  return hour >= 21 || hour < 7;
}

function toIsoDateOrNull(input) {
  if (!input) return null;
  const dt = new Date(input);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function toSafeString(value, maxLen) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, maxLen);
}

function toSafeArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => String(v).trim())
    .filter(Boolean)
    .slice(0, 20);
}

// LLM分類結果は業種を構造化して返さないため、name/description/targetBusiness からキーワードで推定する
// （一覧ページの絞り込みに必要）。
const INDUSTRY_KEYWORD_RULES = [
  { label: "農林水産業", keywords: ["農業", "林業", "漁業", "水産", "畜産", "農園", "農地", "酪農"] },
  { label: "製造業", keywords: ["製造業", "製造", "工場", "ものづくり", "モノづくり", "生産設備", "金属加工", "食品加工", "町工場"] },
  { label: "建設業", keywords: ["建設業", "建設", "建築", "土木", "解体工事", "リフォーム", "住宅工事", "工事業"] },
  { label: "物流・運輸", keywords: ["物流", "運輸業", "運送業", "倉庫業", "トラック運送", "配送業"] },
  { label: "IT・情報通信", keywords: ["IT導入", "情報通信業", "ソフトウェア", "システム開発", "デジタル化", "情報サービス業", "アプリ開発"] },
  { label: "小売・サービス業", keywords: ["小売業", "商店街", "商店", "小売店", "サービス業", "卸売業", "EC事業", "美容業"] },
  { label: "医療・福祉", keywords: ["医療機関", "病院", "診療所", "クリニック", "介護", "福祉施設", "薬局", "訪問看護"] },
  { label: "飲食業", keywords: ["飲食店", "飲食業", "レストラン", "居酒屋", "カフェ", "食堂"] },
  { label: "観光・宿泊", keywords: ["観光", "宿泊業", "ホテル", "旅館", "民泊", "旅行業"] },
];
const BROAD_INDUSTRY_KEYWORDS = ["中小企業全般", "業種を問わず", "全業種", "全ての事業者", "すべての事業者", "業種問わず"];

function inferIndustriesFromText(text) {
  if (!text) return [];
  const matched = new Set();
  for (const rule of INDUSTRY_KEYWORD_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) matched.add(rule.label);
  }
  if (matched.size === 0 && BROAD_INDUSTRY_KEYWORDS.some((k) => text.includes(k))) {
    matched.add("全業種");
  }
  return [...matched];
}

function normalizeSubsidyRate(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  // 例: "1/2" は Decimal に入らないため null 扱いにする
  const num = Number(s.replace(/[%％]/g, "").trim());
  if (!Number.isFinite(num)) return null;
  return num;
}

function normalizeMaxAmount(value) {
  if (value == null) return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
  const n = Number(String(value).replace(/[,\s円万円億]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}

function hashText(input) {
  return createHash("sha256").update(input).digest("hex");
}

function buildExternalId(municipalityCode, url) {
  const urlHash16 = hashText(url).slice(0, 16);
  return `muni-${municipalityCode}-${urlHash16}`;
}

async function selectMunicipalities(client, batchSize) {
  const sql = `
    SELECT
      id,
      code,
      name,
      prefecture_name,
      type,
      official_url,
      subsidy_page_url,
      feed_url,
      crawl_strategy,
      crawl_config,
      last_crawled_at,
      crawl_status,
      priority
    FROM municipalities
    WHERE crawl_status <> 'disabled'
    ORDER BY priority DESC, COALESCE(last_crawled_at, TIMESTAMP '1970-01-01') ASC
    LIMIT $1
  `;
  const res = await client.query(sql, [batchSize]);
  return res.rows;
}

async function markMunicipalityStatus(client, municipalityId, { status, errorMessage }) {
  await client.query(
    `
    UPDATE municipalities
    SET
      crawl_status = $2,
      error_message = $3,
      updated_at = NOW()
    WHERE id = $1
    `,
    [municipalityId, status, errorMessage ?? null],
  );
}

async function updateLastCrawledAt(client, municipalityId) {
  await client.query(
    `
    UPDATE municipalities
    SET last_crawled_at = NOW(), updated_at = NOW(), crawl_status = 'active', error_message = NULL
    WHERE id = $1
    `,
    [municipalityId],
  );
}

async function insertCrawlResult(client, municipalityId, payload) {
  await client.query(
    `
    INSERT INTO municipality_crawl_results
      (id, municipality_id, crawled_at, links_found, new_grants, updated_grants, errors, duration)
    VALUES
      ($1, $2, NOW(), $3, $4, $5, $6::jsonb, $7)
    `,
    [
      randomUUID(),
      municipalityId,
      payload.linksFound ?? 0,
      payload.newGrants ?? 0,
      payload.updatedGrants ?? 0,
      JSON.stringify(payload.errors ?? []),
      payload.duration ?? null,
    ],
  );
}

async function enqueueContentJobs(client, subsidyId) {
  const jobTypes = ["article", "lp", "video"];
  for (const jobType of jobTypes) {
    await client.query(
      `
      INSERT INTO content_jobs (id, subsidy_id, job_type, status, triggered_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      ON CONFLICT (subsidy_id, job_type) DO NOTHING
      `,
      [randomUUID(), subsidyId, jobType],
    );
  }
}

async function upsertMunicipalityGrant(client, municipality, discovered) {
  const officialPageUrl = toSafeString(discovered.url, 1000);
  if (!officialPageUrl) return { isNew: false, subsidyId: null, skipped: true };

  const name = toSafeString(discovered.name || discovered.title, MAX_TITLE_LEN);
  if (!name) return { isNew: false, subsidyId: null, skipped: true };

  const externalId = buildExternalId(municipality.code, officialPageUrl);
  const institutionName =
    toSafeString(discovered.institutionName, MAX_INSTITUTION_LEN) ||
    toSafeString(municipality.name, MAX_INSTITUTION_LEN);

  const deadline = toIsoDateOrNull(discovered.deadline);
  const fetchedAt = toIsoDateOrNull(discovered.fetchedAt) || new Date();
  const subsidyAmount = normalizeMaxAmount(discovered.maxAmount);
  const subsidyRate = normalizeSubsidyRate(discovered.subsidyRate);
  const explicitIndustries = toSafeArray(discovered.targetIndustries);
  const targetIndustries =
    explicitIndustries.length > 0
      ? explicitIndustries
      : inferIndustriesFromText(
          [name, discovered.targetBusiness, discovered.description]
            .filter((v) => typeof v === "string" && v.trim())
            .join(" "),
        );
  const targetIndustryNote =
    toSafeString(discovered.targetBusiness, 2000) || toSafeString(discovered.description, 2000);
  const description = toSafeString(discovered.description, MAX_DESC_LEN);
  const contentHash = toSafeString(
    discovered.contentHash || hashText(JSON.stringify(discovered)),
    255,
  );

  const rawPayload = {
    sourceType: "municipality",
    municipalityCode: municipality.code,
    municipalityName: municipality.name,
    municipalityType: municipality.type,
    crawlStrategy: municipality.crawl_strategy,
    discoveredAt: new Date().toISOString(),
    discovered,
  };

  // officialPageUrl一致を優先し、なければ externalId でUPSERT
  const existingByUrl = await client.query(
    `SELECT id FROM "SubsidyGrant" WHERE official_page_url = $1 LIMIT 1`,
    [officialPageUrl],
  );

  if (existingByUrl.rows.length > 0) {
    const subsidyId = existingByUrl.rows[0].id;
    await client.query(
      `
      UPDATE "SubsidyGrant"
      SET
        "externalId" = COALESCE("externalId", $2),
        name = $3,
        description = $4,
        "maxAmountLabel" = COALESCE($5, "maxAmountLabel"),
        "deadlineLabel" = COALESCE($6, "deadlineLabel"),
        subsidy_amount = COALESCE($7::bigint, subsidy_amount),
        subsidy_rate = COALESCE($8::numeric, subsidy_rate),
        deadline = COALESCE($9::date, deadline),
        source = 'municipality',
        status = 'open',
        "targetIndustries" = CASE
          WHEN cardinality($10::text[]) > 0 THEN $10::text[]
          ELSE "targetIndustries"
        END,
        "targetIndustryNote" = COALESCE($11, "targetIndustryNote"),
        prefecture = COALESCE($12, prefecture),
        municipality_code = $13,
        official_page_url = $1,
        institution_name = COALESCE($14, institution_name),
        fetched_at = $15,
        content_hash = $16,
        "rawPayload" = $17::jsonb,
        "updatedAt" = NOW()
      WHERE id = $18
      `,
      [
        officialPageUrl,
        externalId,
        name,
        description,
        subsidyAmount != null ? `最大${subsidyAmount.toLocaleString("ja-JP")}円` : null,
        deadline ? deadline.toISOString() : null,
        subsidyAmount,
        subsidyRate,
        deadline,
        targetIndustries,
        targetIndustryNote,
        municipality.prefecture_name,
        municipality.code,
        institutionName,
        fetchedAt,
        contentHash,
        JSON.stringify(rawPayload),
        subsidyId,
      ],
    );
    return { isNew: false, subsidyId, skipped: false };
  }

  const upsert = await client.query(
    `
    INSERT INTO "SubsidyGrant" (
      id,
      "externalId",
      name,
      description,
      "maxAmountLabel",
      "deadlineLabel",
      subsidy_amount,
      subsidy_rate,
      deadline,
      source,
      status,
      "targetIndustries",
      "targetIndustryNote",
      prefecture,
      municipality_code,
      official_page_url,
      institution_name,
      fetched_at,
      content_hash,
      "rawPayload",
      "syncedAt",
      "updatedAt"
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7::bigint,$8::numeric,$9::date,
      'municipality','open',$10::text[],$11,$12,$13,$14,$15,$16,$17,$18::jsonb,NOW(),NOW()
    )
    ON CONFLICT ("externalId") DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      "maxAmountLabel" = COALESCE(EXCLUDED."maxAmountLabel", "SubsidyGrant"."maxAmountLabel"),
      "deadlineLabel" = COALESCE(EXCLUDED."deadlineLabel", "SubsidyGrant"."deadlineLabel"),
      subsidy_amount = COALESCE(EXCLUDED.subsidy_amount, "SubsidyGrant".subsidy_amount),
      subsidy_rate = COALESCE(EXCLUDED.subsidy_rate, "SubsidyGrant".subsidy_rate),
      deadline = COALESCE(EXCLUDED.deadline, "SubsidyGrant".deadline),
      source = 'municipality',
      status = 'open',
      "targetIndustries" = CASE
        WHEN cardinality(EXCLUDED."targetIndustries") > 0 THEN EXCLUDED."targetIndustries"
        ELSE "SubsidyGrant"."targetIndustries"
      END,
      "targetIndustryNote" = COALESCE(EXCLUDED."targetIndustryNote", "SubsidyGrant"."targetIndustryNote"),
      prefecture = COALESCE(EXCLUDED.prefecture, "SubsidyGrant".prefecture),
      municipality_code = EXCLUDED.municipality_code,
      official_page_url = EXCLUDED.official_page_url,
      institution_name = COALESCE(EXCLUDED.institution_name, "SubsidyGrant".institution_name),
      fetched_at = EXCLUDED.fetched_at,
      content_hash = EXCLUDED.content_hash,
      "rawPayload" = EXCLUDED."rawPayload",
      "updatedAt" = NOW()
    RETURNING id, (xmax = 0) AS is_new
    `,
    [
      randomUUID(),
      externalId,
      name,
      description,
      subsidyAmount != null ? `最大${subsidyAmount.toLocaleString("ja-JP")}円` : null,
      deadline ? deadline.toISOString() : null,
      subsidyAmount,
      subsidyRate,
      deadline,
      targetIndustries,
      targetIndustryNote,
      municipality.prefecture_name,
      municipality.code,
      officialPageUrl,
      institutionName,
      fetchedAt,
      contentHash,
      JSON.stringify(rawPayload),
    ],
  );

  const row = upsert.rows[0];
  return { isNew: !!row?.is_new, subsidyId: row?.id ?? null, skipped: false };
}

async function callCrawlerEndpoint({ vercelUrl, endpoint, token, municipality, confidenceThreshold }) {
  const response = await fetch(`${vercelUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": token,
    },
    body: JSON.stringify({
      municipality: {
        id: municipality.id,
        code: municipality.code,
        name: municipality.name,
        prefectureName: municipality.prefecture_name,
        type: municipality.type,
        officialUrl: municipality.official_url,
        subsidyPageUrl: municipality.subsidy_page_url,
        feedUrl: municipality.feed_url,
        crawlStrategy: municipality.crawl_strategy,
        crawlConfig: municipality.crawl_config,
      },
      options: {
        confidenceThreshold,
      },
    }),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }

  if (!response.ok || !json) {
    return {
      ok: false,
      status: response.status,
      error: json?.error || text.slice(0, 500) || `HTTP ${response.status}`,
    };
  }

  return {
    ok: true,
    status: response.status,
    payload: json,
  };
}

export async function handler(event = {}) {
  const startedAt = Date.now();
  const DATABASE_URL = process.env.DATABASE_URL;
  const VERCEL_APP_URL = (process.env.VERCEL_APP_URL ?? "").replace(/\/$/, "");
  const MUNICIPALITY_CRAWLER_TOKEN = process.env.MUNICIPALITY_CRAWLER_TOKEN;
  const MUNICIPALITY_BATCH_SIZE = Number(process.env.MUNICIPALITY_BATCH_SIZE ?? DEFAULT_BATCH_SIZE) || DEFAULT_BATCH_SIZE;
  const MUNICIPALITY_CRAWLER_ENDPOINT = process.env.MUNICIPALITY_CRAWLER_ENDPOINT ?? DEFAULT_ENDPOINT;
  const MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD = Number(
    process.env.MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD ?? "0.6",
  );

  if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!VERCEL_APP_URL) throw new Error("VERCEL_APP_URL is required");
  if (!MUNICIPALITY_CRAWLER_TOKEN) throw new Error("MUNICIPALITY_CRAWLER_TOKEN is required");

  const forceRun =
    event?.force === true ||
    process.env.MUNICIPALITY_CRAWLER_FORCE_RUN === "1";

  if (!forceRun && isNightWindowJst()) {
    const hour = getJstHour();
    const report = {
      ok: true,
      event,
      skipped: true,
      reason: `night-window-jst:${hour}`,
      pickedMunicipalities: 0,
      processedMunicipalities: 0,
      totalLinksFound: 0,
      totalNewGrants: 0,
      totalUpdatedGrants: 0,
      municipalities: [],
      elapsedMs: Date.now() - startedAt,
    };
    console.log(`${LOG} skipped in night window`, JSON.stringify(report));
    return report;
  }

  const { Client } = pg;
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const report = {
    ok: true,
    event,
    pickedMunicipalities: 0,
    processedMunicipalities: 0,
    totalLinksFound: 0,
    totalNewGrants: 0,
    totalUpdatedGrants: 0,
    municipalities: [],
    elapsedMs: 0,
  };

  try {
    await client.connect();
    const targets = await selectMunicipalities(client, MUNICIPALITY_BATCH_SIZE);
    report.pickedMunicipalities = targets.length;
    console.log(`${LOG} picked municipalities=${targets.length}`);

    for (const municipality of targets) {
      const muniStartedAt = Date.now();
      const muniReport = {
        municipalityId: municipality.id,
        municipalityCode: municipality.code,
        municipalityName: municipality.name,
        linksFound: 0,
        newGrants: 0,
        updatedGrants: 0,
        errors: [],
        duration: 0,
      };

      try {
        const crawl = await callCrawlerEndpoint({
          vercelUrl: VERCEL_APP_URL,
          endpoint: MUNICIPALITY_CRAWLER_ENDPOINT,
          token: MUNICIPALITY_CRAWLER_TOKEN,
          municipality,
          confidenceThreshold: MUNICIPALITY_LLM_CONFIDENCE_THRESHOLD,
        });

        if (!crawl.ok) {
          throw new Error(`crawler endpoint failed: ${crawl.error}`);
        }

        const discoveredLinks = Array.isArray(crawl.payload?.links) ? crawl.payload.links : [];
        muniReport.linksFound = discoveredLinks.length;

        for (const discovered of discoveredLinks) {
          const row = await upsertMunicipalityGrant(client, municipality, discovered);
          if (row.skipped) continue;
          if (!row.subsidyId) continue;

          if (row.isNew) {
            muniReport.newGrants += 1;
            await enqueueContentJobs(client, row.subsidyId);
          } else {
            muniReport.updatedGrants += 1;
          }
        }

        await updateLastCrawledAt(client, municipality.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        muniReport.errors.push({ message });
        await markMunicipalityStatus(client, municipality.id, {
          status: "error",
          errorMessage: message.slice(0, 1000),
        });
      } finally {
        muniReport.duration = Date.now() - muniStartedAt;
        await insertCrawlResult(client, municipality.id, muniReport);
        report.municipalities.push(muniReport);
        report.processedMunicipalities += 1;
        report.totalLinksFound += muniReport.linksFound;
        report.totalNewGrants += muniReport.newGrants;
        report.totalUpdatedGrants += muniReport.updatedGrants;
      }
    }
  } catch (error) {
    report.ok = false;
    report.error = error instanceof Error ? error.message : String(error);
    console.error(`${LOG} failed`, error);
    throw error;
  } finally {
    report.elapsedMs = Date.now() - startedAt;
    await client.end().catch(() => {});
    console.log(`${LOG} report`, JSON.stringify(report));
  }

  return report;
}

const isDirectInvocation = (() => {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false;
  try {
    return fileURLToPath(import.meta.url) === (process.argv[1] ?? "");
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
      const result = await handler({ source: "local" });
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}
