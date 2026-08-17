import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Cart() {
  const { items, subtotal, removeItem, updateQuantity } = useCart();
  useDocumentTitle("Your Bag");

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-5 px-5 py-32 text-center">
        <ShoppingBag size={32} strokeWidth={1} className="text-muted" />
        <h1 className="font-heading text-3xl">Your Bag Is Empty</h1>
        <p className="max-w-xs text-sm text-muted">Looks like you haven't added anything yet.</p>
        <Link
          to="/shop"
          className="label mt-2 border border-ink px-8 py-4 transition-colors hover:bg-ink hover:text-bg"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col gap-2">
        <span className="label text-accent">Shopping Bag</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Your Bag</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col divide-y divide-line border-y border-line">
          {items.map((line) => (
            <li key={line.key} className="flex gap-5 py-6 sm:gap-6">
              <img
                src={line.image}
                alt=""
                className="h-36 w-28 flex-shrink-0 object-cover sm:h-44 sm:w-36"
                loading="lazy"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl">{line.name}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {line.color} / {line.size}
                    </p>
                  </div>
                  <span className="font-heading text-lg">
                    ${(line.price * line.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 border border-line px-3 py-2">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(line.key, line.quantity - 1)}
                      className="text-muted hover:text-ink"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-5 text-center text-sm">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(line.key, line.quantity + 1)}
                      className="text-muted hover:text-ink"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(line.key)}
                    className="label flex items-center gap-2 text-muted hover:text-ink"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="flex h-fit flex-col gap-6 border border-line p-6 lg:sticky lg:top-28">
          <h2 className="label">Order Summary</h2>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{subtotal >= 100 ? "Free" : "$8.00"}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-line pt-4 font-heading text-xl">
            <span>Total</span>
            <span>${(subtotal >= 100 ? subtotal : subtotal + 8).toFixed(2)}</span>
          </div>
          <Link
            to="/checkout"
            className="label block w-full bg-ink py-4 text-center text-bg transition-opacity hover:opacity-85"
          >
            Checkout
          </Link>
          <Link to="/shop" className="label text-center text-muted hover:text-ink">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
