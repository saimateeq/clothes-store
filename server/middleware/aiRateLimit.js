import rateLimit from "express-rate-limit";

// AI requests hit a paid external API — a tighter, dedicated budget keeps
// cost and abuse bounded independently of the general /api rate limit.
export const aiRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "You're sending requests a little fast — please wait a moment and try again." },
});
