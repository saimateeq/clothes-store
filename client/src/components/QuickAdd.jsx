import { AnimatePresence, motion } from "framer-motion";

export default function QuickAdd({ product, open, selectedSize, onSelectSize, onToggle, onAdd }) {
  return (
    <div className="absolute inset-x-0 bottom-0 translate-y-0 sm:translate-y-full sm:transition-transform sm:duration-300 sm:group-hover:translate-y-0">
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="sizes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 bg-bg/95 p-3"
          >
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectSize(size);
                  }}
                  className={`label border px-2.5 py-1.5 transition-colors ${
                    selectedSize === size
                      ? "border-ink bg-ink text-bg"
                      : "border-line hover:border-ink"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onAdd}
              disabled={!selectedSize}
              className="label w-full bg-ink py-3 text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              Add to Bag
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="quickadd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={onToggle}
            className="label w-full bg-bg/95 py-3.5 text-ink hover:bg-ink hover:text-bg"
          >
            Quick Add
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
