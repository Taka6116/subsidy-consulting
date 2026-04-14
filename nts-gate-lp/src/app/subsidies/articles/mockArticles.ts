/** 将来のアプリ投稿APIと差し替え予定のモック */

export type SubsidyArticle = {
  id: string;
  slug: string;
  /** 表示用 YYYY.M.D */
  publishedAt: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  /** public からのパス（先頭 /） */
  imageSrc: string;
  tags: string[];
};

export const MOCK_ARTICLES: SubsidyArticle[] = [
  {
    id: "1",
    slug: "subsidy-overview-2024",
    publishedAt: "2024.4.13",
    categoryLabel: "お役立ち情報",
    title: "中小企業向け補助金の選び方と申請の流れ",
    excerpt:
      "ものづくり補助金から事業再構築補助金まで、自社に合う制度を見極めるためのチェックポイントを整理しました。",
    imageSrc: "/images/PANA2232.jpg",
    tags: ["補助金基礎", "申請準備"],
  },
  {
    id: "2",
    slug: "ma-expense-guide",
    publishedAt: "2024.3.28",
    categoryLabel: "お役立ち情報",
    title: "M&Aに伴う費用を抑える支援制度の活用事例",
    excerpt:
      "事業承継や買収時に使える助成・補助の組み合わせと、実務上の注意点を解説します。",
    imageSrc: "/images/PANA2394.jpg",
    tags: ["M&A", "事業承継"],
  },
  {
    id: "3",
    slug: "dx-subsidy-checklist",
    publishedAt: "2024.3.10",
    categoryLabel: "お役立ち情報",
    title: "DX投資を補助金でカバーするためのチェックリスト",
    excerpt:
      "IT導入補助金や省力化投資補助など、デジタル投資に紐づく制度の比較と必要書類の目安です。",
    imageSrc: "/images/PANA2664.jpg",
    tags: ["DX", "IT導入"],
  },
  {
    id: "4",
    slug: "hiring-subsidy-2024",
    publishedAt: "2024.2.22",
    categoryLabel: "お役立ち情報",
    title: "採用・人材育成に使える助成金の最新動向",
    excerpt:
      "キャリアアップ助成金や人材開発支援助成金の要件変化と、申請スケジュールの組み立て方をまとめました。",
    imageSrc: "/images/PANA2822-2.jpg",
    tags: ["人材", "採用"],
  },
  {
    id: "5",
    slug: "equipment-investment",
    publishedAt: "2024.2.5",
    categoryLabel: "お役立ち情報",
    title: "設備投資と補助金の相性を見るポイント",
    excerpt:
      "減価償却との関係や採択後の実績報告まで、設備投資を前提にした計画の立て方を解説します。",
    imageSrc: "/images/PANA3061.jpg",
    tags: ["設備投資", "補助金基礎"],
  },
  {
    id: "6",
    slug: "subsidy-documents",
    publishedAt: "2024.1.18",
    categoryLabel: "お役立ち情報",
    title: "採択に向けた事業計画書の書き方（補助金共通）",
    excerpt:
      "審査で見られる観点と、数値根拠の示し方のコツを制度横断で整理しています。",
    imageSrc: "/images/PANA3202-2.jpg",
    tags: ["申請準備", "事業計画"],
  },
];

export type TagOption = { label: string; count: number };

export function buildTagOptions(articles: SubsidyArticle[]): TagOption[] {
  const map = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, "ja"));
}
