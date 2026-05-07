import { load } from "cheerio";
import type {
  CrawlError,
  CrawlResult,
  CrawlStrategy,
  DiscoveredLink,
  MunicipalityLike,
} from "./base";
import { fetchWithRetry } from "../utils/fetch-with-retry";
import { DomainRateLimiter } from "../utils/rate-limiter";
import { decodeBufferToUtf8 } from "../utils/charset-detector";

const STRONG_INCLUDE_KEYWORDS = [
  "補助金",
  "助成金",
  "支援金",
  "給付金",
  "交付金",
  "補助事業",
  "助成事業",
];
const WEAK_INCLUDE_KEYWORDS = ["公募", "募集", "支援制度"];
const WEAK_CONTEXT_KEYWORDS = ["中小企業", "事業者", "産業", "経営", "設備投資", "創業", "DX", "省エネ"];

const EXCLUDE_KEYWORDS = ["終了", "締切済", "募集は終了", "受付終了", "実績報告", "交付決定一覧"];

const limiter = new DomainRateLimiter({ requestDelayMs: 1_000, maxConcurrent: 10 });

type HtmlListConfig = {
  listSelector?: string;
  titleSelector?: string;
  dateSelector?: string;
  paginationSelector?: string;
  maxPages?: number;
};

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function isLikelySubsidyTitle(title: string): boolean {
  if (includesAnyKeyword(title, STRONG_INCLUDE_KEYWORDS)) return true;
  if (includesAnyKeyword(title, WEAK_INCLUDE_KEYWORDS) && includesAnyKeyword(title, WEAK_CONTEXT_KEYWORDS)) {
    return true;
  }
  return false;
}

function resolveUrl(baseUrl: string, href: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseDate(dateText?: string): Date | undefined {
  if (!dateText) return undefined;
  const normalized = dateText.replace(/\./g, "/").replace(/年|月/g, "/").replace(/日/g, "");
  const t = Date.parse(normalized);
  if (Number.isNaN(t)) return undefined;
  return new Date(t);
}

export class HtmlListStrategy implements CrawlStrategy {
  public readonly name = "html_list";

  canHandle(municipality: MunicipalityLike): boolean {
    return municipality.crawlStrategy === "html_list" || municipality.crawlStrategy === "";
  }

  async crawl(municipality: MunicipalityLike): Promise<CrawlResult> {
    const startedAt = Date.now();
    const errors: CrawlError[] = [];
    const links: DiscoveredLink[] = [];
    const seen = new Set<string>();
    let pagesFetched = 0;

    const config = (municipality.crawlConfig ?? {}) as HtmlListConfig;
    const entryUrl = municipality.subsidyPageUrl ?? municipality.officialUrl;

    if (!entryUrl) {
      return {
        links: [],
        errors: [{ message: "subsidyPageUrl/officialUrl が未設定です。" }],
        metadata: { strategy: this.name, duration: Date.now() - startedAt, pagesFetched },
      };
    }

    const queue: string[] = [entryUrl];
    const maxPages = Math.max(1, config.maxPages ?? 3);

    while (queue.length > 0 && pagesFetched < maxPages) {
      const currentUrl = queue.shift();
      if (!currentUrl) break;

      try {
        const response = await limiter.run(currentUrl, () => fetchWithRetry(currentUrl));
        pagesFetched += 1;
        if (!response.ok) {
          errors.push({
            message: `一覧ページ取得失敗: HTTP ${response.status}`,
            url: currentUrl,
            code: String(response.status),
          });
          continue;
        }

        const contentType = response.headers.get("content-type");
        const buffer = Buffer.from(await response.arrayBuffer());
        const html = decodeBufferToUtf8(buffer, contentType);
        const $ = load(html);

        const $anchors = config.listSelector ? $(config.listSelector) : $("a");

        $anchors.each((_, node) => {
          const el = $(node);
          const href = el.attr("href");
          if (!href) return;

          const titleRaw = config.titleSelector ? el.find(config.titleSelector).text() : el.text();
          const title = titleRaw.replace(/\s+/g, " ").trim();
          if (!title) return;

          if (!isLikelySubsidyTitle(title)) return;
          if (includesAnyKeyword(title, EXCLUDE_KEYWORDS)) return;

          const url = resolveUrl(currentUrl, href);
          if (!url || seen.has(url)) return;
          seen.add(url);

          const dateText = config.dateSelector ? el.find(config.dateSelector).text().trim() : undefined;
          links.push({
            url,
            title,
            publishedAt: parseDate(dateText),
          });
        });

        if (config.paginationSelector) {
          const nextHref = $(config.paginationSelector).first().attr("href");
          if (nextHref) {
            const nextUrl = resolveUrl(currentUrl, nextHref);
            if (nextUrl && !queue.includes(nextUrl)) queue.push(nextUrl);
          }
        }
      } catch (error) {
        errors.push({
          message: error instanceof Error ? error.message : "一覧ページのクロールに失敗しました。",
          url: currentUrl,
        });
      }
    }

    return {
      links,
      errors,
      metadata: {
        strategy: this.name,
        duration: Date.now() - startedAt,
        pagesFetched,
      },
    };
  }
}
