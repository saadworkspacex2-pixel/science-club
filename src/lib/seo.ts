import type { Metadata } from "next";

/**
 * Set NEXT_PUBLIC_SITE_URL to the real, preferred production origin.
 * Vercel's production URL is used when available; localhost is only a dev fallback.
 */
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const vercelDeployment = process.env.VERCEL_URL?.trim();
  const fallback = process.env.NODE_ENV === "production"
    ? "https://science-club.netlify.app"
    : "http://localhost:3000";
  const candidate = configured
    || (vercelProduction ? `https://${vercelProduction}` : "")
    || (vercelDeployment ? `https://${vercelDeployment}` : "")
    || fallback;

  try {
    const normalized = /^[a-z][a-z\d+.-]*:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") return new URL(`${fallback}/`);
    return new URL("/", url.origin);
  } catch {
    return new URL(`${fallback}/`);
  }
}

function cleanDescription(description: string) {
  return description.replace(/\s+/g, " ").trim().slice(0, 200);
}

export async function createPageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Promise<Metadata> {
  const { getSeoCanonicalBase, getSeoCanonicalUrl, getSeoSettings, toSeoAbsoluteUrl } = await import("@/lib/seo-settings");
  const seo = await getSeoSettings();
  const canonicalBase = getSeoCanonicalBase(seo);
  const pageTitle = path === "/" && seo.siteTitle.trim() ? seo.siteTitle.trim() : title;
  const summary = cleanDescription(path === "/" && seo.metaDescription.trim() ? seo.metaDescription : description);
  const canonical = path === "/"
    ? getSeoCanonicalUrl(seo)
    : new URL(path, canonicalBase).toString();
  const pageImage = image ? toSeoAbsoluteUrl(image, canonicalBase) : "";
  const configuredOgImage = seo.ogImageUrl ? toSeoAbsoluteUrl(seo.ogImageUrl, canonicalBase) : "";
  const configuredTwitterImage = seo.twitterImageUrl ? toSeoAbsoluteUrl(seo.twitterImageUrl, canonicalBase) : "";
  const ogImage = configuredOgImage || pageImage;
  const ogTitle = seo.ogTitle.trim() || pageTitle;
  const ogDescription = cleanDescription(seo.ogDescription.trim() || summary);
  const twitterTitle = seo.twitterTitle.trim() || ogTitle;
  const twitterDescription = cleanDescription(seo.twitterDescription.trim() || ogDescription);
  const index = seo.robots.startsWith("index");
  const follow = seo.robots.endsWith(", follow");

  return {
    title: path === "/" ? { absolute: pageTitle } : pageTitle,
    description: summary,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: "website",
      locale: "bn_BD",
      ...(ogImage ? { images: [{ url: ogImage, alt: ogTitle }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
      ...((configuredTwitterImage || ogImage) ? { images: [configuredTwitterImage || ogImage] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index,
          follow,
          googleBot: {
            index,
            follow,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function toAbsoluteUrl(value: string) {
  try {
    const url = new URL(value, getSiteUrl());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
