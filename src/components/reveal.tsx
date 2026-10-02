"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 90, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={cn("mb-10 sm:mb-14", align === "center" ? "text-center" : "text-left")}>
      <p className="font-tiro inline-block text-lg italic text-blue">
        ◦ {eyebrow} ◦
      </p>
      <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-base leading-relaxed text-ink-soft dark:text-white/60",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const bg = useTransform([glowX, glowY], (values: unknown) => {
    const [x, y] = values as number[];
    return `radial-gradient(420px circle at ${x}% ${y}%, rgb(255 255 255 / 0.16), transparent 60%)`;
  });

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d", perspective: 900 }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 10);
        rx.set((0.5 - py) * 10);
        glowX.set(px * 100);
        glowY.set(py * 100);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      className={cn("group/tilt relative", className)}
    >
      {children}
      <motion.div
        aria-hidden
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/tilt:opacity-100"
      />
    </motion.div>
  );
}
