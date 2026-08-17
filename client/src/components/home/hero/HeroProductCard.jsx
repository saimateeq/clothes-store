import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIsDesktop } from "../../../hooks/useIsDesktop";
import { productCardEnterRight, productCardEnterSheet } from "./heroAnimations";

function editorialLabel(product) {
  if (product.isNew) return "New Arrival";
  if (product.isBestSeller) return "Best Seller";
  return "Featured Piece";
}

// Desktop: a full-height parallelogram edge-anchored to the right, sliced
// out of the frame with a steep clip-path lean and slid in from off-canvas.
// Mobile keeps the bottom-sheet treatment — a full-height slanted panel
// doesn't translate to a short, wide viewport.
export default function HeroProductCard({ product }) {
  const isDesktop = useIsDesktop();
  if (!product) return null;

  const colorList = product.colors.map((c) => c.name).join(" / ");
  const variants = isDesktop ? productCardEnterRight : productCardEnterSheet;

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute inset-x-4 bottom-24 z-10 sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:w-[40%]"
    >
      <Link
        to={`/product/${product.id}`}
        className="group flex flex-col border border-line/80 bg-cream/95 p-5 shadow-[0_20px_60px_-28px_rgba(23,23,23,0.4)] backdrop-blur-[2px] transition-colors duration-300 hover:border-ink hover:bg-cream sm:h-full sm:justify-center sm:border-none sm:py-10 sm:pl-[30%] sm:pr-8 sm:[clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]"
      >
        <span className="label text-accent">{editorialLabel(product)}</span>
        <h3 className="mt-2 font-heading text-2xl leading-tight text-ink sm:text-[1.7rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          {product.isSale ? (
            <>
              <span className="text-sm text-muted line-through">${product.price}</span>
              <span className="text-base text-accent">${product.salePrice}</span>
            </>
          ) : (
            <span className="text-base text-ink">${product.price}</span>
          )}
        </div>
        {colorList && <p className="mt-1 text-xs text-muted">{colorList}</p>}
        <span className="label mt-4 inline-flex items-center gap-2 text-ink">
          View Product
          <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </Link>
    </motion.div>
  );
}
