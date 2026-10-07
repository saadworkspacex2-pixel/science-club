"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Check, Loader2, Users, X } from "lucide-react";
import { bn } from "@/lib/utils";

type M = {
  id: number;
  name: string;
  role: string;
  className: string;
  photoUrl: string;
};

export default function MemberPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
}) {
  const [all, setAll] = useState<M[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/members");
        const data = await res.json();
        setAll(data.rows || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = useMemo(() => new Set(value ?? []), [value]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return all;
    return all.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        (m.role || "").toLowerCase().includes(query)
    );
  }, [all, q]);

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const chosen = all.filter((m) => selected.has(m.id));

  if (loading) {
    return (
      <div className="grid place-items-center rounded-2xl border py-8">
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--brand)" }} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-3">
      {/* Selected chips */}
      {chosen.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {chosen.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white transition-transform active:scale-95"
              style={{ background: "linear-gradient(135deg,#0a84ff,#0060c9)" }}
            >
              {m.name}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 rounded-xl bg-black/[0.04] px-3 py-2 dark:bg-white/5">
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--ink-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="সদস্য খুঁজুন…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:opacity-50"
        />
        <span className="shrink-0 text-[11px] font-bold" style={{ color: "var(--brand)" }}>
          {bn(chosen.length)} জন
        </span>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto pr-0.5">
        {list.map((m) => {
          const on = selected.has(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                on
                  ? "bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/5"
              }`}
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-all ${
                  on ? "border-transparent" : "border-black/20 dark:border-white/25"
                }`}
                style={on ? { background: "var(--brand)" } : undefined}
              >
                {on && <Check className="h-3.5 w-3.5 text-white" />}
              </span>
              {m.photoUrl ? (
                <img src={m.photoUrl} alt={m.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-bold text-white" style={{ background: "linear-gradient(135deg,#0a84ff,#30d158)" }}>
                  {m.name.charAt(0)}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold">{m.name}</span>
                <span className="block truncate text-[11px]" style={{ color: "var(--ink-3)" }}>
                  {m.role}
                  {m.className ? ` · শ্রেণি ${m.className}` : ""}
                </span>
              </span>
            </button>
          );
        })}
        {list.length === 0 && (
          <p className="flex items-center justify-center gap-2 py-6 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
            <Users className="h-4 w-4" /> কোনো সদস্য পাওয়া যায়নি
          </p>
        )}
      </div>
    </div>
  );
}
