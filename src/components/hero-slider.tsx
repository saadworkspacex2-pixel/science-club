"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { bn } from "@/lib/utils";

export type Slide = {
  id: number;
  imageUrl: string;
  imageUrlMobile?: string | null;
  tag: string | null;
  title: string;
  subtitle: string | null;
  logoUrl?: string | null;
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragging = useRef(false);
  const startX = useRef(0);
  const count = slides.length;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused || dragging.current) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [go, paused, count]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (count < 2) return;
    dragging.current = true;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    setDragX(e.clientX - startX.current);
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dragX) > 60) go(dragX < 0 ? 1 : -1);
    setDragX(0);
  };

  if (!count) return null;
  const current = slides[index];

  return (
    <div
      className="group relative select-none overflow-hidden rounded-[1.6rem] shadow-[var(--shadow-lift)] sm:rounded-[2.2rem]"
      style={{ touchAction: "pan-y", cursor: count > 1 ? "grab" : "default" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => {
        endDrag();
        setPaused(false);
      }}
      onPointerEnter={() => setPaused(true)}
      role="region"
      aria-label="ফীচার্ড স্লাইডার"
    >
      {/* Tall immersive stage on phones, cinematic 16:9 on larger screens */}
      <div className="relative h-[78svh] max-h-[760px] min-h-[460px] w-full sm:h-auto sm:max-h-[78vh] sm:min-h-0 sm:aspect-[16/9]">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.id}
              className="absolute inset-0 transition-all duration-[1100ms] ease-apple"
              style={{
                opacity: active ? 1 : 0,
                transform: `translateX(${active ? dragX * 0.25 : 0}px) scale(${active ? 1 : 1.04})`,
                zIndex: active ? 2 : 1,
              }}
            >
              <picture key={`${s.id}-${active ? index : "idle"}`}>
                {s.imageUrlMobile && (
                  <source media="(max-width: 639px)" srcSet={s.imageUrlMobile} />
                )}
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className={`h-full w-full object-cover ${active ? "kenburns" : ""}`}
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </picture>
              {/* Stronger gradient on mobile so the tall image reads well behind text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 sm:from-black/55 sm:via-black/8 sm:to-transparent" />
            </div>
          );
        })}

        {/* ===== Contest / event logo badge (top-right) ===== */}
        {current.logoUrl && (
          <div
            key={`logo-${index}`}
            className="glass-strong absolute right-3 top-3 z-20 grid place-items-center rounded-2xl p-2 shadow-[var(--shadow-soft)] sm:right-5 sm:top-5 sm:rounded-3xl sm:p-2.5"
            style={{ animation: "badgeIn .7s cubic-bezier(.34,1.56,.64,1) both" }}
          >
            <img
              src={current.logoUrl}
              alt={current.tag || "প্রতিযোগিতার লোগো"}
              className="h-11 w-11 rounded-xl object-contain sm:h-14 sm:w-14"
            />
          </div>
        )}

        {/* Slide counter */}
        {count > 1 && (
          <div
            className={`glass absolute z-20 flex items-center gap-2 rounded-full px-3 py-1.5 ${
              current.logoUrl ? "left-3 top-3 sm:left-5 sm:top-5" : "right-3 top-3 sm:right-5 sm:top-5"
            }`}
            style={{ background: "rgba(0,0,0,.3)", borderColor: "rgba(255,255,255,.22)" }}
          >
            <span className="text-[11px] font-bold tabular-nums text-white/90">
              {bn(index + 1)} / {bn(count)}
            </span>
          </div>
        )}

        {/* ===== Caption overlay — inside the image on every screen size ===== */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-6">
          <div
            key={index}
            className="glass-strong w-full max-w-xl rounded-[1.4rem] p-4 shadow-[var(--shadow-soft)] sm:rounded-3xl sm:p-6"
            style={{ animation: "heroCap 0.9s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {current.tag && (
              <span
                className="mb-2 inline-flex max-w-full items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] px-2.5 py-1 text-[10.5px] font-semibold sm:mb-3 sm:px-3 sm:text-[11px]"
                style={{ color: "var(--brand)" }}
              >
                <Sparkles className="h-3 w-3 shrink-0" />
                <span className="truncate">{current.tag}</span>
              </span>
            )}
            {/* Smaller, tighter titles on phones */}
            <h1 className="text-[clamp(1rem,4.4vw,2.4rem)] font-bold leading-[1.25] tracking-tight">
              {current.title}
            </h1>
            {current.subtitle && (
              <p
                className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed sm:mt-2.5 sm:line-clamp-none sm:text-[14.5px]"
                style={{ color: "var(--ink-2)" }}
              >
                {current.subtitle}
              </p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-5 sm:gap-2.5">
              <Link href="/join" className="btn-brand !px-3.5 !py-2 text-[12px] sm:!px-5 sm:!py-2.5 sm:text-sm">
                পরিবারের অংশ হোন
              </Link>
              <Link href="/achievements" className="btn-glass !px-3.5 !py-2 text-[12px] sm:!px-5 sm:!py-2.5 sm:text-sm">
                আমাদের অর্জন
              </Link>

              {/* Dots sit inline with the buttons — always reachable by thumb */}
              {count > 1 && (
                <div className="ml-auto flex items-center gap-1.5">
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      aria-label={`স্লাইড ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-500 ease-apple sm:h-2 ${
                        i === index
                          ? "w-5 bg-[var(--brand)] sm:w-7"
                          : "w-1.5 bg-black/20 hover:bg-black/40 dark:bg-white/30 sm:w-2"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Arrows — pointer devices only */}
        {count > 1 && (
          <>
            <button
              aria-label="আগের স্লাইড"
              onClick={() => go(-1)}
              className="glass-strong absolute left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-110 group-hover:opacity-100 md:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="পরের স্লাইড"
              onClick={() => go(1)}
              className="glass-strong absolute right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full opacity-0 shadow-[var(--shadow-soft)] transition-all duration-300 hover:scale-110 group-hover:opacity-100 md:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes heroCap {
          from { opacity: 0; transform: translateY(22px) scale(0.98); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes badgeIn {
          from { opacity: 0; transform: translateY(-14px) scale(.8); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
