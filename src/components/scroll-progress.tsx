"use client";

import { useEffect, useRef } from "react";

/**
 * Thin gradient reading-progress bar pinned to the top of the viewport,
 * in the style of iOS Safari. Uses a rAF-throttled scroll listener and
 * writes a transform directly to the DOM node, so it never triggers a
 * React re-render while scrolling.
 */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${ratio.toFixed(4)})`;
      bar.style.opacity = ratio > 0.001 ? "1" : "0";
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" style={{ opacity: 0 }} aria-hidden />;
}
