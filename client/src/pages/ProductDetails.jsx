import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Minus, Plus, PlayCircle, ChevronDown, Sparkles } from "lucide-react";
import { useGetProductBySlugQuery } from "../features/products/productsApi";
import { normalizeProduct, normalizeProducts } from "../features/products/productAdapter";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import ProductGrid from "../components/ProductGrid";
import SectionHeading from "../components/SectionHeading";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import ProductReviews from "../components/ProductReviews";
import OutfitSection from "../components/ai/OutfitSection";
import SizeRecommendationModal from "../components/ai/SizeRecommendationModal";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const ACCORDIONS = [
  {
    title: "Product Details",
    render: (product) =>
      product.description ||
      "Tailored from premium fabric with clean, considered construction. Designed in-house and finished with tonal stitching throughout.",
  },
  {
    title: "Materials",
    render: (product) =>
      product.material ||
      "Composition varies by style — see the garment label for exact fiber content.",
  },
  {
    title: "Care Instructions",
    render: (product) =>
      product.careInstructions || "Machine wash cold on a gentle cycle, or dry clean for best results.",
  },
  {
    title: "Shipping",
    render: () =>
      "Orders are dispatched within 48 hours. Standard delivery takes 3–6 business days; express options are available at checkout.",
  },
  {
    title: "Returns",
    render: () =>
      "Free returns within 30 days of delivery. Items must be unworn with tags attached. Refunds are issued to your original payment method.",
  },
  {
    title: "Reviews",
    render: (product) => <ProductReviews productId={product._id} />,
  },
];

function ZoomImage({ src, alt }) {
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);

  return (
    <div
      className="relative aspect-[3/4] overflow-hidden bg-line"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setOrigin(`${x}% ${y}%`);
      }}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 ease-out"
        style={{ transformOrigin: origin, transform: zoomed ? "scale(1.6)" : "scale(1)" }}
      />
    </div>
  );
}

export default function ProductDetails() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useGetProductBySlugQuery(slug);
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { recordView } = useRecentlyViewed();

  const product = useMemo(() => normalizeProduct(data?.data?.product), [data]);
  const related = useMemo(() => normalizeProducts(data?.data?.related), [data]);

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  useDocumentTitle(product?.name);

  useEffect(() => {
    if (product?._id) recordView(product._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  if (isError) return <Navigate to="/shop" replace />;

  if (isLoading || !product) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="aspect-[3/4] animate-pulse bg-line" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 animate-pulse bg-line" />
            <div className="h-10 w-2/3 animate-pulse bg-line" />
            <div className="h-24 w-full animate-pulse bg-line" />
          </div>
        </div>
      </div>
    );
  }

  const activeColor = color ?? product.colors[0]?.name;
  const wished = has(product._id);
  const onSale = product.isSale && product.salePrice;

  const selectedVariant = product.variants.find(
    (v) => v.color === activeColor && v.size === size
  );
  const outOfStock = size && selectedVariant && selectedVariant.inventory <= 0;

  const handleAddToBag = () => {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem(product, size, activeColor, quantity);
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 lg:py-14">
      <nav className="mb-8 flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
        <Link to="/" className="link-underline">
          Home
        </Link>
        <span>/</span>
        <Link to={`/shop/${product.category}`} className="link-underline capitalize">
          {product.categoryName ?? product.category}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex gap-3 overflow-x-auto lg:w-20 lg:flex-col lg:overflow-visible">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`aspect-[3/4] w-16 shrink-0 overflow-hidden border transition-colors lg:w-full ${
                  activeImage === i ? "border-ink" : "border-line"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <div className="flex aspect-[3/4] w-16 shrink-0 items-center justify-center border border-line text-muted lg:w-full">
              <PlayCircle size={22} strokeWidth={1.25} />
            </div>
          </div>

          <div className="flex-1">
            <ZoomImage src={product.images[activeImage]} alt={product.name} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="label text-accent">
              {product.categoryName ?? product.category}
              {product.isNew && " · New"}
            </span>
            <h1 className="mt-2 font-heading text-4xl sm:text-5xl">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex text-accent" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.round(product.rating) ? "currentColor" : "none"}
                  strokeWidth={1.25}
                />
              ))}
            </div>
            <span className="text-sm text-muted">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className="price flex items-baseline gap-3 text-2xl sm:text-3xl">
            {onSale ? (
              <>
                <span className="text-muted line-through">${product.price}</span>
                <span className="text-accent">${product.salePrice}</span>
              </>
            ) : (
              <span>${product.price}</span>
            )}
          </div>

          <p className="max-w-md text-sm leading-relaxed text-muted">
            {product.shortDescription || product.description}
          </p>

          <div className="flex flex-col gap-3">
            <h3 className="label text-muted">Color — {activeColor}</h3>
            <div className="flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={activeColor === c.name}
                  className={`h-9 w-9 rounded-full border transition-all ${
                    activeColor === c.name ? "ring-2 ring-ink ring-offset-2 ring-offset-bg" : "border-line"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="label text-muted">Size {size && `— ${size}`}</h3>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setSizeModalOpen(true)}
                  className="link-underline flex items-center gap-1 text-xs text-accent"
                >
                  <Sparkles size={11} strokeWidth={1.5} /> Find My Size
                </button>
                <button type="button" className="link-underline text-xs text-muted">
                  Size Guide
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={`label border px-4 py-2.5 transition-colors ${
                    size === s ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="text-xs text-accent">Please select a size.</p>}
            {outOfStock && <p className="text-xs text-accent">This size is currently out of stock.</p>}
            {!outOfStock && selectedVariant && selectedVariant.inventory <= 5 && (
              <p className="text-xs text-muted">Only {selectedVariant.inventory} left in stock.</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="label text-muted">Quantity</h3>
            <div className="flex w-fit items-center gap-4 border border-line px-4 py-2.5">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span className="w-4 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={outOfStock}
              className="label flex-1 bg-ink py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              {outOfStock ? "Out of Stock" : "Add to Bag"}
            </button>
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={outOfStock}
              className="label flex-1 border border-ink py-4 transition-colors hover:bg-ink hover:text-bg disabled:opacity-40"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={() => toggle(product._id)}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={wished}
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center border border-line transition-colors hover:border-ink"
            >
              <Heart
                size={17}
                strokeWidth={1.5}
                className={wished ? "fill-accent text-accent" : ""}
              />
            </button>
          </div>

          <div className="mt-4 flex flex-col border-t border-line">
            {ACCORDIONS.map((section, i) => (
              <div key={section.title} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                  aria-expanded={openAccordion === i}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-sm font-medium">{section.title}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${
                      openAccordion === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openAccordion === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 text-sm leading-relaxed text-muted">
                        {section.render(product)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OutfitSection productId={product._id} />

      {related.length > 0 && (
        <section className="mt-24 lg:mt-32">
          <SectionHeading label="More To Explore" heading="You May Also Like" />
          <div className="mt-12">
            <ProductGrid products={related} columns="grid-cols-2 lg:grid-cols-4" />
          </div>
        </section>
      )}

      <SizeRecommendationModal open={sizeModalOpen} onClose={() => setSizeModalOpen(false)} productId={product._id} />
    </div>
  );
}
