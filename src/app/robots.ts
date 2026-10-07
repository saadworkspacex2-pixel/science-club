import type { MetadataRoute } from "next";
import { getSeoSiteUrl } from "@/lib/seo-settings";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = (await getSeoSiteUrl()).toString().replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin/", "/api/auth/", "/api/upload", "/api/apply", "/api/contact", "/profile", "/login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
