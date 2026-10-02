import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, GraduationCap, Trophy, Users2, Megaphone, ArrowUpRight } from "lucide-react";
import { getMemberSession } from "@/lib/auth";
import { getMembers, getInternalNews } from "@/lib/data";
import { LogoutButton } from "@/components/login-form";
import { Reveal } from "@/components/reveal";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "আমার পোর্টাল" };

export default async function PortalPage() {
  const session = await getMemberSession();
  if (!session) redirect("/login");

  const members = await getMembers();
  const m = members.find((x) => x.id === session.mid);
  if (!m) redirect("/login");
  const internalNews = await getInternalNews();

  const list = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-28 sm:pt-32">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-blue">সদস্য এলাকা</p>
          <h1 className="font-display mt-2 text-3xl font-extrabold sm:text-4xl">
            স্বাগতম, {m.name}!
          </h1>
        </div>
        <LogoutButton endpoint="/api/member-auth" label="লগআউট" />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Reveal>
          <div className="card overflow-hidden">
            <div className="relative aspect-[3/3.2]">
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photoUrl} alt={m.name} className="size-full object-cover" />
              ) : (
                <div className="grid size-full place-items-center bg-black/[0.06] dark:bg-white/10">
                  <span className="font-display text-7xl font-extrabold text-ink/25 dark:text-white/30">{m.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold text-white">
                  <BadgeCheck className="size-3.5 text-teal" /> {m.role}
                </span>
                <p className="font-display mt-2 text-2xl font-extrabold text-white">{m.name}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/80">
                  <GraduationCap className="size-4" />
                  শ্রেণি {m.className}{m.section && ` • শাখা ${m.section}`}{m.roll && ` • রোল ${m.roll}`}
                </p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-ink-soft dark:text-white/60">{m.bio}</p>
            </div>
          </div>
        </Reveal>

        <div className="space-y-6">
          {/* Internal news */}
          <Reveal delay={0.06}>
            <section className="glass rounded-[1.75rem] p-6 sm:p-7">
              <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold">
                <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                  <Megaphone className="size-4" />
                </span>
                অভ্যন্তরীণ ঘোষণা <span className="rounded-full bg-orange/15 px-2 py-0.5 text-[10px] font-bold text-orange">শুধু সদস্যদের জন্য</span>
              </h2>
              <div className="mt-4 space-y-3">
                {internalNews.map((n) => (
                  <div key={n.id} className="rounded-2xl bg-mist p-4 dark:bg-white/5">
                    <p className="text-sm font-extrabold">{n.title}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-soft dark:text-white/60">{n.body}</p>
                    <p className="mt-2 text-[11px] font-medium text-ink-soft/70 dark:text-white/40">
                      {formatDate(n.createdAt || "")}
                    </p>
                  </div>
                ))}
                {internalNews.length === 0 && (
                  <p className="rounded-2xl bg-mist p-4 text-center text-sm text-ink-soft dark:bg-white/5 dark:text-white/50">
                    এখনো কোনো অভ্যন্তরীণ ঘোষণা নেই
                  </p>
                )}
              </div>
            </section>
          </Reveal>

          {m.achievements && (
            <Reveal delay={0.1}>
              <section className="card p-6 sm:p-7">
                <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold">
                  <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                    <Trophy className="size-4" />
                  </span>
                  আমার অর্জনসমূহ
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {list(m.achievements).map((a) => (
                    <li key={a} className="rounded-2xl bg-mist p-3.5 text-sm font-semibold dark:bg-white/5">{a}</li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          {m.participations && (
            <Reveal delay={0.14}>
              <section className="card p-6 sm:p-7">
                <h2 className="font-display flex items-center gap-2.5 text-lg font-extrabold">
                  <span className="grid size-9 place-items-center rounded-xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
                    <Users2 className="size-4" />
                  </span>
                  আমার অংশগ্রহণসমূহ
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {list(m.participations).map((a) => (
                    <li key={a} className="rounded-2xl bg-mist p-3.5 text-sm font-semibold dark:bg-white/5">{a}</li>
                  ))}
                </ul>
              </section>
            </Reveal>
          )}

          <Reveal delay={0.18}>
            <Link href={`/members/${m.id}`}
              className="glass group flex items-center justify-between rounded-[1.75rem] p-6 transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div>
                <p className="font-display text-base font-extrabold">আমার পাবলিক প্রোফাইল</p>
                <p className="text-xs text-ink-soft dark:text-white/50">সবাই কীভাবে আপনার প্রোফাইল দেখছে</p>
              </div>
              <span className="grid size-11 place-items-center rounded-full bg-black/[0.06] text-ink transition-transform group-hover:scale-110 dark:bg-white/10 dark:text-white">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
