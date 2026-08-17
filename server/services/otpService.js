import crypto from "crypto";

export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const PENDING_TTL_MS = 60 * 60 * 1000; // abandoned attempts self-clean after 1 hour
export const MAX_OTP_ATTEMPTS = 5;

export function generateOtp() {
  // 6-digit numeric code, zero-padded (crypto.randomInt, not Math.random).
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}
