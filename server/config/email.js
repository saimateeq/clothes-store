import nodemailer from "nodemailer";

export const isEmailConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  console.warn(
    "Email is not configured — set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in server/.env. " +
      "Emails will be logged to the console instead of sent."
  );
}

export default transporter;
