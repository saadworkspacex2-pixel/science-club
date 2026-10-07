export const ROBOTS_DIRECTIVES = [
  "index, follow",
  "noindex, follow",
  "index, nofollow",
  "noindex, nofollow",
] as const;

export type RobotsDirective = (typeof ROBOTS_DIRECTIVES)[number];

export type SeoSettings = {
  siteTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  robots: RobotsDirective;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  googleVerificationCode: string;
  googleAnalyticsId: string;
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  robots: "index, follow",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  ogImageUrl: "",
  twitterTitle: "",
  twitterDescription: "",
  twitterImageUrl: "",
  googleVerificationCode: "",
  googleAnalyticsId: "",
};

export const SEO_KEYWORD_SUGGESTIONS = [
  "Class 8 Dahlia B",
  "Class VIII Dahlia B",
  "Class 8 results",
  "Class 8 exam results",
  "Class 8 routine",
  "Dahlia B results",
  "Rangpur Cantonment Class 8",
  "Half Yearly Examination 2026",
] as const;
