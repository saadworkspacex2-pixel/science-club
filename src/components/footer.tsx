import Link from "next/link";
import { Atom, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { FacebookIcon, YoutubeIcon, InstagramIcon } from "./icons";
import type { SettingsMap } from "@/lib/data";

const cols = [
  {
    title: "নেভিগেশন",
    links: [
      { href: "/achievements", label: "অর্জনসমূহ" },
      { href: "/members", label: "নেতৃবৃন্দ" },
      { href: "/projects", label: "প্রকল্প ইতিহাস" },
      { href: "/gallery", label: "গ্যালারি" },
    ],
  },
  {
    title: "ক্লাব",
    links: [
      { href: "/hall-of-fame", label: "হল অফ ফেম" },
      { href: "/resources", label: "রিসোর্স লাইব্রেরি" },
      { href: "/news", label: "সংবাদ" },
      { href: "/about", label: "আমাদের সম্পর্কে" },
    ],
  },
  {
    title: "যুক্ত হোন",
    links: [
      { href: "/join", label: "সদস্য আবেদন" },
      { href: "/login", label: "সদস্য লগইন" },
      { href: "/events", label: "ইভেন্টস" },
      { href: "/contact", label: "যোগাযোগ" },
    ],
  },
];

export default function Footer({ settings }: { settings: SettingsMap }) {
  return (
    <footer className="relative mt-24 px-3 pb-6 sm:px-5">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] glass p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-night">
                <Atom className="size-5" />
              </span>
              <div>
                <p className="font-display text-lg font-bold leading-tight">
                  {settings.clubName || "বিইউএসএসএসসি সাইন্স ক্লাব"}
                </p>
                <p className="text-xs font-medium tracking-widest text-ink-soft dark:text-white/50">
                  SCIENCE-CLUB.BUSSSCR
                </p>
              </div>
            </div>
            <p className="font-tiro mt-4 max-w-xs text-base italic leading-relaxed text-ink-soft dark:text-white/60">
              “{settings.tagline}”
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { href: settings.facebook, Icon: FacebookIcon, label: "ফেসবুক" },
                { href: settings.youtube, Icon: YoutubeIcon, label: "ইউটিউব" },
                { href: settings.instagram, Icon: InstagramIcon, label: "ইনস্টাগ্রাম" },
                { href: `mailto:${settings.email}`, Icon: Mail, label: "ইমেইল" },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href || "#"}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-full glass transition-transform hover:scale-110 hover:text-blue active:scale-95"
                >
                  <Icon className="size-[17px]" />
                </a>
              ))}
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm font-bold uppercase tracking-wider text-ink-soft dark:text-white/50">
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link
                      href={l.href}
                      className="group inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition-colors hover:text-blue dark:text-white/65"
                    >
                      {l.label}
                      <ArrowUpRight className="size-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="hairline mt-10 flex flex-col items-start justify-between gap-4 border-t pt-6 text-xs text-ink-soft dark:text-white/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {settings.clubName} — সর্বস্বত্ব সংরক্ষিত</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {settings.address}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="size-3.5" /> {settings.phone}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
