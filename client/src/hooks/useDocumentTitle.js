import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} — VELORA` : "VELORA — Designed for the Everyday";
    return () => {
      document.title = previous;
    };
  }, [title]);
}
