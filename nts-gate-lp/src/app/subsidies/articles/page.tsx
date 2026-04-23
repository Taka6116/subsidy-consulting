import type { Metadata } from "next";
import Header from "@/components/shared/Header";
import LpFooter from "@/components/gate-lp/LpFooter";
import { prisma } from "@/lib/db/prisma";
import SubsidiesArticlesIndex, {
  type ArticleCard,
} from "./SubsidiesArticlesIndex";

export const metadata: Metadata = {
  title: "解説記事 | 日本提携支援",
  description: "補助金・支援制度に関する解説記事をまとめてお届けします。",
};

// 5 分 ISR（Bedrock で新規生成されたら次回アクセス時に反映）
export const revalidate = 300;

function formatPublishedAt(date: Date | null): string {
  if (!date) return "";
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
}

/**
 * 最大補助額ラベルを整形する。
 * - maxAmountLabel が設定されていれば、それに "最大" を補って返す。
 * - 無ければ subsidyAmount（円）から 万円 / 億円 で自動算出する。
 */
function formatMaxAmount(
  label: string | null | undefined,
  amountYen: bigint | null | undefined,
): string | null {
  const pick = (s: string | null | undefined) => (s ? s.trim() : "");
  const raw = pick(label);
  if (raw) {
    return raw.startsWith("最大") ? raw : `最大 ${raw}`;
  }
  if (amountYen == null) return null;
  const yen = Number(amountYen);
  if (!Number.isFinite(yen) || yen <= 0) return null;
  const man = yen / 10000;
  if (man >= 10000) {
    const oku = man / 10000;
    return `最大 ${oku.toFixed(oku >= 10 ? 0 : 1)}億円`;
  }
  return `最大 ${Math.round(man).toLocaleString("ja-JP")}万円`;
}

export default async function SubsidiesArticlesPage() {
  const rows = await prisma.generatedContent.findMany({
    where: {
      contentType: "article",
      status: "published",
      slug: { not: null },
    },
    orderBy: { publishedAt: "desc" },
    take: 60,
    include: {
      grant: {
        select: {
          name: true,
          maxAmountLabel: true,
          subsidyAmount: true,
        },
      },
    },
  });

  const articles: ArticleCard[] = rows
    .filter((r) => r.slug && r.title)
    .map((r) => ({
      id: r.id,
      slug: r.slug as string,
      title: r.title as string,
      excerpt: r.excerpt ?? "",
      publishedAt: formatPublishedAt(r.publishedAt),
      subsidyName: r.grant?.name ?? "",
      maxAmountLabel: formatMaxAmount(
        r.grant?.maxAmountLabel,
        r.grant?.subsidyAmount,
      ),
      tags: r.tags ?? [],
    }));

  return (
    <>
      <Header />
      <main className="relative z-[2] min-h-[100svh] bg-[#f9f7f2] pt-16 font-body sm:pt-20">
        <SubsidiesArticlesIndex articles={articles} />
      </main>
      <LpFooter />
    </>
  );
}
