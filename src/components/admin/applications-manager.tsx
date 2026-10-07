"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Phone,
  Loader2,
  Inbox,
  School,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneOutgoing,
} from "lucide-react";
import { InstagramIcon, WhatsappIcon } from "@/components/brand-icons";
import { bn, bnDate } from "@/lib/utils";

type App = {
  id: number;
  school: string;
  className: string;
  fullName: string;
  classRoll: string;
  phone: string;
  whatsapp: string;
  instagram: string | null;
  status: string;
  note: string | null;
  createdAt: string;
};

const STATUSES = [
  { key: "pending", label: "অপেক্ষমাণ", color: "#ff9500", bg: "rgba(255,149,0,.13)", icon: Clock },
  { key: "contacted", label: "যোগাযোগ করা হয়েছে", color: "#0a84ff", bg: "rgba(10,132,255,.13)", icon: PhoneOutgoing },
  { key: "accepted", label: "গৃহীত", color: "#30d158", bg: "rgba(48,209,88,.13)", icon: CheckCircle2 },
  { key: "rejected", label: "প্রত্যাখ্যাত", color: "#ff375f", bg: "rgba(255,55,95,.12)", icon: XCircle },
];

export default function ApplicationsManager() {
  const [rows, setRows] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/applications");
    const data = await res.json();
    setRows(data.rows || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const patch = async (id: number, body: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const { row } = await res.json();
      setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...row } : r)));
    }
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = rows.filter((r) => r.status === s.key).length;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">সদস্য আবেদন</h1>
        <p className="mt-1 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
          মোট {bn(rows.length)}টি আবেদন · {bn(counts.pending || 0)}টি নতুন অপেক্ষমাণ
        </p>
      </div>

      {/* Filter */}
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {[{ key: "all", label: "সব" }, ...STATUSES].map((s) => {
          const active = filter === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-300 ${
                active ? "text-white" : "glass"
              }`}
              style={active ? { background: "var(--brand)", boxShadow: "0 8px 20px -6px rgba(0,113,227,.5)" } : undefined}
            >
              {s.label}
              {s.key !== "all" && ` (${bn(counts[s.key] || 0)})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 py-16" style={{ color: "var(--ink-3)" }}>
          <Inbox className="h-9 w-9" />
          <p className="text-sm font-medium">এই তালিকায় কিছু নেই</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((a) => {
            const st = STATUSES.find((s) => s.key === a.status) || STATUSES[0];
            const StIcon = st.icon;
            return (
              <li key={a.id} className="glass-card p-3.5 sm:p-5" style={{ boxShadow: "none" }}>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[18px] font-bold text-gradient">
                    {a.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-[16px] font-bold">{a.fullName}</h3>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold"
                        style={{ background: st.bg, color: st.color }}
                      >
                        <StIcon className="h-3.5 w-3.5" />
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px]" style={{ color: "var(--ink-2)" }}>
                      <span className="inline-flex items-center gap-1.5">
                        <School className="h-3.5 w-3.5" /> {a.school}
                      </span>
                      <span>শ্রেণি {a.className}</span>
                      <span>রোল {a.classRoll}</span>
                      <span style={{ color: "var(--ink-3)" }}>{bnDate(a.createdAt)}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`tel:${a.phone}`} className="btn-glass !px-3.5 !py-2 text-[12px]">
                        <Phone className="h-3.5 w-3.5" /> {a.phone}
                      </a>
                      <a
                        href={`https://wa.me/88${a.whatsapp.replace(/^\+?88/, "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-glass !px-3.5 !py-2 text-[12px]"
                        style={{ color: "#30d158" }}
                      >
                        <WhatsappIcon className="h-3.5 w-3.5" /> হোয়াটসঅ্যাপ
                      </a>
                      {a.instagram && (
                        <a
                          href={`https://instagram.com/${a.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-glass !px-3.5 !py-2 text-[12px]"
                          style={{ color: "#d62976" }}
                        >
                          <InstagramIcon className="h-3.5 w-3.5" /> @{a.instagram}
                        </a>
                      )}
                    </div>
                    {a.note && (
                      <p className="mt-2.5 rounded-xl bg-black/[0.04] px-3 py-2 text-[12.5px] dark:bg-white/5" style={{ color: "var(--ink-2)" }}>
                        নোট: {a.note}
                      </p>
                    )}
                    {noteFor === a.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          className="field !py-2 text-[13px]"
                          placeholder="নোট লিখুন…"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                        />
                        <button
                          className="btn-brand !px-4 !py-2 text-[12px]"
                          onClick={() => {
                            patch(a.id, { note: noteText });
                            setNoteFor(null);
                          }}
                        >
                          সেভ
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid w-full grid-cols-2 gap-1.5 sm:flex sm:w-auto sm:flex-col">
                    {STATUSES.filter((s) => s.key !== a.status).map((s) => {
                      const I = s.icon;
                      return (
                        <button
                          key={s.key}
                          onClick={() => patch(a.id, { status: s.key })}
                          className="glass flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold transition-all hover:scale-[1.03] active:scale-95"
                          style={{ color: s.color }}
                        >
                          <I className="h-3.5 w-3.5" /> {s.label}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        setNoteFor(noteFor === a.id ? null : a.id);
                        setNoteText(a.note || "");
                      }}
                      className="glass rounded-xl px-3 py-2 text-[12px] font-semibold"
                      style={{ color: "var(--ink-2)" }}
                    >
                      নোট যোগ করুন
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
