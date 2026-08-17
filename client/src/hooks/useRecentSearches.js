import { useCallback, useState } from "react";

const KEY = "velora_recent_searches";
const MAX = 5;

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState(read);

  const addSearch = useCallback((term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX
      );
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    localStorage.removeItem(KEY);
    setRecent([]);
  }, []);

  return { recent, addSearch, clearSearches };
}
