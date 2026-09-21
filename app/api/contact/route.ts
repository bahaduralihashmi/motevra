import { NextRequest, NextResponse } from "next/server";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Email service is not configured yet." }, { status: 503 });
    }

    const from = process.env.CONTACT_FROM_EMAIL || "MOTEVRA <onboarding@resend.dev>";
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    // 1. Send the full contact message to the MOTEVRA inbox.
    const ownerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: ["bahaduralihashmi@gmail.com"],
        reply_to: email,
        subject: `MOTEVRA Contact — ${subject}`,
        html: `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f0;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="padding:32px 16px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #deded8;">
        <div style="background:#111;padding:24px 28px;">
          <div style="font-size:24px;font-weight:800;letter-spacing:3px;color:#fff;">MOTEVRA</div>
          <div style="margin-top:6px;font-size:12px;letter-spacing:1.5px;color:#aaa;text-transform:uppercase;">New contact form message</div>
        </div>
        <div style="padding:28px;">
          <h1 style="margin:0 0 24px;font-size:24px;line-height:1.25;">${safeSubject}</h1>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:12px;font-weight:700;color:#777;width:110px;text-transform:uppercase;">Name</td>
              <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:15px;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:12px;font-weight:700;color:#777;text-transform:uppercase;">Email</td>
              <td style="padding:12px 0;border-bottom:1px solid #eee;font-size:15px;"><a href="mailto:${safeEmail}" style="color:#111;font-weight:700;">${safeEmail}</a></td>
            </tr>
          </table>
          <div style="font-size:12px;font-weight:700;color:#777;text-transform:uppercase;margin-bottom:10px;">Message</div>
          <div style="padding:18px;background:#f7f7f3;border-left:3px solid #f04b23;font-size:15px;line-height:1.7;word-break:break-word;">${safeMessage}</div>
          <div style="margin-top:28px;">
            <a href="mailto:${safeEmail}?subject=Re:%20${encodeURIComponent(subject)}" style="display:inline-block;background:#f04b23;color:#fff;text-decoration:none;padding:13px 20px;font-size:13px;font-weight:700;">Reply to ${safeName}</a>
          </div>
        </div>
        <div style="padding:18px 28px;border-top:1px solid #eee;font-size:11px;line-height:1.6;color:#888;">
          Sent from the MOTEVRA website contact form.<br />
          <a href="https://www.motevra.com/contact" style="color:#666;">www.motevra.com/contact</a>
        </div>
      </div>
    </div>
  </body>
</html>`,
        text: `MOTEVRA — New contact form message

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Reply to: ${email}
`,
      }),
    });

    if (!ownerResponse.ok) {
      const error = await ownerResponse.text();
      console.error("Resend owner email error:", error);
      return NextResponse.json({ error: "Unable to send your message right now." }, { status: 502 });
    }

    // 2. Send an automatic confirmation to the customer.
    const customerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers,
      body: JSON.stringify({
        from,
        to: [email],
        reply_to: "bahaduralihashmi@gmail.com",
        subject: "We received your message — MOTEVRA",
        html: `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f0;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <div style="padding:32px 16px;">
      <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #deded8;">
        <div style="background:#111;padding:26px 28px;">
          <div style="font-size:24px;font-weight:800;letter-spacing:3px;color:#fff;">MOTEVRA</div>
          <div style="margin-top:6px;font-size:12px;letter-spacing:1.5px;color:#aaa;text-transform:uppercase;">We received your message</div>
        </div>
        <div style="padding:32px 28px;">
          <p style="margin:0 0 12px;font-size:16px;">Hi ${safeName},</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">Thanks for reaching out.</h1>
          <p style="margin:0;color:#555;font-size:15px;line-height:1.7;">
            Your message has been received by the MOTEVRA team. We’ll review it and get back to you as soon as possible.
          </p>

          <div style="margin-top:28px;padding:18px;background:#f7f7f3;border-left:3px solid #f04b23;">
            <div style="font-size:11px;font-weight:700;color:#777;text-transform:uppercase;margin-bottom:7px;">Your subject</div>
            <div style="font-size:15px;font-weight:700;">${safeSubject}</div>
          </div>

          <p style="margin:28px 0 0;color:#555;font-size:14px;line-height:1.7;">
            Please keep this email for your records. If you need to add anything to your request, simply reply to this email.
          </p>

          <div style="margin-top:28px;">
            <a href="https://www.motevra.com" style="display:inline-block;background:#f04b23;color:#fff;text-decoration:none;padding:13px 20px;font-size:13px;font-weight:700;">Visit MOTEVRA</a>
          </div>
        </div>
        <div style="padding:18px 28px;border-top:1px solid #eee;font-size:11px;line-height:1.6;color:#888;">
          This is an automatic confirmation from MOTEVRA.<br />
          Please do not reply to this message unless you want to add information to your request.
        </div>
      </div>
    </div>
  </body>
</html>`,
        text: `MOTEVRA — We received your message

Hi ${name},

Thanks for reaching out. Your message has been received by the MOTEVRA team. We’ll review it and get back to you as soon as possible.

Your subject: ${subject}

Please keep this email for your records. If you need to add anything to your request, simply reply to this email.

MOTEVRA
https://www.motevra.com
`,
      }),
    });

    if (!customerResponse.ok) {
      // The owner notification succeeded. Do not report the whole form as failed.
      const error = await customerResponse.text();
      console.error("Resend customer confirmation error:", error);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
