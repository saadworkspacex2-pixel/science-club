import Link from "next/link";
import { Mail, MapPin, Phone, Heart } from "lucide-react";
import { Logo } from "@/components/logo";
import { CLUB } from "@/lib/utils";

type IconProps = { className?: string; style?: React.CSSProperties };

function FacebookIcon({ className, style }: IconProps) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: "var(--ink-2)", ...style }}>
      <path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.5V12H7.5v3H10v7h3v-7h2.6l.4-3h-3V9.7c0-.4.3-.7.5-.7z" />
    </svg>
  );
}
function InstagramIcon({ className, style }: IconProps) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} style={{ color: "var(--ink-2)", ...style }}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YoutubeIcon({ className, style }: IconProps) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="currentColor" className={className} style={{ color: "var(--ink-2)", ...style }}>
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27.3 27.3 0 0 0 2 12a27.3 27.3 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27.3 27.3 0 0 0 22 12a27.3 27.3 0 0 0-.4-4.8zM10 15V9l5.2 3z" />
    </svg>
  );
}

const NAV = [
  { href: "/achievements", label: "অর্জন" },
  { href: "/members", label: "সদস্য ও নেতৃত্ব" },
  { href: "/projects", label: "প্রকল্প ইতিহাস" },
  { href: "/gallery", label: "গ্যালারী" },
  { href: "/hall-of-fame", label: "হল অফ ফেম" },
  { href: "/resources", label: "রিসোর্স লাইব্রেরি" },
];

const MORE = [
  { href: "/news", label: "সংবাদ ও ঘোষণা" },
  { href: "/events", label: "ইভেন্ট ও ক্যালেন্ডার" },
  { href: "/about", label: "ক্লাব সম্পর্কে" },
  { href: "/contact", label: "যোগাযোগ" },
  { href: "/join", label: "সদস্য আবেদন" },
  { href: "/login", label: "সদস্য লগইন" },
];

export default function Footer({
  clubLogo = "",
  schoolLogo = "",
  clubName,
  schoolName,
}: {
  clubLogo?: string;
  schoolLogo?: string;
  clubName?: string;
  schoolName?: string;
}) {
  return (
    <footer className="mt-24 border-t" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-14 sm:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Logo size={44} src={clubLogo} alt={clubName || CLUB.name} />
              {schoolLogo && (
                <img src={schoolLogo} alt={schoolName || CLUB.full} className="h-10 w-10 shrink-0 rounded-[22%] object-contain" />
              )}
              <span className="leading-tight">
                <span className="block text-[17px] font-bold tracking-tight">{clubName || CLUB.name}</span>
                <span className="block text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                  {schoolName || CLUB.full}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
              কৌতূহলই আমাদের জ্বালানি। বিজ্ঞানচর্চা, গবেষণা আর উদ্ভাবনের মাধ্যমে আমরা গড়ে তুলছি
              সৃজনশীল এক প্রজন্ম।
            </p>
            <div className="mt-6 flex gap-2.5">
              {[
                { icon: FacebookIcon, href: "https://facebook.com", label: "ফেসবুক" },
                { icon: InstagramIcon, href: "https://instagram.com", label: "ইনস্টাগ্রাম" },
                { icon: YoutubeIcon, href: "https://youtube.com", label: "ইউটিউব" },
                { icon: Mail, href: `mailto:${CLUB.email}`, label: "ইমেইল" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="glass grid h-10 w-10 place-items-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                >
                  <Icon className="h-[17px] w-[17px]" style={{ color: "var(--ink-2)" }} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[13px] font-bold uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
              সেকশন
            </h4>
            <ul className="space-y-2.5">
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] font-medium transition-colors hover:text-[var(--brand)]"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[13px] font-bold uppercase tracking-widest" style={{ color: "var(--ink-3)" }}>
              আরও
            </h4>
            <ul className="space-y-2.5">
              {MORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[14px] font-medium transition-colors hover:text-[var(--brand)]"
                    style={{ color: "var(--ink-2)" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2 text-[13px]" style={{ color: "var(--ink-3)" }}>
              <p className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5" /> {CLUB.location}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> {CLUB.phone}
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-[12.5px]"
          style={{ color: "var(--ink-3)" }}
        >
          <p>
            © ২০২৬ {schoolName || CLUB.full} · {clubName || CLUB.name}। সর্বস্বত্ব সংরক্ষিত।
          </p>
          <p className="flex items-center gap-1.5">
            তৈরি হয়েছে <Heart className="h-3.5 w-3.5 text-red-500" /> বিজ্ঞানপ্রেম দিয়ে
          </p>
        </div>
      </div>
    </footer>
  );
}
