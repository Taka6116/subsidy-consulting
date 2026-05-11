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
 * 設備・人材・建設・事業計画・DX・運送など、暗いDXに偏らないように混ぜる
 */
export function getHeroMosaicImages(): ImageEntry[] {
  return [
    ARTICLE_IMAGES.設備[0],
    LP_IMAGES.建設[0],
    LP_IMAGES.人材[0],
    LP_IMAGES.IT[0],
    ARTICLE_IMAGES.事業計画[0],
    LP_IMAGES.運送[0],
  ];
}

// =============================================================
// 用途・目的マッピング（カテゴリ → ユーザー向けの分かりやすい言葉）
// =============================================================

/** カードに表示する「目的・用途」ラベル */
export const CATEGORY_PURPOSE: Record<LpCategory, string> = {
  DX: "IT導入・DX",
  IT: "IT導入・DX",
  人材: "人材確保・賃上げ",
  建設: "建設・施工",
  運送: "物流・運送",
  設備: "設備投資",
  事業計画: "事業計画・新規事業",
  その他: "補助金活用",
};

/** カードに表示する「対象企業/用途」の1行説明 */
export const CATEGORY_TARGET_LINE: Record<LpCategory, string> = {
  DX: "ITツール導入・DXで業務効率化を進めたい企業向け",
  IT: "ITツール導入・クラウド活用を検討する企業向け",
  人材: "採用・賃上げ・人材定着に取り組む中小企業向け",
  建設: "建設機械の更新・電動化を検討する企業向け",
  運送: "物流効率化・ドライバー不足対策を進める企業向け",
  設備: "老朽設備の更新・省力化投資を検討する企業向け",
  事業計画: "新規事業・事業再構築を検討する企業向け",
  その他: "投資判断に補助金を活用したい中小企業向け",
};

/** カードに表示する「このLPで分かること」3点 */
export const CATEGORY_LEARN_POINTS: Record<LpCategory, string[]> = {
  DX: ["対象になる業務領域", "補助対象経費の範囲", "申請前の注意点"],
  IT: ["対象になる業務領域", "補助対象経費の範囲", "申請前の注意点"],
  人材: ["対象になる取り組み", "補助対象となる人件費", "申請前の注意点"],
  建設: ["対象になる建設機械", "補助対象経費の範囲", "申請前の注意点"],
  運送: ["対象になる事業者", "補助対象経費の範囲", "申請前の注意点"],
  設備: ["対象になる設備投資", "補助対象経費の範囲", "申請前の注意点"],
  事業計画: ["対象になる事業", "補助対象経費の範囲", "申請前の注意点"],
  その他: ["対象になる企業", "補助対象経費の範囲", "申請前の注意点"],
};

// =============================================================
// 検索フィルター用：目的・業種・金額の判定
// =============================================================

export type PurposeKey =
  | "equipment" // 設備投資
  | "it_dx" // IT導入・DX
  | "labor_saving" // 省力化
  | "hr" // 人材確保
  | "wage" // 賃上げ
  | "new_business" // 新規事業
  | "logistics"; // 物流・運送

export const PURPOSE_LABELS: Record<PurposeKey, string> = {
  equipment: "設備投資",
  it_dx: "IT導入・DX",
  labor_saving: "省力化",
  hr: "人材確保",
  wage: "賃上げ",
  new_business: "新規事業",
  logistics: "物流・運送",
};

/** name/description/category から、その制度が該当する目的キーを推定（複数可） */
export function detectPurposes(opts: {
  name: string | null;
  copy?: string | null;
  category?: LpCategory;
}): PurposeKey[] {
  const text = `${opts.name ?? ""} ${opts.copy ?? ""}`.toLowerCase();
  const set = new Set<PurposeKey>();

  if (/設備|機械|プラント|工場|生産|更新|老朽|ライン/.test(text)) set.add("equipment");
  if (/it|dx|デジタル|クラウド|ai|ict|システム|ソフトウェア|saas|erp/.test(text))
    set.add("it_dx");
  if (/省力|自動化|省人|効率化|生産性/.test(text)) set.add("labor_saving");
  if (/人材|採用|研修|雇用|求人|定着|人手不足/.test(text)) set.add("hr");
  if (/賃上げ|処遇改善|給与|給料|時給/.test(text)) set.add("wage");
  if (/新規事業|事業再構築|再構築|新事業|ものづくり|販路|商業.*サービス/.test(text))
    set.add("new_business");
  if (/物流|運送|配送|ドライバー|トラック|貨物|運輸|wms/.test(text)) set.add("logistics");

  // カテゴリからのフォールバック
  if (set.size === 0 && opts.category) {
    if (opts.category === "DX" || opts.category === "IT") set.add("it_dx");
    else if (opts.category === "設備") set.add("equipment");
    else if (opts.category === "人材") set.add("hr");
    else if (opts.category === "建設") set.add("equipment");
    else if (opts.category === "運送") set.add("logistics");
    else if (opts.category === "事業計画") set.add("new_business");
  }

  return Array.from(set);
}

export type IndustryKey = "construction" | "manufacturing" | "logistics" | "it" | "retail_service";

export const INDUSTRY_LABELS: Record<IndustryKey, string> = {
  construction: "建設",
  manufacturing: "製造",
  logistics: "物流",
  it: "IT",
  retail_service: "小売・サービス",
};

/** 制度の対象業種を推定 */
export function detectIndustries(opts: {
  name: string | null;
  copy?: string | null;
  targetIndustries?: string[];
  category?: LpCategory;
}): IndustryKey[] {
  const text = `${opts.name ?? ""} ${opts.copy ?? ""} ${(opts.targetIndustries ?? []).join(" ")}`
    .toLowerCase();
  const set = new Set<IndustryKey>();

  if (/建設|施工|土木|建機|建築/.test(text)) set.add("construction");
  if (/製造|工場|プラント|ものづくり|加工/.test(text)) set.add("manufacturing");
  if (/物流|運送|配送|ドライバー|トラック|貨物|運輸/.test(text)) set.add("logistics");
  if (/it|dx|デジタル|クラウド|ai|システム|ソフトウェア|saas/.test(text)) set.add("it");
  if (/小売|サービス|飲食|宿泊|店舗|商業/.test(text)) set.add("retail_service");

  return Array.from(set);
}

export type AmountBucket = "lt300" | "gte1000" | "gte10000";

export const AMOUNT_LABELS: Record<AmountBucket, string> = {
  lt300: "300万円以下",
  gte1000: "1,000万円以上",
  gte10000: "1億円以上",
};

/**
 * 補助上限金額（円）をラベル文字列または数値文字列からパース
 * 例: "最大14.3億円" → 1_430_000_000、"最大300万円" → 3_000_000
 */
export function parseAmountYen(input: {
  maxAmountLabel?: string | null;
  subsidyAmount?: string | null;
}): number | null {
  const raw = input.maxAmountLabel?.trim() ?? "";

  // 「最大1,430,000,000円」「1,000,000円」など円表記
  const yenMatch = raw.match(/([0-9,]+)\s*円/);
  if (yenMatch) {
    const n = Number(yenMatch[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }

  // 「最大14.3億円」「2億円」
  const okuMatch = raw.match(/([0-9.]+)\s*億/);
  if (okuMatch) {
    const n = Number(okuMatch[1]);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 100_000_000);
  }

  // 「最大4,000万円」「300万円」
  const manMatch = raw.match(/([0-9,]+)\s*万/);
  if (manMatch) {
    const n = Number(manMatch[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n * 10_000;
  }

  // subsidyAmount が数値文字列で渡ってきた場合
  if (input.subsidyAmount) {
    const n = Number(input.subsidyAmount);
    if (Number.isFinite(n) && n > 0) return n;
  }

  return null;
}

/** 円金額を金額バケットに分類 */
export function classifyAmountBucket(yen: number | null): AmountBucket | null {
  if (yen === null) return null;
  if (yen >= 100_000_000) return "gte10000";
  if (yen >= 10_000_000) return "gte1000";
  if (yen <= 3_000_000) return "lt300";
  return null;
}
