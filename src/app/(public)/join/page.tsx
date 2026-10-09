import { PageHeader } from "@/components/ui";
import JoinForm from "@/components/join-form";
import { Reveal } from "@/components/motion";
import { ShieldCheck, Zap, HeartHandshake } from "lucide-react";

import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = createPageMetadata({
  title: "বিজ্ঞান ক্লাবে সদস্য আবেদন",
  description: "রংপুরের বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজের বিজ্ঞান ক্লাবে যোগ দিন। ষষ্ঠ থেকে দশম শ্রেণির শিক্ষার্থীদের সদস্য আবেদন।",
  path: "/join",
});

const PERKS = [
  { icon: ShieldCheck, tint: "#0a84ff", title: "মেন্টরশিপ", desc: "অভিজ্ঞ সিনিয়র ও শিক্ষকদের সরাসরি গাইডলাইন" },
  { icon: Zap, tint: "#ff9500", title: "হাতে-কলমে প্রকল্প", desc: "রোবোটিক্স, রকেট্রি, গবেষণা — নিজে বানান" },
  { icon: HeartHandshake, tint: "#30d158", title: "দল ও বন্ধুত্ব", desc: "জাতীয় প্রতিযোগিতায় একসাথে খেলার অভিজ্ঞতা" },
];

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-6xl pb-16">
      <PageHeader
        kicker="রেজিস্ট্রেশন চলছে"
        title="আমাদের পরিবারের অংশ হোন"
        desc="মাত্র এক মিনিটের ফর্ম — বাকিটা আমরা সামলাবো। আবেদনের পর আমাদের টিম হোয়াটসঅ্যাপে যোগাযোগ করবে।"
      />
      <div className="px-4 sm:px-5">
        <Reveal>
          <JoinForm />
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          {PERKS.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={100 + i * 80}>
                <div className="glass-card h-full p-5 text-center">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${p.tint} 14%, transparent)`, color: p.tint }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 text-[15px] font-bold">{p.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
                    {p.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
