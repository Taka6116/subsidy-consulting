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

const INCLUDE_KEYWORDS = [
  "補助金",
  "助成金",
  "支援金",
  "給付金",
  "交付金",
  "公募",
  "募集",
  "支援制度",
  "補助事業",
  "助成事業",
];

const EXCLUDE_KEYWORDS = ["終了", "締切済", "募集は終了", "受付終了", "実績報告", "交付決定一覧"];

const limiter = new DomainRateLimiter({ requestDelayMs: 1_000, maxConcurrent: 10 });

function includesAnyKeyword(text: string, keywords: string[]) {
  return keywords.some((k) => text.includes(k));
}

function resolveUrl(baseUrl: string, maybeUrl: string): string | null {
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return undefined;
  return new Date(t);
}

export class RssStrategy implements CrawlStrategy {
  public readonly name = "rss";

  canHandle(municipality: MunicipalityLike): boolean {
    return municipality.crawlStrategy === "rss" || !!municipality.feedUrl;
  }

  async crawl(municipality: MunicipalityLike): Promise<CrawlResult> {
    const startedAt = Date.now();
    const errors: CrawlError[] = [];
    const links: DiscoveredLink[] = [];
    let pagesFetched = 0;

    const feedUrl = municipality.feedUrl ?? municipality.subsidyPageUrl ?? municipality.officialUrl;
    if (!feedUrl) {
      return {
        links: [],
        errors: [{ message: "feedUrl/subsidyPageUrl/officialUrl が未設定です。" }],
        metadata: { strategy: this.name, duration: Date.now() - startedAt, pagesFetched },
      };
    }

    try {
      const response = await limiter.run(feedUrl, () =>
        fetchWithRetry(feedUrl, {
          headers: { Accept: "application/rss+xml,application/atom+xml,application/xml,text/xml,*/*;q=0.8" },
        }),
      );
      pagesFetched += 1;

      if (!response.ok) {
        errors.push({
          message: `RSS取得失敗: HTTP ${response.status}`,
          url: feedUrl,
          code: String(response.status),
        });
      } else {
        const xml = await response.text();
        const $ = load(xml, { xmlMode: true });
        const seen = new Set<string>();

        const pushItem = (item: DiscoveredLink) => {
          if (seen.has(item.url)) return;
          seen.add(item.url);
          links.push(item);
        };

        $("item").each((_, node) => {
          const el = $(node);
          const title = el.find("title").first().text().replace(/\s+/g, " ").trim();
          const linkRaw = el.find("link").first().text().trim();
          const pubDateRaw = el.find("pubDate").first().text().trim();

          if (!title || !linkRaw) return;
          if (!includesAnyKeyword(title, INCLUDE_KEYWORDS)) return;
          if (includesAnyKeyword(title, EXCLUDE_KEYWORDS)) return;

          const url = resolveUrl(feedUrl, linkRaw);
          if (!url) return;

          pushItem({
            url,
            title,
            publishedAt: parseDate(pubDateRaw),
          });
        });

        $("entry").each((_, node) => {
          const el = $(node);
          const title = el.find("title").first().text().replace(/\s+/g, " ").trim();
          const href = el.find("link").first().attr("href") ?? "";
          const updated = el.find("updated").first().text().trim() || el.find("published").first().text().trim();

          if (!title || !href) return;
          if (!includesAnyKeyword(title, INCLUDE_KEYWORDS)) return;
          if (includesAnyKeyword(title, EXCLUDE_KEYWORDS)) return;

          const url = resolveUrl(feedUrl, href);
          if (!url) return;

          pushItem({
            url,
            title,
            publishedAt: parseDate(updated),
          });
        });
      }
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : "RSSクロールに失敗しました。",
        url: feedUrl,
      });
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
