import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileCTA from "@/components/mobile-cta";
import PageTransition from "@/components/page-transition";
import ScrollProgress from "@/components/scroll-progress";
import { getBranding } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const b = await getBranding();

  return (
    <>
      <ScrollProgress />
      <Navbar
        clubLogo={b.clubLogo}
        schoolLogo={b.schoolLogo}
        clubName={b.clubName}
        schoolName={b.schoolName}
      />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer
        clubLogo={b.clubLogo}
        schoolLogo={b.schoolLogo}
        clubName={b.clubName}
        schoolName={b.schoolName}
      />
      <MobileCTA />
    </>
  );
}
