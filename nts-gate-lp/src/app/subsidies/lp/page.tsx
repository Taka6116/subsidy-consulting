import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesLpClient from "./SubsidiesLpClient";

const FEATURED_LPS = [
  {
    href: "/subsidies/construction-electrification",
    name: "高用車等の電動化促進事業（建設機械）",
    copy: "建設機械の電動化で燃料費削減・脱炭素・生産性向上を一気に実現。最大14.3億円の補助が利用できます。",
    amount: "最大14.3億円",
    deadline: "2027年1月29日",
    badge: "令和7年度（補正）",
  },
  {
    href: "/subsidies/dx-support",
    name: "中小・小規模企業デジタル技術導入支援",
    copy: "ITツール・クラウド導入で業務効率化と競争力強化を。DX推進の第一歩を補助金で加速させます。",
    amount: "最大300万円",
    deadline: "2026年6月30日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/equipment-productivity",
    name: "中小企業設備投資・生産性向上促進補助金",
    copy: "老朽化設備の更新・省力化投資を国が支援。製造業・加工業・物流業の生産性を飛躍的に改善します。",
    amount: "最大4,000万円",
    deadline: "2026年8月31日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/wage-support",
    name: "中小・小規模事業者賃上げ環境整備支援補助金",
    copy: "賃上げと経営強化を同時に実現。人材確保・定着・生産性向上に取り組む中小企業を強力サポートします。",
    amount: "最大300万円",
    deadline: "2026年12月31日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/equipment-investment",
    name: "設備投資・省力化補助金（令和8年度）",
    copy: "老朽設備の更新・自動化・省力化投資を最大2億円で支援。人手不足・コスト高騰を設備投資で一気に解決します。",
    amount: "最大2億円",
    deadline: "2027年3月31日",
    badge: "令和8年度",
  },
  {
    href: "/subsidies/monodukuri-business",
    name: "ものづくり・商業・サービス補助金（21次締切）",
    copy: "新製品開発・生産プロセス改善・販路拡大など、事業計画の実現を最大4,000万円で支援します。",
    amount: "最大4,000万円",
    deadline: "2027年3月23日",
    badge: "令和8年度（21次）",
  },
  {
    href: "/subsidies/logistics-support",
    name: "物流・運送効率化補助金",
    copy: "2024年問題・ドライバー不足・燃料費高騰に対応。配送ルート最適化・WMS導入・省力化投資を補助金で実現。",
    amount: "最大500万円",
    deadline: "2026年5月25日",
    badge: "令和7年度補正",
  },
  {
    href: "/subsidies/human-resources",
    name: "人材確保・賃上げ支援補助金",
    copy: "採用・研修・職場環境整備に最大300万円。人材不足と離職率の悩みを補助金活用で解決します。",
    amount: "最大300万円",
    deadline: "要確認",
    badge: "令和8年度",
  },
] as const;

export const metadata: Metadata = {
  title: "補助金ページ一覧 | 日本提携支援",
  description:
    "制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。あなたの会社が使える補助金を最短で見つけられます。",
};

export const revalidate = 300;

// 専用LP が存在する補助金の grant.id（動的カードから除外するため）
const DEDICATED_LP_GRANT_IDS = new Set([
  "6a3d0ab9-a809-4175-aa5e-90de437b8931", // 令和7年度（補正）商用車等の電動化促進事業（建設機械）
  "b4069491-2fca-4be7-9b2f-d78fc2be1650", // 令和6年度補正予算 商用車等の電動化促進事業
  "88dd0856-9201-45df-ad8b-c8c83472f00c", // 令和7年度補正予算 商用車等の電動化促進事業
  "7152db8b-561f-4863-a1cf-c9585dbdb5fa", // 中小・小規模企業デジタル技術導入等緊急支援事業費補助金
  "0be58438-f9b7-4f2c-b268-bdac62206ea3", // 中小・小規模事業者賃上げ環境整備支援補助金
  "3dc697a6-1100-4832-84d1-81c23b04153d", // 中小・小規模事業者賃上げ環境整備支援補助金（別レコード）
  "7568bddb-d453-47d9-9dd3-a7f17644a908", // 令和8年_設備投資
  "78c0b3e8-0e32-455e-aaa2-6742c75deb23", // ものづくり補助金21次
  "7e0a85e7-a3c5-4ff1-9ee2-4e991cca300f", // ものづくり補助金19次
  "878c848d-9d00-48ea-8fbd-6a1b55fad214", // ものづくり補助金20次
  "13a8828e-3646-4bdc-a854-b5f5767fb53b", // ものづくり補助金22次
  "c79da422-866e-42e1-a37b-c7196db632bc", // 食品等物流合理化緊急対策事業（物流）
  "280f0902-6d50-45d7-a1fb-b265bb7af971", // 食品等物流合理化緊急対策事業（輸出物流）
  "4d6cd8a1-c047-4a9c-8d30-1e8dea559681", // 島根県地域物流効率化
  "99e1d191-fe5e-4cb8-9f66-3a28749fa8d3", // 副業・兼業人材活用促進補助金
  "34fbaf27-54a0-4396-b386-ec33d054d0e2", // 県外専門人材確保支援補助金
]);

export default async function SubsidiesLpIndexPage() {
  const raw = await prisma.generatedContent.findMany({
    where: {
      contentType: "lp",
      status: "published",
    },
    orderBy: { publishedAt: "desc" },
    take: 200,
    include: {
      grant: {
        select: {
          id: true,
          name: true,
          maxAmountLabel: true,
          subsidyAmount: true,
          deadlineLabel: true,
          deadline: true,
          prefecture: true,
          targetIndustries: true,
          status: true,
        },
      },
    },
  });

  // 専用LPが存在するものは動的カードから除外（重複防止）
  const filtered = raw.filter((r) => !DEDICATED_LP_GRANT_IDS.has(r.grant.id));

  const rows = filtered.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
    grant: {
      id: r.grant.id,
      name: r.grant.name,
      maxAmountLabel: r.grant.maxAmountLabel,
      subsidyAmount: r.grant.subsidyAmount != null ? String(r.grant.subsidyAmount) : null,
      deadlineLabel: r.grant.deadlineLabel,
      deadline: r.grant.deadline ? r.grant.deadline.toISOString() : null,
      prefecture: r.grant.prefecture,
      targetIndustries: r.grant.targetIndustries ?? [],
      status: r.grant.status,
    },
  }));

  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-[#eef4f9] pt-16 font-body sm:pt-20">
        <section className="relative isolate overflow-hidden bg-[#071525] text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(30,155,219,0.32),transparent_34%),linear-gradient(135deg,#071525_0%,#0e2c47_55%,#133d59_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-0 -z-10 h-full w-[36%] skew-x-[-13deg] bg-[#1e9bdb]/20"
          />
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <div className="max-w-3xl">
              <h1 className="font-heading text-[clamp(34px,5vw,58px)] font-black leading-tight tracking-[-0.03em] text-white">
                補助金ページ一覧
              </h1>
              <p className="mt-5 text-base font-medium leading-8 text-white/80 sm:text-lg">
                制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。
                <br className="hidden sm:inline" />
                あなたの会社が使える補助金を最短で見つけられます。
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                公開中 {rows.length}件
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">
                相談導線つき
              </span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white ring-1 ring-white/15">
                自動生成・随時追加
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
          <SubsidiesLpClient rows={rows} featuredLps={FEATURED_LPS} />
        </section>
      </main>
      <LpFooter />
    </>
  );
}
