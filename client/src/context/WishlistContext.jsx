import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import {
  useGetWishlistQuery,
  useAddWishlistProductMutation,
  useRemoveWishlistProductMutation,
  useMergeWishlistMutation,
} from "../features/wishlist/wishlistApi";

const STORAGE_KEY = "velora_guest_wishlist";
const WishlistContext = createContext(null);

function readGuestIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

// Guests get a localStorage-backed wishlist (product _ids); authenticated
// users get one backed by MongoDB. On the guest->authenticated transition
// (login/register), the guest list is merged into the server wishlist once,
// then localStorage is cleared so we don't merge it again on a later login.
export function WishlistProvider({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [guestIds, setGuestIds] = useState(readGuestIds);
  const wasAuthenticated = useRef(isAuthenticated);
  const hasMerged = useRef(false);

  const { data: serverData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [addProductMutation] = useAddWishlistProductMutation();
  const [removeProductMutation] = useRemoveWishlistProductMutation();
  const [mergeWishlistMutation] = useMergeWishlistMutation();

  useEffect(() => {
    if (isAuthenticated && !wasAuthenticated.current && guestIds.length > 0 && !hasMerged.current) {
      hasMerged.current = true;
      mergeWishlistMutation(guestIds)
        .unwrap()
        .then(() => {
          localStorage.removeItem(STORAGE_KEY);
          setGuestIds([]);
        })
        .catch(() => {
          hasMerged.current = false;
        });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, guestIds, mergeWishlistMutation]);

  useEffect(() => {
    if (!isAuthenticated) localStorage.setItem(STORAGE_KEY, JSON.stringify(guestIds));
  }, [guestIds, isAuthenticated]);

  const ids = isAuthenticated ? serverData?.data?.productIds ?? [] : guestIds;

  const toggle = useCallback(
    (id) => {
      if (isAuthenticated) {
        if (ids.includes(id)) removeProductMutation(id);
        else addProductMutation(id);
      } else {
        setGuestIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
      }
    },
    [isAuthenticated, ids, addProductMutation, removeProductMutation]
  );

  const remove = useCallback(
    (id) => {
      if (isAuthenticated) removeProductMutation(id);
      else setGuestIds((prev) => prev.filter((i) => i !== id));
    },
    [isAuthenticated, removeProductMutation]
  );

  const has = useCallback((id) => ids.includes(id), [ids]);

  const value = useMemo(
    () => ({ ids, toggle, remove, has, count: ids.length }),
    [ids, toggle, remove, has]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
