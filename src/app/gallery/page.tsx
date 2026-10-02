import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import GalleryGrid from "@/components/gallery-grid";
import { getGallery } from "@/lib/data";

export const metadata: Metadata = {
  title: "গ্যালারি",
  description: "স্কুল, টিম মেম্বার, প্রাক্তন সদস্য ও ইভেন্টসের ছবি এবং ভিডিও গ্যালারি।",
};

export default async function GalleryPage() {
  const items = await getGallery();
  return (
    <div>
      <PageHero
        eyebrow="মুহূর্তের সংগ্রহ"
        title="গ্যালারি"
        subtitle="ছবি ও ভিডিওতে ধরা পড়া আমাদের যাত্রার অমূল্য স্মৃতি — বিভাগ বেছে নিন এবং উপভোগ করুন।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8">
        <GalleryGrid items={items} />
      </section>
    </div>
  );
}
