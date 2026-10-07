import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { CSSProperties, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme";
import FixedLogoOverlays from "@/components/fixed-logo-overlays";
import { getSiteFont } from "@/lib/branding-config";
import { getBranding } from "@/lib/settings";
import { getSeoCanonicalBase, getSeoCanonicalUrl, getSeoSettings, toSeoAbsoluteUrl } from "@/lib/seo-settings";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [branding, seo] = await Promise.all([getBranding(), getSeoSettings()]);
  const canonicalBase = getSeoCanonicalBase(seo);
  const defaultTitle = `${branding.clubName} — ${branding.schoolName}`;
  const title = seo.siteTitle.trim() || defaultTitle;
  const defaultDescription = `${branding.schoolName}, রংপুরের অফিসিয়াল ${branding.clubName}। বিজ্ঞান অলিম্পিয়াড, শিক্ষার্থী অর্জন, প্রকল্প, ক্লাব কার্যক্রম ও সদস্যদের পরিচিতি জানুন।`;
  const description = seo.metaDescription.trim() || defaultDescription;
  const canonicalUrl = getSeoCanonicalUrl(seo);
  const logoUrl = branding.clubLogo ? toSeoAbsoluteUrl(branding.clubLogo, canonicalBase) : "";
  const ogImage = seo.ogImageUrl ? toSeoAbsoluteUrl(seo.ogImageUrl, canonicalBase) : logoUrl;
  const twitterImage = seo.twitterImageUrl ? toSeoAbsoluteUrl(seo.twitterImageUrl, canonicalBase) : ogImage;
  const index = seo.robots.startsWith("index");
  const follow = seo.robots.endsWith(", follow");
  const metadata: Metadata = {
    metadataBase: canonicalBase,
    alternates: { canonical: canonicalUrl },
    applicationName: branding.clubName,
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title: seo.ogTitle.trim() || title,
      description: seo.ogDescription.trim() || description,
      url: canonicalUrl,
      siteName: branding.clubName,
      type: "website",
      locale: "bn_BD",
      ...(ogImage ? { images: [{ url: ogImage, alt: seo.ogTitle.trim() || title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle.trim() || seo.ogTitle.trim() || title,
      description: seo.twitterDescription.trim() || seo.ogDescription.trim() || description,
      ...(twitterImage ? { images: [twitterImage] } : {}),
    },
    ...(seo.googleVerificationCode.trim()
      ? { verification: { google: seo.googleVerificationCode.trim() } }
      : {}),
    robots: {
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
  const googleAnalyticsId = /^G-[A-Z0-9]{6,}$/i.test(seo.googleAnalyticsId)
    ? seo.googleAnalyticsId.trim()
    : "";
  const siteFont = getSiteFont(branding.siteFont);
  const fontVariables = {
    "--site-font-sans": siteFont.css,
    "--site-font-display": siteFont.css,
  } as CSSProperties;
  const canonicalBase = getSeoCanonicalBase(seo);
  const siteUrl = canonicalBase.toString().replace(/\/$/, "");
  const organizationId = `${siteUrl}/#organization`;
  const logoUrl = branding.clubLogo ? toSeoAbsoluteUrl(branding.clubLogo, canonicalBase) : "";
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
        {googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];\nfunction gtag(){window.dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', ${JSON.stringify(googleAnalyticsId)});`}
            </Script>
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
