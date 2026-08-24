import nodemailer from "nodemailer";

export const createEmailTransport = (env = process.env) => {
  const smtpHost = env.SMTP_HOST;
  const smtpUser = env.SMTP_USER;
  const smtpPassword = env.SMTP_PASSWORD;

  const isEmailConfigured = Boolean(smtpHost && smtpUser && smtpPassword);

  const transporter = isEmailConfigured
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(env.SMTP_PORT) || 587,
        secure: Number(env.SMTP_PORT) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false,
        },
      })
    : null;

  return { isEmailConfigured, transporter };
};

const { isEmailConfigured, transporter } = createEmailTransport();

if (!isEmailConfigured) {
  console.warn(
    "Email is not configured — set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in server/.env. " +
      "Emails will be logged to the console instead of sent."
  );
}

export { isEmailConfigured };
export default transporter;
