import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { CSSProperties, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import FixedLogoOverlays from "@/components/fixed-logo-overlays";
import { getSiteFont } from "@/lib/branding-config";
import { getBranding } from "@/lib/settings";
import { toAbsoluteUrl } from "@/lib/seo";
import { getSeoCanonicalBase, getSeoSettings } from "@/lib/seo-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [branding, seo] = await Promise.all([getBranding(), getSeoSettings()]);
  // Admin-managed SEO values win; every field falls back to the original
  // branding-derived value when the admin has left it blank.
  const title = seo.siteTitle || `${branding.clubName} — ${branding.schoolName}`;
  const description = seo.metaDescription
    || `${branding.schoolName}, রংপুরের অফিসিয়াল ${branding.clubName}। বিজ্ঞান অলিম্পিয়াড, শিক্ষার্থী অর্জন, প্রকল্প, ক্লাব কার্যক্রম ও সদস্যদের পরিচিতি জানুন।`;
  const logoUrl = branding.clubLogo ? toAbsoluteUrl(branding.clubLogo) : "";
  const ogImage = seo.ogImageUrl ? toAbsoluteUrl(seo.ogImageUrl) : logoUrl;
  const twitterImage = seo.twitterImageUrl ? toAbsoluteUrl(seo.twitterImageUrl) : logoUrl;
  const googleVerification = seo.googleVerificationCode
    || process.env.GOOGLE_SITE_VERIFICATION?.trim()
    || "YYY8OrNn1NTUjHJcVeg-u3eu-1ojBLjXqw8ZW1k9j6Q";
  const allowIndexing = seo.robots.startsWith("index");
  const allowFollowing = seo.robots.endsWith(", follow");
  const canonicalBase = getSeoCanonicalBase(seo);
  const metadata: Metadata = {
    metadataBase: canonicalBase,
    applicationName: branding.clubName,
    title: {
      default: title,
      template: `%s | ${seo.siteTitle || branding.clubName}`,
    },
    description,
    alternates: { canonical: seo.canonicalUrl ? canonicalBase.toString() : undefined },
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonicalBase.toString(),
      siteName: branding.clubName,
      type: "website",
      locale: "bn_BD",
      ...(ogImage ? { images: [{ url: ogImage, alt: seo.ogTitle || title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || title,
      description: seo.twitterDescription || seo.ogDescription || description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
    verification: { google: googleVerification },
    robots: {
      index: allowIndexing,
      follow: allowFollowing,
      googleBot: {
        index: allowIndexing,
        follow: allowFollowing,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };

  if (branding.clubLogo) {
    metadata.icons = {
      icon: branding.clubLogo,
      shortcut: branding.clubLogo,
      apple: branding.clubLogo,
    };
  }

  return metadata;
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#101014" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [branding, seo] = await Promise.all([getBranding(), getSeoSettings()]);
  const siteFont = getSiteFont(branding.siteFont);
  const fontVariables = {
    "--site-font-sans": siteFont.css,
    "--site-font-display": siteFont.css,
  } as CSSProperties;
  // Structured data must use the same canonical origin as the metadata,
  // robots.txt and sitemap — otherwise schema.org points at a different host.
  const siteUrl = getSeoCanonicalBase(seo).toString().replace(/\/$/, "");
  const organizationId = `${siteUrl}/#organization`;
  const logoUrl = branding.clubLogo ? toAbsoluteUrl(branding.clubLogo) : "";
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": organizationId,
        name: branding.clubName,
        alternateName: "Science Club of Bir Uttam Shaheed Samad School & College",
        url: siteUrl,
        ...(logoUrl ? { logo: logoUrl } : {}),
        parentOrganization: { "@type": "School", name: branding.schoolName },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Rangpur",
          addressRegion: "Rangpur Division",
          addressCountry: "BD",
        },
        areaServed: { "@type": "City", name: "Rangpur" },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: branding.clubName,
        inLanguage: "bn-BD",
        publisher: { "@id": organizationId },
      },
    ],
  };
  const structuredDataText = JSON.stringify(structuredData).replace(/</g, "\\u003c");
  /** GA4 tag is only emitted when the admin has saved a valid Measurement ID. */
  const analyticsId = /^G-[A-Z0-9]{6,}$/i.test(seo.googleAnalyticsId) ? seo.googleAnalyticsId : "";

  return (
    <html lang="bn-BD" suppressHydrationWarning style={fontVariables}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@400;500;600;700;800&family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali:wght@300;400;500;600;700;800&family=Noto+Serif+Bengali:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataText }} />
        {analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsId}');`}</Script>
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <div className="ambient" aria-hidden />
          {children}
          <FixedLogoOverlays placements={branding.fixedLogos} />
        </ThemeProvider>
      </body>
    </html>
  );
}
