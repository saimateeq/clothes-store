import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useGetStylistRecommendationsMutation } from "../features/ai/aiApi";
import { normalizeProduct } from "../features/products/productAdapter";
import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const OCCASIONS = ["Casual", "Wedding", "Party", "Office", "Date", "Vacation"];
const STYLES = ["Minimal", "Streetwear", "Formal", "Luxury", "Oversized", "Classic"];

function PillGroup({ options, value, onChange, customValue, onCustomChange }) {
  const isCustom = value === "Custom";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`label border px-4 py-2.5 transition-colors ${
              value === opt ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {opt}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange("Custom")}
          className={`label border px-4 py-2.5 transition-colors ${
            isCustom ? "border-ink bg-ink text-bg" : "border-line text-muted hover:border-ink hover:text-ink"
          }`}
        >
          Custom
        </button>
      </div>
      {isCustom && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Describe it in your own words"
          className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
        />
      )}
    </div>
  );
}

export default function Stylist() {
  useDocumentTitle("AI Fashion Stylist");
  const { addItem } = useCart();
  const [getRecommendations, { isLoading }] = useGetStylistRecommendationsMutation();

  const [occasion, setOccasion] = useState("Casual");
  const [occasionCustom, setOccasionCustom] = useState("");
  const [style, setStyle] = useState("Minimal");
  const [styleCustom, setStyleCustom] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [colors, setColors] = useState("");
  const [notes, setNotes] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setHasSearched(true);
    try {
      const payload = {
        occasion: (occasion === "Custom" ? occasionCustom : occasion) || undefined,
        style: (style === "Custom" ? styleCustom : style) || undefined,
        budgetMin: budgetMin ? Number(budgetMin) : undefined,
        budgetMax: budgetMax ? Number(budgetMax) : undefined,
        colors: colors ? colors.split(",").map((c) => c.trim()).filter(Boolean) : undefined,
        notes: notes || undefined,
      };
      const res = await getRecommendations(payload).unwrap();
      setResult(res.data);
    } catch (err) {
      setError(err?.data?.message || "AI Stylist is temporarily unavailable. Please try again.");
    }
  };

  const handleAddOutfit = (outfit) => {
    outfit.items.forEach(({ product }) => {
      const normalized = normalizeProduct(product);
      const size = normalized.sizes?.[0];
      const color = normalized.colors?.[0]?.name ?? "Default";
      if (size) addItem(normalized, size, color, 1);
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col items-center gap-2 text-center">
        <span className="label flex items-center gap-2 text-accent">
          <Sparkles size={13} strokeWidth={1.5} /> AI Fashion Stylist
        </span>
        <h1 className="font-heading text-5xl sm:text-6xl">Find Your Perfect Style</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
          Tell us the occasion, your style, and your budget — we'll put together a look from real pieces in our
          collection.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-8">
        <div>
          <h3 className="label mb-3 text-muted">Occasion</h3>
          <PillGroup
            options={OCCASIONS}
            value={occasion}
            onChange={setOccasion}
            customValue={occasionCustom}
            onCustomChange={setOccasionCustom}
          />
        </div>
        <div>
          <h3 className="label mb-3 text-muted">Style</h3>
          <PillGroup
            options={STYLES}
            value={style}
            onChange={setStyle}
            customValue={styleCustom}
            onCustomChange={setStyleCustom}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="label mb-3 text-muted">Budget Min</h3>
            <input
              type="number"
              min="0"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="$0"
              className="w-full border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <h3 className="label mb-3 text-muted">Budget Max</h3>
            <input
              type="number"
              min="0"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="No limit"
              className="w-full border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
          </div>
        </div>
        <div>
          <h3 className="label mb-3 text-muted">Color Preference</h3>
          <input
            type="text"
            value={colors}
            onChange={(e) => setColors(e.target.value)}
            placeholder="e.g. black, white, navy"
            className="w-full border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div>
          <h3 className="label mb-3 text-muted">Anything else?</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional — e.g. 'outdoor evening wedding, relaxed fit'"
            className="w-full resize-none border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="label bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {isLoading ? "Styling…" : "Find My Style"}
        </button>
      </form>

      <div className="mx-auto mt-16 max-w-6xl">
        {isLoading && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] animate-pulse bg-line" />
                <div className="h-4 w-2/3 animate-pulse bg-line" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && <p role="alert" className="text-center text-sm text-accent">{error}</p>}

        {!isLoading && !error && hasSearched && result && (
          <>
            {result.message && <p className="mb-10 text-center text-sm text-muted">{result.message}</p>}
            {result.outfits.length === 0 && !result.message && (
              <p className="text-center text-sm text-muted">No matches found — try adjusting your budget or colors.</p>
            )}
            {result.outfits.map((outfit, i) => (
              <section key={i} className="mb-16">
                <div className="mb-8 flex flex-col items-center gap-2 text-center">
                  <span className="label text-accent">{outfit.title}</span>
                  <span className="price text-2xl">Total ${outfit.total.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {outfit.items.map(({ product, reason }, j) => (
                    <div key={product._id ?? j} className="flex flex-col gap-2">
                      <ProductCard product={normalizeProduct(product)} index={j} />
                      {reason && <p className="text-xs italic text-muted">{reason}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleAddOutfit(outfit)}
                    className="label border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg"
                  >
                    Add Entire Outfit To Cart
                  </button>
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
