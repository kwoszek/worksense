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
  <body style="margin:0;background:#f6f8fb;font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;color:#111;">
    <div style="max-width:600px;margin:28px auto;padding:0 16px;">
      <div style="text-align:center;padding:18px 0;">
        <a href="${'www.worksense.pl'}" style="text-decoration:none;display:inline-block">
          <img src="${'https://i.imgur.com/a4S79Dl.png'}" alt="WorkSense" style="height:44px;display:block;margin:0 auto;" />
        </a>
      </div>

      <div style="background:#ffffff;border-radius:12px;padding:28px;box-shadow:0 6px 18px rgba(16,24,40,0.06);">
        <h2 style="margin:0 0 8px;font-size:20px;color:#0f172a;">Resetowanie hasła</h2>
        <p style="margin:0 0 16px;color:#475569;">Cześć ${username || ''},</p>
        <p style="margin:0 0 18px;color:#475569;line-height:1.5">Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta WorkSense. Aby ustawić nowe hasło, kliknij przycisk poniżej. Link jest ważny przez 30 minut.</p>

        <p style="text-align:center;margin:22px 0;">
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;border-radius:8px;text-decoration:none;font-weight:600;">Zresetuj hasło</a>
        </p>

        <p style="font-size:13px;color:#64748b;margin:0 0 12px;text-align:center">Jeśli przycisk nie działa, skopiuj i wklej poniższy link do paska adresu:</p>
        <p style="word-break:break-all;color:#2563eb;font-size:13px;text-align:center;margin:0 0 16px;"><a href="${link}" style="color:#2563eb;text-decoration:none">${link}</a></p>

        <hr style="border:none;border-top:1px solid #eef2f7;margin:20px 0" />

        <p style="font-size:13px;color:#94a3b8;margin:0">Jeśli nie prosiłeś(-aś) o reset hasła, zignoruj tę wiadomość.</p>
      </div>

      <div style="text-align:center;color:#94a3b8;font-size:12px;margin-top:12px;">
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