import type { Metadata } from "next";
import { Hind_Siliguri, Anek_Bangla, Noto_Sans_Bengali, Tiro_Bangla } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getSettings } from "@/lib/data";

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const anek = Anek_Bangla({
  subsets: ["bengali", "latin"],
  variable: "--font-anek",
  display: "swap",
});

const noto = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});

const tiro = Tiro_Bangla({
  subsets: ["bengali", "latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-tiro",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://science-club.bussscr.edu.bd"),
  title: {
    default: "বুর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ সাইন্স ক্লাব",
    template: "%s | বিইউএসএসএসসি সাইন্স ক্লাব",
  },
  description:
    "বুর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজ সাইন্স ক্লাব — কৌতূহল থেকে আবিষ্কার। বিজ্ঞান অলিম্পিয়াড, রোবোটিক্স, গবেষণা প্রকল্প ও তরুণ বিজ্ঞানীদের মেলবন্ধন।",
  keywords: [
    "সাইন্স ক্লাব",
    "বিজ্ঞান ক্লাব",
    "Bur Uttam Shaheed Samad School and College",
    "science-club.bussscr",
    "রংপুর",
    "বিজ্ঞান অলিম্পিয়াড",
  ],
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "বিইউএসএসএসসি সাইন্স ক্লাব",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <html lang="bn" className={`${hind.variable} ${anek.variable} ${noto.variable} ${tiro.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Navbar clubName={settings.clubName || "বিইউএসএসএসসি সাইন্স ক্লাব"} logoUrl={settings.logoUrl || ""} />
          <main className="min-h-[70vh]">{children}</main>
          <Footer settings={settings} />
        </ThemeProvider>
      </body>
    </html>
  );
}
