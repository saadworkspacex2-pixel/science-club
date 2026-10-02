import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import { AchievementCard } from "@/components/cards";
import { getAchievements } from "@/lib/data";

export const metadata: Metadata = {
  title: "অর্জনসমূহ",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের জাতীয় ও আন্তর্জাতিক পুরস্কার এবং অর্জনের তালিকা।",
};

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  return (
    <div>
      <PageHero
        eyebrow="আমাদের গর্ব"
        title="অর্জনসমূহ"
        subtitle="প্রতিটি পুরস্কারের পেছনে আছে রাতজাগা প্রস্তুতি, দলগত ঐক্য আর বিজ্ঞানের প্রতি অনুরাগ।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-10">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <AchievementCard key={a.id} a={a} delay={(i % 3) * 0.07} />
          ))}
        </div>
        {achievements.length === 0 && (
          <p className="py-20 text-center text-ink-soft dark:text-white/55">শীঘ্রই আসছে...</p>
        )}
      </section>
    </div>
  );
}
