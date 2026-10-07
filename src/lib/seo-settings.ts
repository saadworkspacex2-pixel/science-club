import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { getSiteUrl } from "@/lib/seo";
import {
  DEFAULT_SEO_SETTINGS,
  ROBOTS_DIRECTIVES,
  type RobotsDirective,
  type SeoSettings,
} from "@/lib/seo-settings-config";

const SEO_SETTINGS_KEY = "seo_settings_v1";
const GOOGLE_VERIFICATION_FALLBACK = "YYY8OrNn1NTUjHJcVeg-u3eu-1ojBLjXqw8ZW1k9j6Q";

type SeoSettingsRecord = { settings: SeoSettings; exists: boolean };

function defaultSettings(): SeoSettings {
  return {
    ...DEFAULT_SEO_SETTINGS,
    googleVerificationCode:
      process.env.GOOGLE_SITE_VERIFICATION?.trim() || GOOGLE_VERIFICATION_FALLBACK,
  };
}

function recordOf(input: unknown): Record<string, unknown> {
  return input && typeof input === "object" && !Array.isArray(input)
    ? input as Record<string, unknown>
    : {};
}

function textValue(value: unknown, fallback: string, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : fallback;
}

export function normalizeSeoSettings(input: unknown): SeoSettings {
  const value = recordOf(input);
  const fallback = defaultSettings();
  const robots = ROBOTS_DIRECTIVES.includes(value.robots as RobotsDirective)
    ? value.robots as RobotsDirective
    : fallback.robots;
  const keywords = Array.isArray(value.keywords)
    ? Array.from(new Set(value.keywords
        .filter((keyword): keyword is string => typeof keyword === "string")
        .map((keyword) => keyword.trim().slice(0, 100))
        .filter(Boolean)))
        .slice(0, 50)
    : fallback.keywords;

  return {
    siteTitle: textValue(value.siteTitle, fallback.siteTitle, 180),
    metaDescription: textValue(value.metaDescription, fallback.metaDescription, 160),
    canonicalUrl: textValue(value.canonicalUrl, fallback.canonicalUrl, 500),
    robots,
    keywords,
    ogTitle: textValue(value.ogTitle, fallback.ogTitle, 180),
    ogDescription: textValue(value.ogDescription, fallback.ogDescription, 300),
    ogImageUrl: textValue(value.ogImageUrl, fallback.ogImageUrl, 1000),
    twitterTitle: textValue(value.twitterTitle, fallback.twitterTitle, 180),
    twitterDescription: textValue(value.twitterDescription, fallback.twitterDescription, 300),
    twitterImageUrl: textValue(value.twitterImageUrl, fallback.twitterImageUrl, 1000),
    googleVerificationCode: textValue(value.googleVerificationCode, fallback.googleVerificationCode, 200),
    googleAnalyticsId: textValue(value.googleAnalyticsId, fallback.googleAnalyticsId, 80),
  };
}

export const getSeoSettingsRecord = cache(async function getSeoSettingsRecord(): Promise<SeoSettingsRecord> {
  const fallback = defaultSettings();
  try {
    const [row] = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, SEO_SETTINGS_KEY))
      .limit(1);
    if (!row) return { settings: fallback, exists: false };

    try {
      return { settings: normalizeSeoSettings(JSON.parse(row.value)), exists: true };
    } catch {
      return { settings: fallback, exists: true };
    }
  } catch {
    return { settings: fallback, exists: false };
  }
});

export async function getSeoSettings() {
  return (await getSeoSettingsRecord()).settings;
}

export function validateSeoSettings(input: unknown): { settings: SeoSettings } | { error: string } {
  const value = recordOf(input);
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { error: "SEO সেটিংসের তথ্য সঠিক নয়" };
  }
  if (Array.isArray(value.keywords) && value.keywords.length > 50) {
    return { error: "সর্বোচ্চ ৫০টি keyword যোগ করা যাবে" };
  }

  const normalized = normalizeSeoSettings(value);
  if (normalized.canonicalUrl && !isAbsoluteWebUrl(normalized.canonicalUrl)) {
    return { error: "Canonical URL-এ সম্পূর্ণ http বা https ঠিকানা দিন" };
  }
  if (normalized.ogImageUrl && !isImageUrl(normalized.ogImageUrl)) {
    return { error: "OG Image URL-এ http/https ঠিকানা বা / দিয়ে শুরু হওয়া path দিন" };
  }
  if (normalized.twitterImageUrl && !isImageUrl(normalized.twitterImageUrl)) {
    return { error: "Twitter/X Image URL-এ http/https ঠিকানা বা / দিয়ে শুরু হওয়া path দিন" };
  }
  if (normalized.googleVerificationCode && !/^[a-zA-Z0-9_-]+$/.test(normalized.googleVerificationCode)) {
    return { error: "শুধু Google verification code-এর content value দিন" };
  }
  if (normalized.googleAnalyticsId && !/^G-[A-Z0-9]{6,}$/i.test(normalized.googleAnalyticsId)) {
    return { error: "Google Analytics Measurement ID সাধারণত G- দিয়ে শুরু হয়" };
  }

  return { settings: normalized };
}

function isAbsoluteWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return isAbsoluteWebUrl(value);
}

export async function saveSeoSettings(seoSettings: SeoSettings) {
  await db
    .insert(settings)
    .values({ key: SEO_SETTINGS_KEY, value: JSON.stringify(seoSettings) })
    .onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value` } });
}

export function getSeoCanonicalUrl(seoSettings: SeoSettings) {
  const candidate = seoSettings.canonicalUrl.trim();
  return candidate && isAbsoluteWebUrl(candidate) ? new URL(candidate).toString() : getSiteUrl().toString();
}

export function getSeoCanonicalBase(seoSettings: SeoSettings) {
  const canonical = new URL(getSeoCanonicalUrl(seoSettings));
  return new URL("/", canonical.origin);
}

export async function getSeoSiteUrl() {
  return getSeoCanonicalBase(await getSeoSettings());
}

export function toSeoAbsoluteUrl(value: string, base: URL) {
  try {
    const url = new URL(value, base);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
