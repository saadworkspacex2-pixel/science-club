import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FacebookIcon, YoutubeIcon, InstagramIcon } from "@/components/icons";
import PageHero from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { getSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description: "বিইউএসএসএসসি সাইন্স ক্লাবের সাথে যোগাযোগের ঠিকানা, ইমেইল ও সামাজিক মাধ্যম।",
};

export default async function ContactPage() {
  const s = await getSettings();
  const cards = [
    { Icon: Mail, title: "ইমেইল", value: s.email, href: `mailto:${s.email}` },
    { Icon: Phone, title: "ফোন", value: s.phone, href: `tel:${s.phone?.replace(/[^\d+]/g, "")}` },
    { Icon: MapPin, title: "ঠিকানা", value: s.address, href: "#" },
    { Icon: Clock, title: "ক্লাব সময়", value: "শনি–বৃহস্পতি: বিকেল ৩টা – ৫টা", href: "#" },
  ];
  return (
    <div>
      <PageHero
        eyebrow="সংযোগ"
        title="যোগাযোগ করুন"
        subtitle="যেকোনো প্রশ্ন, পরামর্শ কিংবা পার্টনারশিপ — আমরা সবসময় শুনতে প্রস্তুত।"
      />
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ Icon, title, value, href }, i) => (
            <Reveal key={title} delay={i * 0.06}>
              <a href={href} className="card group block h-full p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
                <span className="grid size-12 place-items-center rounded-2xl bg-black/[0.06] text-ink transition-transform group-hover:scale-110 dark:bg-white/10 dark:text-white">
                  <Icon className="size-6" />
                </span>
                <p className="font-display mt-4 text-sm font-bold uppercase tracking-wider text-ink-soft dark:text-white/50">{title}</p>
                <p className="mt-1.5 break-words text-sm font-semibold leading-relaxed">{value}</p>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <div className="glass mt-6 flex flex-col items-center justify-between gap-5 rounded-[2rem] p-8 sm:flex-row">
            <div>
              <h2 className="font-display text-xl font-extrabold">সামাজিক মাধ্যমে আমরা</h2>
              <p className="mt-1 text-sm text-ink-soft dark:text-white/55">
                ফলো করে রাখুন প্রতিদিনের আপডেট, লাইভ সেশন আর বিজ্ঞানের মজার সব কনটেন্ট।
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { href: s.facebook, Icon: FacebookIcon },
                { href: s.youtube, Icon: YoutubeIcon },
                { href: s.instagram, Icon: InstagramIcon },
              ].map(({ href, Icon }, i) => (
                <a key={i} href={href || "#"} target="_blank" rel="noreferrer"
                  className="grid size-13 place-items-center rounded-2xl bg-ink p-3.5 text-white transition-transform hover:scale-110 active:scale-95 dark:bg-white dark:text-night">
                  <Icon className="size-6" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
