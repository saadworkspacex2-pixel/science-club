"use client";

import { useMemo, useState } from "react";
import { Search, Download, ExternalLink, FileText, BookOpen, Newspaper, Link2, GraduationCap } from "lucide-react";
import { bn, bnDate } from "@/lib/utils";

type R = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  fileUrl: string | null;
  externalUrl: string | null;
  createdAt?: string | Date | null;
};

const CATS = [
  { key: "all", label: "সব", icon: BookOpen },
  { key: "নোট", label: "নোট", icon: FileText },
  { key: "গাইড", label: "গাইড", icon: GraduationCap },
  { key: "প্রশ্নপত্র", label: "প্রশ্নপত্র", icon: FileText },
  { key: "ম্যাগাজিন", label: "ম্যাগাজিন", icon: Newspaper },
  { key: "লিংক", label: "উপকারী লিংক", icon: Link2 },
];

const LEGACY: Record<string, string> = {
  note: "নোট",
  guide: "গাইড",
  paper: "প্রশ্নপত্র",
  magazine: "ম্যাগাজিন",
  link: "লিংক",
};



export default function ResourcesClient({ rows }: { rows: R[] }) {
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const catOk = cat === "all" || r.category === cat || LEGACY[r.category] === cat;
      const qOk =
        !query ||
        r.title.toLowerCase().includes(query) ||
        (r.description || "").toLowerCase().includes(query);
      return catOk && qOk;
    });
  }, [rows, cat, q]);

  return (
    <div>
      <div className="glass-card mb-5 flex items-center gap-3 !rounded-2xl px-5 py-3.5" style={{ boxShadow: "none" }}>
        <Search className="h-4.5 w-4.5 shrink-0" style={{ color: "var(--ink-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="নোট, গাইড, প্রশ্নপত্র খুঁজুন…"
          className="w-full bg-transparent text-[15px] outline-none placeholder:opacity-50"
        />
      </div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-8 sm:px-0">
        {CATS.map((c) => {
          const active = cat === c.key;
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setCat(c.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold sm:py-2.5 sm:text-[13.5px] transition-all duration-400 ease-apple ${
                active ? "scale-[1.03] text-white" : "glass hover:scale-[1.02]"
              }`}
              style={active ? { background: "var(--brand)", boxShadow: "0 10px 24px -8px rgba(0,113,227,.55)" } : undefined}
            >
              <Icon className="h-4 w-4" /> {c.label}
            </button>
          );
        })}
      </div>

      <div key={cat} className="grid gap-3 sm:grid-cols-2 sm:gap-4" style={{ animation: "resIn .5s cubic-bezier(.22,1,.36,1) both" }}>
        {list.map((r) => (
          <div key={r.id} className="glass-card hover-lift flex flex-col p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
                <FileText className="h-5.5 w-5.5" style={{ color: "var(--brand)" }} />
              </span>
              <span className="chip !text-[11px]">{r.category}</span>
            </div>
            <h3 className="mt-4 text-[16.5px] font-bold leading-snug tracking-tight">{r.title}</h3>
            {r.description && (
              <p className="mt-2 flex-1 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                {r.description}
              </p>
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                {bnDate(r.createdAt)}
              </span>
              <div className="flex gap-2">
                {r.fileUrl && (
                  <a href={r.fileUrl} download className="btn-brand !px-4 !py-2 text-[12.5px]">
                    <Download className="h-3.5 w-3.5" /> ডাউনলোড
                  </a>
                )}
                {r.externalUrl && (
                  <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="btn-glass !px-4 !py-2 text-[12.5px]">
                    <ExternalLink className="h-3.5 w-3.5" /> খুলুন
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="glass-card col-span-full py-14 text-center text-sm" style={{ color: "var(--ink-3)" }}>
            কিছু পাওয়া যায়নি
          </p>
        )}
      </div>
      <style jsx>{`
        @keyframes resIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
