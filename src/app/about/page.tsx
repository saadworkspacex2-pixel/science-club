import type { Metadata } from "next";
import { Target, Telescope, ScrollText, Atom } from "lucide-react";
import PageHero from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের লক্ষ্য, স্বপ্ন ও যাত্রার ইতিহাস।",
};

export default async function AboutPage() {
  const s = await getSettings();
  const blocks = [
    { Icon: Target, title: "আমাদের লক্ষ্য (মিশন)", text: s.mission },
    { Icon: Telescope, title: "আমাদের স্বপ্ন (ভিশন)", text: s.vision },
    { Icon: ScrollText, title: "আমাদের ইতিহাস", text: s.history },
  ];
  return (
    <div>
      <PageHero
        eyebrow="পরিচিতি"
        title="আমাদের সম্পর্কে"
        subtitle={s.tagline}
      />
      <section className="mx-auto max-w-5xl space-y-6 px-5 pb-10 pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/seed/lab1.jpg" alt="সাইন্স ক্লাবের দল" className="aspect-[21/9] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-6 sm:p-10">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white">
                <Atom className="size-4" />
                {s.clubName}
              </span>
            </div>
          </div>
        </Reveal>
        {blocks.map(({ Icon, title, text }, i) => (
          <Reveal key={title} delay={0.05 * (i + 1)}>
            <div className="card grid gap-5 p-6 sm:grid-cols-[auto_1fr] sm:p-9">
              <span className="grid size-14 place-items-center rounded-3xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                <Icon className="size-7" />
              </span>
              <div>
                <h2 className="font-display text-xl font-extrabold sm:text-2xl">{title}</h2>
                <p className={cn(
                  "mt-3 leading-[1.95] text-ink-soft dark:text-white/70",
                  title.includes("মিশন") || title.includes("ভিশন")
                    ? "font-tiro text-lg italic"
                    : ""
                )}>{text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
