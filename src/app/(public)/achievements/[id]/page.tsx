import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, MapPin, CalendarDays, Trophy, Medal, Quote, Users, ExternalLink, Building2, MapPinned } from "lucide-react";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { MetaItem } from "@/components/cards";
import { bn } from "@/lib/utils";
import { getAchievementParticipantProfiles } from "@/lib/achievement-participants";
import { PARTICIPANT_RESULTS } from "@/lib/achievement-participant-config";
import { safeExternalWebUrl, safeMapEmbedUrl } from "@/lib/achievement-links";
import { createPageMetadata } from "@/lib/seo";
import { achievementCompatibleSelection } from "@/lib/compatible-entity-selects";
import { resolveAchievementDetails } from "@/lib/achievement-details-store";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [a] = await db.select(achievementCompatibleSelection).from(achievements).where(eq(achievements.id, Number(id))).limit(1);
  if (!a) return createPageMetadata({ title: "অর্জন পাওয়া যায়নি", description: "এই অর্জনটি পাওয়া যায়নি।", path: `/achievements/${id}`, noIndex: true });
  return createPageMetadata({
    title: a.title,
    description: a.subtitle || a.description || `${a.eventName || "বিজ্ঞান অলিম্পিয়াড"} — বিউএসএস সাইন্স ক্লাবের অর্জন ও শিক্ষার্থীদের ফলাফল।`,
    path: `/achievements/${a.id}`,
    image: a.coverImage || undefined,
  });
}

export default async function AchievementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db.select(achievementCompatibleSelection).from(achievements).where(eq(achievements.id, Number(id))).limit(1);
  if (!row) notFound();
  const a = {
    ...row,
    ...(await resolveAchievementDetails(row.id, {
      organizerInfo: row.organizerInfo,
      olympiadWebsite: row.olympiadWebsite,
      mapEmbedUrl: row.mapEmbedUrl,
      participants: row.participants,
    })),
  };

  const participants = await getAchievementParticipantProfiles(a.id, a.participants);
  const photos = Array.isArray(a.photos) ? a.photos.filter((u) => typeof u === "string" && u) : [];
  const olympiadUrl = safeExternalWebUrl(a.olympiadWebsite);
  const mapLink = safeExternalWebUrl(a.mapEmbedUrl);
  const mapEmbed = safeMapEmbedUrl(a.mapEmbedUrl);

  return (
    <article className="mx-auto max-w-5xl pb-24 pt-24 sm:pb-20 sm:pt-28">
      <div className="px-4 sm:px-5">
        <Reveal>
          <Link href="/achievements" className="chip mb-8 !py-2 transition-all hover:scale-[1.04]">
            <ArrowRight className="h-4 w-4" /> সব অর্জন
          </Link>
          {a.eventName && <span className="chip mb-4 ml-2 !py-2">{a.eventName}</span>}
          <h1 className="text-[clamp(1.8rem,5vw,3rem)] font-bold leading-[1.15] tracking-tight">
            {a.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-2.5">
            {a.date && <MetaItem icon={<CalendarDays className="h-4 w-4" style={{ color: "var(--brand)" }} />} label={a.date} />}
            {a.location && <MetaItem icon={<MapPin className="h-4 w-4" style={{ color: "var(--brand)" }} />} label={a.location} />}
            <MetaItem icon={<Trophy className="h-4 w-4 text-amber-500" />} label={`${bn(a.prizes)}টি পুরস্কার`} />
            <MetaItem icon={<Medal className="h-4 w-4 text-orange-500" />} label={`${bn(a.medals)}টি মেডেল`} />
          </div>
        </Reveal>
      </div>

      {a.coverImage && (
        <Reveal delay={120} className="mt-8 px-4 sm:mt-10 sm:px-5">
          <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
            <img src={a.coverImage} alt={a.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>
      )}

      {(a.organizerInfo || olympiadUrl) && (
        <Reveal delay={150} className="mt-6 px-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {a.organizerInfo && (
              <div className="glass-card p-4 sm:p-5">
                <h2 className="flex items-center gap-2 text-[14px] font-bold">
                  <Building2 className="h-4 w-4" style={{ color: "var(--brand)" }} /> আয়োজক তথ্য
                </h2>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                  {a.organizerInfo}
                </p>
              </div>
            )}
            {olympiadUrl && (
              <a href={olympiadUrl} target="_blank" rel="noopener noreferrer" className="glass-card flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5 sm:p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
                  <ExternalLink className="h-4.5 w-4.5" style={{ color: "var(--brand)" }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold">অলিম্পিয়াডের ওয়েবসাইট</span>
                  <span className="mt-0.5 block truncate text-[11.5px]" style={{ color: "var(--ink-3)" }}>{olympiadUrl}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0" style={{ color: "var(--ink-3)" }} />
              </a>
            )}
          </div>
        </Reveal>
      )}

      <div className="px-4 sm:px-5">
        {a.subtitle && (
          <Reveal delay={180}>
            <div className="glass-card mt-8 p-5 sm:mt-10 sm:p-9">
              <Quote className="h-6 w-6" style={{ color: "var(--brand)" }} />
              <p className="mt-4 text-[clamp(1.05rem,2vw,1.3rem)] font-medium leading-[1.7]">
                {a.subtitle}
              </p>
            </div>
          </Reveal>
        )}

        {a.description && (
          <Reveal delay={240}>
            <div className="mt-10 space-y-5 text-[16px]" style={{ color: "var(--ink-2)" }}>
              <h2 className="text-[clamp(1.3rem,2.6vw,1.8rem)] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
                পুরো গল্পটা
              </h2>
              {a.description.split("\n").filter(Boolean).map((p: string, i: number) => (
                <p key={i} className="leading-[1.9]">{p}</p>
              ))}
            </div>
          </Reveal>
        )}

        {(mapEmbed || mapLink) && (
          <Reveal delay={250}>
            <section className="mt-10">
              <h2 className="mb-4 flex items-center gap-2.5 text-[clamp(1.2rem,2.4vw,1.6rem)] font-bold tracking-tight">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]" style={{ color: "var(--brand)" }}>
                  <MapPinned className="h-4.5 w-4.5" />
                </span>
                অলিম্পিয়াডের ভেন্যু
              </h2>
              <div className="glass-card overflow-hidden p-2.5 sm:p-3">
                {mapEmbed ? (
                  <iframe
                    title={`${a.eventName || a.title} — ভেন্যুর মানচিত্র`}
                    src={mapEmbed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="h-[260px] w-full rounded-2xl border-0 sm:h-[360px]"
                  />
                ) : (
                  <div className="grid min-h-40 place-items-center rounded-2xl bg-black/[0.03] p-5 text-center dark:bg-white/5">
                    <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
                      এমবেডযোগ্য ম্যাপ URL না থাকলেও ভেন্যুর লিংকটি খুলে দেখুন।
                    </p>
                  </div>
                )}
                {mapLink && (
                  <a href={mapLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold text-[var(--brand)] hover:bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]">
                    <ExternalLink className="h-3.5 w-3.5" /> ম্যাপ খুলুন
                  </a>
                )}
              </div>
            </section>
          </Reveal>
        )}

        {participants.length > 0 && (
          <Reveal delay={280}>
            <section className="mt-10">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="flex items-center gap-2.5 text-[clamp(1.2rem,2.4vw,1.6rem)] font-bold tracking-tight">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]" style={{ color: "var(--brand)" }}>
                      <Users className="h-4.5 w-4.5" />
                    </span>
                    অংশগ্রহণকারী শিক্ষার্থী ও ফলাফল
                  </h2>
                  <p className="mt-1 text-[12px]" style={{ color: "var(--ink-3)" }}>
                    সেক্টর, অংশগ্রহণ এবং পুরস্কারের তথ্য
                  </p>
                </div>
                <span className="chip !py-1.5 text-[11px]">{bn(participants.length)} জন</span>
              </div>
              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-left">
                    <thead className="bg-black/[0.035] text-[11px] font-bold dark:bg-white/[0.04]">
                      <tr>
                        <th className="px-4 py-3">শিক্ষার্থী</th>
                        <th className="px-4 py-3">সেক্টর</th>
                        <th className="px-4 py-3">ফলাফল</th>
                        <th className="px-4 py-3">পুরস্কার / স্থান</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {participants.map((participant) => {
                        const result = PARTICIPANT_RESULTS.find((item) => item.value === participant.result);
                        const resultStyle = participant.result === "awarded"
                          ? "bg-green-500/10 text-green-700 dark:text-green-300"
                          : participant.result === "no_award"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                            : "bg-black/[0.05] text-[var(--ink-2)] dark:bg-white/[0.07]";
                        const identity = (
                          <span className="flex min-w-0 items-center gap-2.5">
                            {participant.photoUrl ? (
                              <img src={participant.photoUrl} alt={participant.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                            ) : (
                              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-[13px] font-bold text-[var(--brand)]">
                                {participant.name.charAt(0)}
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-bold">{participant.name}</span>
                              <span className="block truncate text-[11px]" style={{ color: "var(--ink-3)" }}>
                                {participant.role}{participant.className ? ` · শ্রেণি ${participant.className}` : ""}
                              </span>
                            </span>
                          </span>
                        );
                        return (
                          <tr key={participant.id} className="text-[12.5px]">
                            <td className="max-w-[280px] px-4 py-3">
                              {participant.memberId ? (
                                <Link href={`/members/${participant.memberId}`} className="block transition-opacity hover:opacity-75">{identity}</Link>
                              ) : identity}
                            </td>
                            <td className="px-4 py-3 font-medium">{participant.sector || "—"}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-bold ${resultStyle}`}>
                                {result?.label || "ফল উল্লেখ নেই"}
                              </span>
                            </td>
                            <td className="px-4 py-3" style={{ color: "var(--ink-2)" }}>{participant.award || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {photos.length > 0 && (
          <Reveal delay={300}>
            <div className="mt-12">
              <h2 className="mb-6 text-[clamp(1.3rem,2.6vw,1.8rem)] font-bold tracking-tight">
                ইভেন্টের ছবি
              </h2>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {photos.map((u: string, i: number) => (
                  <div key={i} className="overflow-hidden rounded-3xl shadow-[var(--shadow-soft)]">
                    <img src={u} alt={`${a.title} ${i + 1}`} className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </article>
  );
}
