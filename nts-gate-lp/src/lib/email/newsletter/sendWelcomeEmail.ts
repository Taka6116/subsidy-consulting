import { sendEmail } from "@/lib/email/sendEmail";
import { buildWelcomeEmail } from "@/lib/email/newsletter/templates";

export async function sendWelcomeEmail(params: {
  email: string;
  unsubscribeToken: string;
}): Promise<void> {
  const message = buildWelcomeEmail(params.unsubscribeToken);
  await sendEmail({
    to: params.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
    context: "sendWelcomeEmail",
  });
}
