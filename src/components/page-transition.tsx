"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Wraps page content and replays an enter animation on every route change.
 * The wrapper is keyed by pathname, so React remounts it and the CSS
 * `pageIn` animation runs again — no animation library required.
 *
 * Also resets scroll position on navigation, matching native app behaviour.
 * Hash navigation (e.g. #section) is left alone so in-page anchors work.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return;
    // "instant" avoids a long animated scroll when moving between pages.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
