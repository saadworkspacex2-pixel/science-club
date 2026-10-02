"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, FileText, Link2, Clock8 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export type Resource = {
  id: number;
  title: string;
  category: string;
  fileUrl: string;
  description: string;
  createdAt: string | null;
};

export default function ResourcesView({ resources }: { resources: Resource[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("সব");
  const categories = ["সব", ...Array.from(new Set(resources.map((r) => r.category)))];

  const shown = useMemo(
    () =>
      resources.filter(
        (r) =>
          (cat === "সব" || r.category === cat) &&
          (q.trim() === "" ||
            r.title.toLowerCase().includes(q.toLowerCase()) ||
            r.description.toLowerCase().includes(q.toLowerCase()))
      ),
    [resources, q, cat]
  );

  return (
    <div>
      <div className="mb-7 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "focusable relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                cat === c ? "text-white" : "glass text-ink-soft hover:text-ink dark:text-white/65"
              )}
            >
              {cat === c && (
                <motion.span
                  layoutId="res-filter"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-blue to-blue-bright shadow-lg shadow-blue/30"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>
        <div className="glass flex h-11 items-center gap-2 rounded-full px-4 sm:w-72">
          <Search className="size-4 shrink-0 text-ink-soft dark:text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="রিসোর্স খুঁজুন..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60 dark:placeholder:text-white/40"
          />
        </div>
      </div>

      <motion.div layout className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {shown.map((r) => (
            <motion.div
              layout
              key={r.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className="card group flex flex-col gap-4 p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:flex-row sm:items-center"
            >
              <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-black/[0.05] p-3.5 text-ink dark:bg-white/10 dark:text-white">
                <FileText className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-extrabold transition-colors group-hover:text-blue">
                    {r.title}
                  </h3>
                  <span className="rounded-full bg-blue/10 px-2.5 py-1 text-[10px] font-bold text-blue">
                    {r.category}
                  </span>
                </div>
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft dark:text-white/55">{r.description}</p>
                )}
                {r.createdAt && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-ink-soft/70 dark:text-white/40">
                    <Clock8 className="size-3" /> {formatDate(r.createdAt)}
                  </p>
                )}
              </div>
              {r.fileUrl ? (
                <a
                  href={r.fileUrl}
                  download={!r.fileUrl.startsWith("http") ? true : undefined}
                  target={r.fileUrl.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue/25 transition-transform hover:scale-[1.04] active:scale-95"
                >
                  {r.fileUrl.startsWith("http") ? <Link2 className="size-4" /> : <Download className="size-4" />}
                  {r.fileUrl.startsWith("http") ? "লিংক খুলুন" : "ডাউনলোড"}
                </a>
              ) : (
                <span className="shrink-0 rounded-full bg-mist px-5 py-2.5 text-sm font-bold text-ink-soft dark:bg-white/5 dark:text-white/45">
                  শীঘ্রই আসছে
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {shown.length === 0 && (
        <p className="py-16 text-center text-sm text-ink-soft dark:text-white/55">
          কোনো রিসোর্স পাওয়া যায়নি
        </p>
      )}
    </div>
  );
}
