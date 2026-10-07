import Link from "next/link";
import { asc, desc, eq, sum, count } from "drizzle-orm";
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Trophy,
  Users,
  FlaskConical,
  Medal,
  UserPlus,
  Rocket,
} from "lucide-react";
import { db } from "@/db";
import {
  slides as heroSlides,
  achievements,
  members,
  projects,
  galleryItems,
  hallOfFame,
  sponsors,
  resources,
  news,
} from "@/db/schema";
import HeroSlider from "@/components/hero-slider";
import { Reveal, Counter, Tilt } from "@/components/motion";
import { SectionHeading, Monogram } from "@/components/ui";
import { AchievementCard, MemberCard, FameCard, SponsorTile } from "@/components/cards";
import ProjectsFilter from "@/components/projects-filter";
import { bn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";
import { achievementCompatibleSelection, memberCardCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return createPageMetadata({
    title: "রংপুরের শিক্ষার্থী বিজ্ঞান ক্লাব",
    description: "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজের বিউএসএস সাইন্স ক্লাব। বিজ্ঞান অলিম্পিয়াড, শিক্ষার্থীদের উদ্ভাবন, প্রকল্প, অর্জন ও ক্লাব কার্যক্রম দেখুন।",
    path: "/",
  });
}

const LEGACY_CATS: Record<string, string> = {
  note: "নোট",
  guide: "গাইড",
  paper: "প্রশ্নপত্র",
  magazine: "ম্যাগাজিন",
  link: "লিংক",
};

export default async function HomePage() {
  const [
    slides,
    achRows,
    leaders,
    projRows,
    gallery,
    fame,
    sponsorRows,
    resRows,
    newsRows,
    [{ c: achCount }],
    [{ c: memCount }],
    [{ c: projCount }],
    [medalSum],
  ] = await Promise.all([
    db.select().from(heroSlides).where(eq(heroSlides.active, true)).orderBy(asc(heroSlides.sortOrder)),
    db.select(achievementCompatibleSelection).from(achievements).orderBy(asc(achievements.sortOrder)).limit(4),
    db.select(memberCardCompatibleSelection).from(members).where(eq(members.featured, true)).orderBy(asc(members.sortOrder)).limit(4),
    db.select().from(projects).orderBy(asc(projects.sortOrder)).limit(6),
    db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder)).limit(6),
    db.select().from(hallOfFame).orderBy(asc(hallOfFame.sortOrder)).limit(3),
    db.select().from(sponsors).orderBy(asc(sponsors.sortOrder)).limit(6),
    db.select().from(resources).orderBy(desc(resources.createdAt)).limit(4),
    db.select().from(news).where(eq(news.published, true)).orderBy(desc(news.createdAt)).limit(6),
    db.select({ c: count() }).from(achievements),
    db.select({ c: count() }).from(members).where(eq(members.active, true)),
    db.select({ c: count() }).from(projects),
    db.select({ v: sum(achievements.medals) }).from(achievements),
  ]);

  const stats = [
    { icon: Trophy, label: "মোট অর্জন", value: achCount, tint: "#ff9500" },
    { icon: Users, label: "সক্রিয় সদস্য", value: memCount, tint: "#0a84ff" },
    { icon: FlaskConical, label: "সম্পন্ন প্রকল্প", value: projCount, tint: "#30d158" },
    { icon: Medal, label: "মোট মেডেল", value: Number(medalSum.v ?? 0), tint: "#af52de" },
  ];

  return (
    <div className="overflow-x-clip">
      {/* ===== HERO ===== */}
      <section className="px-2 pt-20 sm:px-5 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <HeroSlider slides={slides} />
        </div>
      </section>

      {/* ===== NEWS STRIP ===== */}
      {newsRows.length > 0 && (
        <section className="mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-5">
          <Reveal>
            <Link href="/news" className="glass-card group flex items-center gap-3 overflow-hidden !rounded-2xl px-4 py-3" style={{ boxShadow: "none" }}>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-[12px] font-bold text-red-500">
                <Bell className="pulse-dot h-3.5 w-3.5" />
                সর্বশেষ
              </span>
              <div className="relative flex-1 overflow-hidden">
                <div className="marquee-track gap-12 text-[13.5px] font-medium">
                  {[...newsRows, ...newsRows].map((n, i) => (
                    <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                      {n.title}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          </Reveal>
        </section>
      )}

      {/* ===== STATS ===== */}
      <section className="mx-auto mt-10 max-w-6xl px-4 sm:mt-16 sm:px-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.label} delay={i * 90}>
                <Tilt className="glass-card glass-hairline relative overflow-hidden p-4 text-center sm:p-6">
                  <span
                    className="mx-auto grid h-10 w-10 place-items-center rounded-2xl sm:h-12 sm:w-12"
                    style={{ background: `color-mix(in srgb, ${s.tint} 14%, transparent)`, color: s.tint }}
                  >
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <p className="mt-3 text-[clamp(1.4rem,6vw,2.4rem)] font-bold leading-none tracking-tight sm:mt-4">
                    <Counter to={s.value} />+
                  </p>
                  <p className="mt-1.5 text-[11px] font-semibold leading-tight sm:mt-2 sm:text-[12.5px]" style={{ color: "var(--ink-3)" }}>
                    {s.label}
                  </p>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ===== ACHIEVEMENTS ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
        <SectionHeading
          kicker="গর্বের মুহূর্ত"
          title="আমাদের অর্জনসমূহ"
          desc="জাতীয় ও আন্তর্জাতিক মঞ্চে আমাদের দলের ঝলমলে সাফল্য — প্রতিটি পুরস্কারের পেছনে অঘ্রাণ পরিশ্রম আর অসীম কৌতূহল।"
          href="/achievements"
          hrefLabel="সব অর্জন"
        />
        <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {achRows.map((a, i) => (
            <Reveal key={a.id} delay={i * 90} className="w-[78vw] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <AchievementCard a={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== LEADERSHIP ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
        <SectionHeading
          kicker="নেতৃত্ব"
          title="যারা পথ দেখাচ্ছেন"
          desc="ক্লাবের কার্যক্রম পরিচালনায় নিরলসভাবে কাজ করে যাচ্ছে আমাদের নেতৃত্ব দল।"
          href="/members"
          hrefLabel="সব সদস্য"
        />
        <div className="-mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {leaders.map((m, i) => (
            <Reveal key={m.id} delay={i * 90} className="w-[70vw] max-w-[300px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <MemberCard m={m} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== PROJECTS ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
        <SectionHeading
          kicker="উদ্ভাবন"
          title="প্রকল্প ইতিহাস"
          desc="সফল, চলমান, ব্যর্থ — প্রতিটি প্রকল্পই আমাদের শেখায়। ফিল্টার করে দেখুন আমাদের পুরো যাত্রা।"
          href="/projects"
          hrefLabel="সব প্রকল্প"
        />
        <Reveal>
          <ProjectsFilter projects={projRows} />
        </Reveal>
      </section>

      {/* ===== GALLERY PREVIEW ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
        <SectionHeading
          kicker="মুহূর্তের সংগ্রহ"
          title="গ্যালারী"
          href="/gallery"
          hrefLabel="পুরো গ্যালারী"
        />
        <div className="columns-2 gap-2.5 space-y-2.5 sm:columns-3 sm:gap-3.5 sm:space-y-3.5">
          {gallery.map((g, i) => (
            <Reveal key={g.id} delay={(i % 3) * 80} className="break-inside-avoid">
              <Link href="/gallery" className="group relative block overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
                {g.kind === "video" ? (
                  <video src={g.url} className="w-full object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.05]" muted playsInline loop autoPlay />
                ) : (
                  <img src={g.url} alt={g.title || "গ্যালারী"} className="w-full object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.05]" />
                )}
                {g.title && (
                  <span className="absolute inset-x-3 bottom-3 truncate rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-semibold text-white opacity-0 backdrop-blur-md transition-all duration-400 group-hover:opacity-100">
                    {g.title}
                  </span>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== HALL OF FAME ===== */}
      {fame.length > 0 && (
        <section className="mt-14 px-4 sm:mt-24 sm:px-5">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0b0b10] px-4 py-10 sm:rounded-[2.5rem] sm:px-10 sm:py-14" style={{ boxShadow: "0 40px 90px -30px rgba(10,132,255,.35)" }}>
            <div className="pointer-events-none absolute inset-0" aria-hidden />
            <Reveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3.5 py-1.5 text-[13px] font-semibold text-amber-300">
                    <Trophy className="h-3.5 w-3.5" /> কিংবদন্তি প্রাঙ্গণ
                  </span>
                  <h2 className="text-[clamp(1.7rem,4vw,2.6rem)] font-bold tracking-tight text-white">
                    হল অফ ফেম
                  </h2>
                  <p className="mt-3 max-w-xl text-[15px] text-white/55">
                    জাতীয় ও আন্তর্জাতিক পুরস্কারে সম্মানিত তারকারা — যাদের কীর্তি ক্লাবের ইতিহাসে সোনার অক্ষরে লেখা।
                  </p>
                </div>
                <Link href="/hall-of-fame" className="btn-glass shrink-0 !px-5 !py-2.5 text-sm !text-white" style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.15)" }}>
                  সবাইকে দেখুন <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {fame.map((f, i) => (
                <Reveal key={i} delay={i * 100}>
                  <FameCard f={f} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== RESOURCE TEASER ===== */}
      <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
        <SectionHeading
          kicker="জ্ঞানের ভাণ্ডার"
          title="রিসোর্স লাইব্রেরি"
          desc="বিজ্ঞান শেখাকে আরও সহজ করতে আমাদের নিজস্ব নোট, গাইড, প্রশ্নপত্র ও ম্যাগাজিন — সম্পূর্ণ ফ্রি।"
          href="/resources"
          hrefLabel="পুরো লাইব্রেরি"
        />
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {resRows.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <div className="glass-card hover-lift flex h-full flex-col p-5">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
                  <BookOpen className="h-5 w-5" style={{ color: "var(--brand)" }} />
                </span>
                <h3 className="mt-4 text-[15px] font-bold leading-snug">{r.title}</h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                  {r.description}
                </p>
                <span className="chip mt-4 w-fit !text-[11px]">{LEGACY_CATS[r.category] || r.category}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== SPONSORS ===== */}
      {sponsorRows.length > 0 && (
        <section className="mx-auto mt-14 max-w-6xl px-4 sm:mt-24 sm:px-5">
          <SectionHeading
            kicker="সহযোগিতায়"
            title="স্পনসর ও পার্টনার ওয়াল"
            desc="যাদের ভালোবাসা ও সহযোগিতায় আমাদের যাত্রা এগিয়ে চলেছে"
            center
          />
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {sponsorRows.map((s, i) => (
              <Reveal key={s.id} delay={i * 70}>
                <SponsorTile s={s} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="mx-auto mt-16 max-w-6xl px-4 sm:mt-28 sm:px-5">
        <Reveal>
          <div className="dot-grid glass-strong relative overflow-hidden rounded-[2rem] px-5 py-12 text-center sm:rounded-[2.5rem] sm:px-12 sm:py-20" style={{ boxShadow: "var(--shadow-lift)" }}>
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#0a84ff]/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#30d158]/15 blur-3xl" />
            <span className="float-soft mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] text-white" style={{ background: "linear-gradient(135deg,#0a84ff,#30d158)", boxShadow: "0 20px 44px -12px rgba(10,132,255,.6)" }}>
              <Rocket className="h-7 w-7" />
            </span>
            <h2 className="mx-auto mt-7 max-w-2xl text-[clamp(1.8rem,4.5vw,2.8rem)] font-bold leading-[1.15] tracking-tight">
              আমাদের <span className="text-gradient">পরিবারের অংশ</span> হোন
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
              বিজ্ঞানের জাদুতে নিজেকে হারিয়ে ফেলতে চান? ষষ্ঠ থেকে দশম শ্রেণির যেকোনো শিক্ষার্থী আজই আবেদন করতে পারে।
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/join" className="btn-brand">
                <UserPlus className="h-4.5 w-4.5" /> এখনই আবেদন করুন
              </Link>
              <Link href="/about" className="btn-glass">
                ক্লাব সম্পর্কে জানুন
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
