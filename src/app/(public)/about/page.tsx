import Link from "next/link";
import { Target, Eye, History, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { CLUB } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return createPageMetadata({
    title: "ক্লাব সম্পর্কে",
    description: "রংপুরের বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজের বিউএসএস সাইন্স ক্লাবের লক্ষ্য, ভিশন, বিজ্ঞানচর্চা ও ইতিহাস।",
    path: "/about",
  });
}

const PILLARS = [
  {
    icon: Target,
    tint: "#0a84ff",
    title: "আমাদের লক্ষ্য",
    body: "প্রতিটি শিক্ষার্থীর ভেতরের বিজ্ঞানীকে জাগিয়ে তোলা। বইয়ের পৃষ্ঠার বাইরে গিয়ে হাতে-কলমে শেখা, প্রশ্ন করা আর আবিষ্কারের আনন্দ ছড়িয়ে দেওয়াই আমাদের প্রধান লক্ষ্য। গবেষণামূলক মনস্কৃতি গড়ে তোলা এবং জাতীয়-আন্তর্জাতিক মঞ্চে প্রতিষ্ঠানকে তুলে ধরা আমাদের অঙ্গীকার।",
  },
  {
    icon: Eye,
    tint: "#af52de",
    title: "আমাদের ভিশন",
    body: "২০৩০ সালের মধ্যে রংপুর অঞ্চলের সবচেয়ে সক্রিয় ও সফল স্কুল-ভিত্তিক বিজ্ঞান সংগঠন হিসেবে নিজেদের প্রতিষ্ঠিত করা — যেখান থেকে উঠে আসবে আগামী দিনের গবেষক, প্রকৌশলী আর উদ্ভাবক। প্রতিটি সদস্য যেন নিজের স্বপ্নকে বাস্তব আকার দিতে পারে, সে রকম একটি পরিবেশ নির্মাণ আমাদের চূড়ান্ত ভিশন।",
  },
  {
    icon: History,
    tint: "#30d158",
    title: "আমাদের ইতিহাস",
    body: "কয়েকজন কৌতূহলী শিক্ষার্থী আর একজন অনুপ্রাণিত শিক্ষকের হাত ধরে শুরু হয় আমাদের যাত্রা। ছোট্ট একটি পড়ার টেবিল থেকে আজ ফ্যাব-ল্যাব, জ্যোতির্বিজ্ঞান দল, রোবোটিক্স টিম — প্রতি বছর নতুন নতুন অধ্যায় যুক্ত হচ্ছে আমাদের গল্পে। জাতীয় বিজ্ঞান মেলার স্বর্ণপদক আমাদের যাত্রার সবচেয়ে উজ্জ্বল মাইলফলক।",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl pb-16">
      <PageHeader
        kicker={CLUB.english}
        title="বিজ্ঞানই আমাদের ভাষা"
        desc={`${CLUB.full} ${CLUB.sub} — কৌতূহল, সৃজনশীলতা আর সহযোগিতার এক উজ্জ্বল পরিবার।`}
      />
      <div className="px-4 sm:px-5">
        <Reveal className="mb-12">
          <div className="overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
            <img src="/images/about.jpg" alt="আমাদের ক্যাম্পাস" className="aspect-[21/9] w-full object-cover" />
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={i * 100}>
                <div className="glass-card hover-lift h-full p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${p.tint} 14%, transparent)`, color: p.tint }}>
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h2 className="mt-5 text-[19px] font-bold tracking-tight">{p.title}</h2>
                  <p className="mt-3 text-[14px] leading-[1.9]" style={{ color: "var(--ink-2)" }}>
                    {p.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <div className="glass-strong mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[2rem] p-8">
            <div>
              <h3 className="text-[20px] font-bold tracking-tight">আমাদের গল্পের অংশ হতে চান?</h3>
              <p className="mt-1.5 text-[14px]" style={{ color: "var(--ink-3)" }}>
                ষষ্ঠ থেকে দশম শ্রেণির যেকোনো শিক্ষার্থী আবেদন করতে পারে
              </p>
            </div>
            <Link href="/join" className="btn-brand">
              যোগ দিন <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
