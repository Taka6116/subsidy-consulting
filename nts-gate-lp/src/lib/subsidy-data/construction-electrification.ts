export type ConstructionElectrificationSubsidy = {
  id: string;
  badge: string;
  category: string;
  headline: string;
  headlineAccent: string;
  subheadline: string;
  benefits: Array<{ icon: "fuel" | "leaf" | "chart"; label: string }>;
  dates: {
    start: string;
    deadline: string;
    remainingDays: number;
    maxAmount: string;
  };
  targetChecklist: string[];
  targetIndustries: Array<{ label: string; desc: string }>;
  beforeAfter: {
    before: string[];
    after: string[];
  };
  caseStudies: Array<{
    industry: string;
    result: string;
    detail: string;
    amount: string;
  }>;
  flow: Array<{
    step: string;
    title: string;
    desc: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
    suffix?: string;
  }>;
};

export const constructionElectrificationSubsidy: ConstructionElectrificationSubsidy =
  {
    id: "construction-electrification-2025",
    badge: "令和7年度（補正）",
    category: "高用車等の電動化促進事業（建設機械）",
    headline: "建設機械の電動化で、",
    headlineAccent: "最大14.3億円の補助。",
    subheadline:
      "燃料費削減・脱炭素・生産性向上を、国の支援で加速させませんか？",
    benefits: [
      { icon: "fuel", label: "燃料コストを削減" },
      { icon: "leaf", label: "脱炭素・GXに貢献" },
      { icon: "chart", label: "設備更新で生産性UP" },
    ],
    dates: {
      start: "2025.05.20",
      deadline: "2027.01.29",
      remainingDays: 267,
      maxAmount: "最大14.3億円",
    },
    targetChecklist: [
      "建設機械を保有・使用している",
      "燃料コストを削減したい",
      "脱炭素・GXの取り組みを強化したい",
      "設備の更新・導入を検討している",
    ],
    targetIndustries: [
      { label: "建設業", desc: "建設機械の更新や電動化を検討している" },
      {
        label: "リース・レンタル業",
        desc: "電動建機の導入でサービス競争力を高めたい",
      },
      { label: "重機保有企業", desc: "燃料費の高騰に悩み、コスト削減したい" },
      {
        label: "脱炭素・GX推進企業",
        desc: "環境対応を進め、企業価値を高めたい",
      },
    ],
    beforeAfter: {
      before: [
        "燃料費が高騰し、利益を圧迫",
        "老朽化した建機で故障リスクが高い",
        "人手不足で作業効率が上がらない",
        "脱炭素への対応が遅れている",
      ],
      after: [
        "燃料費を大幅に削減",
        "最新機種で作業効率が向上",
        "人手不足を補い、生産性アップ",
        "脱炭素対応で企業価値が向上",
      ],
    },
    caseStudies: [
      {
        industry: "建設業（中型）",
        result: "燃料費を年間2,800万円削減",
        detail:
          "電動建機の導入により、燃料費を約20%削減。3年で投資回収を見込んでいます。",
        amount: "採択額 8,900万円",
      },
      {
        industry: "リース業",
        result: "新サービスで売上150%増",
        detail:
          "電動建機のレンタルを開始し、環境対応重視の新サービスを打ち出し、売上が大幅に拡大。",
        amount: "採択額 5,200万円",
      },
      {
        industry: "建設業（大手）",
        result: "CO2排出量を40%削減",
        detail:
          "脱炭素経営の一環で電動化を推進。企業・イメージ向上にもつながりました。",
        amount: "採択額 1.43億円",
      },
      {
        industry: "レンタル業",
        result: "メンテナンスコスト30%減",
        detail:
          "電動化によりメンテナンス頻度が減少し、コスト削減と稼働率向上を両立。",
        amount: "採択額 6,700万円",
      },
    ],
    flow: [
      {
        step: "01",
        title: "無料相談・診断",
        desc: "AIが貴社に最適な補助金を診断します",
      },
      {
        step: "02",
        title: "要件確認・提案",
        desc: "専門家が要件を確認し、採択戦略をご提案",
      },
      {
        step: "03",
        title: "申請サポート",
        desc: "書類作成から申請まで全面的にサポート",
      },
      {
        step: "04",
        title: "採択・交付決定",
        desc: "採択後の手続きもサポートします",
      },
      {
        step: "05",
        title: "実績報告・受給",
        desc: "受給まで伴走し、次の補助金もご提案",
      },
    ],
    stats: [
      { value: "266億円", label: "累計支援額", suffix: "突破" },
      { value: "1,788件", label: "採択支援実績", suffix: "以上" },
      { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
      { value: "96%", label: "利用企業満足度" },
    ],
  };
