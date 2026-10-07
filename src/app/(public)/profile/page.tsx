import { redirect } from "next/navigation";
import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { BadgeCheck, Award, Compass, Info, Newspaper } from "lucide-react";
import { db } from "@/db";
import { members, news } from "@/db/schema";
import { getSession, roleLabel } from "@/lib/auth";
import { Monogram } from "@/components/ui";
import LogoutButton from "@/components/logout-button";
import { bnDate } from "@/lib/utils";
import { memberCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";
export const metadata = { title: "আমার প্রোফাইল", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const linked =
    session.mid != null
      ? (await db.select(memberCompatibleSelection).from(members).where(eq(members.id, session.mid)).limit(1))[0]
      : null;

  const achList = (linked?.achievements || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
  const partList = (linked?.participations || "").split("\n").map((s: string) => s.trim()).filter(Boolean);

  const internalNews = await db
    .select()
    .from(news)
    .where(and(eq(news.published, true), eq(news.isInternal, true)))
    .orderBy(desc(news.createdAt))
    .limit(5);

  return (
    <div className="mx-auto max-w-4xl pb-24 pt-24 sm:pb-20 sm:pt-32">
      <div className="px-4 sm:px-5">
        <div className="dot-grid glass-card relative overflow-hidden p-5 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#0a84ff]/10 blur-3xl" />
          <div className="flex flex-wrap items-center gap-6">
            {linked?.photoUrl ? (
              <img src={linked.photoUrl} alt={linked.name} className="h-24 w-24 rounded-[28%] object-cover shadow-[0_18px_38px_-12px_rgba(10,132,255,.5)]" />
            ) : (
              <Monogram name={linked?.name || session.n} size={96} />
            )}
            <div className="flex-1">
              <span className="chip">
                <BadgeCheck className="h-3.5 w-3.5" />
                {roleLabel(session.r)}
              </span>
              <h1 className="mt-2.5 text-[clamp(1.6rem,4vw,2.4rem)] font-bold tracking-tight">{linked?.name || session.n}</h1>
              <p className="mt-1 text-[13.5px]" style={{ color: "var(--ink-3)" }}>
                ইউজারনেম: {session.u}
                {linked && <> · {linked.role} · শ্রেণি {linked.className}{linked.section ? ` (${linked.section})` : ""}</>}
              </p>
            </div>
            <LogoutButton />
          </div>
        </div>

        {linked ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="glass-card p-6">
              <h2 className="flex items-center gap-2.5 text-[16px] font-bold">
                <Award className="h-5 w-5 text-amber-500" /> আমার অর্জন
              </h2>
              {achList.length ? (
                <ul className="mt-4 space-y-2.5">
                  {achList.map((a: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" /> {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[13px]" style={{ color: "var(--ink-3)" }}>শীঘ্রই যুক্ত হবে</p>
              )}
            </div>
            <div className="glass-card p-6">
              <h2 className="flex items-center gap-2.5 text-[16px] font-bold">
                <Compass className="h-5 w-5" style={{ color: "var(--brand)" }} /> আমার অংশগ্রহণ
              </h2>
              {partList.length ? (
                <ul className="mt-4 space-y-2.5">
                  {partList.map((p: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" /> {p}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-[13px]" style={{ color: "var(--ink-3)" }}>শীঘ্রই যুক্ত হবে</p>
              )}
            </div>
            <Link href={`/members/${linked.id}`} className="btn-glass sm:col-span-2">
              আমার পাবলিক পোর্টফোলিও দেখুন
            </Link>
          </div>
        ) : (
          <div className="glass-card mt-6 flex items-start gap-3.5 p-6">
            <Info className="mt-0.5 h-5 w-5 shrink-0" style={{ color: "var(--brand)" }} />
            <p className="text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
              আপনার অ্যাকাউন্টটি এখনও কোনো সদস্য প্রোফাইলের সাথে যুক্ত নয়। প্রোফাইল যুক্ত করতে
              অ্যাডমিনের সাথে যোগাযোগ করুন।
            </p>
          </div>
        )}

        {internalNews.length > 0 && (
          <div className="glass-card mt-6 p-6">
            <h2 className="flex items-center gap-2.5 text-[16px] font-bold">
              <Newspaper className="h-5 w-5" style={{ color: "var(--brand)" }} /> অভ্যন্তরীণ ঘোষণা
            </h2>
            <ul className="mt-4 space-y-3">
              {internalNews.map((n) => (
                <li key={n.id} className="rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
                  <p className="text-[14px] font-bold">{n.title}</p>
                  {n.body && (
                    <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{n.body}</p>
                  )}
                  <p className="mt-1.5 text-[11px]" style={{ color: "var(--ink-3)" }}>{bnDate(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(session.r === "superadmin" || session.r === "super_admin" || session.r === "editor") && (
          <Link href="/admin" className="btn-brand mt-6 w-full">
            অ্যাডমিন প্যানেলে যান
          </Link>
        )}
      </div>
    </div>
  );
}
