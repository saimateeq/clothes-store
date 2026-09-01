import OpenAI from "openai";

// Same "degrade gracefully when unconfigured" pattern as config/cloudinary.js
// and config/email.js — the rest of the app checks isAiConfigured and
// returns a friendly 503 instead of crashing when OPENAI_API_KEY is unset.
const configured = Boolean(process.env.OPENAI_API_KEY);

export const openai = configured ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
export const isAiConfigured = configured;

// A small, cheap model is the right default for structured JSON generation
// and tool-calling over a product catalog — override via env if needed.
export const AI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

if (!configured) {
  console.warn(
    "OpenAI is not configured — set OPENAI_API_KEY in server/.env. AI features will return 503 until then."
  );
}

export default openai;
