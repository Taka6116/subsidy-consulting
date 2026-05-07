import type { SubsidyLpData } from "./types";

export const dxSubsidy: SubsidyLpData = {
  id: "dx-digital-support-2026",
  badge: "令和8年度",
  category: "デジタル技術導入支援",
  headline: "中小企業のDX推進に、",
  headlineAccent: "最大300万円の補助。",
  subheadline:
    "業務効率化・コスト削減・競争力強化を、国のDX支援で加速させませんか？",
  benefits: [
    { icon: "monitor", label: "業務効率化" },
    { icon: "trending-up", label: "競争力強化" },
    { icon: "shield", label: "IT基盤整備" },
  ],
  dates: {
    start: "2026.04.01",
    deadline: "2026.06.30",
    remainingDays: 54,
    maxAmount: "最大300万円",
  },
  targetChecklist: [
    "業務のデジタル化・IT化を検討している",
    "紙・手作業での業務が多く効率化したい",
    "クラウドサービス・システムを導入したい",
    "従業員のITスキル向上に取り組みたい",
  ],
  targetIndustries: [
    { label: "製造業", desc: "生産管理・在庫管理のデジタル化を検討している" },
    { label: "小売・卸売業", desc: "受発注・顧客管理のIT化で業務効率を高めたい" },
    { label: "サービス業", desc: "予約管理・顧客対応をデジタル化したい" },
    { label: "建設・不動産業", desc: "現場管理・書類作成のDX化を進めたい" },
  ],
  beforeAfter: {
    before: [
      "紙・Excel中心の業務で作業時間を浪費",
      "情報共有の遅れでミス・手戻りが多発",
      "属人化した業務で人材確保が困難",
      "デジタル化の遅れで競合に差をつけられている",
    ],
    after: [
      "デジタル化で業務時間を大幅に削減",
      "リアルタイムの情報共有でミスをゼロに",
      "標準化・自動化で人材不足を克服",
      "DX推進で顧客満足度と競争力が向上",
    ],
  },
  caseStudies: [
    {
      industry: "製造業（中小）",
      result: "生産管理工数を60%削減",
      detail: "在庫・生産管理システムを導入し、手作業による管理工数を大幅削減。リードタイム短縮にも成功。",
      amount: "採択額 285万円",
    },
    {
      industry: "小売業",
      result: "受発注処理を自動化",
      detail: "クラウド型受発注システムの導入で、電話・FAXによる受発注業務をほぼゼロに。",
      amount: "採択額 150万円",
    },
    {
      industry: "サービス業",
      result: "顧客管理の精度が向上",
      detail: "CRMシステムの導入で顧客情報を一元管理。リピート率が導入前比30%改善。",
      amount: "採択額 200万円",
    },
    {
      industry: "建設業",
      result: "現場報告のペーパーレス化",
      detail: "タブレット活用の現場管理アプリを導入し、日報・工程管理を完全デジタル化。",
      amount: "採択額 300万円",
    },
  ],
  flow: [
    { step: "01", title: "無料相談・診断", desc: "貴社の業務課題とDXニーズをヒアリングします" },
    { step: "02", title: "導入ツール選定", desc: "最適なITツール・システムをご提案します" },
    { step: "03", title: "申請サポート", desc: "申請書類の作成から提出まで全面サポート" },
    { step: "04", title: "採択・導入", desc: "採択後のシステム導入・設定もサポート" },
    { step: "05", title: "定着・活用支援", desc: "導入後の活用定着まで伴走します" },
  ],
  stats: [
    { value: "266億円", label: "累計支援額", suffix: "突破" },
    { value: "1,788件", label: "採択支援実績", suffix: "以上" },
    { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
    { value: "96%", label: "利用企業満足度" },
  ],
};
