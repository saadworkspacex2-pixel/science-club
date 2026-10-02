import type { Metadata } from "next";
import PageHero from "@/components/page-hero";
import JoinForm from "@/components/join-form";
import { Reveal } from "@/components/reveal";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "আমাদের পরিবারের অংশ হোন",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবে সদস্য হতে আবেদন করুন — রেজিস্ট্রেশন ফর্ম পূরণ করুন মাত্র কয়েক মিনিটে।",
};

export default function JoinPage() {
  return (
    <div>
      <PageHero
        eyebrow="নতুন সদস্য"
        title="আমাদের পরিবারের অংশ হোন"
        subtitle="ফর্মটি পূরণ করুন — আপনার আবেদন সরাসরি অ্যাডমিন প্যানেলে পৌঁছে যাবে এবং শীঘ্রই আমরা যোগাযোগ করব।"
      />
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-6">
        <Reveal className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: Sparkles, t: "শিখুন" },
              { Icon: HeartHandshake, t: "বান্ধবী গড়ুন" },
              { Icon: ShieldCheck, t: "নিরাপদ প্রক্রিয়া" },
            ].map(({ Icon, t }) => (
              <div key={t} className="glass flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-xs font-bold text-ink-soft dark:text-white/65">
                <Icon className="size-4 text-blue" />
                {t}
              </div>
            ))}
          </div>
        </Reveal>
        <JoinForm />
      </section>
    </div>
  );
}
