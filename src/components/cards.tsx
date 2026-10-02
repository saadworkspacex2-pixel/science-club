"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, ArrowUpRight, GraduationCap, CheckCircle2, Loader, XCircle, Rocket } from "lucide-react";
import { Reveal, Tilt } from "./reveal";
import { toBn, cn, formatDate } from "@/lib/utils";

// ---------- Achievement ----------
export type AchievementCardData = {
  id: number;
  title: string;
  subtitle: string;
  coverImage: string;
  eventName: string;
  date: string;
  medals: number;
  prizes: number;
};

export function AchievementCard({ a, delay = 0 }: { a: AchievementCardData; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Tilt>
        <Link
          href={`/achievements/${a.id}`}
          className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-soft transition-shadow duration-500 hover:shadow-lift"
        >
          {a.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.coverImage}
              alt={a.title}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <div className="absolute inset-0 bg-black/[0.08] dark:bg-white/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          {(a.medals > 0 || a.prizes > 0) && (
            <div className="glass absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
              <Award className="size-3.5 text-orange" />
              {toBn(a.medals + a.prizes)} পুরস্কার
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">
              {a.eventName || a.date}
            </p>
            <h3 className="font-display mt-1.5 text-lg font-bold leading-snug text-white sm:text-xl">
              {a.title}
            </h3>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/70 opacity-0 transition-all duration-300 group-hover:opacity-100">
              বিস্তারিত দেখুন <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </Link>
      </Tilt>
    </Reveal>
  );
}

// ---------- Member ----------
export type MemberCardData = {
  id: number;
  name: string;
  role: string;
  className: string;
  section: string;
  roll: string;
  photoUrl: string;
  isLeadership: boolean;
};

export function MemberCard({ m, delay = 0 }: { m: MemberCardData; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <Tilt>
        <Link
          href={`/members/${m.id}`}
          className="group relative block aspect-[3/4] overflow-hidden rounded-[1.75rem] shadow-soft transition-shadow duration-500 hover:shadow-lift"
        >
          {m.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={m.photoUrl}
              alt={m.name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
            />
          ) : (
            <div className="grid size-full place-items-center bg-black/[0.06] dark:bg-white/10">
              <span className="font-display text-6xl font-extrabold text-ink/25 dark:text-white/30">{m.name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
          <div className="glass absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
            {m.role}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <h3 className="font-display text-xl font-bold text-white">{m.name}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-white/75">
              <GraduationCap className="size-3.5" />
              শ্রেণি {m.className}
              {m.section && ` • শাখা ${m.section}`}
              {m.roll && ` • রোল ${m.roll}`}
            </p>
          </div>
        </Link>
      </Tilt>
    </Reveal>
  );
}

// ---------- Projects with filter ----------
export type ProjectCardData = {
  id: number;
  title: string;
  summary: string;
  imageUrl: string;
  status: string;
};

export const projectStatus: Record<string, { label: string; dot: string; Icon: typeof Rocket }> = {
  success: { label: "সফল", dot: "bg-green", Icon: CheckCircle2 },
  ongoing: { label: "চলমান", dot: "bg-blue-bright", Icon: Loader },
  failed: { label: "শিক্ষা নেওয়া", dot: "bg-orange", Icon: XCircle },
  future: { label: "ভবিষ্যৎ পরিকল্পনা", dot: "bg-[#af52de]", Icon: Rocket },
};

export const statusChipCls =
  "inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-bold text-ink shadow-md backdrop-blur-md dark:bg-black/60 dark:text-white";

export function ProjectsView({
  projects,
  limit,
}: {
  projects: ProjectCardData[];
  limit?: number;
}) {
  const [filter, setFilter] = useState("all");
  const shown = projects
    .filter((p) => filter === "all" || p.status === filter)
    .slice(0, limit ?? projects.length);

  const filters = [
    { key: "all", label: "সব প্রকল্প" },
    ...Object.entries(projectStatus).map(([key, v]) => ({ key, label: v.label })),
  ];

  return (
    <div>
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
                layoutId="proj-filter"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue to-blue-bright shadow-lg shadow-blue/30"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>
      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((p) => {
            const st = projectStatus[p.status] ?? projectStatus.ongoing;
            return (
              <motion.div
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -16 }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              >
                <Link
                  href={`/projects/${p.id}`}
                  className="card group block overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-lift"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]"
                      />
                    ) : (
                      <div className="size-full bg-black/[0.06] dark:bg-white/10" />
                    )}
                    <span className={cn("absolute left-3.5 top-3.5", statusChipCls)}>
                      <span className={cn("size-2 rounded-full", st.dot)} />
                      {st.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold leading-snug transition-colors group-hover:text-blue">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft dark:text-white/60">
                      {p.summary}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && (
        <p className="py-14 text-center text-sm text-ink-soft dark:text-white/55">
          এই বিভাগে এখনো কোনো প্রকল্প নেই
        </p>
      )}
    </div>
  );
}

export { formatDate };
