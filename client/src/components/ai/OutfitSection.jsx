import { Sparkles } from "lucide-react";
import { useGetOutfitRecommendationsQuery } from "../../features/ai/aiApi";
import { normalizeProduct } from "../../features/products/productAdapter";
import ProductCard from "../ProductCard";
import { useCart } from "../../context/CartContext";

// A bonus section, not a core flow — stays silent (renders nothing) rather
// than showing an error banner if the AI call fails or the catalog can't
// offer a complementary pick, per the same "never break existing
// functionality" bar as the rest of the page.
export default function OutfitSection({ productId }) {
  const { addItem } = useCart();
  const { data, isLoading, isError } = useGetOutfitRecommendationsQuery(productId, { skip: !productId });
  const items = data?.data?.items ?? [];

  if (isError) return null;
  if (!isLoading && items.length === 0) return null;

  const handleAddAll = () => {
    items.forEach(({ product }) => {
      const normalized = normalizeProduct(product);
      const size = normalized.sizes?.[0];
      const color = normalized.colors?.[0]?.name ?? "Default";
      if (size) addItem(normalized, size, color, 1);
    });
  };

  return (
    <section className="mt-24 lg:mt-32">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="label flex items-center gap-2 text-accent">
          <Sparkles size={13} strokeWidth={1.5} /> AI Stylist
        </span>
        <h2 className="font-heading text-4xl sm:text-5xl">Complete The Look</h2>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-[3/4] animate-pulse bg-line" />
                <div className="h-4 w-2/3 animate-pulse bg-line" />
              </div>
            ))
          : items.map(({ product, reason }, i) => (
              <div key={product._id ?? i} className="flex flex-col gap-2">
                <ProductCard product={normalizeProduct(product)} index={i} />
                {reason && <p className="text-xs italic text-muted">{reason}</p>}
              </div>
            ))}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleAddAll}
            className="label border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg"
          >
            Add Entire Outfit To Cart
          </button>
        </div>
      )}
    </section>
  );
}
