import type { SubsidyLpData } from "./types";

export const generalSubsidy: SubsidyLpData = {
  id: "general-wage-support-2026",
  badge: "令和8年度",
  category: "中小企業賃上げ・経営強化支援",
  headline: "賃上げと経営強化を、",
  headlineAccent: "最大300万円の補助で実現。",
  subheadline:
    "人材確保・定着・生産性向上を一体で進めたい中小企業・小規模事業者を強力サポートします。",
  benefits: [
    { icon: "users", label: "人材確保・定着" },
    { icon: "trending-up", label: "賃上げ環境整備" },
    { icon: "briefcase", label: "経営力強化" },
  ],
  dates: {
    start: "2026.04.01",
    deadline: "2026.12.31",
    remainingDays: 238,
    maxAmount: "最大300万円",
  },
  targetChecklist: [
    "従業員の賃上げを検討・実施したい",
    "人材採用・定着に課題を感じている",
    "働き方改革や職場環境の改善を進めたい",
    "生産性向上で持続可能な経営を目指したい",
  ],
  targetIndustries: [
    { label: "小売・飲食業", desc: "人件費上昇に悩みながらも賃上げを進めたい" },
    { label: "介護・福祉業", desc: "人手不足解消のため処遇改善と職場環境整備を進めたい" },
    { label: "建設業", desc: "技能人材の確保・定着に向けた処遇改善に取り組みたい" },
    { label: "製造・加工業", desc: "賃上げ環境を整備しながら生産性向上も同時に実現したい" },
  ],
  beforeAfter: {
    before: [
      "賃上げしたくても財務的な余裕がない",
      "採用コストが高く、定着率も低い",
      "従業員の離職が続き事業運営に支障が出ている",
      "経営改善の方針はあるが資金が足りない",
    ],
    after: [
      "補助金を活用し計画的に賃上げを実施",
      "職場環境改善で採用・定着率が向上",
      "優秀な人材が集まり事業が安定成長",
      "持続可能な経営基盤が整い将来への投資が可能に",
    ],
  },
  caseStudies: [
    {
      industry: "飲食業（小規模）",
      result: "スタッフの定着率が大幅改善",
      detail: "補助金を活用した賃上げと福利厚生整備で離職率が半減。採用コストも削減できた。",
      amount: "採択額 150万円",
    },
    {
      industry: "介護施設",
      result: "有資格者の採用に成功",
      detail: "処遇改善と研修制度整備への投資を補助金で実施。翌年の採用倍率が向上した。",
      amount: "採択額 300万円",
    },
    {
      industry: "建設業（小規模）",
      result: "若手技能者の定着率2倍",
      detail: "賃上げとあわせて資格取得支援制度を整備。若手の早期離職がゼロになった。",
      amount: "採択額 200万円",
    },
    {
      industry: "製造業（下請け）",
      result: "生産性向上で賃上げを継続",
      detail: "業務効率化投資と賃上げをセットで実施。従業員満足度向上とともに受注も増加。",
      amount: "採択額 250万円",
    },
  ],
  flow: [
    { step: "01", title: "無料相談・診断", desc: "賃上げ・経営強化の課題と補助金活用可能性を診断" },
    { step: "02", title: "計画立案", desc: "賃上げ計画と経営改善施策を専門家とともに設計" },
    { step: "03", title: "申請準備サポート", desc: "事業計画・必要情報の整理を専門家が支援します" },
    { step: "04", title: "採択・実施", desc: "採択後の賃上げ・施策実施を伴走サポート" },
    { step: "05", title: "実績報告・受給", desc: "報告書類の整備から補助金受給まで一貫サポート" },
  ],
  stats: [
    { value: "266億円", label: "累計支援額", suffix: "突破" },
    { value: "1,788件", label: "採択支援実績", suffix: "以上" },
    { value: "50名", label: "専門コンサルタント", suffix: "以上在籍" },
    { value: "96%", label: "利用企業満足度" },
  ],
};
