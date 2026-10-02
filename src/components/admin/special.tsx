"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Trash2, Phone, CheckCircle2, Clock, PhoneCall, XCircle, Save, Image as ImageIcon,
} from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import { UploadField } from "./fields";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const statuses: Record<string, { label: string; cls: string; Icon: any }> = {
  pending: { label: "অপেক্ষমাণ", cls: "bg-orange/15 text-orange", Icon: Clock },
  contacted: { label: "যোগাযোগ হয়েছে", cls: "bg-blue/15 text-blue", Icon: PhoneCall },
  accepted: { label: "গৃহীত", cls: "bg-green/15 text-green", Icon: CheckCircle2 },
  rejected: { label: "বাতিল", cls: "bg-red/15 text-red", Icon: XCircle },
};

async function api(resource: string, method: string, body?: any) {
  const res = await fetch(`/api/admin/${resource}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error();
  return res.json().catch(() => ({}));
}

export function ApplicationsManager() {
  const [rows, setRows] = useState<any[] | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { api("applications", "GET").then(setRows).catch(() => setRows([])); }, []);

  const setStatus = async (row: any, status: string) => {
    setRows((rs) => (rs || []).map((r) => (r.id === row.id ? { ...r, status } : r)));
    await api("applications", "PATCH", { id: row.id, status });
  };
  const remove = async (row: any) => {
    await api("applications", "DELETE", { id: row.id });
    setRows((rs) => (rs || []).filter((r) => r.id !== row.id));
  };

  if (!rows) return <div className="grid place-items-center py-16"><Loader2 className="size-7 animate-spin text-blue" /></div>;
  const shown = rows.filter((r) => filter === "all" || r.status === filter);
  const counts = Object.fromEntries(Object.keys(statuses).map((s) => [s, rows.filter((r) => r.status === s).length]));

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {[{ k: "all", l: "সব আবেদন" }, ...Object.entries(statuses).map(([k, v]) => ({ k, l: v.label }))].map((f) => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filter === f.k ? "text-white" : "glass text-ink-soft dark:text-white/65")}>
            {filter === f.k && (
              <motion.span layoutId="app-filter" className="absolute inset-0 rounded-full bg-gradient-to-r from-blue to-blue-bright"
                transition={{ type: "spring", stiffness: 320, damping: 28 }} />
            )}
            <span className="relative">
              {f.l}
              {f.k !== "all" && counts[f.k] ? ` (${counts[f.k]})` : f.k === "all" ? ` (${rows.length})` : ""}
            </span>
          </button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="card rounded-2xl py-14 text-center text-sm text-ink-soft dark:text-white/50">কোনো আবেদন নেই</p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence>
            {shown.map((r) => {
              const st = statuses[r.status] ?? statuses.pending;
              return (
                <motion.div layout key={r.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                  className="card rounded-3xl! p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-base font-extrabold">{r.fullName}</p>
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold", st.cls)}>
                          <st.Icon className="size-3" /> {st.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-ink-soft dark:text-white/55">
                        {r.school.includes("Girls") ? "Cantt Board Girls School" : "বুর উত্তম শহীদ সমাদ"} • {r.className}ম শ্রেণি • রোল {r.classRoll}
                      </p>
                    </div>
                    <button onClick={() => remove(r)} aria-label="মুছুন"
                      className="grid size-9 shrink-0 place-items-center rounded-xl bg-red/10 text-red"><Trash2 className="size-4" /></button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 transition-transform hover:scale-[1.03]">
                      <Phone className="size-3.5 text-blue" /> {r.phone}
                    </a>
                    <a href={`https://wa.me/${r.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-green transition-transform hover:scale-[1.03]">
                      <WhatsAppIcon className="size-3.5" /> WhatsApp
                    </a>
                    {r.instagram && (
                      <a href={`https://instagram.com/${r.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-2 text-[#e1306c] transition-transform hover:scale-[1.03]">
                        <InstagramIcon className="size-3.5" /> {r.instagram}
                      </a>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-1.5">
                    {Object.entries(statuses).map(([key, v]) => (
                      <button key={key} onClick={() => setStatus(r, key)}
                        className={cn("rounded-xl py-2 text-[10px] font-bold transition-all sm:text-[11px]",
                          r.status === key ? "bg-gradient-to-r from-blue to-blue-bright text-white shadow-md" : "bg-mist text-ink-soft hover:bg-black/[0.07] dark:bg-white/5 dark:text-white/55 dark:hover:bg-white/10")}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

const settingFields = [
  { key: "clubName", label: "ক্লাবের নাম" },
  { key: "tagline", label: "ট্যাগলাইন" },
  { key: "mission", label: "মিশন", area: true },
  { key: "vision", label: "ভিশন", area: true },
  { key: "history", label: "ইতিহাস", area: true },
  { key: "email", label: "ইমেইল" },
  { key: "phone", label: "ফোন" },
  { key: "address", label: "ঠিকানা" },
  { key: "facebook", label: "ফেসবুক লিংক" },
  { key: "youtube", label: "ইউটিউব লিংক" },
  { key: "instagram", label: "ইনস্টাগ্রাম লিংক" },
];

export function SettingsManager() {
  const [vals, setVals] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api("settings", "GET").then((rows: any[]) =>
      setVals(Object.fromEntries(rows.map((r) => [r.key, r.value])))
    );
  }, []);

  if (!vals) return <div className="grid place-items-center py-16"><Loader2 className="size-7 animate-spin text-blue" /></div>;

  const save = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(vals)) {
      await api("settings", "POST", { key, value });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl">
      <div className="card rounded-3xl! space-y-5 p-6">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold">
            <ImageIcon className="size-4 text-blue" /> ক্লাবের লোগো
          </p>
          <UploadField label="" value={vals.logoUrl || ""} onChange={(u) => setVals((v) => ({ ...v, logoUrl: u }))} kind="image" aspect={1} accept="image/*" />
        </div>
        {settingFields.map((f) => (
          <div key={f.key}>
            <p className="mb-1.5 text-[13px] font-bold">{f.label}</p>
            {f.area ? (
              <textarea rows={3} value={vals[f.key] || ""} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
            ) : (
              <input value={vals[f.key] || ""} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
            )}
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-4 text-sm font-extrabold text-white shadow-lg shadow-blue/25 disabled:opacity-60">
        {saving ? <Loader2 className="size-4 animate-spin" /> : saved ? <CheckCircle2 className="size-4" /> : <Save className="size-4" />}
        {saving ? "সংরক্ষণ হচ্ছে..." : saved ? "সংরক্ষিত হয়েছে!" : "সব পরিবর্তন সংরক্ষণ করুন"}
      </button>
    </div>
  );
}
