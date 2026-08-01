import nodemailer from "nodemailer";
import { env } from "../../config/env.js";

let transporter;

// Lazily built so importing this module (e.g. in tests, which mock
// sendMail directly) never requires SMTP_* to be configured.
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    });
  }
  return transporter;
}

export async function sendMail({ to, subject, html }) {
  return getTransporter().sendMail({ from: env.MAIL_FROM, to, subject, html });
}
