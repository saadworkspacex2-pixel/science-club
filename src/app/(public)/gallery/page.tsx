import { asc } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import GalleryClient from "@/components/gallery-client";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "বিজ্ঞান ক্লাবের ছবি ও ভিডিও গ্যালারি",
  description: "বিউএসএস সাইন্স ক্লাবের সদস্য, বিজ্ঞান কার্যক্রম, অলিম্পিয়াড ও ইভেন্টের ছবি এবং ভিডিও।",
  path: "/gallery",
});

export default async function GalleryPage() {
  const rows = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder));

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="মুহূর্তের সংগ্রহ"
        title="গ্যালারী"
        desc="ল্যাবের পরীক্ষা থেকে জয়ের উল্লাস — আমাদের প্রতিটি অবিস্মরণীয় মুহূর্ত এখানে জমা আছে।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <Reveal>
            <GalleryClient items={rows} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
