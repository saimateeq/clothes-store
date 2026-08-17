import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Search, Clock } from "lucide-react";
import { useSearchProductsQuery } from "../features/products/productsApi";
import { normalizeProducts } from "../features/products/productAdapter";
import { useDebounce } from "../hooks/useDebounce";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useEscapeKey } from "../hooks/useEscapeKey";

const TRENDING = ["Oversized shirts", "Summer dresses", "New arrivals", "Blazers"];

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { recent, addSearch } = useRecentSearches();

  const { data, isFetching } = useSearchProductsQuery(debouncedQuery, {
    skip: debouncedQuery.trim().length < 1,
  });
  const results = useMemo(() => normalizeProducts(data?.data?.products), [data]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) addSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  useEscapeKey(onClose, open);

  const showResults = debouncedQuery.trim().length >= 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-bg"
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div className="mx-auto flex min-h-full max-w-3xl flex-col px-6 py-10 sm:px-8">
            <div className="flex items-center justify-between">
              <span className="label text-muted">Search</span>
              <button type="button" onClick={onClose} aria-label="Close search">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-10"
            >
              <h2 className="mb-2 font-heading text-3xl sm:text-4xl">SEARCH</h2>
              <div className="flex items-center gap-4 border-b border-ink py-4">
                <Search size={20} strokeWidth={1.5} className="text-muted" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent font-heading text-xl outline-none placeholder:text-muted sm:text-2xl"
                />
              </div>
            </motion.div>

            <div className="mt-10">
              {!showResults ? (
                <div className="flex flex-col gap-8">
                  {recent.length > 0 && (
                    <div>
                      <span className="label text-muted">Recent</span>
                      <ul className="mt-4 flex flex-wrap gap-3">
                        {recent.map((term) => (
                          <li key={term}>
                            <button
                              type="button"
                              onClick={() => setQuery(term)}
                              className="link-underline label inline-flex items-center gap-1.5"
                            >
                              <Clock size={11} />
                              {term}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="label text-muted">Trending</span>
                    <ul className="mt-4 flex flex-wrap gap-3">
                      {TRENDING.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => setQuery(term)}
                            className="link-underline label"
                          >
                            {term}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : isFetching ? (
                <p className="text-sm text-muted">Searching…</p>
              ) : results.length === 0 ? (
                <p className="font-heading text-2xl">No pieces found</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {results.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/product/${product.id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 py-4"
                      >
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-16 w-14 object-cover"
                          loading="lazy"
                        />
                        <div className="flex flex-1 flex-col">
                          <span className="font-heading text-lg">{product.name}</span>
                          <span className="text-sm text-muted capitalize">{product.categoryName}</span>
                        </div>
                        <span className="text-sm">${product.salePrice ?? product.price}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
