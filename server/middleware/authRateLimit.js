import rateLimit from "express-rate-limit";

// Stricter than the general /api limiter — login/register/password-reset
// are the endpoints brute-force and credential-stuffing attempts actually
// target, so they get their own tighter budget independent of normal
// browsing traffic.
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts — please try again later." },
});

// Its own budget, separate from authRateLimit — coupon codes are guessable
// secrets too, but a legitimate shopper retrying a mistyped code shouldn't
// share the same tight bucket as login/register attempts.
export const couponRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts — please try again later." },
});
