import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

export type ActiveSubscriber = {
  id: string;
  email: string;
  unsubscribeToken: string;
};

/** 配信対象の購読者一覧（配信停止済みを除く） */
export async function getActiveSubscribers(): Promise<ActiveSubscriber[]> {
  return prisma.subscriber.findMany({
    where: { unsubscribedAt: null },
    select: {
      id: true,
      email: true,
      unsubscribeToken: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

/** 未配信の公開記事を取得 */
export async function getUnsentPublishedArticles(limit = 20) {
  return prisma.generatedContent.findMany({
    where: {
      contentType: "article",
      status: "published",
      slug: { not: null },
      newsletterSentAt: null,
      publishedAt: { not: null },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function markArticlesNewsletterSent(articleIds: string[]): Promise<void> {
  if (articleIds.length === 0) return;
  const now = new Date();
  await prisma.generatedContent.updateMany({
    where: { id: { in: articleIds } },
    data: { newsletterSentAt: now },
  });
}

export function createUnsubscribeToken(): string {
  return randomUUID();
}
