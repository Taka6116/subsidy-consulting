import type { CrawlResult, CrawlStrategy, MunicipalityLike } from "./strategies/base";
import { HtmlListStrategy } from "./strategies/html-list-strategy";
import { RssStrategy } from "./strategies/rss-strategy";

const defaultStrategies: CrawlStrategy[] = [new RssStrategy(), new HtmlListStrategy()];

export function getDefaultCrawlerStrategies(): CrawlStrategy[] {
  return defaultStrategies;
}

export async function crawlMunicipality(
  municipality: MunicipalityLike,
  strategies: CrawlStrategy[] = defaultStrategies,
): Promise<CrawlResult> {
  const strategy = strategies.find((s) => s.canHandle(municipality));
  if (!strategy) {
    return {
      links: [],
      errors: [{ message: `対応するクロール戦略がありません: ${municipality.crawlStrategy}` }],
      metadata: { strategy: "none", duration: 0, pagesFetched: 0 },
    };
  }
  return strategy.crawl(municipality);
}

export * from "./strategies/base";
export * from "./strategies/html-list-strategy";
export * from "./strategies/rss-strategy";
export * from "./utils/fetch-with-retry";
export * from "./utils/rate-limiter";
export * from "./utils/charset-detector";
