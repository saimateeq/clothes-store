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
import { getOverviewStats, getSalesByCategory, getTopProducts, getLowStockProducts } from "./analyticsService.js";

const REQUEST_TIMEOUT_MS = 30_000;
const MAX_CHAT_ITERATIONS = 5;
const MAX_HISTORY_MESSAGES = 8;

function unavailable(message) {
  return new ApiError(503, message);
}

// Shared helper for the newer, single-shot JSON-mode calls below (outfit,
// size, admin copy/marketing/insights) — the Stylist and Chat above predate
// this and are left as-is since they're already verified working.
async function runJsonPrompt({ system, user, temperature = 0.5 }) {
  const completion = await openai.chat.completions.create(
    {
      model: AI_MODEL,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS }
  );
  return JSON.parse(completion.choices[0].message.content);
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

// ── AI Outfit Generator ─────────────────────────────────────────────────
// "Complete The Look" from one product: candidates come from the real
// catalog, excluding the product's own subcategory (so a dress isn't
// paired with another dress) — same id-only-from-the-given-list contract
// as the Stylist above.

const OUTFIT_SYSTEM_PROMPT = `You are VELORA's AI stylist helping a customer complete a look around one item they're already viewing. You'll get the base product and a JSON array of OTHER real, currently available candidate products.

Rules:
- ONLY use candidate products. Reference them by "id" exactly as given. Never invent one.
- Pick 3 to 4 candidates that genuinely complement the base product to complete a full outfit — different pieces (e.g. don't pick two tops).
- For each pick, give a short one-sentence reason it works with the base product specifically.
- Respond with ONLY strict JSON, no markdown: {"items":[{"id":string,"reason":string}]}`;

export async function generateOutfit({ productId }) {
  if (!isAiConfigured) {
    throw unavailable("Outfit suggestions are temporarily unavailable.");
  }

  const base = await getProductDoc(productId);
  if (!base) throw ApiError.notFound("Product not found");

  const baseSubcategory = base.subcategory?.toString();
  const pool = await searchProductDocs({ limit: 24 });
  const candidates = pool.filter(
    (c) => c._id.toString() !== base._id.toString() && c.subcategory?.toString() !== baseSubcategory
  );
  if (!candidates.length) return { items: [] };

  const candidatesById = new Map(candidates.map((d) => [d._id.toString(), d]));

  let parsed = null;
  try {
    parsed = await runJsonPrompt({
      system: OUTFIT_SYSTEM_PROMPT,
      user: JSON.stringify({ base: toAiPrompt(base), candidates: candidates.map(toAiPrompt) }),
    });
  } catch (err) {
    console.error("aiService.generateOutfit AI call failed:", err.message);
  }

  if (!parsed) {
    // Degrade to real, different-category picks rather than an error —
    // this is a bonus section on the product page, not a core flow.
    return {
      items: candidates.slice(0, 4).map((product) => ({ product, reason: null })),
      degraded: true,
    };
  }

  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .filter((it) => it && typeof it.id === "string" && candidatesById.has(it.id))
    .slice(0, 4)
    .map((it) => ({ product: candidatesById.get(it.id), reason: String(it.reason || "").slice(0, 200) }));

  return { items };
}

// ── AI Visual Product Search ────────────────────────────────────────────
// The model only ever describes the photo (type/color/pattern/style) —
// the actual product matches always come from a real searchProductDocs
// call against that description, never from the vision analysis directly.

const VISUAL_SEARCH_SYSTEM_PROMPT = `You are a fashion visual-analysis assistant. Look at the clothing photo and describe it factually and concisely — you are describing the photo, not guaranteeing an exact catalog match. Respond with ONLY strict JSON, no markdown:
{"clothingType":string,"colors":string[],"pattern":string,"style":string,"material":string|null,"fit":string|null,"searchQuery":string}
"searchQuery" is a short plain-language phrase (3-8 words) combining the type/color/style, suitable for a catalog text search. If the image doesn't clearly show a single wearable clothing/accessory item, set clothingType to "unclear" and searchQuery to "".`;

export async function analyzeAndSearchImage({ base64, mimeType }) {
  if (!isAiConfigured) {
    throw unavailable("Visual search is temporarily unavailable. Please try again later.");
  }

  let analysis;
  try {
    const completion = await openai.chat.completions.create(
      {
        model: AI_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: VISUAL_SEARCH_SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this clothing photo." },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
            ],
          },
        ],
      },
      { timeout: REQUEST_TIMEOUT_MS }
    );
    analysis = JSON.parse(completion.choices[0].message.content);
  } catch (err) {
    console.error("aiService.analyzeAndSearchImage AI call failed:", err.message);
    throw unavailable("We couldn't analyze that image right now. Please try again.");
  }

  if (!analysis || analysis.clothingType === "unclear" || !analysis.searchQuery) {
    return {
      analysis: null,
      products: [],
      message: "We couldn't clearly identify a single clothing item in that photo. Try a clearer, closer photo of one item.",
    };
  }

  const products = await searchProductDocs({
    q: analysis.searchQuery,
    colors: Array.isArray(analysis.colors) ? analysis.colors : undefined,
    limit: 12,
  });

  return {
    analysis: {
      clothingType: String(analysis.clothingType || "").slice(0, 60),
      colors: Array.isArray(analysis.colors) ? analysis.colors.slice(0, 5).map((c) => String(c).slice(0, 30)) : [],
      pattern: String(analysis.pattern || "").slice(0, 60),
      style: String(analysis.style || "").slice(0, 60),
      material: analysis.material ? String(analysis.material).slice(0, 60) : null,
      fit: analysis.fit ? String(analysis.fit).slice(0, 60) : null,
    },
    products,
    message: products.length
      ? "Similar styles from our collection."
      : "We identified the item, but couldn't find a close match in our current collection — try browsing the shop instead.",
  };
}

// ── AI Size Recommendation ──────────────────────────────────────────────
// The recommended size is always validated against the product's own real
// `sizes` array — an id/size the model invents is rejected, not shown.

const SIZE_SYSTEM_PROMPT = `You help a customer pick a size for ONE specific product using its real available sizes and whatever measurements/preferences they provided. You are not a medical or tailoring professional — this is general apparel-fit guidance only, never present it as guaranteed or exact.

Rules:
- The recommended size MUST be exactly one of the product's real available sizes given to you. Never invent a size.
- If the customer gave enough to reason about confidently (a usual size, height+weight, or actual body measurements), set confidence to "High" or "Medium".
- If the information given is sparse or ambiguous, set confidence to "Low" and say so plainly in "reason" rather than overstating certainty.
- Respond with ONLY strict JSON, no markdown: {"recommendedSize":string,"confidence":"Low"|"Medium"|"High","reason":string}`;

export async function recommendSize({ productId, height, weight, chest, waist, usualSize, preferredFit }) {
  if (!isAiConfigured) {
    throw unavailable("Size recommendations are temporarily unavailable.");
  }

  const product = await getProductDoc(productId);
  if (!product) throw ApiError.notFound("Product not found");

  if (!product.sizes?.length) {
    return { recommendedSize: null, confidence: "Low", reason: "This product doesn't have size options to recommend from." };
  }
  if (!height && !weight && !chest && !waist && !usualSize) {
    return {
      recommendedSize: null,
      confidence: "Low",
      reason: "Add at least your usual size or a measurement so we can make a recommendation.",
    };
  }

  let parsed;
  try {
    parsed = await runJsonPrompt({
      system: SIZE_SYSTEM_PROMPT,
      temperature: 0.3,
      user: JSON.stringify({
        product: {
          name: product.name,
          category: product.category?.name,
          sizes: product.sizes,
          material: product.material,
          description: (product.shortDescription || product.description || "").slice(0, 200),
        },
        customer: { height, weight, chest, waist, usualSize, preferredFit },
      }),
    });
  } catch (err) {
    console.error("aiService.recommendSize AI call failed:", err.message);
    throw unavailable("Size recommendations are temporarily unavailable. Please try again in a moment.");
  }

  const recommendedSize = product.sizes.includes(parsed?.recommendedSize) ? parsed.recommendedSize : null;
  if (!recommendedSize) {
    return {
      recommendedSize: null,
      confidence: "Low",
      reason: "We couldn't confidently match your details to one of this product's sizes — check the size guide or contact us.",
    };
  }

  const confidence = ["Low", "Medium", "High"].includes(parsed.confidence) ? parsed.confidence : "Low";
  return { recommendedSize, confidence, reason: String(parsed.reason || "").slice(0, 300) };
}

// ── Admin: AI Product Description Generator ─────────────────────────────
// Pure text generation from admin-supplied facts — nothing here touches
// the database. The admin panel applies fields to the product form (and
// ultimately saves it) only after explicit confirmation; this function
// never writes anything itself.

const PRODUCT_DESCRIPTION_SYSTEM_PROMPT = `You are a copywriter for VELORA, a premium fashion brand. Write product copy from the admin's raw inputs. Tone: elevated, concise, sensory — avoid generic AI marketing filler like "elevate your wardrobe" or "must-have". Respond with ONLY strict JSON, no markdown:
{"description":string,"shortDescription":string,"highlights":string[],"seoTitle":string,"seoMetaDescription":string,"tags":string[],"socialCaption":string}
"description": 2-4 sentences. "shortDescription": under 20 words. "highlights": 3-5 short bullet phrases. "seoTitle": under 60 characters. "seoMetaDescription": under 155 characters. "tags": 4-8 lowercase one-or-two-word tags. "socialCaption": an Instagram-style caption under 300 characters, tasteful, at most 2-4 relevant hashtags.`;

export async function generateProductDescription({ name, category, material, color, features, fit, audience, price }) {
  if (!isAiConfigured) {
    throw unavailable("AI copy generation is temporarily unavailable.");
  }
  if (!name) throw ApiError.badRequest("Product name is required");

  let parsed;
  try {
    parsed = await runJsonPrompt({
      system: PRODUCT_DESCRIPTION_SYSTEM_PROMPT,
      temperature: 0.7,
      user: JSON.stringify({ name, category, material, color, features, fit, audience, price }),
    });
  } catch (err) {
    console.error("aiService.generateProductDescription AI call failed:", err.message);
    throw unavailable("AI copy generation is temporarily unavailable. Please try again in a moment.");
  }

  return {
    description: String(parsed.description || "").slice(0, 2000),
    shortDescription: String(parsed.shortDescription || "").slice(0, 200),
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights.slice(0, 5).map((h) => String(h).slice(0, 120)) : [],
    seoTitle: String(parsed.seoTitle || "").slice(0, 70),
    seoMetaDescription: String(parsed.seoMetaDescription || "").slice(0, 200),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8).map((t) => String(t).toLowerCase().slice(0, 30)) : [],
    socialCaption: String(parsed.socialCaption || "").slice(0, 500),
  };
}

// ── Admin: AI Marketing Content Generator ───────────────────────────────

const MARKETING_CONTENT_TYPES = new Set([
  "instagram_caption",
  "facebook_post",
  "email_campaign",
  "whatsapp_promo",
  "ad_copy",
  "product_launch",
  "sale_announcement",
]);

const MARKETING_SYSTEM_PROMPT = `You are a marketing copywriter for VELORA, a premium fashion brand. Generate marketing copy grounded ONLY in the real product/campaign details given — never invent a price, discount, or product fact that wasn't provided. Respond with ONLY strict JSON, no markdown:
{"variations":[{"headline":string|null,"body":string}]}
Generate exactly 3 distinct variations fitting the requested content type and tone. Respect platform conventions: Instagram is short and hashtag-light; Email has a clear subject-line-style headline; WhatsApp is short and personal; Ad Copy is punchy with a clear call to action.`;

export async function generateMarketingContent({ productId, contentType, audience, tone, offer, goal }) {
  if (!isAiConfigured) {
    throw unavailable("AI marketing generation is temporarily unavailable.");
  }
  if (!MARKETING_CONTENT_TYPES.has(contentType)) {
    throw ApiError.badRequest("Unknown content type");
  }

  let product = null;
  if (productId) {
    product = await getProductDoc(productId);
    if (!product) throw ApiError.notFound("Product not found");
  }

  let parsed;
  try {
    parsed = await runJsonPrompt({
      system: MARKETING_SYSTEM_PROMPT,
      temperature: 0.8,
      user: JSON.stringify({ contentType, audience, tone, offer, goal, product: product ? toAiPrompt(product) : null }),
    });
  } catch (err) {
    console.error("aiService.generateMarketingContent AI call failed:", err.message);
    throw unavailable("AI marketing generation is temporarily unavailable. Please try again in a moment.");
  }

  const variations = (Array.isArray(parsed.variations) ? parsed.variations : [])
    .slice(0, 5)
    .map((v) => ({ headline: v.headline ? String(v.headline).slice(0, 120) : null, body: String(v.body || "").slice(0, 1500) }))
    .filter((v) => v.body);

  return { variations };
}

// ── Admin: AI Sales Insights ─────────────────────────────────────────────
// All numbers come from analyticsService's existing real Mongo aggregations
// (already used by the Dashboard) — the model only writes a narrative on
// top of them, and is explicitly told never to invent a statistic.

const INSIGHTS_SYSTEM_PROMPT = `You are a retail analyst for VELORA, a premium fashion brand. You'll be given real store metrics that are already computed — never recompute, round differently, or contradict them. Write 3 to 6 short, specific, actionable insights a store owner would find useful. Every claim must be directly supported by the numbers given — never invent a statistic, trend, or product fact absent from the data. If the data is too sparse to say anything meaningful, say so plainly instead of padding with generic advice. Respond with ONLY strict JSON, no markdown:
{"insights":[{"summary":string,"detail":string}]}`;

export async function generateSalesInsights({ range = "30d" }) {
  if (!isAiConfigured) {
    throw unavailable("AI insights are temporarily unavailable.");
  }

  const [overview, salesByCategory, topProducts, lowStock] = await Promise.all([
    getOverviewStats(range),
    getSalesByCategory(range),
    getTopProducts(range, 8),
    getLowStockProducts(8),
  ]);

  const metrics = {
    range,
    overview,
    salesByCategory,
    topProducts: topProducts.map((p) => ({ name: p.name, unitsSold: p.unitsSold, revenue: p.revenue })),
    lowStock: lowStock.map((p) => ({ name: p.name, totalInventory: p.totalInventory, lowStockThreshold: p.lowStockThreshold })),
  };

  let parsed = null;
  try {
    parsed = await runJsonPrompt({ system: INSIGHTS_SYSTEM_PROMPT, temperature: 0.4, user: JSON.stringify(metrics) });
  } catch (err) {
    console.error("aiService.generateSalesInsights AI call failed:", err.message);
  }

  const insights = parsed
    ? (Array.isArray(parsed.insights) ? parsed.insights : [])
        .slice(0, 6)
        .map((i) => ({ summary: String(i.summary || "").slice(0, 160), detail: String(i.detail || "").slice(0, 400) }))
        .filter((i) => i.summary)
    : [];

  return { metrics, insights, degraded: !parsed };
}
