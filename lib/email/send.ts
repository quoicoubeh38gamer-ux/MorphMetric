import { LEGAL } from "@/lib/legal";

/**
 * Transactional email.
 *
 * Resend is used when RESEND_API_KEY is set. It is called over plain fetch
 * rather than through an SDK: one endpoint does not justify a dependency, and
 * the request is stable.
 *
 * When the key is absent — local development, or a deployment where email has
 * not been configured yet — the message is logged to the server console
 * instead of being silently dropped. A password reset that vanishes with no
 * trace is the kind of failure nobody notices until a user is locked out.
 */

export const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail(mail: Mail): Promise<{ sent: boolean; reason?: string }> {
  if (!emailEnabled) {
    console.warn(
      `[email] not configured — would have sent "${mail.subject}" to ${mail.to}.\n` +
        `Set RESEND_API_KEY and EMAIL_FROM to send for real. Body:\n${mail.text}`,
    );
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      }),
    });

    if (!res.ok) {
      // The provider's message can name the recipient, so it stays server-side.
      console.error("[email] provider rejected the message", res.status, await res.text());
      return { sent: false, reason: "provider_error" };
    }
    return { sent: true };
  } catch (error) {
    console.error("[email] could not reach the provider", error);
    return { sent: false, reason: "network_error" };
  }
}

/** Plain, unbranded, and short — a reset email that looks like marketing gets binned. */
export function passwordResetMail(to: string, url: string): Mail {
  const text = [
    `Reset your ${LEGAL.productName} password`,
    "",
    "Open this link to choose a new password:",
    url,
    "",
    "The link is valid for one hour and can be used once.",
    "If you did not ask for this, you can ignore this email — nothing has changed.",
    "",
    `${LEGAL.productName} · ${LEGAL.contactEmail}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en"><body style="margin:0;background:#f9fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#12131a">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <p style="font-size:20px;font-weight:600;margin:0 0 20px">Reset your ${LEGAL.productName} password</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#4a4f63">
      Click the button below to choose a new password.
    </p>
    <p style="margin:0 0 24px">
      <a href="${url}" style="display:inline-block;background:#0a0b0f;color:#f4f5f8;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">Choose a new password</a>
    </p>
    <p style="font-size:13px;line-height:1.6;color:#6b6f86;margin:0 0 8px">
      The link is valid for one hour and can be used once.
    </p>
    <p style="font-size:13px;line-height:1.6;color:#6b6f86;margin:0 0 24px">
      If you did not ask for this, ignore this email — nothing has changed.
    </p>
    <p style="font-size:12px;color:#8b8fa3;margin:0;border-top:1px solid #e6e8ef;padding-top:16px">
      ${LEGAL.productName} · ${LEGAL.contactEmail}
    </p>
  </div>
</body></html>`;

  return { to, subject: `Reset your ${LEGAL.productName} password`, text, html };
}
