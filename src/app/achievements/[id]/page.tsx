import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays, Award, Medal, ArrowLeft, Building2, Flag } from "lucide-react";
import { getAchievements } from "@/lib/data";
import GalleryGrid from "@/components/gallery-grid";
import { Reveal } from "@/components/reveal";
import { toBn, formatDate } from "@/lib/utils";

export default async function AchievementDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const all = await getAchievements();
  const a = all.find((x) => x.id === Number(id));
  if (!a) notFound();

  const photos = (a.photos || []).map((url, i) => ({
    id: i,
    kind: "image",
    url,
    category: "events",
    title: a.title,
  }));

  const facts = [
    { Icon: Flag, label: "ইভেন্ট", value: a.eventName },
    { Icon: Building2, label: "যেখানে গিয়েছিলাম", value: a.location },
    { Icon: CalendarDays, label: "তারিখ", value: formatDate(a.date) },
    { Icon: Award, label: "পুরস্কার", value: `${toBn(a.prizes)}টি` },
    { Icon: Medal, label: "পদক", value: `${toBn(a.medals)}টি` },
  ].filter((f) => f.value && f.value !== "০টি");

  return (
    <div className="pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <Link
          href="/achievements"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:text-blue dark:text-white/65"
        >
          <ArrowLeft className="size-3.5 rotate-180" />
          সকল অর্জন
        </Link>

        <Reveal className="mt-5">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] shadow-2xl sm:aspect-[21/9]">
            {a.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverImage} alt={a.title} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-black/[0.08] dark:bg-white/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal">{a.eventName}</p>
              <h1 className="font-display mt-2 max-w-3xl text-2xl font-extrabold leading-tight text-white sm:text-4xl">
                {a.title}
              </h1>
              {a.subtitle && <p className="mt-2 max-w-2xl text-sm font-medium text-white/80">{a.subtitle}</p>}
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <Reveal delay={0.08}>
            <div className="card p-6 sm:p-9">
              <h2 className="font-display text-xl font-extrabold sm:text-2xl">পূর্ণ বিবরণ</h2>
              <div className="mt-4 space-y-4 text-[15px] leading-[1.9] text-ink-soft dark:text-white/70">
                {a.description.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="glass space-y-1 rounded-[1.75rem] p-3">
              {facts.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3.5 rounded-2xl p-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-soft dark:text-white/50">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm font-bold leading-snug">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {photos.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display mb-6 text-xl font-extrabold sm:text-2xl">
              <MapPin className="mr-2 inline size-5 text-blue" />
              ইভেন্টের মুহূর্ত
            </h2>
            <GalleryGrid items={photos} showFilters={false} />
          </section>
        )}
      </div>
    </div>
  );
}
