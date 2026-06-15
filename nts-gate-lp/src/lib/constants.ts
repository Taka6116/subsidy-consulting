/** 共通CTA文言 */
export const CTA = {
  /** ヘッダー・主要CTAボタン */
  PRIMARY: "無料相談を予約する",
  /** ヒーローセクション等のテキストリンク */
  SECONDARY: "無料相談する",
  /** 補助金詳細ページのインラインCTA */
  INLINE: "この補助金について相談する",
  /** フッターCTA */
  FOOTER: "無料相談を予約する →",
} as const;

/** 共通リンク先 */
export const ROUTES = {
  CONSULT: "/consult",
  SUBSIDY_TOP: "/subsidies",
  SUBSIDY_LIST: "/subsidies/list",
  SUBSIDY_ARTICLES: "/subsidies/articles",
  SUBSIDY_LP: "/subsidies/lp",
  SUBSIDY_VIDEOS: "/subsidies/videos",
  CHECK: "/check",
  PARTNER: "/partner",
} as const;
