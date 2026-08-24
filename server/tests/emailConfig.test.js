import test from "node:test";
import assert from "node:assert/strict";

import { createEmailClient } from "../config/email.js";

test("email client reports configured when RESEND_API_KEY is set", () => {
  const { isEmailConfigured } = createEmailClient({ RESEND_API_KEY: "re_test_key" });
  assert.equal(isEmailConfigured, true);
});

test("email client reports unconfigured when RESEND_API_KEY is missing", () => {
  const { isEmailConfigured } = createEmailClient({});
  assert.equal(isEmailConfigured, false);
});

test("sendMail throws a readable error on a non-ok Resend response", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () =>
    new Response(JSON.stringify({ message: "Invalid `from` address" }), { status: 422 });

  try {
    const { sendMail } = createEmailClient({ RESEND_API_KEY: "re_test_key" });
    await assert.rejects(
      () => sendMail({ from: "a@a.com", to: "b@b.com", subject: "x", html: "<p>x</p>" }),
      /Invalid `from` address/
    );
  } finally {
    global.fetch = originalFetch;
  }
});
