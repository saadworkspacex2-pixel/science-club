"use client";

import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Code2,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Search,
  Share2,
  ShieldCheck,
  X,
} from "lucide-react";
import type { SeoSettings } from "@/lib/seo-settings-config";
import { ROBOTS_DIRECTIVES, SEO_KEYWORD_SUGGESTIONS } from "@/lib/seo-settings-config";

const inputClass = "field w-full rounded-xl";
const labelClass = "mb-1.5 block text-[12px] font-semibold";
const helpClass = "mt-1.5 text-[11px] leading-relaxed";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Search;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-card rounded-2xl border border-black/[0.07] bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-[#1c1c1e]/90 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_11%,transparent)]">
          <Icon className="h-[17px] w-[17px]" style={{ color: "var(--brand)" }} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold tracking-tight">{title}</h2>
          {description && <p className={`mt-1 ${helpClass}`} style={{ color: "var(--ink-3)" }}>{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-black/[0.06] p-3 dark:border-white/10">
      <div className="min-w-0">
        <p className="text-[12px] font-semibold">{label}</p>
        <p className={helpClass} style={{ color: "var(--ink-3)" }}>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${checked ? "bg-emerald-500" : "bg-black/20 dark:bg-white/20"}`}
      >
        <span className={`absolute top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow-sm transition-all ${checked ? "left-6" : "left-1"}`}>
          {checked && <Check className="h-3 w-3 text-emerald-600" />}
        </span>
      </button>
    </div>
  );
}

export default function SeoSettingsManager({
  initialSettings,
  fallbackTitle,
  fallbackDescription,
  fallbackCanonicalUrl,
}: {
  initialSettings: SeoSettings;
  fallbackTitle: string;
  fallbackDescription: string;
  fallbackCanonicalUrl: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<SeoSettings>(initialSettings);
  const [savedForm, setSavedForm] = useState<SeoSettings>(initialSettings);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [previewImageFailed, setPreviewImageFailed] = useState(false);

  const setField = <K extends keyof SeoSettings>(key: K, value: SeoSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSaved(false);
    setError("");
  };

  const previewTitle = form.siteTitle.trim() || fallbackTitle;
  const previewDescription = form.metaDescription.trim() || fallbackDescription;
  const previewHost = useMemo(() => {
    try {
      return new URL(form.canonicalUrl.trim() || fallbackCanonicalUrl).host;
    } catch {
      try {
        return new URL(fallbackCanonicalUrl).host;
      } catch {
        return "example.com";
      }
    }
  }, [form.canonicalUrl, fallbackCanonicalUrl]);
  const allowIndexing = form.robots.startsWith("index");
  const allowFollowing = form.robots.endsWith(", follow");

  const setRobots = (index: boolean, follow: boolean) => {
    const directive = `${index ? "index" : "noindex"}, ${follow ? "follow" : "nofollow"}` as SeoSettings["robots"];
    setField("robots", directive);
  };

  const addKeyword = (raw = keywordDraft) => {
    const keyword = raw.trim().replace(/,+$/, "").slice(0, 100);
    if (!keyword || form.keywords.some((item) => item.toLowerCase() === keyword.toLowerCase())) {
      setKeywordDraft("");
      return;
    }
    if (form.keywords.length >= 50) {
      setError("সর্বোচ্চ ৫০টি keyword যোগ করা যাবে");
      return;
    }
    setField("keywords", [...form.keywords, keyword]);
    setKeywordDraft("");
  };

  const handleKeywordKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword();
    } else if (event.key === "Backspace" && !keywordDraft && form.keywords.length) {
      setField("keywords", form.keywords.slice(0, -1));
    }
  };

  const removeKeyword = (keyword: string) => {
    setField("keywords", form.keywords.filter((item) => item !== keyword));
  };

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const response = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "SEO সেটিংস সংরক্ষণ করা যায়নি");
        return;
      }
      setForm(data.settings);
      setSavedForm(data.settings);
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 3200);
    } catch {
      setError("সংযোগ ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm(savedForm);
    setKeywordDraft("");
    setError("");
    setSaved(false);
    setPreviewImageFailed(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-5">
        <h1 className="flex items-center gap-2.5 text-[clamp(1.4rem,3vw,1.9rem)] font-bold tracking-tight">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
            <Search className="h-5 w-5" style={{ color: "var(--brand)" }} />
          </span>
          SEO Settings
        </h1>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
          Manage how your website appears in Google and when shared on social media.
        </p>
      </header>

      <div className="space-y-4">
        <Section icon={Globe2} title="Basic SEO">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Site Title</span>
              <input
                className={inputClass}
                maxLength={180}
                value={form.siteTitle}
                onChange={(event) => setField("siteTitle", event.target.value)}
                placeholder="Class 8 Dahlia B — Rangpur Cantonment"
              />
            </label>
            <label>
              <span className={labelClass}>Canonical URL</span>
              <input
                className={inputClass}
                type="url"
                value={form.canonicalUrl}
                onChange={(event) => setField("canonicalUrl", event.target.value)}
                placeholder="https://class-viii-b.vercel.app/"
              />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Meta Description</span>
              <textarea
                className={`${inputClass} min-h-[84px] resize-y`}
                maxLength={160}
                value={form.metaDescription}
                onChange={(event) => setField("metaDescription", event.target.value)}
                placeholder="A short, clear description of your website."
              />
              <span className={`mt-1 block text-right text-[10.5px] ${form.metaDescription.length > 150 ? "text-amber-600" : ""}`} style={{ color: form.metaDescription.length > 150 ? undefined : "var(--ink-3)" }}>
                {form.metaDescription.length}/160 characters
              </span>
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Robots</span>
              <select className={inputClass} value={form.robots} onChange={(event) => setField("robots", event.target.value as SeoSettings["robots"])}>
                {ROBOTS_DIRECTIVES.map((directive) => <option key={directive} value={directive}>{directive}</option>)}
              </select>
            </label>
          </div>
        </Section>

        <Section
          icon={Search}
          title="Target Keywords"
          description="Keywords are used as content guidance. Google does not use the old meta keywords tag as a ranking factor."
        >
          <div className="rounded-xl border border-black/[0.08] bg-white px-3 py-2.5 dark:border-white/10 dark:bg-black/10">
            <div className="flex flex-wrap gap-2">
              {form.keywords.map((keyword) => (
                <span key={keyword} className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] px-2.5 py-1 text-[11px] font-medium">
                  {keyword}
                  <button type="button" onClick={() => removeKeyword(keyword)} aria-label={`${keyword} remove`} className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                className="min-w-[180px] flex-1 bg-transparent px-1 py-1 text-[12px] outline-none placeholder:text-[var(--ink-3)]"
                value={keywordDraft}
                onChange={(event) => setKeywordDraft(event.target.value)}
                onKeyDown={handleKeywordKeyDown}
                onBlur={() => { if (keywordDraft.trim()) addKeyword(); }}
                placeholder="Type a keyword and press Enter"
                aria-label="Add a keyword"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="mr-1 self-center text-[10.5px]" style={{ color: "var(--ink-3)" }}>Examples:</span>
            {SEO_KEYWORD_SUGGESTIONS.filter((item) => !form.keywords.some((keyword) => keyword.toLowerCase() === item.toLowerCase())).map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => addKeyword(keyword)}
                className="inline-flex items-center gap-1 rounded-full border border-black/[0.08] px-2 py-1 text-[10px] transition-colors hover:bg-black/[0.04] dark:border-white/10 dark:hover:bg-white/5"
              >
                <Plus className="h-2.5 w-2.5" /> {keyword}
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Share2} title="Social Sharing / Open Graph">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>OG Title</span>
              <input className={inputClass} maxLength={180} value={form.ogTitle} onChange={(event) => setField("ogTitle", event.target.value)} placeholder="Title shown when shared" />
            </label>
            <label>
              <span className={labelClass}>OG Image URL</span>
              <input className={inputClass} value={form.ogImageUrl} onChange={(event) => { setPreviewImageFailed(false); setField("ogImageUrl", event.target.value); }} placeholder="https://example.com/share-image.jpg" />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>OG Description</span>
              <textarea className={`${inputClass} min-h-[72px] resize-y`} maxLength={300} value={form.ogDescription} onChange={(event) => setField("ogDescription", event.target.value)} placeholder="Description shown in social previews" />
            </label>
            <div className="sm:col-span-2">
              <span className={labelClass}>Open Graph image preview</span>
              <div className="grid min-h-36 place-items-center overflow-hidden rounded-xl border border-dashed border-black/15 bg-slate-50 dark:border-white/15 dark:bg-white/[0.03]">
                {form.ogImageUrl.trim() && !previewImageFailed ? (
                  <img src={form.ogImageUrl.trim()} alt="Open Graph preview" className="max-h-60 w-full object-contain" onError={() => setPreviewImageFailed(true)} />
                ) : (
                  <div className="p-5 text-center">
                    <ImageIcon className="mx-auto h-7 w-7" style={{ color: "var(--ink-3)" }} />
                    <p className="mt-2 text-[11px]" style={{ color: "var(--ink-3)" }}>
                      {previewImageFailed ? "Image preview could not be loaded" : "Add an OG Image URL to preview it here"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <label>
              <span className={labelClass}>Twitter/X Title</span>
              <input className={inputClass} maxLength={180} value={form.twitterTitle} onChange={(event) => setField("twitterTitle", event.target.value)} placeholder="Title shown on X" />
            </label>
            <label>
              <span className={labelClass}>Twitter/X Image URL</span>
              <input className={inputClass} value={form.twitterImageUrl} onChange={(event) => setField("twitterImageUrl", event.target.value)} placeholder="https://example.com/x-image.jpg" />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClass}>Twitter/X Description</span>
              <textarea className={`${inputClass} min-h-[72px] resize-y`} maxLength={300} value={form.twitterDescription} onChange={(event) => setField("twitterDescription", event.target.value)} placeholder="Description shown on X" />
            </label>
          </div>
        </Section>

        <Section icon={Code2} title="Google Search">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className={labelClass}>Google Search Console Verification Code</span>
              <input className={inputClass} value={form.googleVerificationCode} onChange={(event) => setField("googleVerificationCode", event.target.value)} placeholder="Paste the content value only" />
              <span className={helpClass} style={{ color: "var(--ink-3)" }}>Used to verify ownership in Google Search Console. Paste the meta tag&apos;s content value, not the full tag.</span>
            </label>
            <label>
              <span className={labelClass}>Google Analytics Measurement ID</span>
              <input className={inputClass} value={form.googleAnalyticsId} onChange={(event) => setField("googleAnalyticsId", event.target.value.toUpperCase())} placeholder="G-XXXXXXXXXX" />
              <span className={helpClass} style={{ color: "var(--ink-3)" }}>Adds the Google Analytics 4 tag to public pages. Leave blank to disable tracking.</span>
            </label>
          </div>
        </Section>

        <Section icon={Search} title="Google Search Preview" description="Preview updates as you edit the site title and meta description.">
          <div className="max-w-2xl rounded-xl border border-black/[0.06] bg-white p-4 dark:border-white/10 dark:bg-black/10 sm:p-5">
            <p className="truncate text-[10.5px]" style={{ color: "#188038" }}>{previewHost}</p>
            <p className="mt-1 line-clamp-2 text-[18px] leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{previewTitle}</p>
            <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6]">{previewDescription}</p>
          </div>
        </Section>

        <Section icon={ShieldCheck} title="Indexing Control" description="These controls apply site-wide; private admin routes remain noindex.">
          <div className="space-y-2.5">
            <Toggle
              checked={allowIndexing}
              onChange={(checked) => setRobots(checked, allowFollowing)}
              label="Allow search engines to index this website"
              description="Controls the index/noindex directive on public pages."
            />
            <Toggle
              checked={allowFollowing}
              onChange={(checked) => setRobots(allowIndexing, checked)}
              label="Allow search engines to follow links"
              description="Controls the follow/nofollow directive on public pages."
            />
          </div>
          {!allowIndexing && (
            <p role="alert" className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-800 dark:text-amber-200">
              Search engines may stop showing this website in search results.
            </p>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.07] px-3 py-3 text-[12px] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
              <span><span className="block font-semibold">sitemap.xml</span><span className="mt-0.5 block text-[10.5px]" style={{ color: "var(--ink-3)" }}>Automatically generated and available</span></span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)]">View <ExternalLink className="h-3 w-3" /></span>
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.07] px-3 py-3 text-[12px] transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04]">
              <span><span className="block font-semibold">robots.txt</span><span className="mt-0.5 block text-[10.5px]" style={{ color: "var(--ink-3)" }}>Automatically generated and available</span></span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand)]">View <ExternalLink className="h-3 w-3" /></span>
            </a>
          </div>
        </Section>
      </div>

      <div className="sticky bottom-3 z-20 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.08] bg-white/95 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#1c1c1e]/95 sm:px-4">
        <div aria-live="polite" className="min-h-5 text-[12px]">
          {error && <span role="alert" className="text-red-600 dark:text-red-300">{error}</span>}
          {!error && saved && <span role="status" className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300"><Check className="h-3.5 w-3.5" /> SEO settings saved successfully.</span>}
        </div>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={reset} disabled={saving} className="btn-glass !px-3.5 !py-2.5 text-[12px]">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Changes
          </button>
          <button type="button" onClick={() => void save()} disabled={saving} className="btn-brand !px-4 !py-2.5 text-[12px] disabled:opacity-60">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save SEO Settings
          </button>
        </div>
      </div>
    </div>
  );
}
