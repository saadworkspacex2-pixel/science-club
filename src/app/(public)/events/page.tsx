import { asc } from "drizzle-orm";
import { CalendarDays, MapPin } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { bn } from "@/lib/utils";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return createPageMetadata({
    title: "বিজ্ঞান ক্লাবের ইভেন্ট ও ক্যালেন্ডার",
    description: "রংপুরের বিউএসএস সাইন্স ক্লাবের বিজ্ঞান ইভেন্ট, অলিম্পিয়াড, ওয়ার্কশপ ও প্রতিযোগিতার ক্যালেন্ডার।",
    path: "/events",
  });
}

export default async function EventsPage() {
  const rows = await db.select().from(events).orderBy(asc(events.sortOrder));

  return (
    <div className="mx-auto max-w-4xl pb-16 sm:pb-10">
      <PageHeader
        kicker="আসন্ন আয়োজন"
        title="ইভেন্ট ও ক্যালেন্ডার"
        desc="প্রতিটি আয়োজনের সময়সূচি — ক্যালেন্ডারে নোট করে রাখুন।"
      />
      <div className="px-4 sm:px-5">
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="relative space-y-0 before:absolute before:bottom-6 before:left-[20px] before:top-2 before:w-px before:bg-gradient-to-b before:from-[#0a84ff] before:via-[#5ac8fa] before:to-transparent sm:before:left-[26px]">
            {rows.map((e, i) => (
              <Reveal key={e.id} delay={i * 80}>
                <div className="relative flex gap-3.5 pb-6 sm:gap-7 sm:pb-8">
                  <div className="z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-lg sm:h-13 sm:w-13" style={{ background: "linear-gradient(135deg,#0a84ff,#30d158)" }}>
                    <span className="text-[15px] font-bold">{bn(i + 1)}</span>
                  </div>
                  <div className="glass-card hover-lift min-w-0 flex-1 overflow-hidden">
                    {e.imageUrl && (
                      <img src={e.imageUrl} alt={e.title} className="aspect-[21/9] w-full object-cover" />
                    )}
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] font-semibold" style={{ color: "var(--brand)" }}>
                        {e.date && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" /> {e.date}
                          </span>
                        )}
                        {e.location && (
                          <span className="inline-flex items-center gap-1.5" style={{ color: "var(--ink-3)" }}>
                            <MapPin className="h-3.5 w-3.5" /> {e.location}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-[17.5px] font-bold tracking-tight">{e.title}</h3>
                      {e.description && (
                        <p className="mt-1.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                          {e.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
