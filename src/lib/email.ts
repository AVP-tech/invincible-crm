import nodemailer from "nodemailer";
import { logger } from "./logger";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const DEFAULT_FROM_EMAIL = `"Invincible CRM" <${smtpUser}>`;

let transporter: nodemailer.Transporter | null = null;

if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!transporter) {
    logger.warn("Email requested but SMTP credentials are not set in .env. Skipping sending.", { to, subject });
    return false;
  }



  try {
    const info = await transporter.sendMail({
      from: DEFAULT_FROM_EMAIL,
      to,
      subject,
      html
    });

    logger.info("Email sent successfully", { messageId: info.messageId, to });
    return true;
  } catch (error) {
    logger.error("Exception thrown while sending email via SMTP", error);
    return false;
  }
}
