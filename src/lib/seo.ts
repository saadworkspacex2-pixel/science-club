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

export function createPageMetadata({
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
}): Metadata {
  const summary = cleanDescription(description);
  const imageUrl = image ? toAbsoluteUrl(image) : "";
  const socialImage = imageUrl ? { images: [{ url: imageUrl, alt: title }] } : {};
  return {
    title,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: summary,
      url: path,
      type: "website",
      locale: "bn_BD",
      ...socialImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
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
