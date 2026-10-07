"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { bn } from "@/lib/utils";

export type GalleryItem = {
  id: number;
  kind: string;
  url: string;
  category: string;
  title: string;
};

const CATS = [
  { key: "all", label: "সব" },
  { key: "school", label: "স্কুল" },
  { key: "team", label: "দলের সদস্য" },
  { key: "alumni", label: "অ্যালামনাই" },
  { key: "events", label: "নেটওয়ার্ক / ইভেন্ট" },
];

export default function GalleryClient({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const list = useMemo(
    () => (cat === "all" ? items : items.filter((i) => i.category === cat)),
    [cat, items]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox === null) return;
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((l) => (l === null ? 0 : (l + 1) % list.length));
      if (e.key === "ArrowLeft") setLightbox((l) => (l === null ? 0 : (l - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, list.length]);

  const current = lightbox !== null ? list[lightbox] : null;

  return (
    <div>
      {/* Filters */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-8 sm:px-0">
        {CATS.map((c) => {
          const active = cat === c.key;
          const n = c.key === "all" ? items.length : items.filter((i) => i.category === c.key).length;
          return (
            <button
              key={c.key}
              onClick={() => {
                setCat(c.key);
                setLightbox(null);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold sm:px-5 sm:py-2.5 sm:text-[13.5px] transition-all duration-400 ease-apple ${
                active ? "scale-[1.03] text-white" : "glass hover:scale-[1.02]"
              }`}
              style={active ? { background: "var(--brand)", boxShadow: "0 10px 24px -8px rgba(0,113,227,.55)" } : undefined}
            >
              {c.label} <span className="opacity-60">({bn(n)})</span>
            </button>
          );
        })}
      </div>

      {/* Masonry */}
      <div key={cat} className="columns-2 gap-2.5 space-y-2.5 sm:columns-3 sm:gap-3.5 sm:space-y-3.5 lg:columns-4" style={{ animation: "galIn .55s cubic-bezier(.22,1,.36,1) both" }}>
        {list.map((g, i) => (
          <button
            key={g.id}
            onClick={() => setLightbox(i)}
            className="group relative block w-full break-inside-avoid overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] transition-all duration-500 ease-apple hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)]"
          >
            {g.kind === "video" ? (
              <div className="relative">
                <video src={g.url} className="w-full object-cover" muted playsInline preload="metadata" />
                <span className="absolute inset-0 grid place-items-center bg-black/20">
                  <span className="glass-strong grid h-12 w-12 place-items-center rounded-full">
                    <Play className="h-5 w-5" />
                  </span>
                </span>
              </div>
            ) : (
              <img src={g.url} alt={g.title || "গ্যালারী"} className="w-full object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.06]" loading="lazy" />
            )}
            {g.title && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-10 text-left text-[12.5px] font-semibold text-white opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                {g.title}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ animation: "lbBg .3s ease both" }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setLightbox(null)} />
          <button
            onClick={() => setLightbox(null)}
            aria-label="বন্ধ করুন"
            className="glass-strong absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full transition-transform hover:scale-110 sm:right-5 sm:top-5 sm:h-11 sm:w-11"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={() => setLightbox((lightbox! - 1 + list.length) % list.length)}
            aria-label="আগেরটি"
            className="glass-strong absolute left-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full transition-transform hover:scale-110 sm:left-6 sm:h-11 sm:w-11"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setLightbox((lightbox! + 1) % list.length)}
            aria-label="পরেরটি"
            className="glass-strong absolute right-2 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full transition-transform hover:scale-110 sm:right-6 sm:h-11 sm:w-11"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-5xl" style={{ animation: "lbIn .4s cubic-bezier(.22,1,.36,1) both" }}>
            {current.kind === "video" ? (
              <video src={current.url} className="max-h-[80vh] rounded-2xl" controls autoPlay playsInline />
            ) : (
              <img src={current.url} alt={current.title || ""} className="max-h-[80vh] rounded-2xl object-contain" />
            )}
            {current.title && (
              <p className="glass-strong mx-auto mt-3 w-fit max-w-full truncate rounded-full px-5 py-2 text-[13px] font-semibold">
                {current.title}
              </p>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes galIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes lbBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lbIn { from { opacity: 0; transform: scale(.94) translateY(14px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
