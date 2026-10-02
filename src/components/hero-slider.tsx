"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Slide = { id: number; imageUrl: string; title: string; subtitle: string };

const variants = {
  enter: (dir: number) => ({ opacity: 0, scale: 1.04, x: dir * 60 }),
  center: { opacity: 1, scale: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, scale: 0.99, x: dir * -60 }),
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 90]);
  const contentY = useTransform(scrollY, [0, 500], [0, 60]);
  const contentOpacity = useTransform(scrollY, [0, 420], [1, 0]);

  const paginate = useCallback(
    (d: number) =>
      setIndex(([i]) => [(i + d + slides.length) % slides.length, d >= 0 ? 1 : -1]),
    [slides.length]
  );
  const goTo = (i: number) => setIndex(([cur]) => [i, i > cur ? 1 : -1]);

  useEffect(() => {
    if (slides.length < 2) return;
    timer.current = setInterval(() => paginate(1), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paginate, slides.length, index]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="px-3 pt-[86px] sm:px-5 sm:pt-[96px]">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 30, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="relative mx-auto aspect-video max-h-[86vh] min-h-[340px] w-full max-w-7xl touch-pan-y overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/20 sm:rounded-[2.25rem]"
        role="region"
        aria-label="হিরো স্লাইডার"
      >
        <motion.div style={{ y: parallaxY }} className="absolute inset-0 -bottom-24">
          <AnimatePresence custom={dir} initial={false}>
            <motion.div
              key={slide.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 65, damping: 22 }}
              className="absolute inset-0"
              drag={slides.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={(_, info) => {
                if (info.offset.x < -90) paginate(1);
                else if (info.offset.x > 90) paginate(-1);
              }}
            >
              <motion.img
                src={slide.imageUrl}
                alt={slide.title}
                draggable={false}
                initial={{ scale: 1.16 }}
                animate={{ scale: 1.02 }}
                transition={{ duration: 7, ease: [0.25, 0.6, 0.35, 1] }}
                className="absolute inset-0 size-full select-none object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Cinematic overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        </motion.div>

        {/* Glass content */}
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="absolute inset-x-0 bottom-0 p-5 sm:p-9 lg:p-12"
        >
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                className="glass inline-flex max-w-full items-center gap-2 rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-wide text-white/90 sm:text-xs"
              >
                <span className="size-1.5 animate-pulse rounded-full bg-green" />
                বিইউএসএসএসসি সাইন্স ক্লাব
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 110, damping: 19, delay: 0.18 }}
                className="font-display mt-3 text-[clamp(1.35rem,4.6vw,3.4rem)] font-extrabold leading-[1.12] tracking-tight text-white [text-shadow:0_4px_30px_rgb(0_0_0/0.4)]"
              >
                {slide.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 110, damping: 19, delay: 0.28 }}
                className="font-noto mt-2 max-w-xl text-[clamp(0.85rem,2vw,1.15rem)] font-light leading-relaxed text-white/85"
              >
                {slide.subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Controls */}
        {slides.length > 1 && (
          <>
            <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2 sm:bottom-8 sm:right-9">
              <button
                aria-label="আগের স্লাইড"
                onClick={() => paginate(-1)}
                className="glass grid size-10 place-items-center rounded-full text-white transition-transform hover:scale-110 active:scale-90 sm:size-11"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                aria-label="পরের স্লাইড"
                onClick={() => paginate(1)}
                className="glass grid size-10 place-items-center rounded-full text-white transition-transform hover:scale-110 active:scale-90 sm:size-11"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
            <div className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full glass px-3 py-2 sm:top-6">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`স্লাইড ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    "h-1.5 rounded-full bg-white/40 transition-all duration-500",
                    i === index ? "w-7 bg-white" : "w-1.5 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}
