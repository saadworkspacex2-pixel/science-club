import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Handshake,
  BookOpen,
  FileText,
  Newspaper,
  Sparkles,
} from "lucide-react";
import HeroSlider from "@/components/hero-slider";
import Counters from "@/components/counters";
import NewsTicker from "@/components/news-ticker";
import { AchievementCard, MemberCard, ProjectsView } from "@/components/cards";
import GalleryGrid from "@/components/gallery-grid";
import { SectionHeading, Reveal } from "@/components/reveal";
import { toBn } from "@/lib/utils";
import {
  getSlides,
  getMembers,
  getAchievements,
  getProjects,
  getGallery,
  getHallOfFame,
  getSponsors,
  getNews,
  getSettings,
} from "@/lib/data";

export default async function HomePage() {
  const [slides, members, achievements, projects, gallery, fame, sponsors, news, settings] =
    await Promise.all([
      getSlides(),
      getMembers(),
      getAchievements(),
      getProjects(),
      getGallery(),
      getHallOfFame(),
      getSponsors(),
      getNews(),
      getSettings(),
    ]);

  const leadership = members.filter((m) => m.isLeadership).slice(0, 4);
  const medals = achievements.reduce((a, c) => a + (c.medals || 0) + (c.prizes || 0), 0);
  const stats = [
    { icon: "trophy", value: achievements.length, label: "মোট অর্জন" },
    { icon: "users", value: members.length, label: "সক্রিয় সদস্য" },
    { icon: "flask", value: projects.filter((p) => p.status === "success").length, label: "সম্পন্ন প্রকল্প" },
    { icon: "medal", value: medals, label: "পুরস্কার ও পদক" },
  ];

  return (
    <div>
      <HeroSlider slides={slides} />
      <div className="mt-5">
        <NewsTicker items={news.map((n) => ({ id: n.id, title: n.title }))} />
      </div>

      {/* Counters */}
      <section className="mx-auto mt-14 max-w-6xl px-5">
        <Counters stats={stats} />
      </section>

      {/* Achievements */}
      <section className="relative mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <div className="ambient -left-24 top-10 size-80 bg-blue/25" />
        <SectionHeading
          eyebrow="আমাদের গর্ব"
          title="অর্জনের গল্প"
          subtitle="জাতীয় ও আন্তর্জাতিক মঞ্চে আমাদের দলের ঈর্ষণীয় সাফল্য — প্রতিটি পুরস্কারের পেছনে আছে অক্লান্ত পরিশ্রম।"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {achievements.slice(0, 4).map((a, i) => (
            <AchievementCard key={a.id} a={a} delay={i * 0.07} />
          ))}
        </div>
        <SeeAll href="/achievements" label="সকল অর্জন দেখুন" />
      </section>

      {/* Leadership */}
      <section className="relative mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <div className="ambient -right-24 top-16 size-80 bg-teal/25" />
        <SectionHeading
          eyebrow="নেতৃত্ব"
          title="যারা পথ দেখান"
          subtitle="ক্লাব পরিচালনার পেছনে যে অক্লান্ত কর্মীবৃন্দ রয়েছেন — পরিচিত হোন আমাদের নেতৃবৃন্দের সাথে।"
        />
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {leadership.map((m, i) => (
            <MemberCard key={m.id} m={m} delay={i * 0.07} />
          ))}
        </div>
        <SeeAll href="/members" label="সকল সদস্য দেখুন" />
      </section>

      {/* Projects */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <SectionHeading
          eyebrow="উদ্ভাবন"
          title="প্রকল্প ইতিহাস"
          subtitle="সফলতা থেকে শেখা ব্যর্থতা — প্রতিটি প্রকল্পই আমাদের শেখার যাত্রার পাথেয়।"
        />
        <ProjectsView projects={projects} limit={6} />
        <SeeAll href="/projects" label="সকল প্রকল্প দেখুন" />
      </section>

      {/* Hall of Fame */}
      {fame.length > 0 && (
        <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
          <SectionHeading
            eyebrow="কিংবদন্তিরা"
            title="হল অফ ফেম"
            subtitle="জাতীয় ও আন্তর্জাতিক পুরস্কারে ভূষিত আমাদের তারকারা — যাঁদের কৃতিত্ব আমাদের অহংকার।"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {fame.slice(0, 4).map((f, i) => (
              <Reveal key={f.id} delay={i * 0.07}>
                <div className="card group relative overflow-hidden rounded-[1.75rem]! transition-all duration-500 hover:-translate-y-2 hover:shadow-lift">
                  <div className="relative overflow-hidden rounded-[1.75rem]">
                    {f.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={f.photoUrl}
                        alt={f.name}
                        loading="lazy"
                        className="aspect-[4/4.4] w-full object-cover transition-transform duration-[1.1s] group-hover:scale-[1.06]"
                      />
                    ) : (
                      <div className="aspect-[4/4.4] w-full bg-black/[0.06] dark:bg-white/10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <span className="glass absolute left-3.5 top-3.5 grid size-10 place-items-center rounded-full text-white">
                      <Trophy className="size-5" />
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <h3 className="font-display text-lg font-bold text-white">{f.name}</h3>
                      <p className="mt-1 text-xs font-semibold leading-relaxed text-white/80">{f.award}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <SeeAll href="/hall-of-fame" label="হল অফ ফেম দেখুন" />
        </section>
      )}

      {/* Gallery */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <SectionHeading
          eyebrow="ঝলক"
          title="গ্যালারি"
          subtitle="ল্যাব থেকে পুরস্কারের মঞ্চ — আমাদের যাত্রার অমূল্য মুহূর্তগুলো।"
        />
        <GalleryGrid items={gallery.slice(0, 6)} showFilters={false} />
        <SeeAll href="/gallery" label="পুরো গ্যালারি দেখুন" />
      </section>

      {/* Sponsors */}
      {sponsors.length > 0 && (
        <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
          <SectionHeading
            eyebrow="সহযোগিতায়"
            title="স্পনসর ও পার্টনার"
            subtitle="যাঁদের সহায়তায় আমাদের প্রতিটি স্বপ্ন বাস্তব রূপ পায়।"
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {sponsors.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05}>
                <div className="group flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[1.5rem] glass p-4 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt={s.name} className="max-h-12 max-w-[70%] object-contain" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-2xl bg-black/[0.05] font-display text-xl font-extrabold text-ink transition-transform duration-500 group-hover:scale-110 dark:bg-white/10 dark:text-white">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <p className="text-center text-xs font-bold text-ink-soft dark:text-white/65">{s.name}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-ink-soft dark:text-white/45">
            <Handshake className="size-4" />
            পার্টনার হতে আগ্রহী? <Link href="/contact" className="font-semibold text-blue hover:underline">যোগাযোগ করুন</Link>
          </p>
        </section>
      )}

      {/* Resource teaser */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <div className="relative overflow-hidden rounded-[2rem] glass p-8 sm:p-12">
          <div className="ambient -right-16 -top-16 size-72 bg-teal/35" />
          <div className="ambient -bottom-20 left-10 size-64 bg-blue/25" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-blue">শেখার ভান্ডার</p>
              <h2 className="font-display mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                রিসোর্স লাইব্রেরি
              </h2>
              <p className="mt-4 max-w-lg leading-relaxed text-ink-soft dark:text-white/60">
                নোট, গাইড, অতীতের প্রশ্নপত্র, ম্যাগাজিন ও দরকারি লিংক — সবকিছু এক জায়গায়, সম্পূর্ণ ফ্রি।
              </p>
              <Link
                href="/resources"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue/30 transition-transform hover:scale-[1.04] active:scale-95"
              >
                <BookOpen className="size-4" />
                লাইব্রেরি ঘুরে দেখুন
              </Link>
            </Reveal>
            <div className="grid gap-3">
              {[
                { Icon: FileText, t: "নোট ও সাজেশন", d: "অধ্যায়ভিত্তিক যত্নে তৈরি নোট" },
                { Icon: Newspaper, t: "বিগত বছরের প্রশ্ন", d: "অলিম্পিয়াড ও মেলার প্রশ্ন সংকলন" },
                { Icon: Sparkles, t: "প্রস্তুতি গাইড", d: "সিনিয়রদের অভিজ্ঞতায় তৈরি রোডম্যাপ" },
              ].map(({ Icon, t, d }, i) => (
                <Reveal key={t} delay={0.1 + i * 0.08}>
                  <div className="flex items-center gap-4 rounded-3xl glass p-4 transition-transform duration-500 hover:-translate-y-1">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-sm font-bold">{t}</p>
                      <p className="text-xs text-ink-soft dark:text-white/55">{d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-5 sm:mt-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-16 text-center text-white shadow-2xl shadow-black/25 sm:py-20">
            <div className="absolute -left-20 -top-20 size-72 rounded-full bg-white/[0.08] blur-3xl" />
            <div className="absolute -bottom-24 -right-16 size-80 rounded-full bg-white/[0.05] blur-3xl" />
            <p className="font-tiro relative mx-auto max-w-xl text-lg italic leading-relaxed text-white/70 sm:text-xl">
              “{settings.tagline}”
            </p>
            <h2 className="font-display relative mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              আমাদের পরিবারের অংশ হোন
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              বিজ্ঞানের প্রতি ভালোবাসা থাকলেই যথেষ্ট — বাকিটা আমরা শেখাব। আজই আবেদন করুন, ভবিষ্যতের বিজ্ঞানী হোন আপনিই।
            </p>
            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/join"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-ink transition-transform hover:scale-[1.05] active:scale-95"
              >
                <Sparkles className="size-4" />
                এখনই আবেদন করুন
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold text-white/90 transition-colors hover:bg-white/10"
              >
                আরও জানুন
                <ArrowLeft className="size-4 rotate-180" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Reveal className="mt-10 text-center">
      <Link
        href={href}
        className="glass group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:text-blue hover:shadow-lift dark:text-white"
      >
        {label}
        <ArrowLeft className="size-4 rotate-180 transition-transform group-hover:translate-x-[-4px]" />
      </Link>
    </Reveal>
  );
}
