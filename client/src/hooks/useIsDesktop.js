import { useEffect, useState } from "react";

export function useIsDesktop(breakpoint = "(min-width: 640px)") {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(breakpoint).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(breakpoint);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isDesktop;
}
