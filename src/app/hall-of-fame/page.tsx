import type { Metadata } from "next";
import { Trophy, Quote } from "lucide-react";
import PageHero from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getHallOfFame } from "@/lib/data";

export const metadata: Metadata = {
  title: "হল অফ ফেম",
  description: "জাতীয় ও আন্তর্জাতিক পুরস্কারজয়ী কিংবদন্তি সদস্যদের সম্মাননা প্রদর্শনী।",
};

export default async function HallOfFamePage() {
  const fame = await getHallOfFame();
  return (
    <div>
      <PageHero
        eyebrow="চিরস্মরণীয়"
        title="হল অফ ফেম"
        subtitle="জাতীয় ও আন্তর্জাতিক মঞ্চে পতাকা ওড়ানো আমাদের কিংবদন্তিরা — এখানে তাঁরা চিরকাল স্মরণীয় থাকবেন।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {fame.map((f, i) => (
            <Reveal key={f.id} delay={(i % 2) * 0.08}>
              <div className="group card flex flex-col gap-5 overflow-hidden p-5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:flex-row sm:p-6">
                <div className="relative w-full shrink-0 overflow-hidden rounded-3xl sm:w-44">
                  {f.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.photoUrl} alt={f.name} loading="lazy"
                      className="aspect-[3/3.4] w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:aspect-[3/4]" />
                  ) : (
                    <div className="aspect-[3/4] w-full bg-black/[0.06] dark:bg-white/10" />
                  )}
                  <span className="glass absolute left-3 top-3 grid size-9 place-items-center rounded-full text-white">
                    <Trophy className="size-4" />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-extrabold">{f.name}</h3>
                  <p className="mt-1.5 inline-block rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-bold text-ink dark:bg-white/10 dark:text-white">
                    {f.award}
                  </p>
                  <p className="font-tiro mt-3.5 text-[15px] italic leading-relaxed text-ink-soft dark:text-white/60">
                    <Quote className="mb-1 mr-1.5 inline size-3.5 text-blue/50" />
                    {f.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        {fame.length === 0 && (
          <p className="py-20 text-center text-ink-soft dark:text-white/55">শীঘ্রই আসছে...</p>
        )}
      </section>
    </div>
  );
}
