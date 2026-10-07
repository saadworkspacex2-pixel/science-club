import Link from "next/link";
import { MapPin, Medal, Trophy, ArrowUpLeft, Sparkles } from "lucide-react";
import { Monogram } from "./ui";
import { bn } from "@/lib/utils";
import { normalizeAchievementParticipants, PARTICIPANT_RESULTS } from "@/lib/achievement-participant-config";

/* ---------- Achievement product-style card ---------- */
export function AchievementCard({
  a,
  big = false,
}: {
  a: {
    id: number;
    title: string;
    coverImage: string;
    eventName: string;
    location: string;
    date: string;
    prizes: number;
    medals: number;
  };
  big?: boolean;
}) {
  return (
    <Link
      href={`/achievements/${a.id}`}
      className={`group relative block overflow-hidden rounded-3xl shadow-[var(--shadow-soft)] transition-all duration-500 ease-apple hover:-translate-y-2 hover:shadow-[var(--shadow-lift)] ${
        big ? "aspect-[4/3]" : "aspect-[3/4] sm:aspect-[4/5]"
      }`}
    >
      {a.coverImage ? (
        <img
          src={a.coverImage}
          alt={a.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.07]"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a84ff] via-[#5ac8fa] to-[#30d158]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute right-3.5 top-3.5">
        {a.eventName && (
          <span className="glass rounded-full px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: "rgba(0,0,0,.25)", borderColor: "rgba(255,255,255,.25)" }}>
            {a.eventName}
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-[clamp(1rem,1.6vw,1.25rem)] font-bold leading-snug text-white">
          {a.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] font-medium text-white/75">
          {a.date && <span>{a.date}</span>}
          {(a.prizes > 0 || a.medals > 0) && (
            <span className="inline-flex items-center gap-1">
              <Medal className="h-3.5 w-3.5 text-amber-300" />
              {bn(a.prizes + a.medals)}টি পুরস্কার
            </span>
          )}
        </div>
      </div>
      <span className="glass-strong absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100">
        <ArrowUpLeft className="h-4 w-4" />
      </span>
    </Link>
  );
}

/* ---------- Compact vertical-stack card for member achievement history ---------- */
export function MemberAchievementRow({
  a,
  memberId,
}: {
  a: {
    id: number;
    title: string;
    coverImage: string;
    eventName: string;
    date: string;
    prizes: number;
    medals: number;
    participants?: unknown;
  };
  memberId: number;
}) {
  const participantRows = normalizeAchievementParticipants(a.participants)
    .filter((row) => row.memberId === memberId);
  const sectors = Array.from(new Set(participantRows.map((row) => row.sector).filter(Boolean)));
  const results = Array.from(new Set(participantRows.flatMap((row) => {
    const result = PARTICIPANT_RESULTS.find((item) => item.value === row.result);
    return result ? [result.label] : [];
  })));
  const awards = Array.from(new Set(participantRows.map((row) => row.award).filter(Boolean)));
  const participantSummary = [sectors.join(", "), results.join(" / "), awards.join(", ")]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/achievements/${a.id}`}
      className="glass-card hover-lift group flex min-h-[78px] items-center gap-3 overflow-hidden p-2.5 sm:p-3"
    >
      {a.coverImage ? (
        <img src={a.coverImage} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover sm:h-16 sm:w-16" />
      ) : (
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0a84ff]/15 to-[#30d158]/15 text-[var(--brand)] sm:h-16 sm:w-16">
          <Trophy className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-bold leading-snug group-hover:text-[var(--brand)] sm:text-[14px]">
          {a.title}
        </span>
        <span className="mt-0.5 block truncate text-[11px]" style={{ color: "var(--ink-3)" }}>
          {[a.eventName, a.date].filter(Boolean).join(" · ") || "অর্জন"}
        </span>
        <span className="mt-1 block truncate text-[10.5px] font-semibold" title={participantSummary} style={{ color: participantRows.some((row) => row.result === "awarded") ? "#15803d" : "var(--ink-2)" }}>
          {participantRows.length > 0
            ? participantSummary || "অংশগ্রহণ করেছে"
            : (a.prizes > 0 || a.medals > 0) ? `${bn(a.prizes + a.medals)}টি পুরস্কার` : "অংশগ্রহণ করেছে"}
        </span>
      </span>
      <ArrowUpLeft className="h-4 w-4 shrink-0 text-[var(--ink-3)] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

/* ---------- Member card ---------- */
export function MemberCard({
  m,
}: {
  m: {
    id: number;
    name: string;
    role: string;
    className: string;
    section: string;
    roll: string;
    photoUrl: string;
  };
}) {
  return (
    <Link
      href={`/members/${m.id}`}
      className="glass-card hover-lift group relative block h-full overflow-hidden p-4 text-center sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand)_10%,transparent)] to-transparent" />
      <div className="relative mx-auto w-fit">
        {m.photoUrl ? (
          <img
            src={m.photoUrl}
            alt={m.name}
            className="mx-auto h-20 w-20 rounded-[28%] object-cover shadow-[0_18px_38px_-12px_rgba(10,132,255,.5)] transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24"
          />
        ) : (
          <div className="mx-auto transition-transform duration-500 group-hover:scale-105">
            <Monogram name={m.name} size={96} />
          </div>
        )}
      </div>
      <h3 className="mt-3 text-[14.5px] font-bold leading-tight tracking-tight sm:mt-4 sm:text-[17px]">{m.name}</h3>
      <span className="chip mt-2 !px-2.5 !py-1 !text-[11px] sm:!px-3.5 sm:!py-1.5 sm:!text-[13px]">{m.role}</span>
      <p className="mt-2 text-[11px] sm:mt-3 sm:text-[12.5px]" style={{ color: "var(--ink-3)" }}>
        {m.className && <>শ্রেণি {m.className}</>}
        {m.section && <> · শাখা {m.section}</>}
        {m.roll && <> · রোল {m.roll}</>}
      </p>
    </Link>
  );
}

/* ---------- Project card ---------- */
export const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: "সফল", color: "#16a34a", bg: "rgba(48,209,88,.15)" },
  ongoing: { label: "চলমান", color: "#0071e3", bg: "rgba(10,132,255,.13)" },
  failed: { label: "ব্যর্থ", color: "#e11d48", bg: "rgba(255,55,95,.13)" },
  future: { label: "ভবিষ্যৎ", color: "#b45309", bg: "rgba(255,149,0,.15)" },
};

export function ProjectCard({
  p,
}: {
  p: {
    id: number;
    title: string;
    imageUrl: string;
    summary: string;
    status: string;
    date: string;
  };
}) {
  const st = PROJECT_STATUS[p.status] ?? PROJECT_STATUS.ongoing;
  return (
    <Link
      href={`/projects/${p.id}`}
      className="glass-card hover-lift group block overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.title}
            className="h-full w-full object-cover transition-transform duration-[1.2s] ease-apple group-hover:scale-[1.06]"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#af52de] via-[#0a84ff] to-[#5ac8fa]" />
        )}
        <span
          className="glass absolute left-3.5 top-3.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
          style={{ background: st.bg, color: st.color, borderColor: "transparent" }}
        >
          {st.label}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-[16.5px] font-bold tracking-tight transition-colors group-hover:text-[var(--brand)]">
          {p.title}
        </h3>
        {p.summary && (
          <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
            {p.summary}
          </p>
        )}
        {p.date && (
          <p className="mt-3 text-[11.5px] font-semibold" style={{ color: "var(--ink-3)" }}>
            {p.date}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ---------- Hall of fame card ---------- */
export function FameCard({
  f,
}: {
  f: { name: string; photoUrl: string; award: string; year: string; description: string };
}) {
  return (
    <div className="hover-lift relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-2xl" />
      <div className="flex items-start gap-4">
        {f.photoUrl ? (
          <img src={f.photoUrl} alt={f.name} className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-lg" />
        ) : (
          <div
            className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-[22px] font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg,#ffd60a,#ff9f0a)", boxShadow: "0 14px 30px -8px rgba(255,159,10,.55)" }}
          >
            {f.name.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            {f.year && <span className="text-[11px] font-bold text-amber-400/90">{f.year}</span>}
          </div>
          <h3 className="mt-1 text-[17px] font-bold text-white">{f.name}</h3>
          <p className="mt-1 inline-flex items-start gap-1.5 text-[13px] font-semibold text-sky-300">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {f.award}
          </p>
        </div>
      </div>
      {f.description && (
        <p className="mt-4 text-[13px] leading-relaxed text-white/60">{f.description}</p>
      )}
    </div>
  );
}

/* ---------- Sponsor tile ---------- */
export function SponsorTile({
  s,
}: {
  s: { id: number; name: string; logoUrl: string; tagline: string; website: string };
}) {
  const inner = (
    <>
      {s.logoUrl ? (
        <img src={s.logoUrl} alt={s.name} className="h-12 w-12 rounded-2xl object-cover" />
      ) : (
        <span
          className="grid h-12 w-12 place-items-center rounded-2xl text-[19px] font-bold text-white"
          style={{ background: "linear-gradient(135deg,#5e5ce6,#0a84ff)" }}
        >
          {s.name.charAt(0)}
        </span>
      )}
      <span>
        <span className="block text-[14px] font-bold tracking-tight">{s.name}</span>
        {s.tagline && (
          <span className="block text-[11.5px]" style={{ color: "var(--ink-3)" }}>
            {s.tagline}
          </span>
        )}
      </span>
    </>
  );
  const cls =
    "glass-card hover-lift flex items-center gap-4 p-4 sm:p-5";
  return s.website ? (
    <a href={s.website} target="_blank" rel="noopener noreferrer" className={cls}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/* ---------- Meta chip ---------- */
export function MetaItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold">
      {icon}
      {label}
    </span>
  );
}

export { MapPin };
