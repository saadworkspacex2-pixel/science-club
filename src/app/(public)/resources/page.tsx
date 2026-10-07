import { desc } from "drizzle-orm";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import ResourcesClient from "@/components/resources-client";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return createPageMetadata({
    title: "বিজ্ঞান শিক্ষার নোট ও রিসোর্স লাইব্রেরি",
    description: "শিক্ষার্থীদের জন্য বিজ্ঞান নোট, গাইড, অলিম্পিয়াড প্রশ্নপত্র, ম্যাগাজিন ও উপকারী শিক্ষামূলক লিংকের সংগ্রহ।",
    path: "/resources",
  });
}

export default async function ResourcesPage() {
  const rows = await db.select().from(resources).orderBy(desc(resources.createdAt));

  return (
    <div className="mx-auto max-w-5xl pb-16 sm:pb-10">
      <PageHeader
        kicker="জ্ঞানের ভাণ্ডার"
        title="রিসোর্স লাইব্রেরি"
        desc="আমাদের নিজেদের তৈরি নোট, গাইড, বিগত প্রশ্নপত্র ও ম্যাগাজিন — সবার জন্য উন্মুক্ত, সম্পূর্ণ ফ্রি।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <Reveal>
            <ResourcesClient rows={rows} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
