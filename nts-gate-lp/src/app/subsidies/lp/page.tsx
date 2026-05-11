import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesLpClient from "./SubsidiesLpClient";
import {
  detectLpCategory,
  pickLpImage,
  getHeroMosaicImages,
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
    badge: "令和8年度（21次）",
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
  title: "補助金LP一覧 | 日本提携支援",
  description:
    "制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。あなたの会社が使える補助金を最短で見つけられます。",
};

export const revalidate = 300;

// 専用LP が存在する補助金の grant.id（動的カードから除外するため）
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

  const filtered = raw.filter((r) => !DEDICATED_LP_GRANT_IDS.has(r.grant.id));

  const rows = filtered.map((r) => {
    const category = detectLpCategory({
      name: r.grant.name,
      targetIndustries: r.grant.targetIndustries ?? [],
    });
    const image = pickLpImage(category, r.grant.id);
    return {
      id: r.id,
      title: r.title,
      body: r.body,
      publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
      category,
      imageUrl: image.url,
      imageAlt: image.alt,
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

  // 特集LPに画像を付与
  const featuredWithImages = FEATURED_LPS.map((lp) => ({
    ...lp,
    imageUrl: pickLpImage(lp.category, lp.href).url,
    imageAlt: lp.name,
  }));

  const heroImages = getHeroMosaicImages();

  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-[#f2f5fb] pt-16 font-body sm:pt-20">
        {/* コンパクトヒーロー：左コピー＋右モザイク */}
        <section className="relative overflow-hidden bg-[#071525]">
          {/* グラデーション背景 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,#071525_0%,#0e2a45_55%,#0d3557_100%)]"
          />

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-0 px-6 py-10 md:grid-cols-[1fr_340px] md:gap-8 md:py-12 lg:grid-cols-[1fr_480px]">
            {/* 左：コピー */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex w-fit items-center rounded-full bg-[#1e9bdb]/20 px-3 py-1 text-xs font-bold text-[#7DD3FC] ring-1 ring-[#7DD3FC]/30">
                専門LPカタログ
              </span>
              <h1 className="mt-3 font-heading text-[clamp(26px,4.5vw,48px)] font-black leading-tight tracking-tight text-white">
                補助金活用ガイド
                <br className="hidden sm:block" />
                一覧
              </h1>
              <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-white/75 md:text-[15px]">
                制度ごとに、対象企業のイメージ・申請の流れ・相談前に確認すべきポイントを1ページで整理。
                自社に使える補助金を最短で見つけられます。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/15">
                  公開中 {rows.length + FEATURED_LPS.length}件
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/80 ring-1 ring-white/10">
                  専門LP付き
                </span>
                <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/80 ring-1 ring-white/10">
                  随時更新
                </span>
              </div>
            </div>

            {/* 右：カテゴリ画像モザイク */}
            <div className="mt-6 md:mt-0" aria-hidden>
              <div className="grid grid-cols-3 gap-2">
                {heroImages.slice(0, 3).map((img, i) => (
                  <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover opacity-85"
                      sizes="160px"
                    />
                  </div>
                ))}
                {heroImages.slice(3).map((img, i) => (
                  <div
                    key={i + 3}
                    className="relative col-span-1 aspect-[4/3] overflow-hidden rounded-xl"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt}
                      fill
                      className="object-cover opacity-85"
                      sizes="160px"
                    />
                  </div>
                ))}
                {/* 最後のセルに件数バッジ */}
                <div className="relative col-span-1 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-[#1e9bdb]/25 ring-1 ring-[#7DD3FC]/25">
                  <div className="text-center">
                    <p className="text-xl font-black text-white">
                      {rows.length + FEATURED_LPS.length}
                    </p>
                    <p className="text-[10px] font-semibold text-white/70">専門LP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* カード一覧 */}
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-10">
          <SubsidiesLpClient rows={rows} featuredLps={featuredWithImages} />
        </section>
      </main>
      <LpFooter />
    </>
  );
}
