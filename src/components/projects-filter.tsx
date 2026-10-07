"use client";

import { useState, useMemo } from "react";
import { ProjectCard, PROJECT_STATUS } from "@/components/cards";

type P = {
  id: number;
  title: string;
  imageUrl: string;
  summary: string;
  status: string;
  date: string;
};

export default function ProjectsFilter({ projects }: { projects: P[] }) {
  const [filter, setFilter] = useState("all");
  const list = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [filter, projects]
  );

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mb-8 sm:px-0">
        {[{ key: "all", label: "সব প্রকল্প" }, ...Object.entries(PROJECT_STATUS).map(([key, v]) => ({ key, label: v.label }))].map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold sm:px-5 sm:py-2.5 sm:text-[13.5px] transition-all duration-400 ease-apple ${
                active ? "text-white scale-[1.03]" : "glass hover:scale-[1.02]"
              }`}
              style={
                active
                  ? { background: "var(--brand)", boxShadow: "0 10px 24px -8px rgba(0,113,227,.55)" }
                  : undefined
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <div key={filter} className="grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" style={{ animation: "gridIn .6s cubic-bezier(.22,1,.36,1) both" }}>
        {list.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
        {list.length === 0 && (
          <p className="col-span-full glass-card py-12 text-center text-sm" style={{ color: "var(--ink-3)" }}>
            এই ক্যাটাগরিতে কোনো প্রকল্প নেই
          </p>
        )}
      </div>
      <style jsx>{`
        @keyframes gridIn {
          from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
          to { opacity: 1; transform: none; filter: none; }
        }
      `}</style>
    </div>
  );
}
