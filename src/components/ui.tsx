import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { Reveal } from "./motion";
import { Logo } from "./logo";
import { CLUB } from "@/lib/utils";

export function SectionHeading({
  kicker,
  title,
  desc,
  href,
  hrefLabel,
  center = false,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  href?: string;
  hrefLabel?: string;
  center?: boolean;
}) {
  return (
    <Reveal>
      <div
        className={`mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-10 sm:gap-6 ${
          center ? "flex-col items-center text-center" : ""
        }`}
      >
        <div className="max-w-2xl">
          {kicker && <span className="chip mb-4">{kicker}</span>}
          <h2 className="text-[clamp(1.35rem,5vw,2.6rem)] font-bold leading-[1.2] tracking-tight">
            {title}
          </h2>
          {desc && (
            <p className="mt-2.5 text-[13.5px] leading-relaxed sm:mt-3 sm:text-[15px]" style={{ color: "var(--ink-3)" }}>
              {desc}
            </p>
          )}
        </div>
        {href && hrefLabel && (
          <Link href={href} className="btn-glass shrink-0 !px-5 !py-2.5 text-sm">
            {hrefLabel}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
      </div>
    </Reveal>
  );
}

export function PageHeader({
  kicker,
  title,
  desc,
  children,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="dot-grid relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-16">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          {kicker && <span className="chip mb-5">{kicker}</span>}
          <h1 className="text-[clamp(1.6rem,6.5vw,3.4rem)] font-bold leading-[1.15] tracking-tight">
            {title}
          </h1>
          {desc && (
            <p
              className="mt-3 max-w-2xl text-[13.5px] leading-relaxed sm:mt-4 sm:text-[16px]"
              style={{ color: "var(--ink-3)" }}
            >
              {desc}
            </p>
          )}
        </Reveal>
        {children}
      </div>
    </header>
  );
}

export function Empty({ text = "এখনও কিছু যোগ করা হয়নি" }: { text?: string }) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 px-5 py-12 text-center sm:px-8 sm:py-16">
      <Inbox className="h-10 w-10" style={{ color: "var(--ink-3)" }} />
      <p className="font-medium" style={{ color: "var(--ink-3)" }}>
        {text}
      </p>
    </div>
  );
}

export function BankBadge({ name }: { name: string }) {
  return (
    <div className="glass grid h-9 w-9 shrink-0 place-items-center rounded-full text-[15px] font-bold text-gradient">
      {name.trim().charAt(0)}
    </div>
  );
}

export function Monogram({ name, size = 96 }: { name: string; size?: number }) {
  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-[28%] font-bold text-white"
      style={{
        width: `clamp(60px, 20vw, ${size}px)`,
        height: `clamp(60px, 20vw, ${size}px)`,
        fontSize: `clamp(24px, 8.5vw, ${size * 0.42}px)`,
        background: "linear-gradient(135deg,#0a84ff,#64d2ff 60%,#30d158)",
        boxShadow: "0 18px 38px -12px rgba(10,132,255,.5)",
      }}
    >
      {name.trim().charAt(0)}
      <span className="pointer-events-none absolute inset-0 rounded-[28%] bg-gradient-to-b from-white/30 to-transparent opacity-60" />
    </div>
  );
}

export function SmallLogo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Logo size={34} />
      <span className="leading-tight">
        <span className="block text-[15px] font-bold tracking-tight">{CLUB.name}</span>
        <span className="block text-[10.5px]" style={{ color: "var(--ink-3)" }}>
          {CLUB.full}
        </span>
      </span>
    </span>
  );
}
