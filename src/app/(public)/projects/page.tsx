import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import ProjectsFilter from "@/components/projects-filter";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "শিক্ষার্থী বিজ্ঞান প্রকল্প ও গবেষণা",
  description: "বিউএসএস সাইন্স ক্লাবের শিক্ষার্থীদের বিজ্ঞান প্রকল্প, গবেষণা, উদ্ভাবন ও ভবিষ্যৎ পরিকল্পনা।",
  path: "/projects",
});

export default async function ProjectsPage() {
  const rows = await db.select().from(projects).orderBy(asc(projects.sortOrder));

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="উদ্ভাবন"
        title="প্রকল্প ইতিহাস"
        desc="প্রতিটি প্রকল্প একেকটি শিক্ষা — সফলটা অনুপ্রেরণা দেয়, ব্যর্থটা পথ দেখায়।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <Reveal>
            <ProjectsFilter projects={rows} />
          </Reveal>
        )}
      </div>
    </div>
  );
}
