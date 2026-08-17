import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEscapeKey } from "../hooks/useEscapeKey";

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, removeItem, updateQuantity } = useCart();
  useEscapeKey(closeCart, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-bg shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="label">Your Bag ({items.length})</h2>
              <button type="button" onClick={closeCart} aria-label="Close bag">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="font-heading text-2xl">Your bag is empty</p>
                <Link
                  to="/shop"
                  onClick={closeCart}
                  className="label border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6">
                  {items.map((line) => (
                    <li key={line.key} className="flex gap-4 border-b border-line py-6">
                      <img
                        src={line.image}
                        alt=""
                        className="h-28 w-24 flex-shrink-0 object-cover"
                        loading="lazy"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-heading text-lg leading-tight">{line.name}</span>
                            <span className="text-sm">${(line.price * line.quantity).toFixed(2)}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted">
                            {line.color} / {line.size}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 border border-line px-2 py-1">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => updateQuantity(line.key, line.quantity - 1)}
                              className="text-muted hover:text-ink"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-4 text-center text-sm">{line.quantity}</span>
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => updateQuantity(line.key, line.quantity + 1)}
                              className="text-muted hover:text-ink"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            type="button"
                            aria-label={`Remove ${line.name}`}
                            onClick={() => removeItem(line.key)}
                            className="text-muted hover:text-ink"
                          >
                            <Trash2 size={15} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-6 py-6">
                  <div className="mb-4 flex items-center justify-between font-heading text-xl">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <p className="mb-4 text-sm text-muted">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="label block w-full bg-ink py-4 text-center text-bg transition-opacity hover:opacity-85"
                  >
                    Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="label mt-3 w-full py-2 text-center text-muted hover:text-ink"
                  >
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
