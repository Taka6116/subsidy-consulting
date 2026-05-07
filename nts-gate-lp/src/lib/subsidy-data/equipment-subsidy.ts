import type { SubsidyLpData } from "./types";

export const equipmentSubsidy: SubsidyLpData = {
  id: "equipment-productivity-2026",
  badge: "令和8年度",
  category: "中小企業設備投資・生産性向上",
  headline: "設備投資で生産性を上げ、",
  headlineAccent: "最大4,000万円の補助。",
  subheadline:
    "老朽化設備の更新・省力化投資・品質向上を、国の支援で一気に実現しませんか？",
  benefits: [
    { icon: "settings", label: "生産性向上" },
    { icon: "zap", label: "省エネ・コスト削減" },
    { icon: "award", label: "品質・競争力UP" },
  ],
  dates: {
    start: "2026.04.01",
    deadline: "2026.08.31",
    remainingDays: 116,
    maxAmount: "最大4,000万円",
  },
  targetChecklist: [
    "老朽化した機械・設備の更新を検討している",
    "人手不足を省力化・自動化で解決したい",
    "製品品質の向上や不良品削減に取り組みたい",
    "生産コストの削減や効率化を進めたい",
  ],
  targetIndustries: [
    { label: "製造業", desc: "生産ラインの更新・自動化で生産性を高めたい" },
    { label: "食品加工業", desc: "衛生管理強化と省力化を同時に実現したい" },
    { label: "印刷・加工業", desc: "高精度設備の導入で品質差別化を図りたい" },
    { label: "物流・倉庫業", desc: "仕分け・搬送の自動化で人件費を削減したい" },
  ],
  beforeAfter: {
    before: [
      "老朽化設備で故障リスクと維持費が増大",
      "手作業中心で人手不足が直撃している",
      "生産コストが高く利益率が低下している",
      "品質のバラつきで顧客満足度が上がらない",
    ],
    after: [
      "最新設備で稼働率と品質が大幅に改善",
      "自動化・省力化で少人数でも高生産性を実現",
      "コスト構造の改善で利益率が向上",
      "安定した品質で顧客からの信頼が高まる",
    ],
  },
  caseStudies: [
    {
      industry: "製造業（精密部品）",
      result: "不良品率を80%削減",
      detail: "高精度加工機の導入により不良品率が劇的に改善。品質コストの削減と受注増につながった。",
      amount: "採択額 3,800万円",
    },
    {
      industry: "食品加工業",
      result: "生産ラインを省人化",
      detail: "自動充填・包装機器を導入し、同一ラインで必要人員を4人から1人に削減することに成功。",
      amount: "採択額 2,200万円",
    },
    {
      industry: "物流業",
      result: "仕分け作業時間50%短縮",
      detail: "自動仕分けシステムの導入で作業時間を半減。繁忙期の残業ゼロを実現。",
      amount: "採択額 4,000万円",
    },
    {
      industry: "印刷業",
      result: "受注単価が1.4倍に向上",
      detail: "高速デジタル印刷機の導入で小ロット対応力が向上し、高付加価値案件の受注が増加。",
      amount: "採択額 1,500万円",
    },
  ],
  flow: [
    { step: "01", title: "無料相談・診断", desc: "設備投資の課題と補助金適用可能性を診断" },
    { step: "02", title: "設備・要件確認", desc: "対象設備の要件確認と最適な申請戦略をご提案" },
    { step: "03", title: "申請サポート", desc: "事業計画書作成から申請まで全面サポート" },
    { step: "04", title: "採択・発注", desc: "採択後の設備発注・導入スケジュール調整をサポート" },
    { step: "05", title: "実績報告・受給", desc: "報告書類の作成から補助金受給まで伴走" },
  ],
  stats: [
    { value: "266億円", label: "累計支援額", suffix: "突破" },
    { value: "1,788件", label: "採択支援実績", suffix: "以上" },
    { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
    { value: "96%", label: "利用企業満足度" },
  ],
};
