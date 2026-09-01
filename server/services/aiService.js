import { ApiError } from "../utils/ApiError.js";
import { openai, isAiConfigured, AI_MODEL } from "../config/openai.js";
import {
  searchProductDocs,
  getProductDoc,
  checkAvailability,
  hydrateProductDocs,
  getCategoryHint,
  toAiPrompt,
} from "./aiProductTools.js";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_CHAT_ITERATIONS = 5;
const MAX_HISTORY_MESSAGES = 8;

function unavailable(message) {
  return new ApiError(503, message);
}

// ── AI Fashion Stylist ──────────────────────────────────────────────────
// Retrieval happens in code, BEFORE the model is ever called: we search the
// real catalog first, then hand the model only those candidates and force
// it to reference them by id. It can never introduce a product, price, or
// id that doesn't already exist in Mongo.

const STYLIST_SYSTEM_PROMPT = `You are VELORA's AI fashion stylist for a premium clothing brand. You will be given the customer's request and a JSON array of real, currently available products (each with id, name, price, colors, sizes, category, material, tags, description).

Rules:
- ONLY use products from the provided list. Reference them by "id" exactly as given. Never invent an id, name, price, or product that isn't in the list.
- Build one complete outfit using 2 to 4 complementary items that best fit the requested occasion, style, and budget. If a strong, meaningfully different second option exists, include a second outfit (max 2 total). It's fine to return fewer items, or one outfit, if that's all that genuinely fits.
- For each item, give a short one-sentence reason it belongs in the outfit.
- If the provided products don't comfortably fit the budget or request, say so plainly in "message" rather than forcing a bad match.
- Respond with ONLY strict JSON, no markdown, in exactly this shape:
{"outfits":[{"title":string,"items":[{"id":string,"reason":string}]}],"message":string}`;

export async function generateFashionAdvice({ occasion, style, budgetMin, budgetMax, colors, category, notes }) {
  if (!isAiConfigured) {
    throw unavailable("AI Fashion Stylist is temporarily unavailable. Please try again later.");
  }

  const searchTerms = [occasion, style, notes, ...(colors || [])].filter(Boolean).join(" ").trim();

  let docs = await searchProductDocs({
    q: searchTerms || undefined,
    category,
    minPrice: budgetMin,
    maxPrice: budgetMax,
    colors,
    limit: 18,
  });
  // A category guess that matches nothing shouldn't sink the whole request —
  // retry once without it before giving up.
  if (!docs.length && category) {
    docs = await searchProductDocs({ q: searchTerms || undefined, minPrice: budgetMin, maxPrice: budgetMax, colors, limit: 18 });
  }

  if (!docs.length) {
    return {
      outfits: [],
      message: "We couldn't find pieces matching that combination right now — try a wider budget or a different color.",
    };
  }

  const candidatesById = new Map(docs.map((d) => [d._id.toString(), d]));
  const prompt = docs.map(toAiPrompt);

  let parsed = null;
  try {
    const completion = await openai.chat.completions.create(
      {
        model: AI_MODEL,
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: STYLIST_SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({ request: { occasion, style, budgetMin, budgetMax, colors, notes }, products: prompt }),
          },
        ],
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    parsed = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("aiService.generateFashionAdvice AI call failed:", err.message);
  }

  if (!parsed) {
    // Degrade gracefully rather than error out: the customer still gets
    // real, relevant products, just without AI-written outfit reasoning.
    const picks = docs.slice(0, 4);
    return {
      outfits: [
        {
          title: "Hand-Picked For You",
          total: picks.reduce((sum, d) => sum + d.price, 0),
          items: picks.map((product) => ({ product, reason: null })),
        },
      ],
      message: "AI styling is temporarily unavailable, so here are close matches from our collection.",
      degraded: true,
    };
  }

  const outfits = [];
  for (const outfit of (Array.isArray(parsed.outfits) ? parsed.outfits : []).slice(0, 2)) {
    const items = (Array.isArray(outfit.items) ? outfit.items : [])
      .filter((it) => it && typeof it.id === "string" && candidatesById.has(it.id))
      .map((it) => ({ product: candidatesById.get(it.id), reason: String(it.reason || "").slice(0, 200) }));
    if (!items.length) continue;

    outfits.push({
      title: String(outfit.title || "Your Look").slice(0, 60),
      total: items.reduce((sum, it) => sum + it.product.price, 0),
      items,
    });
  }

  return { outfits, message: String(parsed.message || "").slice(0, 300) };
}

// ── AI Shopping Assistant ───────────────────────────────────────────────
// Function-calling loop: the model can only learn about products by
// calling searchProducts/getProduct (which run the SAME real Mongo query
// as the stylist above), and can only surface product cards to the
// customer by calling presentProducts with ids it has actually seen —
// anything else is dropped before it ever reaches the client.

function chatSystemPrompt(categoryHint) {
  return `You are VELORA's AI shopping assistant — warm, concise, and knowledgeable about the catalog of a premium fashion brand. Help customers find real products, answer questions about availability and price, and suggest outfits.

Rules:
- NEVER invent product names, prices, sizes, colors, or availability. Only reference products returned by the searchProducts or getProduct tools during this conversation.
- Call searchProducts before recommending, comparing, or describing any specific product.
- When you want the app to display product cards for your answer, call presentProducts with the relevant ids (most relevant first, at most 4) — only ids that came from searchProducts or getProduct in this conversation are valid.
- Keep replies to 2-4 sentences, friendly and specific to what was asked.
- If nothing matches, say so plainly and suggest broadening the search (different color, higher budget, another category) rather than making something up.
- Store categories currently available: ${categoryHint || "(none configured yet)"}.`;
}

const CHAT_TOOLS = [
  {
    type: "function",
    function: {
      name: "searchProducts",
      description: "Search VELORA's real, current product catalog.",
      parameters: {
        type: "object",
        properties: {
          q: { type: "string", description: "Free-text keywords, e.g. 'black oversized hoodie'" },
          category: { type: "string", description: "A store category slug, if confidently known" },
          minPrice: { type: "number" },
          maxPrice: { type: "number" },
          colors: { type: "array", items: { type: "string" } },
          sizes: { type: "array", items: { type: "string" } },
          inStock: { type: "boolean" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getProduct",
      description: "Look up a single product by its id.",
      parameters: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    },
  },
  {
    type: "function",
    function: {
      name: "checkAvailability",
      description: "Check whether a specific size/color of a product is in stock.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" }, size: { type: "string" }, color: { type: "string" } },
        required: ["id", "size", "color"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "presentProducts",
      description: "Show product cards to the customer for the ids you're recommending, most relevant first.",
      parameters: {
        type: "object",
        properties: { ids: { type: "array", items: { type: "string" } } },
        required: ["ids"],
      },
    },
  },
];

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
}

async function executeTool(name, rawArgs, seenIds) {
  let args = {};
  try {
    args = JSON.parse(rawArgs || "{}");
  } catch {
    // malformed tool-call arguments — proceed with {} rather than fail the turn
  }

  switch (name) {
    case "searchProducts": {
      const docs = await searchProductDocs(args);
      docs.forEach((d) => seenIds.add(d._id.toString()));
      return { products: docs.map(toAiPrompt) };
    }
    case "getProduct": {
      const doc = await getProductDoc(args.id);
      if (doc) seenIds.add(doc._id.toString());
      return doc ? { product: toAiPrompt(doc) } : { error: "Not found" };
    }
    case "checkAvailability":
      return checkAvailability(args);
    case "presentProducts": {
      const ids = Array.isArray(args.ids) ? args.ids.filter((id) => seenIds.has(id)).slice(0, 4) : [];
      return { presented: ids };
    }
    default:
      return { error: "Unknown tool" };
  }
}

export async function chatWithAssistant({ message, history }) {
  if (!isAiConfigured) {
    throw unavailable("The shopping assistant is temporarily unavailable. Please try again later.");
  }
  if (!message || !String(message).trim()) {
    throw ApiError.badRequest("Message is required");
  }

  const categoryHint = await getCategoryHint();
  const messages = [
    { role: "system", content: chatSystemPrompt(categoryHint) },
    ...sanitizeHistory(history),
    { role: "user", content: String(message).slice(0, 1000) },
  ];

  const seenIds = new Set();
  let presentedIds = [];
  let reply = null;

  try {
    for (let i = 0; i < MAX_CHAT_ITERATIONS; i++) {
      const completion = await openai.chat.completions.create(
        { model: AI_MODEL, messages, tools: CHAT_TOOLS, tool_choice: "auto", temperature: 0.4 },
        { timeout: REQUEST_TIMEOUT_MS }
      );
      const msg = completion.choices[0].message;

      if (!msg.tool_calls?.length) {
        reply = msg.content?.trim() || null;
        break;
      }

      messages.push({ role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls });

      for (const call of msg.tool_calls) {
        const result = await executeTool(call.function.name, call.function.arguments, seenIds);
        if (call.function.name === "presentProducts" && result.presented) presentedIds = result.presented;
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
    }
  } catch (err) {
    console.error("aiService.chatWithAssistant AI call failed:", err.message);
    throw unavailable("The shopping assistant is temporarily unavailable. Please try again in a moment.");
  }

  const idsToShow = presentedIds.length ? presentedIds : [...seenIds].slice(0, 4);
  const products = await hydrateProductDocs(idsToShow);

  return {
    reply: reply || "Here's what I found — let me know if you'd like something different.",
    products,
  };
}
