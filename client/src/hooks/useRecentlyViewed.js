import { useCallback, useState } from "react";

// Same guest-localStorage pattern as CartContext/WishlistContext. Logged-in
// users get recently-viewed tracked server-side (see productController's
// getProductBySlug); guests use this instead, feeding "Recommended For
// You" via ?viewed=id1,id2 — see recommendationService.js.
const STORAGE_KEY = "velora_guest_viewed";
const MAX_ITEMS = 20;

function readViewed() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState(readViewed);

  const recordView = useCallback((productId) => {
    if (!productId) return;
    setViewed((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable (private mode, quota) — in-memory state still works for this session
      }
      return next;
    });
  }, []);

  return { viewed, recordView };
}
