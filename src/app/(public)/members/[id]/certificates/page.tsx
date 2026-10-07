import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowRight, Download, ExternalLink, FileBadge2, FileText } from "lucide-react";
import { db } from "@/db";
import { members } from "@/db/schema";
import { Reveal } from "@/components/motion";
import { resolveMemberCertificates } from "@/lib/member-certificates-store";
import { createPageMetadata, getSiteUrl, toAbsoluteUrl } from "@/lib/seo";
import { memberCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member] = await db.select(memberCompatibleSelection).from(members).where(eq(members.id, Number(id))).limit(1);
  if (!member) return createPageMetadata({ title: "সার্টিফিকেট", description: "সদস্যের সার্টিফিকেট পাতা পাওয়া যায়নি।", path: `/members/${id}/certificates`, noIndex: true });
  const certificates = await resolveMemberCertificates(member.id, member.certificates);
  return createPageMetadata({
    title: `${member.name} — সার্টিফিকেট`,
    description: `${member.name} (${member.role})-এর বিজ্ঞান, অলিম্পিয়াড ও শিক্ষাগত সার্টিফিকেটের সংগ্রহ।`,
    path: `/members/${member.id}/certificates`,
    image: member.photoUrl || undefined,
    noIndex: certificates.length === 0,
  });
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default async function MemberCertificatesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [member] = await db.select(memberCompatibleSelection).from(members).where(eq(members.id, Number(id))).limit(1);
  if (!member) notFound();

  const certificates = await resolveMemberCertificates(member.id, member.certificates);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": new URL(`/members/${member.id}/certificates`, getSiteUrl()).toString(),
    url: new URL(`/members/${member.id}/certificates`, getSiteUrl()).toString(),
    name: `${member.name} — সার্টিফিকেট`,
    description: `${member.name}-এর সার্টিফিকেট সংগ্রহ`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: certificates.length,
      itemListElement: certificates.map((certificate, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: certificate.title,
        url: toAbsoluteUrl(certificate.url),
      })),
    },
  };

  return (
    <article className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-5 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <Reveal>
        <Link href={`/members/${member.id}`} className="chip mb-7 !py-2 transition-transform hover:scale-[1.03]">
          <ArrowRight className="h-4 w-4" /> {member.name}-এর প্রোফাইলে ফিরুন
        </Link>
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]">
            <FileBadge2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[12px] font-semibold" style={{ color: "var(--ink-3)" }}>{member.role}</p>
            <h1 className="text-[clamp(1.7rem,4vw,2.5rem)] font-bold tracking-tight">
              {member.name}-এর সার্টিফিকেট
            </h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          অলিম্পিয়াড, বিজ্ঞানচর্চা ও অন্যান্য অর্জনের সার্টিফিকেটগুলো এখানে দেখুন বা ডাউনলোড করুন।
        </p>
      </Reveal>

      {certificates.length === 0 ? (
        <div className="glass-card mt-8 grid min-h-48 place-items-center p-6 text-center">
          <div>
            <FileText className="mx-auto mb-3 h-7 w-7" style={{ color: "var(--ink-3)" }} />
            <h2 className="text-[15px] font-bold">সার্টিফিকেট এখনো যোগ করা হয়নি</h2>
            <p className="mt-1 text-[12px]" style={{ color: "var(--ink-3)" }}>পরে আবার দেখুন।</p>
          </div>
        </div>
      ) : (
        <section className="mt-8" aria-label={`${member.name}-এর সার্টিফিকেটসমূহ`}>
          <p className="mb-4 text-[12px] font-semibold" style={{ color: "var(--ink-3)" }}>
            মোট {certificates.length}টি সার্টিফিকেট
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate, index) => {
              const isImage = certificate.mime.startsWith("image/");
              return (
                <Reveal key={certificate.id} delay={(index % 6) * 50}>
                  <div className="glass-card h-full overflow-hidden">
                    <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="group block">
                      {isImage ? (
                        <img
                          src={certificate.url}
                          alt={`${member.name} — ${certificate.title} সার্টিফিকেট`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/3] w-full bg-black/[0.03] object-contain p-2 dark:bg-white/[0.03]"
                        />
                      ) : (
                        <div className="grid aspect-[4/3] place-items-center bg-[color-mix(in_srgb,var(--brand)_5%,transparent)] p-5 transition-colors group-hover:bg-[color-mix(in_srgb,var(--brand)_10%,transparent)]">
                          <div className="text-center">
                            <FileText className="mx-auto h-12 w-12" style={{ color: "var(--brand)" }} />
                            <span className="mt-3 block rounded-full bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] px-3 py-1 text-[11px] font-bold text-[var(--brand)]">PDF সার্টিফিকেট</span>
                          </div>
                        </div>
                      )}
                    </a>
                    <div className="flex items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-[14px] font-bold" title={certificate.title}>{certificate.title}</h2>
                        <p className="mt-0.5 text-[11px]" style={{ color: "var(--ink-3)" }}>{isImage ? "ছবির সার্টিফিকেট" : "PDF ডকুমেন্ট"}</p>
                      </div>
                      <a href={certificate.url} target="_blank" rel="noopener noreferrer" download className="btn-brand !gap-1.5 !px-3 !py-2 text-[11px]" aria-label={`${certificate.title} ডাউনলোড করুন`}>
                        <Download className="h-3.5 w-3.5" /> ডাউনলোড
                      </a>
                      <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full" aria-label={`${certificate.title} নতুন ট্যাবে খুলুন`}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
