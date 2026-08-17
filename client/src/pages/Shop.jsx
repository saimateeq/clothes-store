import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useListProductsQuery, useGetProductFacetsQuery } from "../features/products/productsApi";
import { useListCategoriesQuery } from "../features/categories/categoriesApi";
import { normalizeProducts } from "../features/products/productAdapter";
import ProductGrid from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useEscapeKey } from "../hooks/useEscapeKey";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "best-selling", label: "Best Selling" },
  { value: "highest-rated", label: "Highest Rated" },
];

const PRICE_RANGES = [
  { label: "Under $75", min: 0, max: 75 },
  { label: "$75 – $150", min: 75, max: 150 },
  { label: "$150 – $250", min: 150, max: 250 },
  { label: "$250+", min: 250, max: undefined },
];

function FilterPanel({
  categories,
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sizes,
  toggleSize,
  colors,
  toggleColor,
  facets,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h2 className="label">Filters</h2>
        <button type="button" onClick={onClear} className="link-underline text-xs text-muted">
          Clear All
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="label text-muted">Category</h3>
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`text-left text-sm transition-colors ${
            category === "all" ? "text-ink font-medium" : "text-muted hover:text-ink"
          }`}
        >
          All Products
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setCategory(cat.slug)}
            className={`text-left text-sm capitalize transition-colors ${
              category === cat.slug ? "text-ink font-medium" : "text-muted hover:text-ink"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="label text-muted">Price</h3>
        {PRICE_RANGES.map((range) => (
          <label key={range.label} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={priceRange?.label === range.label}
              onChange={() => setPriceRange(priceRange?.label === range.label ? null : range)}
              className="h-4 w-4 accent-ink"
            />
            {range.label}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="label text-muted">Size</h3>
        <div className="flex flex-wrap gap-2">
          {(facets?.sizes ?? []).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`label border px-3 py-1.5 transition-colors ${
                sizes.includes(size) ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="label text-muted">Color</h3>
        <div className="flex flex-wrap gap-3">
          {(facets?.colors ?? []).map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => toggleColor(color.name)}
              aria-label={color.name}
              aria-pressed={colors.includes(color.name)}
              className={`h-7 w-7 rounded-full border transition-all ${
                colors.includes(color.name) ? "ring-2 ring-ink ring-offset-2 ring-offset-bg" : "border-line"
              }`}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { category: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [category, setCategory] = useState(routeCategory ?? "all");
  const [priceRange, setPriceRange] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sort, setSort] = useState(searchParams.get("sort") ?? "featured");
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  useEscapeKey(() => setMobileFiltersOpen(false), mobileFiltersOpen);

  useEffect(() => {
    setCategory(routeCategory ?? "all");
    setPage(1);
  }, [routeCategory]);

  useEffect(() => {
    const urlSort = searchParams.get("sort");
    if (urlSort) setSort(urlSort);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [category, priceRange, sizes, colors, sort]);

  const toggleSize = (size) =>
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  const toggleColor = (name) =>
    setColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));
  const clearFilters = () => {
    setCategory("all");
    setPriceRange(null);
    setSizes([]);
    setColors([]);
  };

  const { data: categoriesData } = useListCategoriesQuery({ flat: true });
  const topCategories = (categoriesData?.data?.categories ?? []).filter((c) => !c.parent);

  const { data: facetsData } = useGetProductFacetsQuery();

  const { data, isLoading, isFetching } = useListProductsQuery({
    category: category !== "all" ? category : undefined,
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    sizes: sizes.length ? sizes.join(",") : undefined,
    colors: colors.length ? colors.join(",") : undefined,
    sort,
    page,
    limit: 12,
  });

  const products = normalizeProducts(data?.data?.products);
  const total = data?.data?.total ?? 0;
  const pages = data?.data?.pages ?? 1;
  const heading = category === "all" ? "All Products" : topCategories.find((c) => c.slug === category)?.name ?? category;
  useDocumentTitle(heading);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-2">
        <span className="label text-accent">Shop</span>
        <h1 className="font-heading text-5xl capitalize sm:text-6xl">{heading}</h1>
        <p className="text-sm text-muted">{total} products</p>
      </div>

      <div className="mb-8 flex items-center justify-between border-y border-line py-4">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="label flex items-center gap-2 lg:hidden"
        >
          <SlidersHorizontal size={15} strokeWidth={1.5} />
          Filters
        </button>
        <span className="hidden label text-muted lg:inline">{total} results</span>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="label hidden text-muted sm:inline">Sort by</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setSearchParams(e.target.value === "featured" ? {} : { sort: e.target.value });
            }}
            className="border border-line bg-bg px-3 py-2 text-sm outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel
            categories={topCategories}
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sizes={sizes}
            toggleSize={toggleSize}
            colors={colors}
            toggleColor={toggleColor}
            facets={facetsData?.data}
            onClear={clearFilters}
          />
        </aside>

        <div className="flex flex-col gap-12">
          {isLoading || isFetching ? (
            <ProductGridSkeleton columns="grid-cols-2 lg:grid-cols-3" count={12} />
          ) : (
            <ProductGrid products={products} columns="grid-cols-2 lg:grid-cols-3" />
          )}

          {pages > 1 && (
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="label text-muted">
                Page {page} of {pages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center border border-line transition-colors hover:border-ink disabled:opacity-30"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-bg p-6 lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-heading text-2xl">Filters</span>
                <button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <X size={22} strokeWidth={1.5} />
                </button>
              </div>
              <FilterPanel
                categories={topCategories}
                category={category}
                setCategory={setCategory}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                sizes={sizes}
                toggleSize={toggleSize}
                colors={colors}
                toggleColor={toggleColor}
                facets={facetsData?.data}
                onClear={clearFilters}
              />
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="label mt-8 w-full bg-ink py-4 text-bg"
              >
                Show {total} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
