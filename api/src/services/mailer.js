const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendPasswordReset(email, username, link) {
  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;background:#0a0a0a;font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:#f9f9f9;">
    <div style="max-width:600px;margin:28px auto;padding:0 16px;">
      <div style="text-align:center;padding:18px 0;">
        <a href="${'www.worksense.pl'}" style="text-decoration:none;display:inline-block">
          <img src="data:image/png;base64,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" crossorigin="anonymous" loading="eager" alt="WorkSense" style="height:44px;display:block;margin:0 auto;" />
        </a>
      </div>

      <div style="background:#151519;border-radius:12px;padding:28px;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
        <h2 style="margin:0 0 8px;font-size:20px;color:#f9f9f9;">Resetowanie hasła</h2>
        <p style="margin:0 0 16px;color:#a6a6a6;">Cześć ${username || ''},</p>
        <p style="margin:0 0 18px;color:#a6a6a6;line-height:1.5">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta WorkSense. Aby ustawić nowe hasło, kliknij przycisk poniżej. Link jest ważny przez 30 minut.</p>

        <p style="text-align:center;margin:22px 0;">
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#12A150;color:#f9f9f9;border-radius:8px;text-decoration:none;font-weight:600;">Zresetuj hasło</a>
        </p>

        <p style="font-size:13px;color:a6a6a6;margin:0 0 12px;text-align:center">Jeśli przycisk nie działa, skopiuj i wklej poniższy link do paska adresu:</p>
        <p style="word-break:break-all;color:#12A150;font-size:13px;text-align:center;margin:0 0 16px;"><a href="${link}" style="color:#12A150;text-decoration:none">${link}</a></p>

        <hr style="border:none;border-top:1px solid #eef2f7;margin:20px 0" />

        <p style="font-size:13px;color:#a6a6a6;margin:0">Jeśli nie prosiłeś(-aś) o reset hasła, zignoruj tę wiadomość.</p>
      </div>

      <div style="text-align:center;color:#a6a6a6;font-size:12px;margin-top:12px;">
        <p style="margin:6px 0 0">Pozdrawiamy — Zespół WorkSense</p>
      </div>
    </div>
  </body>
  </html>`;
  return transporter.sendMail({
    from: `WorkSense <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset hasła – WorkSense',
    html,
  });
}

module.exports = { sendPasswordReset };