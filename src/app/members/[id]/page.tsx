import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GraduationCap, BadgeCheck, Trophy, Users2, BookOpenText } from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { getMembers, getAchievements } from "@/lib/data";

export default async function MemberPortfolio({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const members = await getMembers();
  const m = members.find((x) => x.id === Number(id));
  if (!m) notFound();

  const clubAchievements = (await getAchievements()).slice(0, 3);
  const list = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-5">
        <Link
          href="/members"
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-ink-soft transition-colors hover:text-blue dark:text-white/65"
        >
          <ArrowLeft className="size-3.5 rotate-180" />
          সকল সদস্য
        </Link>

        <div className="mt-5 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Profile card */}
          <Reveal>
            <div className="card overflow-hidden lg:sticky lg:top-28">
              <div className="relative aspect-[3/3.4] overflow-hidden">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photoUrl} alt={m.name} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center bg-black/[0.06] dark:bg-white/10">
                  <span className="font-display text-8xl font-extrabold text-ink/25 dark:text-white/30">{m.name.charAt(0)}</span>
                </div>
              )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
                    <BadgeCheck className="size-3.5 text-teal" />
                    {m.role}
                  </span>
                  <h1 className="font-display mt-2.5 text-3xl font-extrabold text-white">{m.name}</h1>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-white/80">
                    <GraduationCap className="size-4" />
                    শ্রেণি {m.className}
                    {m.section && ` • শাখা ${m.section}`}
                    {m.roll && ` • রোল ${m.roll}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 p-4">
                {m.whatsapp && (
                  <a href={`https://wa.me/${m.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black/[0.05] py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.03] active:scale-95 dark:bg-white/10 dark:text-white">
                    <WhatsAppIcon className="size-4" /> WhatsApp
                  </a>
                )}
                {m.facebook && (
                  <a href={m.facebook} target="_blank" rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black/[0.05] py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.03] active:scale-95 dark:bg-white/10 dark:text-white">
                    <FacebookIcon className="size-4" /> Facebook
                  </a>
                )}
                {m.instagram && (
                  <a href={`https://instagram.com/${m.instagram.replace(/^@/, "")}`} target="_blank" rel="noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black/[0.05] py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.03] active:scale-95 dark:bg-white/10 dark:text-white">
                    <InstagramIcon className="size-4" /> Instagram
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {/* Details */}
          <div className="space-y-6">
            {m.bio && (
              <Reveal delay={0.06}>
                <section className="card p-6 sm:p-8">
                  <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">
                    <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                      <BookOpenText className="size-4" />
                    </span>
                    আমার সম্পর্কে
                  </h2>
                  <p className="mt-4 leading-[1.9] text-ink-soft dark:text-white/70">{m.bio}</p>
                </section>
              </Reveal>
            )}
            {m.achievements && (
              <Reveal delay={0.1}>
                <section className="card p-6 sm:p-8">
                  <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">
                    <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                      <Trophy className="size-4" />
                    </span>
                    ব্যক্তিগত অর্জন
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {list(m.achievements).map((a) => (
                      <li key={a} className="flex items-start gap-3 rounded-2xl bg-mist p-3.5 text-sm font-semibold dark:bg-white/5">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink/30 dark:bg-white/40" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}
            {m.participations && (
              <Reveal delay={0.14}>
                <section className="card p-6 sm:p-8">
                  <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold sm:text-xl">
                    <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                      <Users2 className="size-4" />
                    </span>
                    অংশগ্রহণসমূহ
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {list(m.participations).map((a) => (
                      <li key={a} className="flex items-start gap-3 rounded-2xl bg-mist p-3.5 text-sm font-semibold dark:bg-white/5">
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink/30 dark:bg-white/40" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            )}
            <Reveal delay={0.18}>
              <section className="glass rounded-[1.75rem] p-6 sm:p-8">
                <h2 className="font-display text-lg font-extrabold sm:text-xl">ক্লাবের সাম্প্রতিক অর্জনে অবদান</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {clubAchievements.map((a) => (
                    <Link key={a.id} href={`/achievements/${a.id}`}
                      className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift">
                      {a.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.coverImage} alt={a.title} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-3 text-[11px] font-bold leading-snug text-white">
                        {a.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}
