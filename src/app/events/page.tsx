import type { Metadata } from "next";
import { MapPin, CalendarDays } from "lucide-react";
import PageHero from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getEvents } from "@/lib/data";
import { formatDate, toBn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ইভেন্টস ও ক্যালেন্ডার",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের আসন্ন ইভেন্ট, কর্মসূচি ও বার্ষিক ক্যালেন্ডার।",
};

export default async function EventsPage() {
  const events = await getEvents();
  return (
    <div>
      <PageHero
        eyebrow="মত দাগানো"
        title="ইভেন্টস ও ক্যালেন্ডার"
        subtitle="আসন্ন কর্মসূচির তারিখ নোট করে রাখুন — আপনার উপস্থিতিই আমাদের শক্তি।"
      />
      <section className="mx-auto max-w-5xl space-y-5 px-5 pb-10 pt-8">
        {events.map((e, i) => {
          const d = new Date(e.date);
          const valid = !isNaN(d.getTime());
          return (
            <Reveal key={e.id} delay={Math.min(i * 0.06, 0.3)}>
              <article className="card group grid gap-0 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lift sm:grid-cols-[130px_1fr_240px]">
                <div className="flex flex-row items-center justify-center gap-3 bg-black/[0.05] p-5 text-ink dark:bg-white/[0.07] dark:text-white sm:flex-col sm:gap-0.5">
                  <span className="font-display text-3xl font-extrabold leading-none">
                    {valid ? toBn(d.getDate()) : "—"}
                  </span>
                  <span className="text-sm font-bold">
                    {valid ? d.toLocaleDateString("bn-BD", { month: "long" }) : e.date}
                  </span>
                  <span className="text-xs text-ink-soft dark:text-white/60">{valid ? toBn(d.getFullYear()) : ""}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h2 className="font-display text-lg font-extrabold leading-snug transition-colors group-hover:text-blue sm:text-xl">
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft dark:text-white/60">{e.description}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-ink-soft dark:text-white/50">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-blue" />{e.location}</span>
                    <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-blue" />{formatDate(e.date)}</span>
                  </div>
                </div>
                {e.imageUrl && (
                  <div className="relative hidden overflow-hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={e.imageUrl} alt={e.title} loading="lazy"
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
        {events.length === 0 && (
          <p className="py-20 text-center text-ink-soft dark:text-white/55">কোনো আসন্ন ইভেন্ট নেই</p>
        )}
      </section>
    </div>
  );
}
