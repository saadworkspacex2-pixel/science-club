import { MapPin, Mail, Phone, Clock } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { Reveal } from "@/components/motion";
import ContactForm from "@/components/contact-form";
import { CLUB } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return createPageMetadata({
    title: "যোগাযোগ — বিজ্ঞান ক্লাব, রংপুর",
    description: "বীর উত্তম শহীদ সমাদ স্কুল অ্যান্ড কলেজের বিউএসএস সাইন্স ক্লাবের সঙ্গে যোগাযোগ করুন। অবস্থান, ইমেইল ও যোগাযোগের তথ্য দেখুন।",
    path: "/contact",
  });
}

const INFO = [
  { icon: MapPin, tint: "#ff375f", label: "ঠিকানা", value: CLUB.location },
  { icon: Mail, tint: "#0a84ff", label: "ইমেইল", value: CLUB.email },
  { icon: Phone, tint: "#30d158", label: "ফোন", value: CLUB.phone },
  { icon: Clock, tint: "#ff9500", label: "অফিস সময়", value: "শনি–বৃহস্পতি, সকাল ৯টা – বিকেল ৪টা" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl pb-16">
      <PageHeader
        kicker="আমরা শুনছি"
        title="যোগাযোগ করুন"
        desc="প্রশ্ন, পরামর্শ বা সহযোগিতার প্রস্তাব — যেকোনো কিছুতেই আমাদের মেসেজ করুন।"
      />
      <div className="grid gap-4 px-4 sm:gap-6 sm:px-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3.5">
          {INFO.map((i, idx) => {
            const Icon = i.icon;
            return (
              <Reveal key={i.label} delay={idx * 70}>
                <div className="glass-card hover-lift flex items-center gap-4 p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${i.tint} 14%, transparent)`, color: i.tint }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[12px] font-semibold" style={{ color: "var(--ink-3)" }}>{i.label}</span>
                    <span className="block text-[15px] font-bold tracking-tight">{i.value}</span>
                  </span>
                </div>
              </Reveal>
            );
          })}
          <Reveal delay={300}>
            <div className="glass-card overflow-hidden p-0">
              <img src="/images/about.jpg" alt="ক্যাম্পাস" className="aspect-[16/9] w-full object-cover" />
            </div>
          </Reveal>
        </div>
        <Reveal delay={120}>
          <ContactForm />
        </Reveal>
      </div>
    </div>
  );
}
