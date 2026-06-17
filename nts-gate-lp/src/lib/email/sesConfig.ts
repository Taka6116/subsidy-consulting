/**
 * AWS SES 設定（相談フォーム通知・メールマガジン共通）
 *
 * 本番で必要な AWS 側設定:
 * - SES で送信元ドメイン / メールアドレスを検証
 * - サンドボックス解除（任意アドレスへ送信するため）
 * - Vercel / Lambda 実行ロール or IAM ユーザーに ses:SendEmail 権限
 * - SPF / DKIM / DMARC（到達率向上）
 */

export function getSesRegion(): string {
  return process.env.AWS_REGION?.trim() || "ap-northeast-1";
}

/** マガジン送信元。未設定時は相談フォームと同じ CONTACT_NOTIFY_FROM を使用 */
export function getNewsletterFrom(): string | null {
  const from =
    process.env.NEWSLETTER_FROM?.trim() ||
    process.env.CONTACT_NOTIFY_FROM?.trim();
  return from || null;
}

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_APP_URL?.trim() ||
    "https://subsidy.nihon-teikei.co.jp";
  return raw.replace(/\/$/, "");
}

export function isEmailConfigured(): boolean {
  return Boolean(getNewsletterFrom());
}

export function assertEmailConfigured(context: string): string {
  const from = getNewsletterFrom();
  if (!from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        `[${context}] NEWSLETTER_FROM or CONTACT_NOTIFY_FROM is not configured.`,
      );
    }
    throw new Error(
      `[${context}] Email from-address is not configured (dev skip).`,
    );
  }
  return from;
}
