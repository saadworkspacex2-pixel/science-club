import Link from "next/link";
import { count, eq, desc } from "drizzle-orm";
import {
  Trophy,
  Users,
  FlaskConical,
  Newspaper,
  UserPlus,
  Image as ImageIcon,
  ArrowUpLeft,
  Inbox,
} from "lucide-react";
import { db } from "@/db";
import { achievements, members, projects, news, applications, galleryItems } from "@/db/schema";
import { bn, bnDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "অপেক্ষমাণ", cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  contacted: { label: "যোগাযোগ করা হয়েছে", cls: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  accepted: { label: "গৃহীত", cls: "bg-green-500/15 text-green-600 dark:text-green-400" },
  rejected: { label: "প্রত্যাখ্যাত", cls: "bg-red-500/15 text-red-600 dark:text-red-400" },
};

export default async function AdminDashboard() {
  const [
    [{ c: ach }],
    [{ c: mem }],
    [{ c: proj }],
    [{ c: gal }],
    [{ c: nw }],
    [{ c: pendingCount }],
    recentApps,
  ] = await Promise.all([
    db.select({ c: count() }).from(achievements),
    db.select({ c: count() }).from(members),
    db.select({ c: count() }).from(projects),
    db.select({ c: count() }).from(galleryItems),
    db.select({ c: count() }).from(news),
    db.select({ c: count() }).from(applications).where(eq(applications.status, "pending")),
    db.select().from(applications).orderBy(desc(applications.createdAt)).limit(6),
  ]);

  const stats = [
    { label: "মোট অর্জন", value: ach, icon: Trophy, href: "/admin/achievements", tint: "#ff9500" },
    { label: "সক্রিয় সদস্য", value: mem, icon: Users, href: "/admin/members", tint: "#0a84ff" },
    { label: "প্রকল্প", value: proj, icon: FlaskConical, href: "/admin/projects", tint: "#30d158" },
    { label: "গ্যালারী আইটেম", value: gal, icon: ImageIcon, href: "/admin/gallery", tint: "#af52de" },
    { label: "সংবাদ", value: nw, icon: Newspaper, href: "/admin/news", tint: "#5ac8fa" },
    { label: "অপেক্ষমাণ আবেদন", value: pendingCount, icon: UserPlus, href: "/admin/applications", tint: "#ff375f" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-tight">ড্যাশবোর্ড</h1>
        <p className="mt-1 text-[14px]" style={{ color: "var(--ink-3)" }}>
          পুরো ওয়েবসাইটের নিয়ন্ত্রণ এক জায়গা থেকে
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="glass-card hover-lift group relative overflow-hidden p-4 sm:p-5"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl"
                style={{ background: `color-mix(in srgb, ${s.tint} 15%, transparent)`, color: s.tint }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[clamp(1.35rem,5.5vw,2.2rem)] font-bold leading-none sm:mt-4">{bn(s.value)}</p>
              <p className="mt-1.5 text-[11.5px] font-medium leading-tight sm:text-[13px]" style={{ color: "var(--ink-3)" }}>
                {s.label}
              </p>
              <ArrowUpLeft className="absolute right-4 top-4 h-4 w-4 opacity-0 transition-all duration-300 group-hover:opacity-60" />
            </Link>
          );
        })}
      </div>

      <section className="glass-card p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-bold">সাম্প্রতিক সদস্য আবেদন</h2>
          <Link href="/admin/applications" className="btn-glass !px-4 !py-2 text-[13px]">
            সব দেখুন
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10" style={{ color: "var(--ink-3)" }}>
            <Inbox className="h-8 w-8" />
            <p className="text-sm">এখনও কোনো আবেদন নেই</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentApps.map((a) => {
              const st = STATUS_LABEL[a.status] ?? STATUS_LABEL.pending;
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                  <div className="glass grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-bold text-gradient">
                    {a.fullName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold">{a.fullName}</p>
                    <p className="truncate text-[12px]" style={{ color: "var(--ink-3)" }}>
                      শ্রেণি {a.className} · রোল {a.classRoll} · {bnDate(a.createdAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11.5px] font-semibold ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
