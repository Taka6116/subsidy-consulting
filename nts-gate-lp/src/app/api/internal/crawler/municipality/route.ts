import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { load } from "cheerio";
import { crawlMunicipality, fetchWithRetry, decodeBufferToUtf8 } from "@/lib/crawler";
import { classifySubsidy } from "@/lib/crawler/llm/classify-subsidy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type MunicipalityPayload = {
  id: string;
  code: string;
  name: string;
  prefectureName?: string;
  type: string;
  officialUrl: string | null;
  subsidyPageUrl: string | null;
  feedUrl: string | null;
  crawlStrategy: string;
  crawlConfig: unknown;
};

function toPlainText(html: string): string {
  const $ = load(html);
  $("script,style,noscript").remove();
  return $.text().replace(/\s+/g, " ").trim();
}

function hashContent(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function normalizeThreshold(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0.6;
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

export async function POST(request: Request) {
  const expectedToken = process.env.MUNICIPALITY_CRAWLER_TOKEN?.trim();
  if (!expectedToken) {
    return NextResponse.json(
      { ok: false, error: "MUNICIPALITY_CRAWLER_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const providedToken = request.headers.get("x-internal-token");
  if (providedToken !== expectedToken) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json body" }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const municipality = body.municipality as MunicipalityPayload | undefined;
  const options = (body.options ?? {}) as Record<string, unknown>;

  if (!municipality?.id || !municipality?.code || !municipality?.name) {
    return NextResponse.json(
      { ok: false, error: "municipality.id/code/name are required" },
      { status: 400 },
    );
  }

  const confidenceThreshold = normalizeThreshold(options.confidenceThreshold);
  const maxClassify = Math.max(1, Math.min(Number(options.maxClassify ?? 20) || 20, 100));

  const crawlResult = await crawlMunicipality({
    id: municipality.id,
    code: municipality.code,
    name: municipality.name,
    officialUrl: municipality.officialUrl ?? null,
    subsidyPageUrl: municipality.subsidyPageUrl ?? null,
    feedUrl: municipality.feedUrl ?? null,
    crawlStrategy: municipality.crawlStrategy ?? "html_list",
    crawlConfig: municipality.crawlConfig ?? null,
  });

  const links = [];
  const classifyErrors: Array<{ url: string; error: string }> = [];
  let skippedLowConfidence = 0;
  let skippedNonSubsidy = 0;

  for (const item of crawlResult.links.slice(0, maxClassify)) {
    try {
      const response = await fetchWithRetry(item.url, { timeoutMs: 20_000, retries: 1 });
      if (!response.ok) {
        classifyErrors.push({ url: item.url, error: `HTTP ${response.status}` });
        continue;
      }

      const contentType = response.headers.get("content-type");
      const buffer = Buffer.from(await response.arrayBuffer());
      const html = decodeBufferToUtf8(buffer, contentType);
      const pageText = toPlainText(html).slice(0, 12_000);
      if (!pageText) continue;

      const classified = await classifySubsidy({
        pageText,
        pageUrl: item.url,
      });

      if (!classified) {
        skippedNonSubsidy += 1;
        continue;
      }
      if (classified.confidence < confidenceThreshold) {
        skippedLowConfidence += 1;
        continue;
      }

      links.push({
        url: item.url,
        title: item.title,
        name: classified.name ?? item.title,
        description: classified.description,
        maxAmount: classified.maxAmount,
        subsidyRate: classified.subsidyRate,
        deadline: classified.deadline,
        targetBusiness: classified.targetBusiness,
        targetArea: classified.targetArea,
        institutionName: classified.institutionName ?? municipality.name,
        targetIndustries: [],
        confidence: classified.confidence,
        fetchedAt: new Date().toISOString(),
        contentHash: hashContent(pageText),
      });
    } catch (error) {
      classifyErrors.push({
        url: item.url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return NextResponse.json({
    ok: true,
    municipality: {
      id: municipality.id,
      code: municipality.code,
      name: municipality.name,
    },
    metadata: crawlResult.metadata,
    links,
    rawLinksFound: crawlResult.links.length,
    skipped: {
      lowConfidence: skippedLowConfidence,
      nonSubsidy: skippedNonSubsidy,
    },
    errors: [...crawlResult.errors, ...classifyErrors],
  });
}
