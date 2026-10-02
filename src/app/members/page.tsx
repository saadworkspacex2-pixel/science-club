import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import { MemberCard } from "@/components/cards";
import { SectionHeading } from "@/components/reveal";
import { getMembers } from "@/lib/data";

export const metadata: Metadata = {
  title: "নেতৃবৃন্দ ও সদস্য",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের সভাপতি, সহ-সভাপতি, পরিচালক, সাধারণ সম্পাদকসহ সকল সদস্য।",
};

export default async function MembersPage() {
  const members = await getMembers();
  const leadership = members.filter((m) => m.isLeadership);
  const others = members.filter((m) => !m.isLeadership);

  return (
    <div>
      <PageHero
        eyebrow="আমাদের পরিবার"
        title="নেতৃবৃন্দ ও সদস্যরা"
        subtitle="ক্লাবের প্রতিটি সফলতার নেপথ্যে থাকা মানুষগুলো — যেকোনো সদস্যের কার্ডে ক্লিক করে দেখুন তাঁর সম্পূর্ণ প্রোফাইল।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-6">
        <SectionHeading eyebrow="কর্তৃপক্ষ" title="বর্তমান প্যানেল" align="left" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {leadership.map((m, i) => (
            <MemberCard key={m.id} m={m} delay={(i % 4) * 0.07} />
          ))}
        </div>
      </section>
      {others.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-10">
          <SectionHeading eyebrow="সক্রিয় অংশগ্রহণকারী" title="অন্যান্য সদস্যবৃন্দ" align="left" />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {others.map((m, i) => (
              <MemberCard key={m.id} m={m} delay={(i % 4) * 0.07} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
