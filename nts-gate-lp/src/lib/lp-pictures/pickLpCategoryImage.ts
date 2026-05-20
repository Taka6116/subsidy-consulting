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

// article_pictures内の全画像インデックス（カテゴリ別）
const ARTICLE_IMAGES: Record<string, ImageEntry[]> = {
  DX_IT: [
    { url: "/api/article-pictures/DX%E3%83%BBIT/businessman-with-digital-interface-data-growth.webp", alt: "デジタルデータ活用" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/business-restructuring-transition-structure-company-digital-transformation-technology-strategy-digitization-digitalization-business-product-process-production-innovation.webp", alt: "DXトランスフォーメーション" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/call-center-worker-using-ai-tech-laptop-reply-customers-closeup.webp", alt: "AIツール活用" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/close-up-office-desktop-with-laptop-computer-glowing-blurry-ai-hologram-with-binary-coding-blurry-background-artificial-intelligence-technology-programming-concept-double-exposure.webp", alt: "AI・プログラミング" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/creative-digital-marketing-concept-featuring-colorful-visuals-modern-technology-effective-online-advertising-campaigns.webp", alt: "デジタルマーケティング" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/digital-assets-business-management-system-concept.webp", alt: "デジタル資産管理" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/DX%E3%83%BBIT3.webp", alt: "DX・IT活用" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/DX%E3%83%BBIT%E7%B3%BB2.webp", alt: "DX推進" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/wooden-blocks-with-dx-text-concept-pen-sketchbook-cup.webp", alt: "DXコンセプト" },
    { url: "/api/article-pictures/DX%E3%83%BBIT/asia-businesswoman-entrepreneur-wearing-face-mask-social-distancing-new-normal-situation-virus-prevention-while-using-laptop-phone-back-work-office.webp", alt: "テレワーク・DX" },
  ],
  事業計画: [
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-corporate-people-working-concept.webp", alt: "事業計画" },
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-meeting-conference-concept.webp", alt: "事業戦略会議" },
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/business-share-planing-strategy-brainstroming-concept.webp", alt: "事業計画立案" },
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/hr-managers-interviewing-job-applicant.webp", alt: "経営面談" },
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/two-cropped-startuppers-developing-business-plan.webp", alt: "スタートアップ事業計画" },
    { url: "/api/article-pictures/%E4%BA%8B%E6%A5%AD%E8%A8%88%E7%94%BB/working-process-startup-businessman-working-wood-table-with-new-finance-project-modern-notebook-table-pen-holding-hand.webp", alt: "新規事業プロジェクト" },
  ],
  人材: [
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/business-job-interview-concept.webp", alt: "採用面接" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/business-team-discussing-report-digital-tablet.webp", alt: "チームミーティング" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/business-teamwork-meeting-discuss.webp", alt: "人材育成" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/handshake-close-up-executives.webp", alt: "採用契約" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/hr-human-resources-recruitment-organisation-structure-social-network-concept.webp", alt: "HR・組織構築" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/male-candidate-interviewed-by-diverse-hr-team.webp", alt: "多様な採用チーム" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/nice-meet-you.webp", alt: "人材マッチング" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/portrait-asian-businesswoman-presenting-her-plan-meeting.webp", alt: "プレゼンテーション" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/recruitment-wallpaper-conference-presentation.webp", alt: "採用プレゼン" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/unrecognizable-man-woman-business-suits-looking-laptop-screen-together.webp", alt: "協業・人材連携" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/workers-talking.webp", alt: "職場コミュニケーション" },
    { url: "/api/article-pictures/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A8/%E4%BA%BA%E6%9D%90%E3%83%BB%E6%8E%A1%E7%94%A82.webp", alt: "人材・採用支援" },
  ],
  建設: [
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/construction-silhouette.webp", alt: "建設シルエット" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/construction-site-working-japan.webp", alt: "建設現場" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/construction-worker-engineer-working-together-construction-site.webp", alt: "建設エンジニア" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/engineers-analyzing-data-digital-tablet.webp", alt: "建設データ分析" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/singapore-nobody-urban-modern-high.webp", alt: "都市建設" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/working-construction-site.webp", alt: "施工現場" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/young-asian-engineers-teamwork-site-inspector-discuss-together-using-notebook-computer-paper-blueprint-building-construction-sitehome-renovation-ideas-concept.webp", alt: "現場チームワーク" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%AD%E7%B3%BB2.webp", alt: "建設業務" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%AD%E7%B3%BB3.webp", alt: "建設プロジェクト" },
    { url: "/api/article-pictures/%E5%BB%BA%E8%A8%AD/%E5%BB%BA%E8%A8%AD%E7%B3%BB4.webp", alt: "建設施工" },
  ],
  設備: [
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/factory-workshop-interior-machines-glass-production-background.webp", alt: "工場設備" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/plant-picture-clean-room-equipment-stainless-steel-machines.webp", alt: "生産設備" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/display-empty-photovoltaics-factory-monitoring-system-performance.webp", alt: "省エネ設備監視" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/empty-high-end-office-workspace-with-advanced-technology-enhance-efficiency.webp", alt: "先進設備" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/investors-examine-solar-panel-surface-using-tablet-discussing-design-efficiency.webp", alt: "省エネ投資" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/monitor-green-energy-solar-panels-plant-with-software-used-optimize-layouts.webp", alt: "グリーンエネルギー設備" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/production-line-printed-circuit-board-manufacturing-mounted-workshop.webp", alt: "製造ライン" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/steel-pipelines-cables-plant.webp", alt: "プラント設備" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/technologist-with-grey-tablet-his-hands-make-set-up-production-line-while-standing-department-dairy-factory.webp", alt: "生産ライン設備調整" },
    { url: "/api/article-pictures/%E8%A8%AD%E5%82%99%E3%83%BB%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87/%E8%A8%AD%E5%82%99%E6%8A%95%E8%B3%87%E7%B3%BB2.webp", alt: "設備投資" },
  ],
  運送: [
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/asian-delivery-man-delivery-men-unloading-cardboard-boxes-from-truck.webp", alt: "トラック荷降ろし" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/asian-delivery-man-work-truck-checking-product-truck-concept-ecommerce.webp", alt: "配送チェック" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/close-up-hands-carrying-box.webp", alt: "荷物配送" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/courier-doing-jobs-logistics.webp", alt: "物流業務" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/delivery-man-smiling-holding-cardboard-box.webp", alt: "宅配サービス" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/delivery-service-send-customer-receiving-package.webp", alt: "配送サービス" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/entrepreneurs-small-business-sme-independent-men-work-home-use-smartphones-laptops-commercial-checking-online-marketing-packing-boxes-sme-sellers-concept-ecommerce-team-online-sales.webp", alt: "EC物流" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/midsection-woman-receiving-boxes-from-delivery-man.webp", alt: "受取配送" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/%E9%81%8B%E9%80%81%E7%B3%BB.webp", alt: "運送業" },
    { url: "/api/article-pictures/%E9%81%8B%E9%80%81/%E9%81%8B%E9%80%81%E7%B3%BB2.webp", alt: "運送サービス" },
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
      return [...LP_IMAGES.DX, ...ARTICLE_IMAGES.DX_IT];
    case "IT":
      return [...LP_IMAGES.IT, ...ARTICLE_IMAGES.DX_IT];
    case "人材":
      return [...LP_IMAGES.人材, ...ARTICLE_IMAGES.人材];
    case "建設":
      return [...LP_IMAGES.建設, ...ARTICLE_IMAGES.建設];
    case "運送":
      return [...LP_IMAGES.運送, ...ARTICLE_IMAGES.運送];
    case "事業計画":
      return ARTICLE_IMAGES.事業計画;
    case "設備":
      return ARTICLE_IMAGES.設備;
    default:
      // その他は全カテゴリからバランスよく選択
      return [
        LP_IMAGES.DX[0],
        LP_IMAGES.IT[0],
        LP_IMAGES.人材[0],
        ARTICLE_IMAGES.設備[0],
        ARTICLE_IMAGES.DX_IT[2],
        ARTICLE_IMAGES.事業計画[0],
        ARTICLE_IMAGES.建設[0],
        ARTICLE_IMAGES.運送[0],
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

/** FV右カラムの目的カード → 一覧フィルターへの連動 */
export type HeroFilterAction =
  | { type: "purpose"; key: PurposeKey }
  | { type: "industry"; key: IndustryKey };

export const HERO_CARD_FILTERS: Record<string, HeroFilterAction> = {
  設備投資: { type: "purpose", key: "equipment" },
  "IT導入・DX": { type: "purpose", key: "it_dx" },
  人材確保: { type: "purpose", key: "hr" },
  "物流・運送": { type: "purpose", key: "logistics" },
  "建設・施工": { type: "industry", key: "construction" },
  省エネ: { type: "purpose", key: "labor_saving" },
  事業計画: { type: "purpose", key: "new_business" },
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
