import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesLpClient from "./SubsidiesLpClient";
import {
  detectLpCategory,
  pickLpImage,
  detectPurposes,
  detectIndustries,
  parseAmountYen,
  classifyAmountBucket,
  CATEGORY_PURPOSE,
  CATEGORY_TARGET_LINE,
  CATEGORY_LEARN_POINTS,
} from "@/lib/lp-pictures/pickLpCategoryImage";

const FEATURED_LPS = [
  {
    href: "/subsidies/construction-electrification",
    name: "商用車等の電動化促進事業（建設機械）",
    copy: "建設機械の電動化で燃料費削減・脱炭素・生産性向上を一気に実現。最大14.3億円の補助が利用できます。",
    amount: "最大14.3億円",
    deadline: "2027年1月29日",
    badge: "令和7年度（補正）",
    category: "建設" as const,
  },
  {
    href: "/subsidies/dx-support",
    name: "中小・小規模企業デジタル技術導入支援",
    copy: "ITツール・クラウド導入で業務効率化と競争力強化を。DX推進の第一歩を補助金で加速させます。",
    amount: "最大300万円",
    deadline: "2026年6月30日",
    badge: "令和8年度",
    category: "DX" as const,
  },
  {
    href: "/subsidies/equipment-productivity",
    name: "中小企業設備投資・生産性向上促進補助金",
    copy: "老朽化設備の更新・省力化投資を国が支援。製造業・加工業・物流業の生産性を飛躍的に改善します。",
    amount: "最大4,000万円",
    deadline: "2026年8月31日",
    badge: "令和8年度",
    category: "設備" as const,
  },
  {
    href: "/subsidies/wage-support",
    name: "中小・小規模事業者賃上げ環境整備支援補助金",
    copy: "賃上げと経営強化を同時に実現。人材確保・定着・生産性向上に取り組む中小企業を強力サポートします。",
    amount: "最大300万円",
    deadline: "2026年12月31日",
    badge: "令和8年度",
    category: "人材" as const,
  },
  {
    href: "/subsidies/equipment-investment",
    name: "設備投資・省力化補助金（令和8年度）",
    copy: "老朽設備の更新・自動化・省力化投資を最大2億円で支援。人手不足・コスト高騰を設備投資で一気に解決します。",
    amount: "最大2億円",
    deadline: "2027年3月31日",
    badge: "令和8年度",
    category: "設備" as const,
  },
  {
    href: "/subsidies/monodukuri-business",
    name: "ものづくり・商業・サービス補助金（21次締切）",
    copy: "新製品開発・生産プロセス改善・販路拡大など、事業計画の実現を最大4,000万円で支援します。",
    amount: "最大4,000万円",
    deadline: "2027年3月23日",
    badge: "令和8年度(21次)",
    category: "事業計画" as const,
  },
  {
    href: "/subsidies/logistics-support",
    name: "物流・運送効率化補助金",
    copy: "2024年問題・ドライバー不足・燃料費高騰に対応。配送ルート最適化・WMS導入・省力化投資を補助金で実現。",
    amount: "最大500万円",
    deadline: "2026年5月25日",
    badge: "令和7年度補正",
    category: "運送" as const,
  },
  {
    href: "/subsidies/human-resources",
    name: "人材確保・賃上げ支援補助金",
    copy: "採用・研修・職場環境整備に最大300万円。人材不足と離職率の悩みを補助金活用で解決します。",
    amount: "最大300万円",
    deadline: "要確認",
    badge: "令和8年度",
    category: "人材" as const,
  },
] as const;

export const metadata: Metadata = {
  title: "業種・目的から使える補助金を見つける | 日本提携支援",
  description:
    "設備投資・IT導入・人材確保・物流改善まで、自社に関係する補助金制度を目的別にわかりやすく整理しています。",
};

export const revalidate = 300;

const DEDICATED_LP_GRANT_IDS = new Set([
  "6a3d0ab9-a809-4175-aa5e-90de437b8931",
  "b4069491-2fca-4be7-9b2f-d78fc2be1650",
  "88dd0856-9201-45df-ad8b-c8c83472f00c",
  "7152db8b-561f-4863-a1cf-c9585dbdb5fa",
  "0be58438-f9b7-4f2c-b268-bdac62206ea3",
  "3dc697a6-1100-4832-84d1-81c23b04153d",
  "7568bddb-d453-47d9-9dd3-a7f17644a908",
  "78c0b3e8-0e32-455e-aaa2-6742c75deb23",
  "7e0a85e7-a3c5-4ff1-9ee2-4e991cca300f",
  "878c848d-9d00-48ea-8fbd-6a1b55fad214",
  "13a8828e-3646-4bdc-a854-b5f5767fb53b",
  "c79da422-866e-42e1-a37b-c7196db632bc",
  "280f0902-6d50-45d7-a1fb-b265bb7af971",
  "4d6cd8a1-c047-4a9c-8d30-1e8dea559681",
  "99e1d191-fe5e-4cb8-9f66-3a28749fa8d3",
  "34fbaf27-54a0-4396-b386-ec33d054d0e2",
]);

const grantSelect = {
  id: true,
  name: true,
  maxAmountLabel: true,
  subsidyAmount: true,
  deadlineLabel: true,
  deadline: true,
  prefecture: true,
  targetIndustries: true,
  status: true,
  description: true,
} as const;

function buildFeaturedWithImages() {
  return FEATURED_LPS.map((lp) => {
    const image = pickLpImage(lp.category, lp.href);
    const purposes = detectPurposes({ name: lp.name, copy: lp.copy, category: lp.category });
    const industries = detectIndustries({ name: lp.name, copy: lp.copy, category: lp.category });
    const amountYen = parseAmountYen({ maxAmountLabel: lp.amount });
    const amountBucket = classifyAmountBucket(amountYen);
    return {
      ...lp,
      imageUrl: image.url,
      imageAlt: `${lp.name} - ${image.alt}`,
      categoryLabel: CATEGORY_PURPOSE[lp.category],
      targetLine: CATEGORY_TARGET_LINE[lp.category],
      learnPoints: CATEGORY_LEARN_POINTS[lp.category],
      purposes,
      industries,
      amountYen,
      amountBucket,
    };
  });
}

async function getLpIndexRows() {
  try {
    const [raw, articleRaw] = await Promise.all([
      prisma.generatedContent.findMany({
        where: { contentType: "lp", status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 200,
        include: { grant: { select: grantSelect } },
      }),
      prisma.generatedContent.findMany({
        where: { contentType: "article", status: "published" },
        orderBy: { publishedAt: "desc" },
        take: 200,
        include: { grant: { select: grantSelect } },
      }),
    ]);

    const lpGrantIds = new Set(raw.map((r) => r.grant.id));
    const articleBackfilledRaw = articleRaw.filter((r) => !lpGrantIds.has(r.grant.id));
    const combinedRaw = [...raw, ...articleBackfilledRaw];
    return combinedRaw.filter((r) => !DEDICATED_LP_GRANT_IDS.has(r.grant.id));
  } catch {
    return [];
  }
}

export default async function SubsidiesLpIndexPage() {
  const filteredRaw = await getLpIndexRows();

  const rows = filteredRaw.map((r) => {
    const category = detectLpCategory({
      name: r.grant.name,
      copy: r.grant.description,
      targetIndustries: r.grant.targetIndustries ?? [],
    });
    const image = pickLpImage(category, r.grant.id);
    const purposes = detectPurposes({
      name: r.grant.name,
      copy: r.grant.description,
      category,
    });
    const industries = detectIndustries({
      name: r.grant.name,
      copy: r.grant.description,
      targetIndustries: r.grant.targetIndustries ?? [],
      category,
    });
    const amountYen = parseAmountYen({
      maxAmountLabel: r.grant.maxAmountLabel,
      subsidyAmount: r.grant.subsidyAmount != null ? String(r.grant.subsidyAmount) : null,
    });
    const amountBucket = classifyAmountBucket(amountYen);

    return {
      id: r.id,
      title: r.title,
      body: r.body,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      category,
      categoryLabel: CATEGORY_PURPOSE[category],
      targetLine: CATEGORY_TARGET_LINE[category],
      learnPoints: CATEGORY_LEARN_POINTS[category],
      imageUrl: image.url,
      imageAlt: `${r.grant.name ?? "補助金活用ガイド"} - ${image.alt}`,
      purposes,
      industries,
      amountYen,
      amountBucket,
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
    };
  });

  const featuredWithImages = buildFeaturedWithImages();

  const totalLpCount = rows.length + featuredWithImages.length;

  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-[#F4F7FB] pt-16 font-body sm:pt-20">
        <SubsidiesLpClient
          rows={rows}
          featuredLps={featuredWithImages}
          totalLpCount={totalLpCount}
        />

        {/* ============ ページ下部 相談CTA ============ */}
        <section id="consult-cta" className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-[#F4F7FB] to-white p-6 shadow-sm sm:p-10">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                補助金選びで迷ったら、まずは対象確認から
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                制度名が分からなくても、投資内容や業種から
                活用できる可能性のある補助金を整理します。
                NTSの専門家が無料でお答えします。
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/consult"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-[#0B4F8A] px-6 font-bold text-white shadow-sm transition hover:bg-[#083D6D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A]"
                >
                  無料相談する
                </Link>
                <Link
                  href="/check"
                  className="inline-flex h-12 flex-1 items-center justify-center rounded-xl border border-[#0B4F8A]/30 bg-white px-6 font-bold text-[#0B4F8A] transition hover:bg-[#F4F7FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4F8A]"
                >
                  対象の補助金を確認する
                </Link>
              </div>
              <ul className="mt-5 grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <li>✓ 相談申し込み無料</li>
                <li>✓ 制度名が分からなくてもOK</li>
                <li>✓ 申請後も伴走サポート</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <LpFooter />
    </>
  );
}

