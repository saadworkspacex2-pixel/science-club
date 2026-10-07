export const SITE_FONTS = [
  {
    key: "hind-siliguri",
    label: "Hind Siliguri",
    sample: "বিজ্ঞান ক্লাব · Science Club",
    css: '"Hind Siliguri", ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: "noto-sans-bengali",
    label: "Noto Sans Bengali",
    sample: "বাংলা পড়তে সহজ, পরিষ্কার ও আধুনিক",
    css: '"Noto Sans Bengali", ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: "baloo-da-2",
    label: "Baloo Da 2",
    sample: "সৃজনশীলতা ও বিজ্ঞানের নতুন ভাবনা",
    css: '"Baloo Da 2", ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: "noto-serif-bengali",
    label: "Noto Serif Bengali",
    sample: "গবেষণা, আবিষ্কার ও জ্ঞানের আলো",
    css: '"Noto Serif Bengali", Georgia, serif',
  },
] as const;

export type SiteFontKey = (typeof SITE_FONTS)[number]["key"];
export const DEFAULT_SITE_FONT: SiteFontKey = "hind-siliguri";

export function isSiteFontKey(value: unknown): value is SiteFontKey {
  return typeof value === "string" && SITE_FONTS.some((font) => font.key === value);
}

export function getSiteFont(value: unknown) {
  return SITE_FONTS.find((font) => font.key === value) ?? SITE_FONTS[0];
}

export const LOGO_TARGET_PAGES = [
  { path: "*", label: "সব পাবলিক পেজ" },
  { path: "/", label: "হোম পেজ" },
  { path: "/about", label: "ক্লাব সম্পর্কে" },
  { path: "/achievements", label: "অর্জনসমূহ" },
  { path: "/members", label: "সদস্য ও নেতৃত্ব" },
  { path: "/projects", label: "প্রকল্প" },
  { path: "/gallery", label: "গ্যালারী" },
  { path: "/hall-of-fame", label: "হল অফ ফেম" },
  { path: "/resources", label: "রিসোর্স" },
  { path: "/news", label: "সংবাদ" },
  { path: "/events", label: "ইভেন্ট" },
  { path: "/contact", label: "যোগাযোগ" },
  { path: "/join", label: "সদস্য আবেদন" },
  { path: "/login", label: "সদস্য লগইন" },
  { path: "/profile", label: "সদস্য প্রোফাইল" },
] as const;

export type LogoTargetPage = (typeof LOGO_TARGET_PAGES)[number]["path"];

export type FixedLogoPlacement = {
  id: string;
  url: string;
  page: LogoTargetPage;
  x: number;
  y: number;
  size: number;
};

export const MAX_FIXED_LOGOS = 8;

function safeLogoUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  const url = value.trim();
  if (!url || url.includes("..")) return false;
  if (/^\/api\/files\/[a-z0-9._-]+$/i.test(url)) return true;
  return /^https:\/\//i.test(url);
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/** Parse and constrain admin-saved fixed logo positions before rendering them. */
export function normalizeFixedLogos(input: unknown): FixedLogoPlacement[] {
  let raw = input;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];

  const allowedPages = new Set<string>(LOGO_TARGET_PAGES.map((page) => page.path));
  return raw.slice(0, MAX_FIXED_LOGOS).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    const url = typeof value.url === "string" ? value.url.trim() : "";
    const page = typeof value.page === "string" ? value.page : "";
    if (!safeLogoUrl(url) || !allowedPages.has(page)) return [];

    const rawId = typeof value.id === "string" ? value.id.trim() : "";
    const id = /^[a-zA-Z0-9_-]{1,80}$/.test(rawId) ? rawId : `fixed-logo-${index + 1}`;
    return [{
      id,
      url,
      page: page as LogoTargetPage,
      x: clampNumber(value.x, 3, 97, 50),
      y: clampNumber(value.y, 3, 97, 50),
      size: clampNumber(value.size, 24, 240, 72),
    }];
  });
}
