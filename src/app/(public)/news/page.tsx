import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { news } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { CalendarDays, Lock } from "lucide-react";
import { bnDate } from "@/lib/utils";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "সংবাদ, নোটিশ ও ঘোষণা",
  description: "বিউএসএস সাইন্স ক্লাব, রংপুরের সর্বশেষ সংবাদ, সদস্য নোটিশ, বিজ্ঞান কার্যক্রম ও ঘোষণা।",
  path: "/news",
});

export default async function NewsPage() {
  const rows = await db
    .select()
    .from(news)
    .where(and(eq(news.published, true), eq(news.isInternal, false)))
    .orderBy(desc(news.createdAt));

  return (
    <div className="mx-auto max-w-5xl pb-16 sm:pb-10">
      <PageHeader
        kicker="নোটিশ বোর্ড"
        title="সংবাদ ও ঘোষণা"
        desc="ক্লাবের সব গুরুত্বপূর্ণ আপডেট এক জায়গায়।"
      />
      <div className="space-y-4 px-4 sm:space-y-5 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          rows.map((n, i) => (
            <Reveal key={n.id} delay={i * 60}>
              <article className="glass-card overflow-hidden sm:flex">
                {n.mediaUrl && n.mediaKind !== "none" && (
                  <div className="sm:w-64 sm:shrink-0">
                    {n.mediaKind === "video" ? (
                      <video src={n.mediaUrl} className="h-48 w-full object-cover sm:h-full" controls playsInline />
                    ) : (
                      <img src={n.mediaUrl} alt={n.title} className="h-48 w-full object-cover sm:h-full" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1 p-4 sm:p-7">
                  <div className="flex flex-wrap items-center gap-3">
                    {n.tag && <span className="chip !text-[11px]">{n.tag}</span>}
                    {n.isInternal && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-1 text-[11px] font-bold text-purple-500">
                        <Lock className="h-3 w-3" /> সদস্যদের জন্য
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: "var(--ink-3)" }}>
                      <CalendarDays className="h-3.5 w-3.5" /> {bnDate(n.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2.5 text-[16px] font-bold leading-snug tracking-tight sm:mt-3 sm:text-[19px]">{n.title}</h2>
                  {n.body && (
                    <p className="mt-2 text-[13px] leading-[1.75] sm:mt-2.5 sm:text-[14.5px]" style={{ color: "var(--ink-2)" }}>
                      {n.body}
                    </p>
                  )}
                </div>
              </article>
            </Reveal>
          ))
        )}
      </div>
    </div>
  );
}
