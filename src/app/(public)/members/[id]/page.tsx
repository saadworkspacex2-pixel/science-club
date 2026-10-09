import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowRight, Award, Compass, BadgeCheck, FileBadge2, ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { members } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { Monogram } from "@/components/ui";
import { WhatsappIcon, FacebookIcon, InstagramIcon } from "@/components/brand-icons";
import { getAchievementsForMember } from "@/lib/achievement-members";
import { MemberAchievementRow } from "@/components/cards";
import { Trophy } from "lucide-react";
import { resolveMemberCertificates } from "@/lib/member-certificates-store";
import { createPageMetadata, getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import { memberCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [m] = await db.select(memberCompatibleSelection).from(members).where(eq(members.id, Number(id))).limit(1);
  if (!m) return createPageMetadata({ title: "সদস্য পাওয়া যায়নি", description: "এই সদস্য প্রোফাইলটি পাওয়া যায়নি।", path: `/members/${id}`, noIndex: true });
  return createPageMetadata({
    title: m.seoTitle || `${m.name} — ${m.role}`,
    description: m.seoDescription || m.bio || `${m.name}, ${m.role} — রংপুরের বিউএসএস সাইন্স ক্লাবের সদস্য প্রোফাইল, অর্জন ও অংশগ্রহণ।`,
    path: `/members/${m.id}`,
    image: m.photoUrl || undefined,
  });
}

export default async function MemberPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [m] = await db.select(memberCompatibleSelection).from(members).where(eq(members.id, Number(id))).limit(1);
  if (!m) notFound();

  const certificates = await resolveMemberCertificates(m.id, m.certificates);
  const linkedAchievements = await getAchievementsForMember(m.id);
  const achList = (m.achievements || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
  const partList = (m.participations || "").split("\n").map((s: string) => s.trim()).filter(Boolean);
  const siteUrl = getSiteUrl().toString().replace(/\/$/, "");
  const memberUrl = new URL(`/members/${m.id}`, siteUrl).toString();
  const personImage = m.photoUrl ? toAbsoluteUrl(m.photoUrl) : "";
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    description: m.bio || `${m.name}, ${m.role} — বিউএসএস সাইন্স ক্লাবের সদস্য।`,
    url: memberUrl,
    ...(personImage ? { image: personImage } : {}),
    affiliation: { "@id": `${siteUrl}/#organization` },
    ...(achList.length ? { award: achList } : {}),
  };
  const personJsonLd = JSON.stringify(personStructuredData).replace(/</g, "\\u003c");

  return (
    <div className="mx-auto max-w-5xl pb-24 pt-24 sm:pb-20 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
      <div className="px-4 sm:px-5">
        <Reveal>
          <Link href="/members" className="chip mb-8 !py-2 transition-all hover:scale-[1.04]">
            <ArrowRight className="h-4 w-4" /> সব সদস্য
          </Link>
        </Reveal>

        {/* Hero card */}
        <Reveal>
          <div className="dot-grid glass-card relative mt-4 overflow-hidden p-5 sm:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0a84ff]/10 blur-3xl" />
            <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-end">
              {m.photoUrl ? (
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  className="h-28 w-28 rounded-[30%] object-cover shadow-[0_24px_48px_-14px_rgba(10,132,255,.55)] sm:h-36 sm:w-36"
                />
              ) : (
                <Monogram name={m.name} size={144} />
              )}
              <div className="text-center sm:pb-2 sm:text-left">
                <span className="chip">{m.role}</span>
                <h1 className="mt-3 text-[clamp(1.8rem,5vw,3rem)] font-bold leading-tight tracking-tight">
                  {m.name}
                </h1>
                <p className="mt-2 text-[14px] font-medium" style={{ color: "var(--ink-3)" }}>
                  {m.className && <>শ্রেণি {m.className}</>}
                  {m.section && <> · শাখা {m.section}</>}
                  {m.roll && <> · রোল {m.roll}</>}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:mt-5 sm:gap-2.5 sm:justify-start">
                  {m.whatsapp && (
                    <a
                      href={`https://wa.me/88${m.whatsapp.replace(/^\+?88/, "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass !px-4 !py-2.5 text-[13px]"
                      style={{ color: "#25d366" }}
                    >
                      <WhatsappIcon className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                  {m.facebook && (
                    <a href={m.facebook} target="_blank" rel="noopener noreferrer" className="btn-glass !px-4 !py-2.5 text-[13px]" style={{ color: "#1877f2" }}>
                      <FacebookIcon className="h-4 w-4" /> Facebook
                    </a>
                  )}
                  {m.instagram && (
                    <a
                      href={`https://instagram.com/${m.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-glass !px-4 !py-2.5 text-[13px]"
                      style={{ color: "#d62976" }}
                    >
                      <InstagramIcon className="h-4 w-4" /> Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Auto-linked achievements from the achievements showcase */}
        {linkedAchievements.length > 0 && (
          <Reveal delay={80}>
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2.5 text-[17px] font-bold sm:text-[19px]">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Trophy className="h-4 w-4" />
                </span>
                অংশগ্রহণ করা অর্জনসমূহ
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                {linkedAchievements.map((a) => (
                  <MemberAchievementRow key={a.id} a={a} memberId={m.id} />
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {certificates.length > 0 && (
          <Reveal delay={100}>
            <div className="mt-5">
              <Link href={`/members/${m.id}/certificates`} className="btn-brand inline-flex !px-5 !py-3 text-[13px] shadow-[var(--shadow-soft)]">
                <FileBadge2 className="h-4.5 w-4.5" />
                See {m.name}’s Certificates
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10.5px]">{certificates.length}</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        )}

        {/* Bio / Achievements / Participations */}
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {m.bio && (
            <Reveal delay={100} className="lg:col-span-2">
              <div className="glass-card p-5 sm:p-7">
                <h2 className="flex items-center gap-2.5 text-[17px] font-bold">
                  <BadgeCheck className="h-5 w-5" style={{ color: "var(--brand)" }} /> পরিচিতি
                </h2>
                <p className="mt-3 text-[15px] leading-[1.85]" style={{ color: "var(--ink-2)" }}>
                  {m.bio}
                </p>
              </div>
            </Reveal>
          )}
          {achList.length > 0 && (
            <Reveal delay={160}>
              <div className="glass-card h-full p-5 sm:p-7">
                <h2 className="flex items-center gap-2.5 text-[17px] font-bold">
                  <Award className="h-5 w-5 text-amber-500" /> অর্জনসমূহ
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {achList.map((a, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
          {partList.length > 0 && (
            <Reveal delay={220}>
              <div className="glass-card h-full p-5 sm:p-7">
                <h2 className="flex items-center gap-2.5 text-[17px] font-bold">
                  <Compass className="h-5 w-5" style={{ color: "var(--brand)" }} /> অংশগ্রহণ
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {partList.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
