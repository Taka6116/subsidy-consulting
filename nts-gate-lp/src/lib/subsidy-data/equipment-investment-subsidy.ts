import type { SubsidyLpData } from "./types";

export const equipmentInvestmentSubsidy: SubsidyLpData = {
  id: "7568bddb-d453-47d9-9dd3-a7f17644a908",
  badge: "令和8年度",
  category: "設備投資・生産性向上",
  headline: "老朽設備の更新・省力化投資に、",
  headlineAccent: "最大2億円の補助。",
  subheadline:
    "設備の老朽化・人手不足・コスト高騰を、国の設備投資補助金で一気に解決しませんか？",
  benefits: [
    { icon: "settings", label: "設備更新・導入" },
    { icon: "trending-up", label: "生産性向上" },
    { icon: "users", label: "省力化・自動化" },
  ],
  dates: {
    start: "公募中",
    deadline: "2027年3月31日",
    remainingDays: 328,
    maxAmount: "最大2億円",
  },
  targetChecklist: [
    "老朽化した設備・機械の更新を検討している",
    "人手不足を設備・機械で補いたい",
    "生産ラインの効率化・省力化を図りたい",
    "新しい製品・サービスのための設備投資を行いたい",
  ],
  targetIndustries: [
    { label: "製造業", desc: "生産ライン更新・自動化設備の導入を検討している" },
    { label: "食品加工業", desc: "衛生管理設備・加工ラインの刷新を進めたい" },
    { label: "建設業", desc: "重機・建設機械の更新で生産性を高めたい" },
    { label: "物流・倉庫業", desc: "マテハン設備・仕分けシステムの導入を検討している" },
  ],
  beforeAfter: {
    before: [
      "老朽化設備で故障リスクが高く、稼働率が低い",
      "人手不足で生産量・品質が安定しない",
      "設備コストが高く、競合他社に価格で負けている",
      "新規受注に応えるための設備が不足している",
    ],
    after: [
      "最新設備で稼働率・品質が大幅に向上",
      "自動化・省力化で少人数でも高い生産力を確保",
      "コスト削減で価格競争力が改善",
      "新規受注・取引先拡大のチャンスが広がる",
    ],
  },
  caseStudies: [
    {
      industry: "食品加工業",
      result: "生産量が年間30%増加",
      detail:
        "包装ラインの自動化設備を導入し、人手不足の解消と生産量の大幅増加を同時に実現。",
      amount: "採択額 4,800万円",
    },
    {
      industry: "製造業（中型）",
      result: "不良品率を8割削減",
      detail:
        "品質検査設備を最新機器に刷新。AI検査システムとの組み合わせで、不良品率が大幅に改善。",
      amount: "採択額 9,200万円",
    },
    {
      industry: "物流業",
      result: "仕分け作業を完全自動化",
      detail:
        "仕分けコンベアとRFIDシステムを導入し、入出庫作業のほぼ全工程を自動化。従業員をコア業務へ集中。",
      amount: "採択額 1.5億円",
    },
    {
      industry: "建設業",
      result: "工期を平均20%短縮",
      detail:
        "最新の建設機械を複数台導入し、工期短縮と安全性向上を両立。受注件数も増加。",
      amount: "採択額 6,500万円",
    },
  ],
  flow: [
    { step: "01", title: "無料相談・診断", desc: "設備投資の課題・目標をヒアリングします" },
    { step: "02", title: "補助金選定・要件確認", desc: "最適な補助金スキームをご提案します" },
    { step: "03", title: "事業計画書作成", desc: "採択率を高める計画書を専門家が作成" },
    { step: "04", title: "申請・採択", desc: "申請から採択通知まで全面サポート" },
    { step: "05", title: "設備導入・報告", desc: "交付後の設備導入・実績報告も伴走" },
  ],
  stats: [
    { value: "266億円", label: "累計支援額", suffix: "突破" },
    { value: "1,788件", label: "採択支援実績", suffix: "以上" },
    { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
    { value: "96%", label: "利用企業満足度" },
  ],
};
