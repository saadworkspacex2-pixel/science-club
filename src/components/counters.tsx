"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { Trophy, Users, FlaskConical, Medal, type LucideIcon } from "lucide-react";
import { toBn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  trophy: Trophy,
  users: Users,
  flask: FlaskConical,
  medal: Medal,
};

export type Stat = { icon: string; value: number; label: string };

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const spring = useSpring(0, { stiffness: 42, damping: 16 });
  const display = useTransform(spring, (v) => toBn(Math.round(v)));
  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);
  return (
    <span ref={ref}>
      <motion.span>{display}</motion.span>
    </span>
  );
}

export default function Counters({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {stats.map((s, i) => {
        const Icon = icons[s.icon] ?? Trophy;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7"
          >
            <div className="mb-4 inline-grid size-12 place-items-center rounded-2xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
              <Icon className="size-6" />
            </div>
            <p className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              <CountUp value={s.value} />
              <span className="text-ink-soft dark:text-white/50">+</span>
            </p>
            <p className="mt-1.5 text-sm font-semibold text-ink-soft dark:text-white/60">{s.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
