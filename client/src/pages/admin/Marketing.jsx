import { useState } from "react";
import { Sparkles, Copy, Check, X } from "lucide-react";
import { useSearchProductsQuery } from "../../features/products/productsApi";
import { useGenerateMarketingContentMutation } from "../../features/admin/adminAiApi";
import { useDebounce } from "../../hooks/useDebounce";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const CONTENT_TYPES = [
  { value: "instagram_caption", label: "Instagram Caption" },
  { value: "facebook_post", label: "Facebook Post" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "whatsapp_promo", label: "WhatsApp Message" },
  { value: "ad_copy", label: "Advertisement Copy" },
  { value: "product_launch", label: "Product Launch" },
  { value: "sale_announcement", label: "Sale Announcement" },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(text)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
          .catch(() => null);
      }}
      className="label flex shrink-0 items-center gap-1.5 text-muted hover:text-ink"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ProductPicker({ selected, onSelect, onClear }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useSearchProductsQuery(debouncedQuery, { skip: debouncedQuery.trim().length < 2 });
  const results = data?.data?.products ?? [];

  if (selected) {
    return (
      <div className="flex items-center justify-between border border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={selected.images?.[0]?.url} alt="" className="h-12 w-10 object-cover" />
          <div>
            <p className="text-sm font-medium">{selected.name}</p>
            <p className="text-xs text-muted">${selected.price}</p>
          </div>
        </div>
        <button type="button" onClick={onClear} aria-label="Remove product">
          <X size={16} strokeWidth={1.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a product to feature (optional — leave blank for a general campaign)"
        className="w-full border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
      />
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full border border-line bg-bg shadow-lg">
          {results.map((p) => (
            <li key={p._id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-line/40"
              >
                <img src={p.images?.[0]?.url} alt="" className="h-10 w-8 object-cover" />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Marketing() {
  useDocumentTitle("AI Marketing");
  const [product, setProduct] = useState(null);
  const [contentType, setContentType] = useState(CONTENT_TYPES[0].value);
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [offer, setOffer] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState(null);
  const [generate, { data, isLoading }] = useGenerateMarketingContentMutation();

  const handleGenerate = async () => {
    setError(null);
    try {
      await generate({
        productId: product?._id,
        contentType,
        audience: audience || undefined,
        tone: tone || undefined,
        offer: offer || undefined,
        goal: goal || undefined,
      }).unwrap();
    } catch (err) {
      setError(err?.data?.message || "AI marketing generation is temporarily unavailable.");
    }
  };

  const variations = data?.data?.variations ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="label flex items-center gap-2 text-accent">
          <Sparkles size={13} strokeWidth={1.5} /> AI Marketing
        </span>
        <h1 className="font-heading text-4xl">Marketing Content Generator</h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
        <div className="flex flex-col gap-5 border border-line p-6">
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Product (optional)</span>
            <ProductPicker selected={product} onSelect={setProduct} onClear={() => setProduct(null)} />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Content Type</span>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Target Audience</span>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="e.g. young professionals, 25-40"
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Tone</span>
            <input
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. confident, minimal, playful"
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Offer</span>
            <input
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="e.g. 20% off this week"
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="label text-muted">Campaign Goal</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. drive traffic to the new arrivals page"
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>

          {error && <p className="text-xs text-accent">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading}
            className="label bg-ink py-3.5 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isLoading ? "Generating…" : variations.length ? "Regenerate" : "Generate"}
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {isLoading && (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse border border-line bg-line/30" />
              ))}
            </div>
          )}

          {!isLoading && variations.length === 0 && (
            <div className="flex h-full min-h-[200px] items-center justify-center border border-dashed border-line text-sm text-muted">
              Generated variations will appear here.
            </div>
          )}

          {variations.map((v, i) => (
            <div key={i} className="flex flex-col gap-3 border border-line p-6">
              <div className="flex items-center justify-between">
                <span className="label text-muted">Variation {i + 1}</span>
                <CopyButton text={[v.headline, v.body].filter(Boolean).join("\n\n")} />
              </div>
              {v.headline && <p className="font-medium">{v.headline}</p>}
              <p className="whitespace-pre-line text-sm leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
