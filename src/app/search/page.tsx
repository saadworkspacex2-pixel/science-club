import type { Metadata } from "next";
import Link from "next/link";
import { ilike, or } from "drizzle-orm";
import { Search, Trophy, Users, FlaskConical, Newspaper, FolderDown, UserRound } from "lucide-react";
import { db } from "@/db";
import * as s from "@/db/schema";
import PageHero from "@/components/page-hero";
import { toBn } from "@/lib/utils";

export const metadata: Metadata = { title: "সার্চ" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const pattern = `%${query}%`;

  const [achievements, members, projects, news, resources, fame] = query
    ? await Promise.all([
        db.select().from(s.achievements).where(or(ilike(s.achievements.title, pattern), ilike(s.achievements.description, pattern))),
        db.select().from(s.members).where(or(ilike(s.members.name, pattern), ilike(s.members.role, pattern))),
        db.select().from(s.projects).where(or(ilike(s.projects.title, pattern), ilike(s.projects.summary, pattern))),
        db.select().from(s.news).where(or(ilike(s.news.title, pattern), ilike(s.news.body, pattern))),
        db.select().from(s.resources).where(or(ilike(s.resources.title, pattern), ilike(s.resources.description, pattern))),
        db.select().from(s.hallOfFame).where(or(ilike(s.hallOfFame.name, pattern), ilike(s.hallOfFame.award, pattern))),
      ])
    : [[], [], [], [], [], []];

  const groups = [
    { title: "অর্জন", Icon: Trophy, items: achievements.map((a) => ({ href: `/achievements/${a.id}`, label: a.title, sub: a.eventName })) },
    { title: "সদস্য", Icon: Users, items: members.map((m) => ({ href: `/members/${m.id}`, label: m.name, sub: m.role })) },
    { title: "প্রকল্প", Icon: FlaskConical, items: projects.map((p) => ({ href: `/projects/${p.id}`, label: p.title, sub: p.summary })) },
    { title: "সংবাদ", Icon: Newspaper, items: news.map((n) => ({ href: "/news", label: n.title, sub: n.body.slice(0, 60) })) },
    { title: "রিসোর্স", Icon: FolderDown, items: resources.map((r) => ({ href: "/resources", label: r.title, sub: r.category })) },
    { title: "হল অফ ফেম", Icon: UserRound, items: fame.map((f) => ({ href: "/hall-of-fame", label: f.name, sub: f.award })) },
  ];
  const total = groups.reduce((a, g) => a + g.items.length, 0);

  return (
    <div>
      <PageHero eyebrow="সার্বজনীন অনুসন্ধান" title="পুরো সাইটে খুঁজুন" />
      <section className="mx-auto max-w-3xl px-5 pb-10">
        <form action="/search" method="GET" className="glass flex items-center gap-2 rounded-full p-2 pl-5">
          <Search className="size-5 shrink-0 text-ink-soft dark:text-white/50" />
          <input
            name="q"
            defaultValue={query}
            placeholder="অর্জন, সদস্য, প্রকল্প, সংবাদ..."
            className="w-full bg-transparent py-2.5 text-[15px] font-medium outline-none placeholder:text-ink-soft/55 dark:placeholder:text-white/40"
          />
          <button type="submit"
            className="shrink-0 rounded-full bg-gradient-to-r from-blue to-blue-bright px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue/30 transition-transform hover:scale-[1.03] active:scale-95">
            খুঁজুন
          </button>
        </form>

        {query && (
          <p className="mt-6 text-center text-sm font-semibold text-ink-soft dark:text-white/55">
            “{query}” এর জন্য {toBn(total)}টি ফলাফল পাওয়া গেছে
          </p>
        )}

        <div className="mt-6 space-y-6">
          {groups.filter((g) => g.items.length > 0).map((g) => (
            <section key={g.title} className="card p-5 sm:p-6">
              <h2 className="font-display flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-ink-soft dark:text-white/55">
                <g.Icon className="size-4 text-blue" /> {g.title}
                <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] text-blue">{toBn(g.items.length)}</span>
              </h2>
              <ul className="mt-3 divide-y divide-black/[0.05] dark:divide-white/[0.06]">
                {g.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link href={item.href} className="group flex items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold transition-colors group-hover:text-blue">{item.label}</p>
                        {item.sub && <p className="truncate text-xs text-ink-soft dark:text-white/45">{item.sub}</p>}
                      </div>
                      <span className="text-blue opacity-0 transition-opacity group-hover:opacity-100">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {query && total === 0 && (
            <p className="py-14 text-center text-sm text-ink-soft dark:text-white/55">
              দুঃখিত, কিছুই পাওয়া যায়নি — অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
