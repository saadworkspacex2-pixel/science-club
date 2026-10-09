import type { MetadataRoute } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { achievements, members, projects } from "@/db/schema";
import { normalizeMemberCertificates } from "@/lib/member-certificates";
import { getMemberCertificatesMap } from "@/lib/member-certificates-store";
import { getSiteUrl } from "@/lib/seo";
import { getSeoCanonicalBase, getSeoSettings } from "@/lib/seo-settings";
import { memberCertificateCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";

const PUBLIC_PATHS: Array<{ path: string; frequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", frequency: "weekly", priority: 1 },
  { path: "/about", frequency: "monthly", priority: 0.7 },
  { path: "/achievements", frequency: "weekly", priority: 0.9 },
  { path: "/members", frequency: "weekly", priority: 0.8 },
  { path: "/projects", frequency: "monthly", priority: 0.8 },
  { path: "/gallery", frequency: "weekly", priority: 0.6 },
  { path: "/hall-of-fame", frequency: "monthly", priority: 0.6 },
  { path: "/resources", frequency: "weekly", priority: 0.7 },
  { path: "/news", frequency: "daily", priority: 0.7 },
  { path: "/events", frequency: "weekly", priority: 0.7 },
  { path: "/contact", frequency: "yearly", priority: 0.4 },
  { path: "/join", frequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the admin-configured canonical origin when one has been saved.
  const seo = await getSeoSettings();
  const siteUrl = seo.canonicalUrl ? getSeoCanonicalBase(seo) : getSiteUrl();
  const entry = (path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency,
    priority,
  });
  const baseEntries = PUBLIC_PATHS.map((item) => entry(item.path, item.frequency, item.priority));

  try {
    const [achievementRows, memberRows, projectRows] = await Promise.all([
      db.select({ id: achievements.id }).from(achievements).orderBy(asc(achievements.sortOrder)),
      db.select(memberCertificateCompatibleSelection)
        .from(members)
        .where(eq(members.active, true))
        .orderBy(asc(members.sortOrder)),
      db.select({ id: projects.id }).from(projects).orderBy(asc(projects.sortOrder)),
    ]);

    const certificateFallbacks = await getMemberCertificatesMap(memberRows.map((row) => row.id));
    const detailEntries: MetadataRoute.Sitemap = [
      ...achievementRows.map((row) => entry(`/achievements/${row.id}`, "monthly", 0.7)),
      ...memberRows.flatMap((row) => {
        const profile = entry(`/members/${row.id}`, "monthly", 0.6);
        return (certificateFallbacks.get(row.id) ?? normalizeMemberCertificates(row.certificates)).length
          ? [profile, entry(`/members/${row.id}/certificates`, "monthly", 0.5)]
          : [profile];
      }),
      ...projectRows.map((row) => entry(`/projects/${row.id}`, "monthly", 0.6)),
    ];
    return [...baseEntries, ...detailEntries];
  } catch {
    // Keep the static public sitemap available during database maintenance.
    return baseEntries;
  }
}
