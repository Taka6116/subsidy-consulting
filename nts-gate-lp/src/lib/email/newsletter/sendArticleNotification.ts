import { prisma } from "@/lib/db/prisma";
import { sendEmail, sendEmailBatch } from "@/lib/email/sendEmail";
import {
  buildArticleNotificationEmail,
  buildDigestEmail,
  type ArticleForNewsletter,
} from "@/lib/email/newsletter/templates";
import {
  getActiveSubscribers,
  getUnsentPublishedArticles,
  markArticlesNewsletterSent,
} from "@/lib/email/newsletter/subscribers";

const LOG_PREFIX = "[sendArticleNotification]";

export type ArticleNotificationResult = {
  articleId: string;
  subscriberCount: number;
  sent: number;
  failed: number;
  skipped: boolean;
};

/** 新着記事 1 件を購読者全員へ即時配信 */
export async function sendArticleNotification(
  contentId: string,
): Promise<ArticleNotificationResult> {
  const article = await prisma.generatedContent.findFirst({
    where: {
      id: contentId,
      contentType: "article",
      status: "published",
      newsletterSentAt: null,
      slug: { not: null },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  if (!article?.slug || !article.title) {
    return {
      articleId: contentId,
      subscriberCount: 0,
      sent: 0,
      failed: 0,
      skipped: true,
    };
  }

  const subscribers = await getActiveSubscribers();
  if (subscribers.length === 0) {
    console.info(`${LOG_PREFIX} no active subscribers — marking sent contentId=${contentId}`);
    await markArticlesNewsletterSent([article.id]);
    return {
      articleId: article.id,
      subscriberCount: 0,
      sent: 0,
      failed: 0,
      skipped: false,
    };
  }

  const articlePayload: ArticleForNewsletter = {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    publishedAt: article.publishedAt,
  };

  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    const message = buildArticleNotificationEmail(
      articlePayload,
      subscriber.unsubscribeToken,
    );
    try {
      const ok = await sendEmail({
        to: subscriber.email,
        subject: message.subject,
        text: message.text,
        html: message.html,
        context: "sendArticleNotification",
      });
      if (ok) sent += 1;
    } catch (err) {
      failed += 1;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`${LOG_PREFIX} failed subscriberId=${subscriber.id}: ${msg}`);
    }
  }

  if (failed === 0) {
    await markArticlesNewsletterSent([article.id]);
    console.info(
      `${LOG_PREFIX} done contentId=${contentId} sent=${sent} subscribers=${subscribers.length}`,
    );
  } else {
    console.warn(
      `${LOG_PREFIX} partial failure contentId=${contentId} sent=${sent} failed=${failed}`,
    );
  }

  return {
    articleId: article.id,
    subscriberCount: subscribers.length,
    sent,
    failed,
    skipped: false,
  };
}

/** 未配信記事を週刊ダイジェストとして一括配信（即時配信の取りこぼし救済） */
export async function sendNewsletterDigest(): Promise<{
  articleCount: number;
  subscriberCount: number;
  sent: number;
  failed: number;
}> {
  const articles = await getUnsentPublishedArticles(20);
  const subscribers = await getActiveSubscribers();

  if (articles.length === 0) {
    return { articleCount: 0, subscriberCount: subscribers.length, sent: 0, failed: 0 };
  }

  if (subscribers.length === 0) {
    await markArticlesNewsletterSent(articles.map((a) => a.id));
    return { articleCount: articles.length, subscriberCount: 0, sent: 0, failed: 0 };
  }

  const articlePayloads: ArticleForNewsletter[] = articles
    .filter((a): a is typeof a & { slug: string; title: string } =>
      Boolean(a.slug && a.title),
    )
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt,
      publishedAt: a.publishedAt,
    }));

  if (articlePayloads.length === 0) {
    return { articleCount: 0, subscriberCount: subscribers.length, sent: 0, failed: 0 };
  }

  const { sent, failed } = await sendEmailBatch(
    subscribers.map((s) => s.email),
    (to) => {
      const subscriber = subscribers.find((s) => s.email === to)!;
      const message = buildDigestEmail(articlePayloads, subscriber.unsubscribeToken);
      return {
        subject: message.subject,
        text: message.text,
        html: message.html,
      };
    },
    { context: "sendNewsletterDigest", chunkSize: 10 },
  );

  if (failed === 0) {
    await markArticlesNewsletterSent(articles.map((a) => a.id));
    console.info(
      `[sendNewsletterDigest] done articles=${articles.length} sent=${sent}`,
    );
  } else {
    console.warn(
      `[sendNewsletterDigest] partial failure articles=${articles.length} sent=${sent} failed=${failed}`,
    );
  }

  return {
    articleCount: articles.length,
    subscriberCount: subscribers.length,
    sent,
    failed,
  };
}
