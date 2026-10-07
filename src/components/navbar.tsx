"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Menu,
  X,
  Loader2,
  Trophy,
  Users,
  FlaskConical,
  Newspaper,
  FolderDown,
  ArrowUpLeft,
  Command,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme";
import { Logo } from "@/components/logo";
import { CLUB } from "@/lib/utils";

const LINKS = [
  { href: "/achievements", label: "অর্জন" },
  { href: "/members", label: "সদস্য" },
  { href: "/projects", label: "প্রকল্প" },
  { href: "/gallery", label: "গ্যালারী" },
  { href: "/hall-of-fame", label: "হল অফ ফেম" },
  { href: "/resources", label: "রিসোর্স" },
  { href: "/news", label: "সংবাদ" },
  { href: "/about", label: "সম্পর্কে" },
];

type SearchGroups = {
  achievements: { id: number; title: string; sub?: string | null }[];
  members: { id: number; title: string; sub?: string | null }[];
  projects: { id: number; title: string; sub?: string | null }[];
  news: { id: number; title: string; sub?: string | null }[];
  resources: { id: number; title: string; sub?: string | null }[];
};

const GROUP_META: Record<
  keyof SearchGroups,
  { label: string; href: (id: number) => string; icon: typeof Trophy }
> = {
  achievements: { label: "অর্জন", href: (id) => `/achievements/${id}`, icon: Trophy },
  members: { label: "সদস্য", href: (id) => `/members/${id}`, icon: Users },
  projects: { label: "প্রকল্প", href: (id) => `/projects/${id}`, icon: FlaskConical },
  news: { label: "সংবাদ", href: () => `/news`, icon: Newspaper },
  resources: { label: "রিসোর্স", href: () => `/resources`, icon: FolderDown },
};

export default function Navbar({
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
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<SearchGroups | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, searchOpen]);

  // Global "open search" event (used by mobile bottom bar)
  useEffect(() => {
    const handler = () => setSearchOpen(true);
    window.addEventListener("sc:open-search", handler);
    return () => window.removeEventListener("sc:open-search", handler);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 60);
    else {
      setQ("");
      setGroups(null);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!q.trim()) {
      setGroups(null);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setGroups(data.groups);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const goResult = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={`mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 transition-all duration-500 ease-apple ${
            scrolled ? "glass-strong shadow-[var(--shadow-soft)]" : "glass border-transparent bg-transparent backdrop-blur-0"
          }`}
          style={scrolled ? undefined : { borderColor: "transparent", background: "transparent", backdropFilter: "none", WebkitBackdropFilter: "none" }}
        >
          <Link href="/" className="flex min-w-0 items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]">
            <Logo size={36} src={clubLogo} alt={clubName || CLUB.name} />
            {schoolLogo && (
              <img src={schoolLogo} alt={schoolName || CLUB.full} className="hidden h-8 w-8 shrink-0 rounded-[22%] object-contain sm:block" />
            )}
            <span className="hidden min-w-0 leading-tight xs:block sm:block">
              <span className="block truncate text-[14.5px] font-bold tracking-tight">{clubName || CLUB.name}</span>
              <span className="block truncate text-[10px]" style={{ color: "var(--ink-3)" }}>
                {schoolName || CLUB.full}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(l.href + "/");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-full px-3 py-2 text-[13.5px] font-medium transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 ${
                    active ? "text-[var(--brand)]" : ""
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-[2.5px] rounded-full bg-gradient-to-r from-[#0a84ff] to-[#30d158]" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="সার্চ"
              className="glass group flex h-10 items-center gap-2 rounded-full px-3.5 transition-all duration-300 hover:scale-[1.03] active:scale-95"
            >
              <Search className="h-4 w-4" style={{ color: "var(--ink-2)" }} />
              <span className="hidden text-[13px] md:block" style={{ color: "var(--ink-3)" }}>
                সার্চ করুন…
              </span>
              <span className="hidden items-center gap-0.5 rounded-md bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10 md:flex" style={{ color: "var(--ink-3)" }}>
                <Command className="h-2.5 w-2.5" />K
              </span>
            </button>
            <ThemeToggle />
            <Link href="/join" className="btn-brand hidden !px-5 !py-2.5 text-sm md:inline-flex">
              যোগ দিন
            </Link>
            <button
              aria-label="মেনু"
              onClick={() => setOpen(!open)}
              className="glass grid h-10 w-10 place-items-center rounded-full transition-transform active:scale-90 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl transition-all duration-500 ease-apple lg:hidden ${
            open ? "glass-strong max-h-[70vh] opacity-100 shadow-[var(--shadow-lift)]" : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 gap-1.5 p-4">
            {[...LINKS, { href: "/contact", label: "যোগাযোগ" }, { href: "/events", label: "ইভেন্ট" }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-2xl bg-black/[0.03] px-4 py-3.5 text-[14px] font-medium transition-colors hover:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
            <Link href="/join" className="btn-brand col-span-2 mt-1">যোগ দিন</Link>
            <div className="col-span-2 mt-1 flex gap-2">
              <Link href="/login" className="btn-glass flex-1 !py-2.5 text-sm">সদস্য লগইন</Link>
              <Link href="/contact" className="btn-glass flex-1 !py-2.5 text-sm">যোগাযোগ</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <div
        className={`fixed inset-0 z-[70] transition-all duration-300 ${
          searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/25 backdrop-blur-md"
          onClick={() => setSearchOpen(false)}
        />
        <div
          className={`absolute inset-x-0 top-0 mx-auto max-w-2xl px-4 pt-24 transition-all duration-500 ease-spring ${
            searchOpen ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          }`}
        >
          <div className="glass-strong overflow-hidden rounded-3xl shadow-[var(--shadow-lift)]">
            <div className="flex items-center gap-3 border-b px-5 py-4">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--brand)" }} />
              ) : (
                <Search className="h-5 w-5" style={{ color: "var(--ink-3)" }} />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="অর্জন, সদস্য, প্রকল্প, সংবাদ — সব খুঁজুন…"
                className="w-full bg-transparent text-[17px] font-medium outline-none placeholder:opacity-50"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg border px-2 py-1 text-[11px] font-medium"
                style={{ color: "var(--ink-3)" }}
              >
                ESC
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-3">
              {!groups && !q && (
                <p className="px-4 py-10 text-center text-sm" style={{ color: "var(--ink-3)" }}>
                  পুরো ওয়েবসাইট জুড়ে সার্চ করুন — যেমন "রোবট", "স্বর্ণপদক", "আরিফুল"
                </p>
              )}
              {groups &&
                (Object.keys(groups) as (keyof SearchGroups)[]).map((key) => {
                  const list = groups[key];
                  if (!list?.length) return null;
                  const meta = GROUP_META[key];
                  const Icon = meta.icon;
                  return (
                    <div key={key} className="mb-1">
                      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>
                        {meta.label}
                      </p>
                      {list.map((item) => (
                        <button
                          key={`${key}-${item.id}`}
                          onClick={() => goResult(meta.href(item.id))}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                        >
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--brand)_12%,transparent)]">
                            <Icon className="h-4 w-4" style={{ color: "var(--brand)" }} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px] font-semibold">{item.title}</span>
                            {item.sub && (
                              <span className="block truncate text-xs" style={{ color: "var(--ink-3)" }}>
                                {item.sub}
                              </span>
                            )}
                          </span>
                          <ArrowUpLeft className="h-4 w-4 shrink-0" style={{ color: "var(--ink-3)" }} />
                        </button>
                      ))}
                    </div>
                  );
                })}
              {groups &&
                Object.values(groups).every((g) => !g?.length) && (
                  <p className="px-4 py-10 text-center text-sm" style={{ color: "var(--ink-3)" }}>
                    কিছু পাওয়া যায়নি — অন্য কিছু লিখে দেখুন
                  </p>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
