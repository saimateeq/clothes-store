const RESEND_API_URL = "https://api.resend.com/emails";

// Resend over HTTPS instead of raw SMTP — Render's network doesn't reliably
// deliver outbound SMTP (port 587) to Gmail (connections just hang until
// they time out), but HTTPS to Resend's API works the same as any other
// third-party API call.
export const createEmailClient = (env = process.env) => {
  const apiKey = env.RESEND_API_KEY;
  const isEmailConfigured = Boolean(apiKey);

  async function sendMail({ from, to, subject, html }) {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || `Resend request failed with status ${response.status}`);
    }

    return response.json();
  }

  return { isEmailConfigured, sendMail };
};

const { isEmailConfigured, sendMail } = createEmailClient();

if (!isEmailConfigured) {
  console.warn(
    "Email is not configured — set RESEND_API_KEY in server/.env. " +
      "Emails will be logged to the console instead of sent."
  );
}

export { isEmailConfigured, sendMail };
