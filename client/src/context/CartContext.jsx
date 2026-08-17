import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { openCartDrawer, closeCartDrawer } from "../features/ui/uiSlice";
import {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useMergeCartMutation,
} from "../features/cart/cartApi";

const STORAGE_KEY = "velora_guest_cart";
const CartContext = createContext(null);

const lineKey = (productId, size, color) => `${productId}__${size}__${color}`;

function readGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

// Same guest-localStorage / authenticated-MongoDB split as WishlistContext,
// with a one-time merge on the guest->authenticated transition. The cart
// drawer's open/closed state lives in Redux (uiSlice) since it's triggered
// from unrelated components (product cards, navbar) — this context is just
// a thin facade over that plus whichever cart data source is active.
export function CartProvider({ children }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isOpen = useSelector((state) => state.ui.cartDrawerOpen);
  const [guestItems, setGuestItems] = useState(readGuestCart);
  const [pulse, setPulse] = useState(0);
  const wasAuthenticated = useRef(isAuthenticated);
  const hasMerged = useRef(false);

  const { data: serverCart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const [addCartItemMutation] = useAddCartItemMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [removeCartItemMutation] = useRemoveCartItemMutation();
  const [mergeCartMutation] = useMergeCartMutation();

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current && guestItems.length > 0 && !hasMerged.current) {
      hasMerged.current = true; // set synchronously — guards against React
      // StrictMode's double-invoke (and any other re-entrant fire) sending
      // the same guest items twice, which would double the quantities.
      const payload = guestItems.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));
      mergeCartMutation(payload)
        .unwrap()
        .then(() => {
          localStorage.removeItem(STORAGE_KEY);
          setGuestItems([]);
        })
        .catch(() => {
          hasMerged.current = false; // allow retry on next auth transition if it failed
        });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, guestItems, mergeCartMutation]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY, JSON.stringify(guestItems));
  }, [guestItems, isAuthenticated]);

  const items = isAuthenticated ? serverCart?.data?.items ?? [] : guestItems;

  const addItem = useCallback(
    (product, size, color, quantity = 1) => {
      if (isAuthenticated) {
        addCartItemMutation({ productId: product._id, size, color, quantity });
      } else {
        setGuestItems((prev) => {
          const key = lineKey(product._id, size, color);
          const existing = prev.find((line) => line.key === key);
          if (existing) {
            return prev.map((line) =>
              line.key === key ? { ...line, quantity: line.quantity + quantity } : line
            );
          }
          return [
            ...prev,
            {
              key,
              productId: product._id,
              name: product.name,
              image: product.images?.[0],
              price: product.salePrice ?? product.price,
              size,
              color,
              quantity,
            },
          ];
        });
      }
      setPulse((p) => p + 1);
      dispatch(openCartDrawer());
    },
    [isAuthenticated, addCartItemMutation, dispatch]
  );

  const removeItem = useCallback(
    (key) => {
      if (isAuthenticated) {
        const [productId, size, color] = key.split("__");
        removeCartItemMutation({ productId, size, color });
      } else {
        setGuestItems((prev) => prev.filter((line) => line.key !== key));
      }
    },
    [isAuthenticated, removeCartItemMutation]
  );

  const updateQuantity = useCallback(
    (key, quantity) => {
      const safeQuantity = Math.max(1, quantity);
      if (isAuthenticated) {
        const [productId, size, color] = key.split("__");
        updateCartItemMutation({ productId, size, color, quantity: safeQuantity });
      } else {
        setGuestItems((prev) =>
          prev.map((line) => (line.key === key ? { ...line, quantity: safeQuantity } : line))
        );
      }
    },
    [isAuthenticated, updateCartItemMutation]
  );

  const openCart = useCallback(() => dispatch(openCartDrawer()), [dispatch]);
  const closeCart = useCallback(() => dispatch(closeCartDrawer()), [dispatch]);

  const count = useMemo(() => items.reduce((sum, l) => sum + l.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      isOpen,
      pulse,
      addItem,
      removeItem,
      updateQuantity,
      openCart,
      closeCart,
    }),
    [items, count, subtotal, isOpen, pulse, addItem, removeItem, updateQuantity, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
