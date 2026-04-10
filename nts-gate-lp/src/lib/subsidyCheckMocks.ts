/** スプリント2: 法人検索・マッチング結果のモック（タイムアウト時フォールバック等で利用） */

import type { SubsidyInsightCard } from "@/lib/ai/bedrockSubsidyMatch";
import type { CorporateCandidate } from "@/types/corporateSearch";

export type { CorporateCandidate };

/** /api/subsidy/match の Bedrock マージ後フィールド */
export type SubsidyMatchDecision = {
  matchScore: number;
  summary: string;
  matchReason: string[];
  riskFlags: string[];
  insightCards?: SubsidyInsightCard[];
};

export type MatchedSubsidyPreview = {
  id: string;
  name: string;
  maxAmountLabel: string;
  deadlineLabel: string;
  /** jGrants 等からの事実ベースの抜粋 */
  summary: string;
  /** 一覧・詳細の本文（表示は description ?? summary） */
  description?: string;
  decision?: SubsidyMatchDecision;
  targetIndustries?: string[];
  /** jGrants 追加フィールド */
  subsidyRate?: string;
  targetArea?: string;
  institutionName?: string;
  detailUrl?: string;
};

export function mockSearchCorporates(companyName: string): CorporateCandidate[] {
  const trimmed = companyName.trim();
  const suffix = trimmed || "サンプル";

  return [
    {
      corporateNumber: "1010001000000",
      name: `${suffix}株式会社（本店）`,
      prefecture: "東京都",
      city: "千代田区",
    },
    {
      corporateNumber: "2020002000000",
      name: `${suffix}ホールディングス`,
      prefecture: "大阪府",
      city: "大阪市北区",
    },
    {
      corporateNumber: "3030003000000",
      name: `株式会社${suffix}エンジニアリング`,
      prefecture: "愛知県",
      city: "名古屋市中区",
    },
  ];
}

export function mockMatchedSubsidies(_industryId: string): MatchedSubsidyPreview[] {
  void _industryId;
  return [
    {
      id: "mock-it",
      name: "IT導入補助金",
      maxAmountLabel: "最大450万円（例）",
      deadlineLabel: "公募ごとに異なります（要確認）",
      summary: "ITツール・SaaS導入など業務効率化・DX投資が対象になり得る制度です。",
      decision: {
        matchScore: 78,
        summary: "IT・業務効率化投資の支援制度として照合候補に挙がりやすい典型例です。",
        matchReason: ["業種がIT関連施策の対象領域と重なる可能性", "導入費用の補助という目的が明確"],
        riskFlags: [],
        insightCards: [
          {
            title: "活用のイメージ",
            body: "業務用のITツールやSaaSの導入費用が補助の対象になり得る制度です。自社の投資計画と公募要領の対象範囲を照合してください。",
          },
          {
            title: "確認したい条件",
            body: "対象業種・従業員規模・補助率は公募ごとに異なります。最新の要領と申請窓口で要確認です。",
          },
        ],
      },
    },
    {
      id: "mock-labor",
      name: "省力化投資補助金（例）",
      maxAmountLabel: "上限は公募要領で確認",
      deadlineLabel: "随時更新",
      summary: "ロボット・IoT等の省力化設備投資を支援する制度のイメージです。",
    },
    {
      id: "mock-succession",
      name: "事業承継・引継ぎ補助金（例）",
      maxAmountLabel: "上限は公募要領で確認",
      deadlineLabel: "随時更新",
      summary: "承継に伴う設備投資や専門家活用などが対象になり得る制度のイメージです。",
    },
  ];
}
