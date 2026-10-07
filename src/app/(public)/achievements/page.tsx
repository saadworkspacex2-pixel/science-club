import { asc } from "drizzle-orm";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { AchievementCard } from "@/components/cards";
import { Reveal } from "@/components/motion";

import { createPageMetadata } from "@/lib/seo";
import { achievementCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return createPageMetadata({
    title: "বিজ্ঞান অলিম্পিয়াড ও অর্জনসমূহ",
    description: "রংপুরের বিউএসএস সাইন্স ক্লাবের বিজ্ঞান অলিম্পিয়াড, জাতীয় পুরস্কার, মেডেল এবং শিক্ষার্থীদের সাফল্যের গল্প।",
    path: "/achievements",
  });
}

export default async function AchievementsPage() {
  const rows = await db.select(achievementCompatibleSelection).from(achievements).orderBy(asc(achievements.sortOrder));

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="গর্বের মুহূর্ত"
        title="আমাদের অর্জনসমূহ"
        desc="প্রতিটি পুরস্কারের পেছনে আছে অসংখ্য পরীক্ষা, ভুল আর নতুন করে ওঠার গল্প।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {rows.map((a, i) => (
              <Reveal key={a.id} delay={(i % 3) * 90}>
                <AchievementCard a={a} big />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
