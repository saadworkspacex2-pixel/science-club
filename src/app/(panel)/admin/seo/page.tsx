import SeoSettingsManager from "@/components/admin/seo-settings-manager";
import { getBranding } from "@/lib/settings";
import { DEFAULT_SEO_SETTINGS } from "@/lib/seo-settings-config";
import { getSeoCanonicalBase, getSeoSettingsRecord } from "@/lib/seo-settings";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const [record, branding] = await Promise.all([getSeoSettingsRecord(), getBranding()]);
  const fallbackTitle = `${branding.clubName} — ${branding.schoolName}`;
  const fallbackDescription = `${branding.schoolName}, রংপুরের অফিসিয়াল ${branding.clubName}। বিজ্ঞান অলিম্পিয়াড, শিক্ষার্থী অর্জন, প্রকল্প, ক্লাব কার্যক্রম ও সদস্যদের পরিচিতি জানুন।`;
  const logoUrl = branding.clubLogo || "";
  const defaults = {
    ...DEFAULT_SEO_SETTINGS,
    siteTitle: fallbackTitle,
    metaDescription: fallbackDescription,
    canonicalUrl: getSeoCanonicalBase(record.settings).toString() || getSiteUrl().toString(),
    ogTitle: fallbackTitle,
    ogDescription: fallbackDescription,
    ogImageUrl: logoUrl,
    twitterTitle: fallbackTitle,
    twitterDescription: fallbackDescription,
    twitterImageUrl: logoUrl,
    googleVerificationCode: record.settings.googleVerificationCode,
  };
  const initialSettings = record.exists
    ? { ...defaults, ...record.settings }
    : defaults;

  return (
    <SeoSettingsManager
      initialSettings={initialSettings}
      fallbackTitle={fallbackTitle}
      fallbackDescription={fallbackDescription}
      fallbackCanonicalUrl={getSiteUrl().toString()}
    />
  );
}
