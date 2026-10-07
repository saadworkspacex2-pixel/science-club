"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Info,
  Loader2,
  MousePointer2,
  Palette,
  Plus,
  RotateCcw,
  Trash2,
  Type,
} from "lucide-react";
import UploadField from "@/components/admin/upload-field";
import { Logo } from "@/components/logo";
import {
  DEFAULT_SITE_FONT,
  LOGO_TARGET_PAGES,
  MAX_FIXED_LOGOS,
  SITE_FONTS,
  type FixedLogoPlacement,
  type SiteFontKey,
} from "@/lib/branding-config";

type Branding = {
  clubLogo: string;
  schoolLogo: string;
  clubName: string;
  schoolName: string;
  siteFont: SiteFontKey;
  fixedLogos: FixedLogoPlacement[];
};

const EMPTY: Branding = {
  clubLogo: "",
  schoolLogo: "",
  clubName: "",
  schoolName: "",
  siteFont: DEFAULT_SITE_FONT,
  fixedLogos: [],
};

function clampPercent(value: number) {
  return Math.min(97, Math.max(3, value));
}

export default function BrandingManager() {
  const router = useRouter();
  const [form, setForm] = useState<Branding>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const res = await fetch("/api/admin/branding", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "সেটিংস লোড করা যায়নি");
        if (active && data.branding) {
          setForm({
            ...EMPTY,
            ...data.branding,
            fixedLogos: Array.isArray(data.branding.fixedLogos) ? data.branding.fixedLogos : [],
          });
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "সেটিংস লোড করা যায়নি");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof Branding,>(key: K, value: Branding[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };

  const updateFixedLogo = (id: string, patch: Partial<FixedLogoPlacement>) => {
    setForm((current) => ({
      ...current,
      fixedLogos: current.fixedLogos.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
    setSaved(false);
  };

  const addFixedLogo = () => {
    if (form.fixedLogos.length >= MAX_FIXED_LOGOS) return;
    const placement: FixedLogoPlacement = {
      id: globalThis.crypto?.randomUUID?.() ?? `logo-${Date.now()}`,
      url: form.clubLogo,
      page: "/",
      x: 82,
      y: 82,
      size: 72,
    };
    set("fixedLogos", [...form.fixedLogos, placement]);
  };

  const removeFixedLogo = (id: string) => {
    set("fixedLogos", form.fixedLogos.filter((item) => item.id !== id));
  };

  const placeLogo = (event: React.MouseEvent<HTMLDivElement>, id: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = clampPercent(((event.clientX - rect.left) / rect.width) * 100);
    const y = clampPercent(((event.clientY - rect.top) / rect.height) * 100);
    updateFixedLogo(id, { x, y });
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_logo: form.clubLogo,
          school_logo: form.schoolLogo,
          club_name: form.clubName,
          school_name: form.schoolName,
          site_font: form.siteFont,
          fixed_logos: form.fixedLogos,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "সংরক্ষণ ব্যর্থ");
        return;
      }
      if (data.branding) {
        setForm({ ...EMPTY, ...data.branding });
      }
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2800);
    } catch {
      setError("সংযোগ ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--brand)" }} />
      </div>
    );
  }

  const selectedFont = SITE_FONTS.find((font) => font.key === form.siteFont) ?? SITE_FONTS[0];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="flex items-center gap-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
            <Palette className="h-5 w-5" style={{ color: "var(--brand)" }} />
          </span>
          সাইট সেটিংস
        </h1>
        <p className="mt-1.5 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
          ক্লাবের নাম, প্রধান লোগো, ফন্ট এবং পেজে স্থির লোগো সাজান।
        </p>
      </div>

      {/* Site-wide identity preview */}
      <section className="glass-card mb-4 p-4 sm:mb-5 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
              লাইভ প্রিভিউ
            </p>
            <p className="mt-1 text-[12px]" style={{ color: "var(--ink-3)" }}>
              এই লোগোটি সাইটের প্রধান ব্র্যান্ড মার্ক ও ব্রাউজার ট্যাবের আইকন হবে।
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white shadow-sm">
            <Logo size={27} src={form.clubLogo} alt={form.clubName || "ক্লাব লোগো"} />
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
          <Logo size={42} src={form.clubLogo} alt={form.clubName || "ক্লাব লোগো"} />
          {form.schoolLogo && (
            <img src={form.schoolLogo} alt={form.schoolName || "প্রতিষ্ঠানের লোগো"} className="h-9 w-9 shrink-0 rounded-[22%] object-contain" />
          )}
          <span className="min-w-0 leading-tight" style={{ fontFamily: selectedFont.css }}>
            <span className="block truncate text-[15px] font-bold tracking-tight">
              {form.clubName || "বিউএসএস সাইেন্স ক্লাব"}
            </span>
            <span className="block truncate text-[10.5px]" style={{ color: "var(--ink-3)" }}>
              {form.schoolName || "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ"}
            </span>
          </span>
        </div>
      </section>

      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5">
        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-1 text-[15px] font-bold">প্রধান ক্লাব লোগো</h2>
          <p className="mb-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
            নেভিগেশন, ফুটার, অ্যাডমিন এবং ফেভিকনে একই লোগো ব্যবহার হবে। স্বচ্ছ PNG বা WebP ভালো।
          </p>
          <UploadField
            value={form.clubLogo}
            onChange={(url) => set("clubLogo", url)}
            accept="image/*"
            kind="image"
            crop={false}
          />
          {form.clubLogo && (
            <button
              type="button"
              onClick={() => set("clubLogo", "")}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-500"
            >
              <RotateCcw className="h-3.5 w-3.5" /> ডিফল্ট লোগোতে ফিরুন
            </button>
          )}
        </div>

        <div className="glass-card p-4 sm:p-5">
          <h2 className="mb-1 text-[15px] font-bold">প্রতিষ্ঠানের লোগো</h2>
          <p className="mb-3 text-[12px]" style={{ color: "var(--ink-3)" }}>
            ক্লাব লোগোর পাশে আলাদা স্কুল/প্রতিষ্ঠানের লোগো দেখাবে (ঐচ্ছিক)।
          </p>
          <UploadField
            value={form.schoolLogo}
            onChange={(url) => set("schoolLogo", url)}
            accept="image/*"
            kind="image"
            crop={false}
          />
          {form.schoolLogo && (
            <button
              type="button"
              onClick={() => set("schoolLogo", "")}
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-500"
            >
              <RotateCcw className="h-3.5 w-3.5" /> সরিয়ে ফেলুন
            </button>
          )}
        </div>

        <label className="glass-card block p-4 sm:p-5">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            সাইন্স ক্লাবের নাম
          </span>
          <input
            className="field"
            maxLength={120}
            value={form.clubName}
            onChange={(event) => set("clubName", event.target.value)}
            placeholder="বিউএসএস সাইেন্স ক্লাব"
          />
        </label>

        <label className="glass-card block p-4 sm:p-5">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            প্রতিষ্ঠানের নাম
          </span>
          <input
            className="field"
            maxLength={180}
            value={form.schoolName}
            onChange={(event) => set("schoolName", event.target.value)}
            placeholder="বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ"
          />
        </label>
      </div>

      {/* Typeface control */}
      <section className="glass-card mt-5 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2">
          <Type className="h-4.5 w-4.5" style={{ color: "var(--brand)" }} />
          <h2 className="text-[15px] font-bold">ওয়েবসাইটের ফন্ট</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:items-center">
          <label>
            <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ink-3)" }}>
              বাংলা-সমর্থিত টাইপফেস নির্বাচন
            </span>
            <select
              className="field"
              value={form.siteFont}
              onChange={(event) => set("siteFont", event.target.value as SiteFontKey)}
            >
              {SITE_FONTS.map((font) => (
                <option key={font.key} value={font.key}>{font.label}</option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5" style={{ fontFamily: selectedFont.css }}>
            <p className="text-[11px] font-semibold" style={{ color: "var(--ink-3)" }}>নমুনা</p>
            <p className="mt-1 text-[19px] font-bold">{selectedFont.sample}</p>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--ink-2)" }}>Science Club · 0123456789</p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
          পছন্দের ফন্টটি পুরো সাইটে প্রয়োগ হবে। ফন্টগুলো প্রথমবার লোড করতে ইন্টারনেট সংযোগ লাগতে পারে।
        </p>
      </section>

      {/* Per-page fixed logo placement editor */}
      <section className="mt-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-bold">পেজে স্থির লোগো</h2>
            <p className="mt-1 text-[12px]" style={{ color: "var(--ink-3)" }}>
              একটি পেজ বেছে নিন, প্রিভিউতে ক্লিক করে অবস্থান ঠিক করুন — লোগোটি ওই পেজে স্ক্রল করলেও একই স্ক্রিন-স্থানে থাকবে।
            </p>
          </div>
          <button
            type="button"
            onClick={addFixedLogo}
            disabled={form.fixedLogos.length >= MAX_FIXED_LOGOS}
            className="btn-glass inline-flex items-center gap-2 !px-4 !py-2.5 text-[12.5px] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> লোগো যোগ করুন
          </button>
        </div>

        {form.fixedLogos.length === 0 ? (
          <div className="glass-card grid place-items-center px-5 py-9 text-center">
            <MousePointer2 className="mb-2 h-6 w-6" style={{ color: "var(--brand)" }} />
            <p className="text-[13px] font-semibold">এখনও কোনো পেজ-লোগো যোগ করা হয়নি</p>
            <p className="mt-1 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              “লোগো যোগ করুন” চাপুন, ছবি আপলোড করুন এবং প্রিভিউতে যেখানে চান সেখানে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {form.fixedLogos.map((placement, index) => {
              const previewSize = Math.min(64, Math.max(26, Math.round(placement.size * 0.48)));
              return (
                <article key={placement.id} className="glass-card p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[14px] font-bold">লোগো পজিশন {index + 1}</h3>
                      <p className="mt-0.5 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                        শুধুমাত্র নির্বাচিত পেজে দেখাবে
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFixedLogo(placement.id)}
                      aria-label={`লোগো পজিশন ${index + 1} মুছুন`}
                      className="glass grid h-9 w-9 place-items-center rounded-full text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                          এই পজিশনের লোগো
                        </label>
                        <UploadField
                          value={placement.url}
                          onChange={(url) => updateFixedLogo(placement.id, { url })}
                          accept="image/*"
                          kind="image"
                          crop={false}
                        />
                        {(form.clubLogo || form.schoolLogo) && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {form.clubLogo && (
                              <button type="button" onClick={() => updateFixedLogo(placement.id, { url: form.clubLogo })} className="btn-glass !px-3 !py-1.5 text-[11px]">
                                ক্লাবের প্রধান লোগো ব্যবহার
                              </button>
                            )}
                            {form.schoolLogo && (
                              <button type="button" onClick={() => updateFixedLogo(placement.id, { url: form.schoolLogo })} className="btn-glass !px-3 !py-1.5 text-[11px]">
                                স্কুল লোগো ব্যবহার
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                          কোন পেজে দেখাবেন
                        </span>
                        <select
                          className="field"
                          value={placement.page}
                          onChange={(event) => updateFixedLogo(placement.id, { page: event.target.value as FixedLogoPlacement["page"] })}
                        >
                          {LOGO_TARGET_PAGES.map((page) => (
                            <option key={page.path} value={page.path}>{page.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="mb-1.5 flex items-center justify-between text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                          <span>লোগোর আকার</span>
                          <span style={{ color: "var(--ink-3)" }}>{placement.size}px</span>
                        </span>
                        <input
                          type="range"
                          min={24}
                          max={240}
                          step={4}
                          value={placement.size}
                          onChange={(event) => updateFixedLogo(placement.id, { size: Number(event.target.value) })}
                          className="w-full accent-[var(--brand)]"
                        />
                      </label>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold" style={{ color: "var(--ink-2)" }}>
                          স্ক্রিনে অবস্থান — প্রিভিউতে ক্লিক করুন
                        </span>
                        <span className="text-[10.5px] tabular-nums" style={{ color: "var(--ink-3)" }}>
                          {Math.round(placement.x)}% · {Math.round(placement.y)}%
                        </span>
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        aria-label="লোগোর স্ক্রিন অবস্থান বেছে নিতে প্রিভিউতে ক্লিক করুন"
                        onClick={(event) => placeLogo(event, placement.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            updateFixedLogo(placement.id, { x: 50, y: 50 });
                          }
                        }}
                        className="relative mx-auto aspect-[4/3] w-full cursor-crosshair overflow-hidden rounded-2xl border bg-[linear-gradient(135deg,rgba(10,132,255,.08),rgba(48,209,88,.06))] outline-none ring-[var(--brand)] focus-visible:ring-2"
                        style={{
                          backgroundImage: "linear-gradient(rgba(127,127,127,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(127,127,127,.12) 1px, transparent 1px)",
                          backgroundSize: "24px 24px",
                        }}
                      >
                        <div className="absolute inset-x-0 top-0 flex h-8 items-center justify-between border-b bg-white/70 px-3 text-[9px] font-semibold text-slate-500 dark:bg-black/30 dark:text-slate-300">
                          <span>SCIENCE CLUB · পেজ প্রিভিউ</span>
                          <span>● ● ●</span>
                        </div>
                        <div className="absolute left-3 top-12 h-2 w-2 rounded-full bg-[var(--brand)]/40" />
                        <div className="absolute right-5 top-14 h-3 w-16 rounded-full bg-black/5 dark:bg-white/10" />
                        <div className="absolute bottom-8 left-5 h-2 w-2/5 rounded-full bg-black/5 dark:bg-white/10" />
                        {placement.url ? (
                          <img
                            src={placement.url}
                            alt=""
                            draggable={false}
                            className="pointer-events-none absolute z-10 rounded-lg object-contain drop-shadow-md"
                            style={{
                              left: `${placement.x}%`,
                              top: `${placement.y}%`,
                              width: previewSize,
                              height: previewSize,
                              transform: "translate(-50%, -50%)",
                            }}
                          />
                        ) : (
                          <span
                            className="pointer-events-none absolute z-10 grid h-10 w-10 place-items-center rounded-full border-2 border-dashed border-[var(--brand)] bg-white/80 text-[var(--brand)] dark:bg-black/50"
                            style={{ left: `${placement.x}%`, top: `${placement.y}%`, transform: "translate(-50%, -50%)" }}
                          >
                            <MousePointer2 className="h-4 w-4" />
                          </span>
                        )}
                        <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[9px] font-semibold text-white">
                          ক্লিক করে অবস্থান নির্ধারণ করুন
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="glass-card mt-5 flex items-start gap-3 p-4">
        <Info className="mt-0.5 h-4.5 w-4.5 shrink-0" style={{ color: "var(--brand)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          স্থির লোগোটি পেজের কনটেন্টের ওপর ভাসবে এবং ক্লিক/লিংকে বাধা দেবে না। ব্র্যান্ডের প্রধান লোগো পরিবর্তন করলে ফেভিকন ও সাইটের নেভিগেশন-ফুটারও আপডেট হবে।
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">
          {error}
        </p>
      )}

      <div className="sticky bottom-4 mt-6">
        <button onClick={save} disabled={saving} className="btn-brand w-full !py-3.5 disabled:opacity-60">
          {saving ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : saved ? (
            <Check className="h-4.5 w-4.5" />
          ) : null}
          {saved ? "সংরক্ষিত হয়েছে ✓" : "সব সেটিংস সংরক্ষণ করুন"}
        </button>
      </div>
    </div>
  );
}
