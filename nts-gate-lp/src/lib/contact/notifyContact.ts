/**
 * お問い合わせ通知ロジック
 *
 * - CONTACT_NOTIFY_TO / CONTACT_NOTIFY_FROM を環境変数で管理
 * - 本番 (NODE_ENV === "production") で CONTACT_NOTIFY_TO 未設定 → エラーをスローしてDB保存後に検知可能にする
 * - 開発環境では未設定時は警告ログのみ（ソフトスキップ）
 * - 個人情報を console.log しない
 * - 将来の CRM 連携はこの関数の実装を差し替えるだけでよい
 */

import { sendEmail } from "@/lib/email/sendEmail";

export type ContactPayload = {
  name: string;
  email: string;
  company: string | null;
  message: string;
  source: string | null;
};

/** DB 保存後に呼び出す通知処理。CRM への差し替えはこの関数のみ変更する */
export async function notifyContact(payload: ContactPayload): Promise<void> {
  const to = process.env.CONTACT_NOTIFY_TO?.trim();
  const from =
    process.env.CONTACT_NOTIFY_FROM?.trim() ||
    process.env.NEWSLETTER_FROM?.trim();

  if (!to) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[notifyContact] CONTACT_NOTIFY_TO is not configured. " +
          "Set this environment variable before accepting live inquiries.",
      );
    }
    console.warn("[notifyContact] CONTACT_NOTIFY_TO is not set. Skipping notification (dev mode).");
    return;
  }

  if (!from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[notifyContact] CONTACT_NOTIFY_FROM is not configured. " +
          "Set this environment variable before accepting live inquiries.",
      );
    }
    console.warn("[notifyContact] CONTACT_NOTIFY_FROM is not set. Skipping notification (dev mode).");
    return;
  }

  const subject = `[NTS] 無料相談フォーム 新着問い合わせ`;
  const body = buildEmailBody(payload);

  try {
    await sendEmail({
      to,
      from,
      subject,
      text: body,
      context: "notifyContact",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`[notifyContact] SES send failed: ${message}`);
  }
}

/** メール本文を組み立てる（個人情報はメール本文にのみ含まれ、ログには出力しない） */
function buildEmailBody(p: ContactPayload): string {
  const lines = [
    "NTS 無料相談フォームに新しいお問い合わせが届きました。",
    "",
    "── お問い合わせ内容 ──────────────────────",
    `お名前    : ${p.name}`,
    `会社名    : ${p.company ?? "（未入力）"}`,
    `メール    : ${p.email}`,
    `流入元    : ${p.source ?? "（不明）"}`,
    "",
    `お問い合わせ内容:`,
    p.message,
    "────────────────────────────────────────",
    "",
    "このメールは自動送信です。返信しないでください。",
  ];
  return lines.join("\n");
}
