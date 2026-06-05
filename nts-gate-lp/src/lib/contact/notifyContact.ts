/**
 * お問い合わせ通知ロジック
 *
 * - CONTACT_NOTIFY_TO / CONTACT_NOTIFY_FROM を環境変数で管理
 * - CONTACT_NOTIFY_TO はカンマ区切りで複数アドレス指定可能
 *   例: info@nihon-teikei.com,your@email.com
 * - 本番 (NODE_ENV === "production") で必須変数未設定 → エラーをスロー
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
  const toRaw = process.env.CONTACT_NOTIFY_TO?.trim();
  const from =
    process.env.CONTACT_NOTIFY_FROM?.trim() ||
    process.env.NEWSLETTER_FROM?.trim();

  if (!toRaw) {
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

  // カンマ区切りを分割して重複除去（担当者・テスト用アドレス複数対応）
  const toAddresses = [...new Set(
    toRaw.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
  )];

  // ① 担当者への社内通知 ＋ ② 問い合わせ者への自動返信 を並列送信
  const sends: Promise<unknown>[] = [
    ...toAddresses.map((to) =>
      sendEmail({
        to,
        from,
        subject: `[NTS] 無料相談フォーム 新着問い合わせ`,
        text: buildNotifyBody(payload),
        context: "notifyContact",
      })
    ),
    sendEmail({
      to: payload.email,
      from,
      subject: `【日本提携支援】無料相談のお申し込みを受け付けました`,
      text: buildAutoReplyBody(payload),
      context: "autoReply",
    }),
  ];

  const results = await Promise.allSettled(sends);

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    const messages = failures
      .map((r) => (r as PromiseRejectedResult).reason?.message ?? String((r as PromiseRejectedResult).reason))
      .join(", ");
    // デバッグ用：どのアドレスで失敗したか記録（PII注意・解決後削除）
    console.error(`[notifyContact] from="${from}" toAddresses=${JSON.stringify(toAddresses)} userEmail="${payload.email}"`);
    throw new Error(`[notifyContact] SES send failed: ${messages}`);
  }
}

/** source 値を人間が読みやすいラベルに変換 */
function formatSource(source: string | null): string {
  if (!source) return "（不明）";
  const map: Record<string, string> = {
    consult:     "補助金サービスページ（/consult）",
    subsidies:   "補助金一覧ページ（/subsidies）",
    lp:          "トップLP",
    check:       "補助金診断ページ",
    partner:     "パートナーページ",
  };
  return map[source] ?? source;
}

/** 担当者向け社内通知メール本文 */
function buildNotifyBody(p: ContactPayload): string {
  const lines = [
    "NTS 無料相談フォームに新しいお問い合わせが届きました。",
    "",
    "── お問い合わせ内容 ──────────────────────",
    `お名前    : ${p.name}`,
    `会社名    : ${p.company ?? "（未入力）"}`,
    `メール    : ${p.email}`,
    `流入元    : ${formatSource(p.source)}`,
    "",
    "お問い合わせ内容:",
    p.message,
    "────────────────────────────────────────",
    "",
    "このメールは自動送信です。返信しないでください。",
  ];
  return lines.join("\n");
}

/** 問い合わせ者向け自動返信メール本文 */
function buildAutoReplyBody(p: ContactPayload): string {
  const lines = [
    `${p.name} 様`,
    "",
    "この度は日本提携支援の無料相談フォームにお申し込みいただき、",
    "誠にありがとうございます。",
    "",
    "以下の内容でお問い合わせを受け付けました。",
    "担当者より改めてご連絡差し上げますので、",
    "今しばらくお待ちいただけますようお願いいたします。",
    "",
    "── お申し込み内容（控え）────────────────",
    `お名前    : ${p.name}`,
    `会社名    : ${p.company ?? "（未入力）"}`,
    `メール    : ${p.email}`,
    "",
    "お問い合わせ内容:",
    p.message,
    "────────────────────────────────────────",
    "",
    "※ このメールは自動送信です。このメールへの返信はお受けできません。",
    "　 ご不明な点は info@nihon-teikei.com までお気軽にお問い合わせください。",
    "",
    "──────────────────────────────",
    "日本提携支援",
    "https://subsidy-nts-v2.vercel.app/",
    "──────────────────────────────",
  ];
  return lines.join("\n");
}
