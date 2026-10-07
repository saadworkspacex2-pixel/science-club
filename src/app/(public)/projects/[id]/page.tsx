import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, Trophy, AlertTriangle, Telescope, CalendarDays } from "lucide-react";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { PROJECT_STATUS } from "@/components/cards";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(projects).where(eq(projects.id, Number(id))).limit(1);
  if (!p) return createPageMetadata({ title: "প্রকল্প পাওয়া যায়নি", description: "এই প্রকল্পটি পাওয়া যায়নি।", path: `/projects/${id}`, noIndex: true });
  return createPageMetadata({
    title: p.title,
    description: p.summary || p.description || `বিউএসএস সাইন্স ক্লাবের শিক্ষার্থী বিজ্ঞান প্রকল্প: ${p.title}`,
    path: `/projects/${p.id}`,
    image: p.imageUrl || undefined,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p] = await db.select().from(projects).where(eq(projects.id, Number(id))).limit(1);
  if (!p) notFound();
  const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.ongoing;

  const blocks = [
    { icon: Trophy, tint: "#30d158", title: "সফলতা ও পুরস্কার", body: p.successes, list: true },
    { icon: AlertTriangle, tint: "#ff375f", title: "ব্যর্থতা ও শিক্ষা", body: p.failures, list: false },
    { icon: Telescope, tint: "#0a84ff", title: "ভবিষ্যৎ পরিকল্পনা", body: p.futurePlans, list: false },
  ].filter((b) => b.body && b.body.trim());

  return (
    <article className="mx-auto max-w-5xl pb-24 pt-24 sm:pb-20 sm:pt-28">
      <div className="px-4 sm:px-5">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/projects" className="chip !py-2 transition-all hover:scale-[1.04]">
              <ArrowRight className="h-4 w-4" /> সব প্রকল্প
            </Link>
            <span
              className="inline-flex items-center rounded-full px-3.5 py-2 text-[13px] font-bold"
              style={{ background: st.bg, color: st.color }}
            >
              {st.label}
            </span>
            {p.date && (
              <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold">
                <CalendarDays className="h-4 w-4" style={{ color: "var(--brand)" }} /> {p.date}
              </span>
            )}
          </div>
          <h1 className="mt-5 text-[clamp(1.9rem,5vw,3.2rem)] font-bold leading-[1.12] tracking-tight">
            {p.title}
          </h1>
          {p.summary && (
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
              {p.summary}
            </p>
          )}
        </Reveal>
      </div>

      {p.imageUrl && (
        <Reveal delay={120} className="mt-8 px-4 sm:mt-10 sm:px-5">
          <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
            <img src={p.imageUrl} alt={p.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>
      )}

      <div className="px-4 sm:px-5">
        {p.description && (
          <Reveal delay={160}>
            <div className="glass-card mt-8 p-5 sm:mt-10 sm:p-9">
              <h2 className="text-[19px] font-bold tracking-tight">প্রকল্পের বিবরণ</h2>
              <div className="mt-4 space-y-4 text-[15.5px] leading-[1.9]" style={{ color: "var(--ink-2)" }}>
                {p.description.split("\n").filter(Boolean).map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {blocks.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.title} delay={200 + i * 90}>
                <div className="glass-card h-full p-5 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${b.tint} 14%, transparent)`, color: b.tint }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-[16px] font-bold">{b.title}</h3>
                  {b.list ? (
                    <ul className="mt-3 space-y-2.5">
                      {b.body!.split("\n").filter(Boolean).map((l: string, j: number) => (
                        <li key={j} className="flex items-start gap-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: b.tint }} />
                          {l}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-[13.5px] leading-[1.85]" style={{ color: "var(--ink-2)" }}>
                      {b.body}
                    </p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </article>
  );
}
