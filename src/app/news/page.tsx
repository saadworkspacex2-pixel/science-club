import type { Metadata } from "next";
import { CalendarDays, Megaphone } from "lucide-react";
import PageHero from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getNews } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "সংবাদ ও ঘোষণা",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের সর্বশেষ সংবাদ, ঘোষণা ও নোটিশ।",
};

export default async function NewsPage() {
  const news = await getNews();
  return (
    <div>
      <PageHero
        eyebrow="সবার জন্য"
        title="সংবাদ ও ঘোষণা"
        subtitle="ক্লাবের সর্বশেষ খবর, ইভেন্ট ঘোষণা ও গুরুত্বপূর্ণ নোটিশ — সবচেয়ে আগে এখানেই।"
      />
      <section className="mx-auto max-w-4xl space-y-5 px-5 pb-10 pt-8">
        {news.map((n, i) => (
          <Reveal key={n.id} delay={Math.min(i * 0.06, 0.3)}>
            <article className="card overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
              {n.mediaUrl && n.mediaKind === "video" ? (
                <video src={n.mediaUrl} controls preload="metadata" className="aspect-video w-full object-cover" />
              ) : n.mediaUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.mediaUrl} alt={n.title} loading="lazy" className="aspect-[21/9] w-full object-cover" />
              ) : null}
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink-soft dark:text-white/50">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue/10 px-3 py-1.5 text-blue">
                    <Megaphone className="size-3.5" /> ঘোষণা
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-3.5" />
                    {formatDate(n.createdAt || "")}
                  </span>
                </div>
                <h2 className="font-display mt-3 text-xl font-extrabold leading-snug sm:text-2xl">{n.title}</h2>
                <p className="mt-3 leading-[1.85] text-ink-soft dark:text-white/65">{n.body}</p>
              </div>
            </article>
          </Reveal>
        ))}
        {news.length === 0 && (
          <p className="py-20 text-center text-ink-soft dark:text-white/55">এখনো কোনো ঘোষণা নেই</p>
        )}
      </section>
    </div>
  );
}
