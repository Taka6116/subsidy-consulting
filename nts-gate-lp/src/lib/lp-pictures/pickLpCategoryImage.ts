/**
 * 補助金LP一覧ページ用のカテゴリ画像ピッカー
 *
 * LP_pictures/{カテゴリ}/{ファイル} を /api/lp-pictures/{カテゴリ}/{ファイル} で配信
 * article_pictures/{カテゴリ}/{ファイル} を /api/article-pictures/{カテゴリ}/{ファイル} で配信
 */

type ImageEntry = {
  /** /api/lp-pictures/... または /api/article-pictures/... */
  url: string;
  alt: string;
};

// LP_pictures内の画像インデックス
const LP_IMAGES: Record<string, ImageEntry[]> = {
  DX: [
    { url: "/api/lp-pictures/DX/DXLP.webp", alt: "DX・デジタル化" },
    { url: "/api/lp-pictures/DX/DXLP2.webp", alt: "DX推進" },
  ],
  IT: [
    { url: "/api/lp-pictures/IT/ITLP2.webp", alt: "ITツール導入" },
    { url: "/api/lp-pictures/IT/ITLP3.webp", alt: "IT活用" },
    { url: "/api/lp-pictures/IT/ITLP4.webp", alt: "IT支援" },
  ],
  人材: [
    { url: "/api/lp-pictures/%E4%BA%BA%E6%9D%90/%E4%BA%BA%E6%9D%90LP2.webp", alt: "人材確保・採用" },
    { url: "/api/lp-pictures/%E4%BA%BA%E6%9D%90/%E4%BA%BA%E6%9D%90LP3.webp", alt: "人材育成" },
  ],
  建設: [
    { url: "/api/lp-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%ADLP2.webp", alt: "建設・施工" },
    { url: "/api/lp-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%ADLP3.webp", alt: "建設業" },
    { url: "/api/lp-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%ADLP4.webp", alt: "建設機械" },
  ],
  運送: [
    { url: "/api/lp-pictures/%E9%81%8B%E9%80%81/%E9%81%8B%E9%80%81LP2.webp", alt: "物流・運送" },
    { url: "/api/lp-pictures/%E9%81%8B%E9%80%81/%E9%81%8B%E9%80%81LP3.webp", alt: "配送業" },
    { url: "/api/lp-pictures/%E9%81%8B%E9%80%81/%E9%81%8B%E9%80%81LP4.webp", alt: "運送サービス" },
  ],
};

// article_pictures内の補助的な画像インデックス
const ARTICLE_IMAGES: Record<string, ImageEntry[]> = {
  事業計画: [
    {
      url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-corporate-people-working-concept.webp",
      alt: "事業計画",
    },
    {
      url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-meeting-conference-concept.webp",
      alt: "事業戦略",
    },
  ],
  設備: [
    {
      url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/factory-workshop-interior-machines-glass-production-background.webp",
      alt: "設備投資",
    },
    {
      url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/plant-picture-clean-room-equipment-stainless-steel-machines.webp",
      alt: "生産設備",
    },
  ],
};

export type LpCategory =
  | "DX"
  | "IT"
  | "人材"
  | "建設"
  | "運送"
  | "事業計画"
  | "設備"
  | "その他";

/**
 * 制度名・説明文・業種タグからカテゴリを推定する
 */
export function detectLpCategory(opts: {
  name: string | null;
  copy?: string | null;
  targetIndustries?: string[];
}): LpCategory {
  const text = [opts.name ?? "", opts.copy ?? "", ...(opts.targetIndustries ?? [])].join(" ").toLowerCase();

  if (/dx|デジタル|クラウド|ai|人工知能|デジ|ict/.test(text)) return "DX";
  if (/it[^a-z]|itツール|it導入|システム|ソフトウェア|saas|erp/.test(text)) return "IT";
  if (/運送|物流|配送|ドライバー|トラック|貨物|運輸|フォワーダー/.test(text)) return "運送";
  if (/建設|施工|土木|建機|建物|建築|リフォーム|電動化|設備工事/.test(text)) return "建設";
  if (/人材|採用|賃上げ|研修|求人|雇用|労働|従業員|社員|人手不足/.test(text)) return "人材";
  if (/設備|機械|省力|自動化|ライン|生産性|製造|工場|プラント/.test(text)) return "設備";
  if (/事業計画|再構築|新規事業|販路|ものづくり|商業|サービス補助/.test(text)) return "事業計画";

  return "その他";
}

/**
 * カテゴリと決定論的インデックスから画像URLを選ぶ
 * seed には grant.id の末尾数文字など一意な値を渡す
 */
export function pickLpImage(category: LpCategory, seed: string): ImageEntry {
  const pool = getLpImagePool(category);
  const idx = pickIndex(seed, pool.length);
  return pool[idx];
}

function getLpImagePool(category: LpCategory): ImageEntry[] {
  switch (category) {
    case "DX":
      return LP_IMAGES.DX;
    case "IT":
      return LP_IMAGES.IT;
    case "人材":
      return LP_IMAGES.人材;
    case "建設":
      return LP_IMAGES.建設;
    case "運送":
      return LP_IMAGES.運送;
    case "事業計画":
      return ARTICLE_IMAGES.事業計画;
    case "設備":
      return ARTICLE_IMAGES.設備;
    default:
      // その他はDX・IT・人材・設備のプールから選択
      return [
        LP_IMAGES.DX[0],
        LP_IMAGES.IT[0],
        LP_IMAGES.人材[0],
        ARTICLE_IMAGES.設備[0],
      ];
  }
}

/** seed から決定論的に配列インデックスを返す */
function pickIndex(seed: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

/**
 * ヒーローセクション用の複数カテゴリモザイク画像を返す
 * 5カテゴリ × 1枚ずつ
 */
export function getHeroMosaicImages(): ImageEntry[] {
  return [
    LP_IMAGES.建設[0],
    LP_IMAGES.DX[0],
    LP_IMAGES.IT[0],
    LP_IMAGES.運送[0],
    LP_IMAGES.人材[0],
  ];
}
