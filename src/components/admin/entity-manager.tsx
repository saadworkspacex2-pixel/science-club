"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  GripVertical,
  Loader2,
  Check,
  FileText,
  Eye,
  EyeOff,
  Inbox,
} from "lucide-react";
import type { EntityUI, FieldConfig } from "@/lib/admin-config";
import UploadField from "@/components/admin/upload-field";
import BannerUpload from "@/components/admin/banner-upload";
import MemberPicker from "@/components/admin/member-picker";
import AchievementParticipantsEditor from "@/components/admin/achievement-participants-editor";
import MemberCertificatesEditor from "@/components/admin/member-certificates-editor";
import type { AchievementParticipant } from "@/lib/achievement-participant-config";
import { validateMemberCertificates, type MemberCertificate } from "@/lib/member-certificates";
import { bn } from "@/lib/utils";

type Row = Record<string, unknown> & { id: number };

/* ---------------- Single field ---------------- */
function Field({
  field,
  value,
  onChange,
  form,
  setForm,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  form: Record<string, unknown>;
  setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  const str = value == null ? "" : String(value);

  if (field.type === "members") {
    const ids = Array.isArray(value) ? (value as number[]) : [];
    return <MemberPicker value={ids} onChange={(v) => onChange(v)} />;
  }

  if (field.type === "participants") {
    const participants = Array.isArray(value) ? value as AchievementParticipant[] : [];
    return <AchievementParticipantsEditor value={participants} onChange={(rows) => onChange(rows)} />;
  }

  if (field.type === "certificates") {
    const certificates = Array.isArray(value) ? value as MemberCertificate[] : [];
    return <MemberCertificatesEditor value={certificates} onChange={(rows) => onChange(rows)} />;
  }

  if (field.type === "banner") {
    return (
      <BannerUpload
        desktopValue={str}
        mobileValue={form.imageUrlMobile == null ? "" : String(form.imageUrlMobile)}
        onChange={(v) =>
          setForm((s) => ({
            ...s,
            ...(v.desktop !== undefined ? { [field.key]: v.desktop } : {}),
            ...(v.mobile !== undefined ? { imageUrlMobile: v.mobile } : {}),
          }))
        }
      />
    );
  }

  if (field.type === "boolean") {
    const on = Boolean(value);
    return (
      <button
        type="button"
        onClick={() => onChange(!on)}
        className={`relative h-8 w-14 rounded-full transition-colors duration-300 ${on ? "bg-[var(--accent-green,#34c759)]" : "bg-black/15 dark:bg-white/15"}`}
        style={on ? { background: "#34c759" } : undefined}
      >
        <span
          className={`absolute top-1 grid h-6 w-6 place-items-center rounded-full bg-white shadow transition-all duration-300 ease-spring ${
            on ? "left-7" : "left-1"
          }`}
        >
          {on && <Check className="h-3.5 w-3.5 text-green-600" />}
        </span>
      </button>
    );
  }

  if (field.type === "select") {
    return (
      <select className="field" value={str} onChange={(e) => onChange(e.target.value)}>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "textarea" || field.type === "longtext") {
    return (
      <textarea
        className="field min-h-[90px] resize-y"
        rows={field.type === "longtext" ? 5 : 3}
        value={str}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        className="field"
        type="number"
        value={str}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      />
    );
  }

  if (field.type === "image" || field.type === "media" || field.type === "file") {
    const accept =
      field.type === "file"
        ? ".pdf,application/pdf"
        : field.type === "media"
          ? "image/*,video/*"
          : "image/*";
    return <UploadField value={str} onChange={onChange} accept={accept} kind={field.type} />;
  }

  return (
    <input
      className="field"
      type={field.type === "password" ? "password" : "text"}
      value={str}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* ---------------- Main manager ---------------- */
export default function EntityManager({ slug, config }: { slug: string; config: EntityUI }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState<null | { mode: "create" } | { mode: "edit"; row: Row }>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const load = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${slug}${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const data = await res.json();
      setRows(data.rows || []);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const t = window.setTimeout(() => { void load(q); }, q ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [q, load]);

  const openCreate = () => {
    const defaults: Record<string, unknown> = { imageUrlMobile: "" };
    config.fields.forEach((f) => {
      if (f.type === "boolean") defaults[f.key] = true;
      else if (f.type === "members" || f.type === "participants" || f.type === "certificates") defaults[f.key] = [];
      else if (f.type === "select") defaults[f.key] = f.options?.[0]?.value ?? "";
      else defaults[f.key] = "";
    });
    setForm(defaults);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (row: Row) => {
    const filled: Record<string, unknown> = { imageUrlMobile: row.imageUrlMobile ?? "" };
    config.fields.forEach((f) => {
      if (f.type === "members" || f.type === "participants" || f.type === "certificates") {
        filled[f.key] = Array.isArray(row[f.key]) ? row[f.key] : [];
      } else {
        filled[f.key] = row[f.key] ?? (f.type === "boolean" ? false : "");
      }
    });
    setForm(filled);
    setFormError("");
    setModal({ mode: "edit", row });
  };

  const save = async () => {
    for (const f of config.fields) {
      if (f.type === "members") continue;
      if (f.type === "participants") {
        const rows = Array.isArray(form[f.key]) ? form[f.key] as unknown[] : [];
        const hasUnnamed = rows.some((row) =>
          !row || typeof row !== "object" || !String((row as Record<string, unknown>).name ?? "").trim()
        );
        if (hasUnnamed) {
          setFormError("প্রতিটি শিক্ষার্থীর নাম লিখুন অথবা খালি সারিটি মুছে দিন");
          return;
        }
        continue;
      }
      if (f.type === "certificates") {
        const validated = validateMemberCertificates(form[f.key]);
        if ("error" in validated) {
          setFormError(validated.error);
          return;
        }
        continue;
      }
      if (f.required && !String(form[f.key] ?? "").trim()) {
        setFormError(`"${f.label}" পূরণ করতে হবে`);
        return;
      }
    }
    setSaving(true);
    setFormError("");
    try {
      const isEdit = modal?.mode === "edit";
      const res = await fetch(
        isEdit ? `/api/admin/${slug}/${(modal as { mode: "edit"; row: Row }).row.id}` : `/api/admin/${slug}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "সংরক্ষণ ব্যর্থ");
        return;
      }
      setModal(null);
      await load(q);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: Row) => {
    if (!confirm(`"${row.title || row.name || row.fullName || `#${row.id}`}" মুছে ফেলবেন?`)) return;
    await fetch(`/api/admin/${slug}/${row.id}`, { method: "DELETE" });
    await load(q);
  };

  const onDrop = async (toIdx: number) => {
    const from = dragIdx.current;
    dragIdx.current = null;
    setOverIdx(null);
    if (from === null || from === toIdx) return;
    const next = [...rows];
    const [moved] = next.splice(from, 1);
    next.splice(toIdx, 0, moved);
    setRows(next);
    await fetch(`/api/admin/${slug}/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    });
  };

  const listFields = config.fields.filter((f) => f.list);
  const thumbKey = ["imageUrl", "url", "photoUrl", "logoUrl"].find((k) =>
    config.fields.some((f) => f.key === k)
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">{config.title}</h1>
          {config.description && (
            <p className="mt-1 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
              {config.description} · মোট {bn(rows.length)}টি
              {config.hasOrder && " · টেনে সাজান"}
            </p>
          )}
        </div>
        {!config.readOnly && (
          <button onClick={openCreate} className="btn-brand !px-4 !py-2.5 text-[13px] sm:!px-5 sm:text-sm">
            <Plus className="h-4 w-4" /> নতুন {config.singular}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="glass-card mb-5 flex items-center gap-3 !rounded-2xl px-4 py-3" style={{ boxShadow: "none" }}>
        <Search className="h-4 w-4 shrink-0" style={{ color: "var(--ink-3)" }} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${config.title} খুঁজুন…`}
          className="w-full bg-transparent text-[14px] outline-none placeholder:opacity-50"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="grid place-items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand)" }} />
        </div>
      ) : rows.length === 0 ? (
        <div className="glass-card flex flex-col items-center gap-3 py-16" style={{ color: "var(--ink-3)" }}>
          <Inbox className="h-9 w-9" />
          <p className="text-[14px] font-medium">কিছু পাওয়া যায়নি</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row, idx) => {
            const thumb = thumbKey ? (row[thumbKey] as string | null) : null;
            const isVideo = thumb?.match(/\.(mp4|webm|mov)$/i);
            return (
              <li
                key={row.id}
                draggable={config.hasOrder && !q}
                onDragStart={() => (dragIdx.current = idx)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverIdx(idx);
                }}
                onDrop={() => onDrop(idx)}
                onDragEnd={() => setOverIdx(null)}
                className={`glass-card flex items-center gap-2.5 !rounded-2xl p-2.5 transition-all duration-300 sm:gap-3.5 sm:p-3 ${
                  overIdx === idx ? "scale-[1.01] ring-2 ring-[var(--brand)]" : ""
                }`}
                style={{ boxShadow: "none" }}
              >
                {config.hasOrder && !q && (
                  <span className="cursor-grab pl-1 active:cursor-grabbing" style={{ color: "var(--ink-3)" }}>
                    <GripVertical className="h-5 w-5" />
                  </span>
                )}
                {thumb && !isVideo && (
                  <img src={thumb} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14" />
                )}
                {thumb && isVideo && (
                  <video src={thumb} className="h-11 w-11 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14" muted playsInline />
                )}
                <div className="min-w-0 flex-1">
                  {listFields.length > 0 ? (
                    <>
                      <p className="truncate text-[13.5px] font-semibold sm:text-[14.5px]">
                        {String(row[listFields[0].key] ?? `#${row.id}`)}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px]" style={{ color: "var(--ink-3)" }}>
                        {listFields.slice(1).map((f) => {
                          const v = row[f.key];
                          if (f.type === "boolean") return null;
                          if (v == null || v === "") return null;
                          const label = f.options?.find((o) => o.value === v)?.label ?? String(v);
                          return (
                            <span key={f.key} className="truncate">
                              {label.length > 48 ? label.slice(0, 48) + "…" : label}
                            </span>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-[14.5px] font-semibold">আইডি {bn(row.id)}</p>
                  )}
                </div>
                {config.fields
                  .filter((f) => f.type === "boolean" && f.list)
                  .map((f) => (
                    <span key={f.key} className="hidden sm:block" style={{ color: row[f.key] ? "#34c759" : "var(--ink-3)" }}>
                      {row[f.key] ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
                    </span>
                  ))}
                {!config.readOnly && (
                  <button
                    onClick={() => openEdit(row)}
                    aria-label="সম্পাদনা"
                    className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
                  >
                    <Pencil className="h-4 w-4" style={{ color: "var(--brand)" }} />
                  </button>
                )}
                <button
                  onClick={() => remove(row)}
                  aria-label="মুছুন"
                  className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/35 backdrop-blur-md" onClick={() => setModal(null)} />
          <div className={`glass-strong relative mt-auto w-full ${slug === "achievements" || slug === "members" ? "max-w-5xl" : "max-w-2xl"} rounded-t-3xl p-5 shadow-[var(--shadow-lift)] sm:my-8 sm:mt-0 sm:rounded-3xl sm:p-7`} style={{ animation: "modalIn .45s cubic-bezier(.34,1.56,.64,1) both" }}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[18px] font-bold">
                {modal.mode === "create" ? `নতুন ${config.singular}` : `${config.singular} সম্পাদনা`}
              </h2>
              <button onClick={() => setModal(null)} className="glass grid h-9 w-9 place-items-center rounded-full" aria-label="বন্ধ">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid max-h-[64svh] grid-cols-1 gap-4 overflow-y-auto pr-1 sm:max-h-[62vh] sm:grid-cols-2">
              {config.fields.map((f) => {
                const wrapperClass = `block ${f.full || ["textarea", "longtext", "image", "media", "file", "banner", "members", "participants"].includes(f.type) ? "sm:col-span-2" : ""}`;
                const fieldLabel = (
                  <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </span>
                );
                const fieldControl = <Field field={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} form={form} setForm={setForm} />;
                return f.type === "participants" || f.type === "certificates" ? (
                  <div key={f.key} className={wrapperClass}>
                    {fieldLabel}
                    {fieldControl}
                  </div>
                ) : (
                  <label key={f.key} className={wrapperClass}>
                    {fieldLabel}
                    {fieldControl}
                  </label>
                );
              })}
            </div>

            {formError && (
              <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">
                {formError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2.5 pb-[max(0px,env(safe-area-inset-bottom))] sm:mt-6">
              <button onClick={() => setModal(null)} className="btn-glass flex-1 !px-5 !py-2.5 text-sm sm:flex-none">
                বাতিল
              </button>
              <button onClick={save} disabled={saving} className="btn-brand flex-1 !px-6 !py-2.5 text-sm disabled:opacity-60 sm:flex-none">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                সংরক্ষণ
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
