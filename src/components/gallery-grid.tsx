"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: number;
  kind: string;
  url: string;
  category: string;
  title: string;
};

export const galleryCategories: Record<string, string> = {
  school: "স্কুল",
  team: "টিম মেম্বার",
  alumni: "প্রাক্তন সদস্য",
  events: "নেটওয়ার্ক / ইভেন্ট",
};

export default function GalleryGrid({
  items,
  showFilters = true,
}: {
  items: GalleryItem[];
  showFilters?: boolean;
}) {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<number | null>(null);

  const shown = items.filter((g) => filter === "all" || g.category === filter);
  const activeItem = active !== null ? shown[active] : null;

  const step = useCallback(
    (d: number) => {
      setActive((cur) =>
        cur === null ? cur : (cur + d + shown.length) % shown.length
      );
    },
    [shown.length]
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, step]);

  useEffect(() => setActive(null), [filter]);

  const filters = [
    { key: "all", label: "সবগুলো" },
    ...Object.entries(galleryCategories).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div>
      {showFilters && (
        <div className="no-scrollbar mb-8 flex justify-start gap-2 overflow-x-auto pb-1 sm:justify-center">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "focusable relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "text-white"
                  : "glass text-ink-soft hover:text-ink dark:text-white/65 dark:hover:text-white"
              )}
            >
              {filter === f.key && (
                <motion.span
                  layoutId="gallery-filter"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue to-blue-bright shadow-lg shadow-blue/30"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative">{f.label}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="columns-2 gap-4 sm:columns-3 [column-fill:balance]">
        <AnimatePresence mode="popLayout">
          {shown.map((g, i) => (
            <motion.button
              layout
              key={g.id}
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 170, damping: 22, delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setActive(i)}
              className="group relative mb-4 block w-full overflow-hidden rounded-[1.5rem] shadow-soft transition-shadow duration-500 hover:shadow-lift"
            >
              {g.kind === "video" ? (
                <div className="relative aspect-video w-full">
                  <video src={g.url} muted preload="metadata" className="size-full object-cover" />
                  <span className="glass absolute inset-0 m-auto grid size-14 place-items-center rounded-full text-white">
                    <Play className="size-6 fill-current" />
                  </span>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.url}
                  alt={g.title}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
                />
              )}
              {g.title && (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10 text-left text-xs font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {g.title}
                </span>
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && (
        <p className="py-14 text-center text-sm text-ink-soft dark:text-white/55">
          এই বিভাগে এখনো কোনো মিডিয়া নেই
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-2xl"
            onClick={() => setActive(null)}
          >
            <motion.div
              key={activeItem.id}
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="relative max-h-[85vh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.kind === "video" ? (
                <video
                  src={activeItem.url}
                  controls
                  autoPlay
                  className="max-h-[78vh] w-auto max-w-full rounded-3xl shadow-2xl"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.url}
                  alt={activeItem.title}
                  className="max-h-[78vh] w-auto max-w-full rounded-3xl object-contain shadow-2xl"
                />
              )}
              {activeItem.title && (
                <p className="glass mx-auto mt-4 w-fit max-w-full rounded-full px-5 py-2 text-center text-sm font-semibold text-white">
                  {activeItem.title}
                </p>
              )}
            </motion.div>
            <button
              aria-label="বন্ধ করুন"
              onClick={() => setActive(null)}
              className="glass absolute right-5 top-5 grid size-11 place-items-center rounded-full text-white transition-transform hover:scale-110 active:scale-90"
            >
              <X className="size-5" />
            </button>
            {shown.length > 1 && (
              <>
                <button
                  aria-label="আগেরটি"
                  onClick={(e) => { e.stopPropagation(); step(-1); }}
                  className="glass absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white transition-transform hover:scale-110 active:scale-90"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  aria-label="পরেরটি"
                  onClick={(e) => { e.stopPropagation(); step(1); }}
                  className="glass absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white transition-transform hover:scale-110 active:scale-90"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
