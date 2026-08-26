import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { resizeImage } from "../utils/imageUrl";
import QuickAdd from "./QuickAdd";

// 2x a ~300px grid tile — sharp on retina without shipping full-size source.
const THUMB_WIDTH = 600;

export default function ProductCard({ product, index = 0 }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const wished = has(product._id);
  const onSale = product.isSale && product.salePrice;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    setQuickAddOpen((v) => !v);
  };

  const handleAddToBag = (e) => {
    e.preventDefault();
    if (!selectedSize) return;
    addItem(product, selectedSize, product.colors[0]?.name ?? "Default", 1);
    setQuickAddOpen(false);
    setSelectedSize(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6, delay: (index % 4) * 0.08 }}
      className="group relative flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-line">
        <Link to={`/product/${product.id}`} aria-label={product.name}>
          <img
            src={resizeImage(product.images[0], THUMB_WIDTH)}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-500 sm:group-hover:opacity-0"
          />
          {product.images[1] && (
            <img
              src={resizeImage(product.images[1], THUMB_WIDTH)}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-105 object-cover opacity-0 transition-opacity duration-500 sm:group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="label bg-ink px-2 py-1 text-bg">New</span>
          )}
          {onSale && (
            <span className="label bg-accent px-2 py-1 text-white">Sale</span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(product._id);
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center bg-bg/90 opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <motion.span
            animate={wished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <Heart
              size={15}
              strokeWidth={1.5}
              className={wished ? "fill-accent text-accent" : "text-ink"}
            />
          </motion.span>
        </button>

        <QuickAdd
          product={product}
          open={quickAddOpen}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
          onToggle={handleQuickAdd}
          onAdd={handleAddToBag}
        />
      </div>

      <Link to={`/product/${product.id}`} className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="link-underline font-heading text-lg leading-tight transition-colors duration-300 group-hover:text-muted">
            {product.name}
          </h3>
          <div className="price flex shrink-0 items-baseline gap-2 text-sm">
            {onSale ? (
              <>
                <span className="text-muted line-through">${product.price}</span>
                <span className="text-accent">${product.salePrice}</span>
              </>
            ) : (
              <span className="transition-colors duration-300 group-hover:text-accent">
                ${product.price}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {product.colors.map((color) => (
            <span
              key={color.name}
              className="h-3 w-3 rounded-full border border-line"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
