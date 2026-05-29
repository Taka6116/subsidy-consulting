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
    keywords: ["ものづくり", "ものづくり補助金"],
    fallbackTitleKeywords: ["ものづくり補助金", "ものづくり"],
  },
  "dx-support": {
    keywords: ["デジタル技術導入", "DX支援", "IT導入"],
    fallbackTitleKeywords: ["DX", "デジタル", "IT導入"],
  },
  "construction-electrification": {
    keywords: ["電動化促進", "建設機械", "高用車", "商用車"],
    fallbackTitleKeywords: ["電動化", "建設機械補助金"],
  },
  "wage-support": {
    keywords: ["賃上げ", "最低賃金", "賃金引上げ"],
    fallbackTitleKeywords: ["賃上げ補助金", "賃上げ"],
  },
  "equipment-investment": {
    keywords: ["設備投資", "省力化", "老朽設備"],
    fallbackTitleKeywords: ["設備投資補助金", "省力化"],
  },
  "equipment-productivity": {
    keywords: ["設備投資", "生産性向上", "設備更新"],
    fallbackTitleKeywords: ["生産性向上補助金", "設備投資", "生産性向上"],
  },
  "human-resources": {
    keywords: ["人材確保", "人手不足", "雇用", "人材育成"],
    fallbackTitleKeywords: ["人材補助金", "人手不足", "人材確保"],
  },
  "logistics-support": {
    keywords: ["物流", "運送", "輸送"],
    fallbackTitleKeywords: ["物流補助金", "物流効率化"],
  },
};
