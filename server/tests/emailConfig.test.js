import test from "node:test";
import assert from "node:assert/strict";

import { createEmailTransport } from "../config/email.js";

test("email transport sets short SMTP timeouts to avoid hanging registration requests", () => {
  const { isEmailConfigured, transporter } = createEmailTransport({
    SMTP_HOST: "smtp.gmail.com",
    SMTP_USER: "user@gmail.com",
    SMTP_PASSWORD: "secret",
  });

  assert.equal(isEmailConfigured, true);
  assert.equal(transporter.options.connectionTimeout, 15000);
  assert.equal(transporter.options.greetingTimeout, 15000);
  assert.equal(transporter.options.socketTimeout, 20000);
});
