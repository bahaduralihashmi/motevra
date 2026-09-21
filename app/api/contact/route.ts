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

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
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

    if (!response.ok) {
      const error = await response.text();
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Unable to send your message right now." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
