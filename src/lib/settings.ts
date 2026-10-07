import { cache } from "react";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import {
  DEFAULT_SITE_FONT,
  isSiteFontKey,
  normalizeFixedLogos,
  type FixedLogoPlacement,
  type SiteFontKey,
} from "@/lib/branding-config";

export type Branding = {
  clubLogo: string;
  schoolLogo: string;
  clubName: string;
  schoolName: string;
  siteFont: SiteFontKey;
  fixedLogos: FixedLogoPlacement[];
};

export const BRANDING_KEYS = [
  "club_logo",
  "school_logo",
  "club_name",
  "school_name",
  "site_font",
  "fixed_logos",
] as const;

const FALLBACK: Branding = {
  clubLogo: "",
  schoolLogo: "",
  clubName: "বিউএসএস সাইেন্স ক্লাব",
  schoolName: "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ",
  siteFont: DEFAULT_SITE_FONT,
  fixedLogos: [],
};

/** Reads only the public branding keys once per server render request. */
export const getBranding = cache(async function getBranding(): Promise<Branding> {
  try {
    const rows = await db.select().from(settings).where(inArray(settings.key, [...BRANDING_KEYS]));
    const map = new Map(rows.map((row) => [row.key, row.value ?? ""]));
    const siteFont = map.get("site_font");

    return {
      clubLogo: map.get("club_logo") || FALLBACK.clubLogo,
      schoolLogo: map.get("school_logo") || FALLBACK.schoolLogo,
      clubName: map.get("club_name") || FALLBACK.clubName,
      schoolName: map.get("school_name") || FALLBACK.schoolName,
      siteFont: isSiteFontKey(siteFont) ? siteFont : FALLBACK.siteFont,
      fixedLogos: normalizeFixedLogos(map.get("fixed_logos")),
    };
  } catch {
    return FALLBACK;
  }
});
