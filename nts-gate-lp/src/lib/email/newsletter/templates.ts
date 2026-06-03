import { getSiteUrl } from "@/lib/email/sesConfig";

export type ArticleForNewsletter = {
  slug: string;
  title: string;
  excerpt: string | null;
  publishedAt: Date | null;
};

export function buildUnsubscribeUrl(unsubscribeToken: string): string {
  return `${getSiteUrl()}/api/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
}

export function buildArticleUrl(slug: string): string {
  return `${getSiteUrl()}/subsidies/articles/${slug}`;
}

export function buildArticlesIndexUrl(): string {
  return `${getSiteUrl()}/subsidies/articles`;
}

function formatPublishedDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildWelcomeEmail(unsubscribeToken: string): {
  subject: string;
  text: string;
  html: string;
} {
  const articlesUrl = buildArticlesIndexUrl();
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);

  const subject = "【日本提携支援】補助金情報メールの登録が完了しました";

  const text = [
    "補助金情報メールへのご登録ありがとうございます。",
    "",
    "新着の補助金解説記事や公募情報を、要点をまとめてお届けします。",
    "",
    `記事一覧: ${articlesUrl}`,
    "",
    "配信停止はこちら:",
    unsubscribeUrl,
    "",
    "このメールは自動送信です。返信しないでください。",
    "日本提携支援",
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html lang="ja">
<body style="font-family:'Noto Sans JP',sans-serif;color:#313131;line-height:1.8;margin:0;padding:24px;background:#f4f2e9;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <p style="margin:0 0 16px;font-size:14px;color:#28A4A3;font-weight:700;letter-spacing:0.1em;">NTS 補助金情報</p>
    <h1 style="margin:0 0 20px;font-size:20px;color:#0E357F;">ご登録ありがとうございます</h1>
    <p style="margin:0 0 16px;font-size:14px;color:#555;">
      新着の補助金解説記事や公募情報を、要点をまとめてお届けします。
    </p>
    <p style="margin:0 0 24px;">
      <a href="${articlesUrl}" style="display:inline-block;background:#28A4A3;color:#fff;text-decoration:none;padding:12px 24px;border-radius:25px;font-size:14px;font-weight:700;">
        補助金記事を見る
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#888;">
      <a href="${unsubscribeUrl}" style="color:#888;">配信停止はこちら</a>
    </p>
  </div>
</body>
</html>`.trim();

  return { subject, text, html };
}

export function buildArticleNotificationEmail(
  article: ArticleForNewsletter,
  unsubscribeToken: string,
): { subject: string; text: string; html: string } {
  const articleUrl = buildArticleUrl(article.slug);
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  const dateLabel = formatPublishedDate(article.publishedAt);
  const excerpt = article.excerpt?.trim() || "詳細は記事ページをご確認ください。";

  const subject = `【新着】${article.title}`;

  const text = [
    "新しい補助金解説記事を公開しました。",
    "",
    article.title,
    dateLabel ? `公開日: ${dateLabel}` : "",
    "",
    excerpt,
    "",
    `記事を読む: ${articleUrl}`,
    "",
    "配信停止:",
    unsubscribeUrl,
    "",
    "日本提携支援",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html lang="ja">
<body style="font-family:'Noto Sans JP',sans-serif;color:#313131;line-height:1.8;margin:0;padding:24px;background:#f4f2e9;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <p style="margin:0 0 8px;font-size:12px;color:#28A4A3;font-weight:700;">新着記事</p>
    <h1 style="margin:0 0 12px;font-size:18px;color:#0E357F;line-height:1.6;">${escapeHtml(article.title)}</h1>
    ${dateLabel ? `<p style="margin:0 0 16px;font-size:12px;color:#888;">${escapeHtml(dateLabel)}</p>` : ""}
    <p style="margin:0 0 24px;font-size:14px;color:#555;">${escapeHtml(excerpt)}</p>
    <p style="margin:0 0 24px;">
      <a href="${articleUrl}" style="display:inline-block;background:#28A4A3;color:#fff;text-decoration:none;padding:12px 24px;border-radius:25px;font-size:14px;font-weight:700;">
        記事を読む
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#888;">
      <a href="${unsubscribeUrl}" style="color:#888;">配信停止はこちら</a>
    </p>
  </div>
</body>
</html>`.trim();

  return { subject, text, html };
}

export function buildDigestEmail(
  articles: ArticleForNewsletter[],
  unsubscribeToken: string,
): { subject: string; text: string; html: string } {
  const articlesUrl = buildArticlesIndexUrl();
  const unsubscribeUrl = buildUnsubscribeUrl(unsubscribeToken);
  const count = articles.length;

  const subject =
    count === 1
      ? `【週刊】${articles[0].title}`
      : `【週刊】補助金新着情報 ${count}件`;

  const textLines = [
    "今週の補助金新着情報をお届けします。",
    "",
    ...articles.flatMap((article) => [
      `■ ${article.title}`,
      article.excerpt?.trim() || "",
      buildArticleUrl(article.slug),
      "",
    ]),
    `すべて見る: ${articlesUrl}`,
    "",
    "配信停止:",
    unsubscribeUrl,
    "",
    "日本提携支援",
  ];

  const articleHtml = articles
    .map(
      (article) => `
    <div style="margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid #eee;">
      <h2 style="margin:0 0 8px;font-size:16px;color:#0E357F;line-height:1.6;">
        <a href="${buildArticleUrl(article.slug)}" style="color:#0E357F;text-decoration:none;">${escapeHtml(article.title)}</a>
      </h2>
      <p style="margin:0 0 8px;font-size:13px;color:#555;">${escapeHtml(article.excerpt?.trim() || "")}</p>
      <a href="${buildArticleUrl(article.slug)}" style="font-size:13px;color:#28A4A3;">続きを読む →</a>
    </div>`,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="ja">
<body style="font-family:'Noto Sans JP',sans-serif;color:#313131;line-height:1.8;margin:0;padding:24px;background:#f4f2e9;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <p style="margin:0 0 8px;font-size:12px;color:#28A4A3;font-weight:700;">週刊ダイジェスト</p>
    <h1 style="margin:0 0 24px;font-size:20px;color:#0E357F;">補助金新着情報 ${count}件</h1>
    ${articleHtml}
    <p style="margin:0 0 24px;">
      <a href="${articlesUrl}" style="display:inline-block;background:#28A4A3;color:#fff;text-decoration:none;padding:12px 24px;border-radius:25px;font-size:14px;font-weight:700;">
        記事一覧を見る
      </a>
    </p>
    <p style="margin:0;font-size:12px;color:#888;">
      <a href="${unsubscribeUrl}" style="color:#888;">配信停止はこちら</a>
    </p>
  </div>
</body>
</html>`.trim();

  return { subject, text: textLines.join("\n"), html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
