/**
 * 静的LP slugごとの「関連記事検索キーワード」マッピング。
 *
 * ArticleRelatedSection が lpSlug prop を受け取ったとき、
 * ここのキーワード配列を使って GeneratedContent.grant.name の OR 検索を行う。
 *
 * 追加・変更方法:
 *   - slug は src/app/subsidies/ 直下のフォルダ名と一致させること
 *   - keywords は DB 上の SubsidyGrant.name に含まれる文字列（部分一致）を指定する
 *   - 短すぎるキーワードは無関係な補助金までヒットするため、2〜5文字以上推奨
 *   - fallbackTitleKeywords は grant.name 検索でも0件のとき記事タイトルを検索するキーワード
 */
export type LpArticleKeywordEntry = {
  /** SubsidyGrant.name に対する部分一致キーワード（OR 条件） */
  keywords: string[];
  /** grant.name ヒット0件時のタイトルフォールバック用キーワード（OR 条件） */
  fallbackTitleKeywords?: string[];
};

export const LP_ARTICLE_KEYWORDS: Record<string, LpArticleKeywordEntry> = {
  "monodukuri-business": {
    keywords: ["ものづくり", "ものづくり補助金", "生産性向上", "設備投資", "製造業"],
    fallbackTitleKeywords: ["ものづくり", "ものづくり補助金", "生産性向上", "製造業"],
  },
  "dx-support": {
    keywords: ["DX", "デジタル化", "IT導入", "デジタル技術導入", "業務効率化"],
    fallbackTitleKeywords: ["DX", "デジタル化", "IT導入", "デジタル技術", "業務効率化"],
  },
  "construction-electrification": {
    keywords: ["電動化", "建設機械", "GX", "省エネ", "脱炭素"],
    fallbackTitleKeywords: ["電動化", "建設機械", "GX補助金", "省エネ", "脱炭素"],
  },
  "wage-support": {
    keywords: ["賃上げ", "人手不足", "職場環境", "省力化", "人材確保"],
    fallbackTitleKeywords: ["賃上げ", "人手不足", "職場環境整備", "省力化", "人材確保"],
  },
  "equipment-investment": {
    keywords: ["設備投資", "設備更新", "生産性向上", "省力化"],
    fallbackTitleKeywords: ["設備投資", "設備更新", "生産性向上", "省力化"],
  },
  "equipment-productivity": {
    keywords: ["設備投資", "生産性向上", "設備更新"],
    fallbackTitleKeywords: ["設備投資", "生産性向上", "設備更新"],
  },
  "human-resources": {
    keywords: ["人材", "人手不足", "賃上げ", "採用", "定着", "職場環境"],
    fallbackTitleKeywords: ["人材", "人手不足", "賃上げ", "採用支援", "定着", "職場環境"],
  },
  "logistics-support": {
    keywords: ["物流", "配送", "倉庫", "2024年問題", "省力化"],
    fallbackTitleKeywords: ["物流", "配送", "倉庫", "2024年問題", "省力化"],
  },
};
