import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useListProductsQuery } from "../features/products/productsApi";
import { normalizeProducts } from "../features/products/productAdapter";
import SectionHeading from "./SectionHeading";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  const trackRef = useRef(null);
  const { data, isLoading } = useListProductsQuery({ isBestSeller: true, limit: 12 });
  const bestSellers = normalizeProducts(data?.data?.products);

  const scrollByAmount = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    const amount = card ? card.getBoundingClientRect().width + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="section-py mx-auto max-w-[1600px] px-5 sm:px-8">
      <div className="flex items-end justify-between gap-6">
        <SectionHeading label="Most Loved" heading="Best Sellers" description="Our most-loved pieces." />
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
          : bestSellers.map((product, i) => (
              <div
                key={product.id}
                data-card
                className="w-[62%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]"
              >
                <ProductCard product={product} index={i} />
              </div>
            ))}
      </div>
    </section>
  );
}
