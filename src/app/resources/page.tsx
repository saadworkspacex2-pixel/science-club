import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import ResourcesView from "@/components/resources-view";
import { getResources } from "@/lib/data";

export const metadata: Metadata = {
  title: "রিসোর্স লাইব্রেরি",
  description: "নোট, গাইড, অতীতের প্রশ্নপত্র, ম্যাগাজিন ও দরকারি লিংকের সংগ্রহশালা।",
};

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <div>
      <PageHero
        eyebrow="জ্ঞানের ভান্ডার"
        title="রিসোর্স লাইব্রেরি"
        subtitle="প্রস্তুতির সব সামগ্রী এক জায়গায় — খুঁজুন, বেছে নিন, ডাউনলোড করুন।"
      />
      <section className="mx-auto max-w-4xl px-5 pb-10 pt-8">
        <ResourcesView resources={resources} />
      </section>
    </div>
  );
}
