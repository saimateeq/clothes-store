import transporter, { isEmailConfigured } from "../config/email.js";

const FROM = process.env.EMAIL_FROM || "VELORA <no-reply@velora.com>";

function layout({ title, body }) {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;background:#F7F5F0;padding:40px 20px;">
      <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border:1px solid #E3DFD6;padding:40px;">
        <p style="letter-spacing:0.2em;font-size:13px;color:#171717;margin:0 0 32px;">VELORA</p>
        <h1 style="font-family:Georgia,serif;font-weight:500;font-size:26px;color:#171717;margin:0 0 16px;">${title}</h1>
        <div style="font-size:14px;line-height:1.7;color:#6F6A61;">${body}</div>
      </div>
    </div>
  `;
}

async function send({ to, subject, html }) {
  if (!isEmailConfigured) {
    console.log(`[email:disabled] Would send "${subject}" to ${to}\n${html.replace(/<[^>]+>/g, " ").trim()}`);
    return { delivered: false };
  }
  await transporter.sendMail({ from: FROM, to, subject, html });
  return { delivered: true };
}

export const sendWelcomeEmail = (user) =>
  send({
    to: user.email,
    subject: "Welcome to VELORA",
    html: layout({
      title: `Welcome, ${user.name.split(" ")[0]}`,
      body: `Your VELORA account has been created. Thank you for joining us — designed for the everyday.`,
    }),
  });

export const sendPasswordResetEmail = (user, resetUrl) =>
  send({
    to: user.email,
    subject: "Reset your VELORA password",
    html: layout({
      title: "Reset your password",
      body: `We received a request to reset your password. This link expires in 30 minutes.<br/><br/>
        <a href="${resetUrl}" style="color:#B89B72;">Reset password →</a><br/><br/>
        If you didn't request this, you can safely ignore this email.`,
    }),
  });

export const sendOtpEmail = ({ name, email }, otp) =>
  send({
    to: email,
    subject: `${otp} is your VELORA verification code`,
    html: layout({
      title: `Verify your email`,
      body: `Hi ${name.split(" ")[0]}, use this code to finish creating your account. It expires in 10 minutes.<br/><br/>
        <span style="display:inline-block;font-family:Georgia,serif;font-size:32px;letter-spacing:0.3em;color:#171717;">${otp}</span><br/><br/>
        If you didn't request this, you can safely ignore this email.`,
    }),
  });

export default { sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail };
