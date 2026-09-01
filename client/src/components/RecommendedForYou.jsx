import { useRef } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useGetRecommendedProductsQuery } from "../features/products/productsApi";
import { normalizeProducts } from "../features/products/productAdapter";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";

// Logged-in users are scored server-side from their own history (see
// recommendationService.js); guests pass their locally-tracked viewed
// product ids. Either way this never calls an LLM per view — see that
// service's header comment for why.
export default function RecommendedForYou() {
  const trackRef = useRef(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { viewed } = useRecentlyViewed();

  const { data, isLoading } = useGetRecommendedProductsQuery({
    viewed: !isAuthenticated && viewed.length ? viewed.join(",") : undefined,
    limit: 12,
  });
  const recommended = normalizeProducts(data?.data?.products);

  const scrollByAmount = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const amount = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!isLoading && recommended.length === 0) return null;

  return (
    <section className="section-py mx-auto max-w-[1600px] px-5 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading
          label={
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} strokeWidth={1.5} /> Smart Recommendations
            </span>
          }
          heading="Recommended For You"
          description="Picked based on what you've been browsing."
        />
        <div className="hidden shrink-0 gap-3 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Previous"
            className="flex h-11 w-11 items-center justify-center border border-line text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bg active:scale-95"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Next"
            className="flex h-11 w-11 items-center justify-center border border-line text-ink transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bg active:scale-95"
          >
            <ArrowRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 sm:gap-6"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[62%] shrink-0 sm:w-[42%] lg:w-[23%]">
                <div className="aspect-[3/4] animate-pulse bg-line" />
              </div>
            ))
          : recommended.map((product, i) => (
              <div key={product.id} data-card className="w-[62%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]">
                <ProductCard product={product} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
