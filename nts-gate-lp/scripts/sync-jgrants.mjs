/**
 * jGrants API -> RDS SubsidyGrant 同期スクリプト
 * 実行: node scripts/sync-jgrants.mjs
 */
import dotenv from "dotenv";
import pg from "pg";
import { randomUUID } from "node:crypto";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const { Client } = pg;
const JGRANTS_BASE = "https://api.jgrants-portal.go.jp/exp/v1/public";

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function resolveExternalId(grant) {
  return (
    grant?.id ??
    grant?.subsidyId ??
    grant?.subsidy_id ??
    grant?.jgrantsId ??
    grant?.jgrants_id ??
    null
  );
}

function resolveName(grant) {
  return (
    grant?.name ??
    grant?.title ??
    grant?.subsidyName ??
    grant?.subsidy_name ??
    "不明"
  );
}

function resolveDescription(grant) {
  return grant?.summary ?? grant?.outline ?? grant?.description ?? null;
}

function resolveDeadlineRaw(grant) {
  return (
    grant?.deadline ??
    grant?.acceptance_end ??
    grant?.acceptanceEnd ??
    grant?.acceptance_end_datetime ??
    null
  );
}

function resolveMaxAmountLabel(grant) {
  const numericCandidate =
    grant?.maxAmount ??
    grant?.max_amount ??
    grant?.subsidyAmount ??
    grant?.subsidy_amount ??
    grant?.upper_limit;
  const asNumber = Number(numericCandidate);
  if (!Number.isNaN(asNumber) && Number.isFinite(asNumber) && asNumber > 0) {
    return `最大${asNumber.toLocaleString("ja-JP")}円`;
  }
  return grant?.upperLimit ?? grant?.upper_limit_label ?? null;
}

function resolveTargetIndustries(grant) {
  const candidate =
    grant?.targetIndustries ??
    grant?.target_industries ??
    grant?.industries ??
    grant?.targetIndustry;
  if (Array.isArray(candidate)) {
    return candidate
      .map((v) => String(v).trim())
      .filter((v) => v.length > 0);
  }
  if (typeof candidate === "string" && candidate.trim()) {
    return [candidate.trim()];
  }
  return [];
}

function parseDeadline(deadlineRaw) {
  if (!deadlineRaw) return null;
  const dt = new Date(deadlineRaw);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

async function fetchAllOpenGrants() {
  const results = [];
  const seenIds = new Set();
  let offset = 0;
  const limit = 100;
  let previousSignature = null;
  const maxLoops = 200;
  let loops = 0;

  while (true) {
    loops += 1;
    if (loops > maxLoops) {
      console.warn(`[fetch] max loops reached: ${maxLoops}`);
      break;
    }

    const params = new URLSearchParams({
      keyword: "補助金",
      sort: "created_date",
      order: "DESC",
      acceptance: "1",
      limit: String(limit),
      offset: String(offset),
    });
    const url = `${JGRANTS_BASE}/subsidies?${params.toString()}`;
    console.log(`[fetch] offset=${offset}`);
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`jGrants API error: ${res.status} ${res.statusText}`);
    }

    const payload = await res.json();
    const items = extractItems(payload);
    if (offset === 0 && items[0]) {
      console.log("[debug] first item keys:", Object.keys(items[0]).join(", "));
    }

    const pageIds = items.map((it) => resolveExternalId(it) ?? "").join("|");
    const signature = `${items.length}:${pageIds}`;
    if (signature === previousSignature) {
      console.log("[fetch] duplicated page detected; stop paging");
      break;
    }
    previousSignature = signature;

    let newlyAdded = 0;
    for (const item of items) {
      const id = resolveExternalId(item) ?? `${resolveName(item)}::${JSON.stringify(item).slice(0, 80)}`;
      if (seenIds.has(id)) continue;
      seenIds.add(id);
      results.push(item);
      newlyAdded += 1;
    }
    console.log(`[fetch] got=${items.length} new=${newlyAdded} total=${results.length}`);

    if (items.length === 0 || newlyAdded === 0 || items.length < limit) break;
    offset += limit;
    await sleep(100);
  }

  return results;
}

function filterRelevantGrants(grants) {
  const now = new Date();
  return grants.filter((g) => {
    const deadline = parseDeadline(resolveDeadlineRaw(g));
    if (deadline && deadline < now) return false;
    return true;
  });
}

async function upsertGrant(grant) {
  const externalId = resolveExternalId(grant);
  const name = resolveName(grant);
  const description = resolveDescription(grant);
  const maxAmountLabel = resolveMaxAmountLabel(grant);
  const deadlineRaw = resolveDeadlineRaw(grant);
  const deadline = parseDeadline(deadlineRaw);
  const targetIndustries = resolveTargetIndustries(grant);

  const query = `
    INSERT INTO "SubsidyGrant" (
      id, "externalId", name, description,
      "maxAmountLabel", "deadlineLabel",
      deadline, status, source,
      "targetIndustries", "rawPayload", "updatedAt", "syncedAt"
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,'open','jgrants',$8,$9::jsonb,NOW(),NOW())
    ON CONFLICT ("externalId") DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      "maxAmountLabel" = EXCLUDED."maxAmountLabel",
      "deadlineLabel" = EXCLUDED."deadlineLabel",
      deadline = EXCLUDED.deadline,
      "targetIndustries" = EXCLUDED."targetIndustries",
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
    JSON.stringify(grant),
  ];

  const result = await client.query(query, values);
  return result.rows[0];
}

async function enqueueJobs(subsidyId) {
  for (const jobType of ["article", "lp", "video_script"]) {
    await client.query(
      `
      INSERT INTO content_jobs (id, subsidy_id, job_type, status, triggered_at)
      VALUES ($1, $2, $3, 'pending', NOW())
      ON CONFLICT (subsidy_id, job_type) DO NOTHING
      `,
      [randomUUID(), subsidyId, jobType]
    );
  }
}

async function logSync(recordsFetched, recordsUpserted, errorMessage = null) {
  await client.query(
    `
    INSERT INTO sync_logs (id, synced_at, records_fetched, records_upserted, error_message)
    VALUES ($1, NOW(), $2, $3, $4)
    `,
    [randomUUID(), recordsFetched, recordsUpserted, errorMessage]
  );
}

let fetched = 0;
let newCount = 0;
let updatedCount = 0;
let errorMessage = null;
let connected = false;

try {
  await client.connect();
  connected = true;
  console.log("[db] connected");

  const allGrants = await fetchAllOpenGrants();
  fetched = allGrants.length;
  console.log(`[summary] fetched=${fetched}`);

  const filtered = filterRelevantGrants(allGrants);
  console.log(`[summary] filtered=${filtered.length}`);

  for (const grant of filtered) {
    const row = await upsertGrant(grant);
    if (row.is_new) {
      newCount += 1;
      await enqueueJobs(row.id);
    } else {
      updatedCount += 1;
    }
  }

  console.log(`[done] new=${newCount} updated=${updatedCount}`);
} catch (err) {
  errorMessage = err instanceof Error ? err.message : String(err);
  console.error("[error]", err);
} finally {
  const upserted = newCount + updatedCount;
  try {
    if (connected) {
      await logSync(fetched, upserted, errorMessage);
    }
  } catch (logErr) {
    console.error("[warn] failed to write sync_logs", logErr);
  }
  try {
    await client.end();
  } catch {
    // ignore
  }
}
