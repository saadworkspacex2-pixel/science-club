import { asc, eq } from "drizzle-orm";
import { Crown, UsersRound } from "lucide-react";
import { db } from "@/db";
import { members } from "@/db/schema";
import { PageHeader, Empty } from "@/components/ui";
import { MemberCard } from "@/components/cards";
import { Reveal } from "@/components/motion";

import { createPageMetadata } from "@/lib/seo";
import { memberCardCompatibleSelection } from "@/lib/compatible-entity-selects";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return createPageMetadata({
    title: "সদস্য ও নেতৃত্ব — রংপুর বিজ্ঞান ক্লাব",
    description: "বিউএসএস সাইন্স ক্লাবের সভাপতি, সহ-সভাপতি, সাধারণ সম্পাদক ও সদস্যদের প্রোফাইল, কার্যক্রম ও অর্জন।",
    path: "/members",
  });
}

export default async function MembersPage() {
  const rows = await db
    .select(memberCardCompatibleSelection)
    .from(members)
    .where(eq(members.active, true))
    .orderBy(asc(members.sortOrder));

  const leaders = rows.filter((m) => m.isLeadership);
  const regulars = rows.filter((m) => !m.isLeadership);

  return (
    <div className="mx-auto max-w-6xl pb-16 sm:pb-10">
      <PageHeader
        kicker="আমাদের মানুষ"
        title="সদস্য ও নেতৃত্ব"
        desc="প্রতিটি সদস্যই আমাদের পরিবারের একেকটি তারকা — প্রোফাইলে ক্লিক করে দেখুন তাদের পুরো গল্প।"
      />
      <div className="space-y-10 px-4 sm:space-y-14 sm:px-5">
        <section>
          <Reveal>
            <h2 className="mb-6 flex items-center gap-2.5 text-[20px] font-bold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
                <Crown className="h-4.5 w-4.5" />
              </span>
              নেতৃত্ব কমিটি
            </h2>
          </Reveal>
          {leaders.length === 0 ? (
            <Empty />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {leaders.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 80}>
                  <MemberCard m={m} />
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {regulars.length > 0 && (
          <section>
            <Reveal>
              <h2 className="mb-6 flex items-center gap-2.5 text-[20px] font-bold tracking-tight">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]" style={{ color: "var(--brand)" }}>
                  <UsersRound className="h-4.5 w-4.5" />
                </span>
                সাধারণ সদস্য
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {regulars.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 80}>
                  <MemberCard m={m} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
