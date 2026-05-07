export type CrawlError = {
  message: string;
  url?: string;
  code?: string;
};

export type CrawlMetadata = {
  strategy: string;
  duration: number;
  pagesFetched: number;
};

export type DiscoveredLink = {
  url: string;
  title: string;
  publishedAt?: Date;
  rawHtml?: string;
};

export type CrawlResult = {
  links: DiscoveredLink[];
  errors: CrawlError[];
  metadata: CrawlMetadata;
};

/**
 * Prisma型に直接依存しないことで、crawler基盤を単体テストしやすくする。
 * DB層からは同名フィールドを持つオブジェクトを渡す。
 */
export type MunicipalityLike = {
  id: string;
  code: string;
  name: string;
  officialUrl: string | null;
  subsidyPageUrl: string | null;
  feedUrl: string | null;
  crawlStrategy: string;
  crawlConfig: unknown;
};

export interface CrawlStrategy {
  name: string;
  canHandle(municipality: MunicipalityLike): boolean;
  crawl(municipality: MunicipalityLike): Promise<CrawlResult>;
}
