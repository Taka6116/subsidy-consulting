import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  assertEmailConfigured,
  getSesRegion,
  isEmailConfigured,
} from "@/lib/email/sesConfig";

export type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** 未指定時は NEWSLETTER_FROM → CONTACT_NOTIFY_FROM */
  from?: string;
  /** ログ用コンテキスト（PII は含めない） */
  context?: string;
};

let sesClient: SESClient | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({ region: getSesRegion() });
  }
  return sesClient;
}

/** SES 経由で 1 通送信。未設定時は開発環境ではスキップ、本番では throw */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const context = params.context ?? "sendEmail";

  if (!isEmailConfigured() && !params.from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[${context}] SES from-address is not configured.`);
    }
    console.warn(`[${context}] Email not configured. Skipping send (dev mode).`);
    return false;
  }

  const from = params.from ?? assertEmailConfigured(context);
  const ses = getSesClient();

  const body: { Text: { Data: string; Charset: string }; Html?: { Data: string; Charset: string } } =
    {
      Text: { Data: params.text, Charset: "UTF-8" },
    };
  if (params.html) {
    body.Html = { Data: params.html, Charset: "UTF-8" };
  }

  await ses.send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: [params.to] },
      Message: {
        Subject: { Data: params.subject, Charset: "UTF-8" },
        Body: body,
      },
    }),
  );

  console.info(`[${context}] Email sent successfully.`);
  return true;
}

/** 複数宛先へ順次送信（SES レート制限を考慮して chunk 送信） */
export async function sendEmailBatch(
  recipients: string[],
  buildMessage: (to: string) => Omit<SendEmailParams, "to">,
  options?: { chunkSize?: number; context?: string },
): Promise<{ sent: number; failed: number }> {
  const chunkSize = options?.chunkSize ?? 10;
  const context = options?.context ?? "sendEmailBatch";
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < recipients.length; i += chunkSize) {
    const chunk = recipients.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map((to) =>
        sendEmail({
          to,
          ...buildMessage(to),
          context,
        }),
      ),
    );
    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        sent += 1;
      } else if (result.status === "rejected") {
        failed += 1;
        const message =
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason);
        console.error(`[${context}] batch send failed: ${message}`);
      }
    }
  }

  return { sent, failed };
}
