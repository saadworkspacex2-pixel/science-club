import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";
import { getSeoCanonicalBase, getSeoSettings } from "@/lib/seo-settings";

const PRIVATE_PATHS = [
  "/admin",
  "/api/admin/",
  "/api/auth/",
  "/api/upload",
  "/api/apply",
  "/api/contact",
  "/profile",
  "/login",
];

export const dynamic = "force-dynamic";

/**
 * Honours the "Allow search engines to index this website" toggle from
 * /admin/seo. When indexing is disabled the whole site is disallowed and the
 * sitemap reference is dropped. Private routes stay disallowed either way.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  const siteUrl = (seo.canonicalUrl ? getSeoCanonicalBase(seo) : getSiteUrl())
    .toString()
    .replace(/\/$/, "");

  if (!seo.robots.startsWith("index")) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
