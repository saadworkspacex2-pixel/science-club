import { asc } from "drizzle-orm";
import { db } from "@/db";
import { hallOfFame } from "@/db/schema";
import { Empty } from "@/components/ui";
import { FameCard } from "@/components/cards";
import { Reveal } from "@/components/motion";
import { Trophy } from "lucide-react";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "অলিম্পিয়াড বিজয়ীদের হল অফ ফেম",
  description: "জাতীয় ও আন্তর্জাতিক বিজ্ঞান অলিম্পিয়াডে পুরস্কারপ্রাপ্ত বিউএসএস সাইন্স ক্লাবের শিক্ষার্থীদের পরিচিতি ও অর্জন।",
  path: "/hall-of-fame",
});

export default async function HallOfFamePage() {
  const rows = await db.select().from(hallOfFame).orderBy(asc(hallOfFame.sortOrder));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-5 sm:pt-32">
      <div className="overflow-hidden rounded-[2rem] bg-[#0b0b10] px-4 py-10 sm:rounded-[2.5rem] sm:px-12 sm:py-14" style={{ boxShadow: "0 40px 90px -30px rgba(10,132,255,.35)" }}>
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-[13px] font-semibold text-amber-300">
              <Trophy className="h-3.5 w-3.5" /> কিংবদন্তি প্রাঙ্গণ
            </span>
            <h1 className="text-[clamp(2rem,5.5vw,3.4rem)] font-bold leading-[1.12] tracking-tight text-white">
              হল অফ ফেম
            </h1>
            <p className="mt-4 text-[16px] leading-relaxed text-white/55">
              জাতীয় ও আন্তর্জাতিক পুরস্কারে সম্মানিত তারকারা — যাদের নাম ক্লাবের ইতিহাসে সোনার অক্ষরে লেখা।
            </p>
          </div>
        </Reveal>
        {rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {rows.map((f, i) => (
              <Reveal key={f.id} delay={(i % 2) * 100}>
                <FameCard f={f} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
