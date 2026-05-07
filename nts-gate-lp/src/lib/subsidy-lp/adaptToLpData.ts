/**
 * 既存の buildSubsidyLpData() 出力（旧 SubsidyLpData）を
 * 新しい SubsidyLpData（SubsidyLpData in types.ts）へ変換するアダプター。
 *
 * /subsidies/lp/[id] の動的ページが construction-electrification と
 * 同じセクション構成を使えるようにするために使用する。
 */

import type { SubsidyLpData as NewLpData } from "@/lib/subsidy-data/types";
import type { SubsidyLpData as OldLpData } from "@/lib/subsidy-lp/buildSubsidyLpData";

const DEFAULT_FLOW = [
  { step: "01", title: "無料相談・診断", desc: "貴社に最適な補助金活用方針をヒアリングします" },
  { step: "02", title: "要件確認・提案", desc: "専門家が要件を確認し、採択戦略をご提案" },
  { step: "03", title: "申請サポート", desc: "書類作成から申請まで全面的にサポート" },
  { step: "04", title: "採択・交付決定", desc: "採択後の手続きもサポートします" },
  { step: "05", title: "実績報告・受給", desc: "受給まで伴走し、次の補助金もご提案" },
] as const;

const DEFAULT_STATS = [
  { value: "266億円", label: "累計支援額", suffix: "突破" },
  { value: "1,788件", label: "採択支援実績", suffix: "以上" },
  { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
  { value: "96%", label: "利用企業満足度" },
];

/**
 * 旧形式データから新形式の SubsidyLpData へ変換する。
 *
 * @param old - buildSubsidyLpData() の戻り値
 * @param grantName - DB の grant.name（補助金名）
 * @param targetIndustries - DB の grant.targetIndustries（対象業種一覧）
 */
export function adaptToLpData(
  old: OldLpData,
  grantName: string,
  targetIndustries: string[],
): NewLpData {
  // ---- before / after をデフォルト生成 --------------------------------
  const before = old.pains.length > 0
    ? old.pains.slice(0, 4)
    : [
        "補助金の情報収集に時間がかかっている",
        "申請要件が複雑で踏み出せない",
        "自社が対象かどうか分からない",
        "採択後の実施・報告が不安",
      ];

  const after = [
    "補助金の活用で自己負担を大幅に削減",
    "専門家のサポートで申請をスムーズに完了",
    "採択率を高める戦略設計でリスクを低減",
    "採択後も伴走支援で確実に受給まで到達",
  ];

  // ---- 対象業種カードを生成 -------------------------------------------
  const defaultIndustries = [
    { label: "中小企業", desc: "経営課題の解決・設備投資に活用したい" },
    { label: "小規模事業者", desc: "事業拡大・販路開拓を検討している" },
    { label: "スタートアップ", desc: "新事業・製品開発の資金調達に活用したい" },
    { label: "製造業", desc: "設備更新・生産性向上を補助金で実現したい" },
  ];

  const resolvedIndustries =
    targetIndustries.length > 0
      ? targetIndustries.slice(0, 4).map((label) => ({
          label,
          desc: `${label}での補助金活用を検討している`,
        }))
      : defaultIndustries;

  // ---- チェックリストを pains から派生 ---------------------------------
  const targetChecklist = before.map((pain) =>
    pain.endsWith("。") ? pain.slice(0, -1) : pain,
  );

  // ---- 活用事例カードを useCases から派生 ------------------------------
  const caseStudies = old.useCases.slice(0, 4).map((uc) => ({
    industry: uc.persona ?? uc.label.replace(/【活用例】/g, "").slice(0, 8),
    result: uc.label.replace(/【活用例】/g, ""),
    detail: uc.body,
    amount: old.amountLabel !== "要確認" ? `補助上限 ${old.amountLabel.replace("最大 ", "")}` : "補助額は公募要領を確認",
  }));

  // 4件に満たない場合は汎用カードを補完
  while (caseStudies.length < 4) {
    caseStudies.push({
      industry: "中小企業",
      result: "補助金活用で経営課題を解決",
      detail: "補助金を活用し、自己負担を抑えながら設備投資・業務改善・競争力強化を実現しました。",
      amount: old.amountLabel !== "要確認" ? `補助上限 ${old.amountLabel.replace("最大 ", "")}` : "補助額は公募要領を確認",
    });
  }

  return {
    id: old.id,
    badge: old.institutionName !== "所管省庁・機関" ? old.institutionName : "補助金制度",
    category: grantName,
    headline: old.heroCopy.length <= 24 ? old.heroCopy : `${grantName}を、`,
    headlineAccent:
      old.amountLabel !== "要確認"
        ? `${old.amountLabel}の補助で実現。`
        : "補助金で実現しませんか。",
    subheadline: old.subCopy,
    benefits: [
      { icon: "chart", label: "経営課題を解決" },
      { icon: "shield", label: "採択率を高めるサポート" },
      { icon: "users", label: "全国対応" },
    ],
    dates: {
      start: old.acceptanceStart !== "要確認" ? old.acceptanceStart : "公募中",
      deadline:
        old.deadlineLabel !== "要確認" ? old.deadlineLabel : "要確認（公募要領参照）",
      remainingDays: old.remainingDays ?? 0,
      maxAmount: old.amountLabel,
    },
    targetChecklist,
    targetIndustries: resolvedIndustries,
    beforeAfter: { before, after },
    caseStudies,
    flow: [...DEFAULT_FLOW],
    stats: DEFAULT_STATS,
  };
}
