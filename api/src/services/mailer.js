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
  <div style="font-family:sans-serif">
    <p>Cześć ${username || ''},</p>
    <p>Otrzymaliśmy prośbę o zresetowanie hasła. Kliknij poniższy link (ważny 30 minut):</p>
    <p><a href="${link}" style="color:#2563eb">${link}</a></p>
    <p>Jeśli to nie Ty, zignoruj wiadomość.</p>
    <p>Pozdrawiamy,<br/>Zespół WorkSense</p>
  </div>`;
  return transporter.sendMail({
    from: `WorkSense <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset hasła – WorkSense',
    html,
  });
}

module.exports = { sendPasswordReset };