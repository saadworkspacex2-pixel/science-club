"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Pencil, Trash2, GripVertical, X, Loader2, Search, ImageOff,
} from "lucide-react";
import { UploadField, MultiImagesField } from "./fields";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "image" | "images" | "media" | "file" | "password" | "dynamic-select";
  options?: { value: string; label: string }[];
  aspect?: number;
  half?: boolean;
  placeholder?: string;
  hint?: string;
};

export type ResourceConfig = {
  resource: string;
  title: string;
  singular: string;
  sortable?: boolean;
  fields: FieldConfig[];
  displayTitle: (r: any) => string;
  displaySub?: (r: any) => string;
  displayImage?: (r: any) => string | undefined;
};

const defaultFor = (f: FieldConfig): any =>
  f.type === "number" ? 0 : f.type === "checkbox" ? false : f.type === "images" ? [] : "";

async function api(resource: string, method: string, body?: any) {
  const res = await fetch(`/api/admin/${resource}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "সমস্যা হয়েছে");
  return data;
}

function SortableRow({
  row, cfg, onEdit, onDelete, sortable,
}: {
  row: any; cfg: ResourceConfig; onEdit: () => void; onDelete: () => void; sortable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  const img = cfg.displayImage?.(row);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "card relative z-0 flex items-center gap-3 rounded-2xl! p-3",
        isDragging && "z-20 shadow-lift ring-2 ring-blue/40"
      )}
    >
      {sortable && (
        <button {...attributes} {...listeners} aria-label="টেনে সাজান"
          className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-xl text-ink-soft/60 transition-colors hover:bg-black/5 hover:text-ink active:cursor-grabbing dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white">
          <GripVertical className="size-4" />
        </button>
      )}
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
      ) : (
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-black/[0.05] text-ink-soft dark:bg-white/10 dark:text-white/40">
          <ImageOff className="size-4" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold">{cfg.displayTitle(row)}</p>
        {cfg.displaySub && (
          <p className="truncate text-xs text-ink-soft dark:text-white/50">{cfg.displaySub(row)}</p>
        )}
      </div>
      <button onClick={onEdit} aria-label="সম্পাদনা"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue/10 text-blue transition-transform hover:scale-105 active:scale-95">
        <Pencil className="size-4" />
      </button>
      <button onClick={onDelete} aria-label="মুছুন"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-red/10 text-red transition-transform hover:scale-105 active:scale-95">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

export default function ResourceManager({
  cfg,
  dynamicOptions,
}: {
  cfg: ResourceConfig;
  dynamicOptions?: Record<string, { value: string; label: string }[]>;
}) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<any | null>(null); // {} = new
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = async () => {
    try {
      setRows(await api(cfg.resource, "GET"));
    } catch {
      setRows([]);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [cfg.resource]);

  const shown = useMemo(() => {
    if (!rows) return [];
    if (!q.trim()) return rows;
    return rows.filter((r) =>
      `${cfg.displayTitle(r)} ${cfg.displaySub?.(r) ?? ""}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [rows, q, cfg]);

  const openNew = () => {
    const f: Record<string, any> = {};
    cfg.fields.forEach((fd) => (f[fd.key] = defaultFor(fd)));
    setForm(f);
    setEditing({ __new: true });
    setErr("");
  };
  const openEdit = (row: any) => {
    const f: Record<string, any> = {};
    cfg.fields.forEach((fd) => {
      if (fd.type === "password") f[fd.key] = "";
      else f[fd.key] = row[fd.key] ?? defaultFor(fd);
    });
    setForm(f);
    setEditing(row);
    setErr("");
  };

  const save = async () => {
    setSaving(true);
    setErr("");
    try {
      const body = { ...form };
      if (form.password === "") delete body.password;
      if (editing.__new) {
        const created = await api(cfg.resource, "POST", body);
        setRows((rs) => [created, ...(rs || [])]);
      } else {
        const updated = await api(cfg.resource, "PATCH", { ...body, id: editing.id });
        setRows((rs) => (rs || []).map((r) => (r.id === editing.id ? { ...r, ...updated } : r)));
      }
      setEditing(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api(cfg.resource, "DELETE", { id: confirmDelete.id });
      setRows((rs) => (rs || []).filter((r) => r.id !== confirmDelete.id));
    } finally {
      setConfirmDelete(null);
    }
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id || !rows) return;
    const oldI = rows.findIndex((r) => r.id === active.id);
    const newI = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldI, newI);
    setRows(next);
    await api(cfg.resource, "PATCH", { order: next.map((r, i) => ({ id: r.id, sortOrder: i })) });
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="glass flex h-11 flex-1 items-center gap-2 rounded-full px-4 sm:max-w-xs">
          <Search className="size-4 shrink-0 text-ink-soft dark:text-white/45" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${cfg.title} খুঁজুন...`}
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-soft/60 dark:placeholder:text-white/40" />
        </div>
        <button onClick={openNew}
          className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright px-5 text-sm font-extrabold text-white shadow-lg shadow-blue/25 transition-transform hover:scale-[1.03] active:scale-95">
          <Plus className="size-4" /> নতুন {cfg.singular}
        </button>
      </div>

      {!rows ? (
        <div className="grid place-items-center py-16"><Loader2 className="size-7 animate-spin text-blue" /></div>
      ) : shown.length === 0 ? (
        <p className="card rounded-2xl py-14 text-center text-sm text-ink-soft dark:text-white/50">
          কিছুই নেই — ডানদিকের বাটনে নতুন {cfg.singular} যোগ করুন
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={shown.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {shown.map((row) => (
                <SortableRow key={row.id} row={row} cfg={cfg}
                  sortable={Boolean(cfg.sortable) && !q.trim()}
                  onEdit={() => openEdit(row)} onDelete={() => setConfirmDelete(row)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {cfg.sortable && rows && rows.length > 1 && !q.trim() && (
        <p className="mt-4 text-center text-xs text-ink-soft/70 dark:text-white/40">
          টিপ: বাম পাশের হ্যান্ডেল ধরে টেনে ক্রম পরিবর্তন করুন
        </p>
      )}

      {/* Edit Dialog */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xl"
            onClick={() => setEditing(null)}>
            <motion.div
              initial={{ scale: 0.95, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong my-auto w-full max-w-2xl rounded-[1.75rem] p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-lg font-extrabold">
                  {editing.__new ? `নতুন ${cfg.singular}` : `${cfg.singular} সম্পাদনা`}
                </h3>
                <button onClick={() => setEditing(null)} className="grid size-9 place-items-center rounded-full glass">
                  <X className="size-4" />
                </button>
              </div>
              <div className="grid max-h-[62vh] gap-4 overflow-y-auto pe-1 sm:grid-cols-2">
                {cfg.fields.map((f) => {
                  const v = form[f.key];
                  const set = (val: any) => setForm((s) => ({ ...s, [f.key]: val }));
                  const full = !f.half || f.type === "textarea" || f.type === "images";
                  return (
                    <div key={f.key} className={cn(full && "sm:col-span-2")}>
                      {f.type === "text" && (
                        <>
                          <p className="mb-1.5 text-[13px] font-bold">{f.label}</p>
                          <input value={v} onChange={(e) => set(e.target.value)} placeholder={f.placeholder}
                            className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
                        </>
                      )}
                      {f.type === "number" && (
                        <>
                          <p className="mb-1.5 text-[13px] font-bold">{f.label}</p>
                          <input type="number" value={v} onChange={(e) => set(Number(e.target.value))}
                            className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
                        </>
                      )}
                      {f.type === "password" && (
                        <>
                          <p className="mb-1.5 text-[13px] font-bold">{f.label}</p>
                          <input type="password" value={v} onChange={(e) => set(e.target.value)}
                            placeholder={f.placeholder || "পরিবর্তন না করলে খালি রাখুন"}
                            className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
                        </>
                      )}
                      {f.type === "textarea" && (
                        <>
                          <p className="mb-1.5 text-[13px] font-bold">{f.label}{f.hint && <span className="ml-1.5 text-[11px] font-medium text-ink-soft dark:text-white/45">({f.hint})</span>}</p>
                          <textarea value={v} onChange={(e) => set(e.target.value)} rows={4} placeholder={f.placeholder}
                            className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5" />
                        </>
                      )}
                      {(f.type === "select" || f.type === "dynamic-select") && (
                        <>
                          <p className="mb-1.5 text-[13px] font-bold">{f.label}</p>
                          <select value={String(v)} onChange={(e) => set(f.type === "dynamic-select" ? Number(e.target.value) : e.target.value)}
                            className="w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3 text-sm font-medium outline-none focus:border-blue/40 dark:border-white/10 dark:bg-white/5">
                            <option value="">নির্বাচন করুন</option>
                            {(f.type === "dynamic-select" ? dynamicOptions?.[f.key] ?? [] : f.options ?? []).map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </>
                      )}
                      {f.type === "checkbox" && (
                        <button type="button" onClick={() => set(!v)}
                          className={cn("flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-bold transition-all",
                            v ? "border-green/40 bg-green/10 text-green" : "border-black/[0.06] bg-mist text-ink-soft dark:border-white/10 dark:bg-white/5 dark:text-white/55")}>
                          {f.label}
                          <span className={cn("relative h-6 w-11 rounded-full transition-colors", v ? "bg-green" : "bg-black/15 dark:bg-white/15")}>
                            <motion.span layout className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow", v ? "right-0.5" : "left-0.5")} />
                          </span>
                        </button>
                      )}
                      {f.type === "image" && (
                        <UploadField label={f.label} value={v} onChange={set} kind="image" aspect={f.aspect} accept="image/*" />
                      )}
                      {f.type === "media" && (
                        <UploadField label={f.label} value={v} onChange={set} kind="file" accept="image/*,video/*" />
                      )}
                      {f.type === "file" && (
                        <UploadField label={f.label} value={v} onChange={set} kind="file" accept="image/*,video/*,.pdf,.zip,.docx,.txt" />
                      )}
                      {f.type === "images" && (
                        <MultiImagesField label={f.label} value={Array.isArray(v) ? v : []} onChange={set} />
                      )}
                    </div>
                  );
                })}
              </div>
              {err && <p className="mt-3 rounded-2xl bg-red/10 px-4 py-2.5 text-center text-sm font-bold text-red">{err}</p>}
              <div className="mt-5 flex gap-2.5">
                <button onClick={() => setEditing(null)} className="flex-1 rounded-full glass py-3.5 text-sm font-bold">বাতিল</button>
                <button onClick={save} disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue/25 disabled:opacity-60">
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] grid place-items-center bg-black/50 p-4 backdrop-blur-xl"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-sm rounded-[1.75rem] p-6 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-red/10 text-red">
                <Trash2 className="size-6" />
              </span>
              <p className="font-display mt-4 text-lg font-extrabold">সত্যিই মুছে ফেলবেন?</p>
              <p className="mt-1.5 text-sm text-ink-soft dark:text-white/55">
                “{cfg.displayTitle(confirmDelete)}” স্থায়ীভাবে মুছে যাবে।
              </p>
              <div className="mt-5 flex gap-2.5">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-full glass py-3 text-sm font-bold">ফিরে যান</button>
                <button onClick={doDelete} className="flex-1 rounded-full bg-red py-3 text-sm font-extrabold text-white">মুছে ফেলুন</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
