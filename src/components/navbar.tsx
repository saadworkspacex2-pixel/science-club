"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Atom, ChevronDown, Menu, X, Search, Sparkles } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { cn } from "@/lib/utils";

const mainLinks = [
  { href: "/", label: "হোম" },
  { href: "/achievements", label: "অর্জন" },
  { href: "/members", label: "নেতৃবৃন্দ" },
  { href: "/projects", label: "প্রকল্প" },
  { href: "/gallery", label: "গ্যালারি" },
];

const moreLinks = [
  { href: "/hall-of-fame", label: "হল অফ ফেম" },
  { href: "/news", label: "সংবাদ ও ঘোষণা" },
  { href: "/resources", label: "রিসোর্স লাইব্রেরি" },
  { href: "/events", label: "ইভেন্টস ও ক্যালেন্ডার" },
  { href: "/about", label: "আমাদের সম্পর্কে" },
  { href: "/contact", label: "যোগাযোগ" },
  { href: "/login", label: "সদস্য লগইন" },
];

export default function Navbar({ clubName, logoUrl }: { clubName: string; logoUrl: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!q.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const isAdmin = pathname.startsWith("/admin");

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
    >
      <div
        className={cn(
          "mx-auto mt-3 flex max-w-6xl items-center gap-2 rounded-full px-3 py-2 transition-all duration-500 sm:px-4",
          scrolled ? "glass-strong shadow-lg" : "glass"
        )}
      >
        <Link href="/" className="focusable flex min-w-0 items-center gap-2.5 rounded-full">
          <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-ink text-white dark:bg-white dark:text-night">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="ক্লাব লোগো" className="size-full object-cover" />
            ) : (
              <Atom className="size-5 animate-[spin_12s_linear_infinite]" />
            )}
          </span>
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="font-display max-w-[220px] truncate text-[15px] font-bold tracking-tight">
              {clubName}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-ink-soft dark:text-white/60">
              science-club.bussscr
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
          {mainLinks.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "focusable relative rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink dark:text-white/70 dark:hover:text-white",
                  active && "text-ink dark:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-black/[0.06] dark:bg-white/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{l.label}</span>
              </Link>
            );
          })}
          <div className="relative">
            <button
              onClick={() => setMoreOpen((v) => !v)}
              onBlur={() => setTimeout(() => setMoreOpen(false), 180)}
              className="focusable flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink dark:text-white/70 dark:hover:text-white"
            >
              আরও
              <ChevronDown className={cn("size-3.5 transition-transform duration-300", moreOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className="glass-strong absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-3xl p-2"
                >
                  {moreLinks.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      {l.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-2">
          <AnimatePresence>
            {searchOpen ? (
              <motion.form
                key="search"
                onSubmit={submitSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 170, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className="glass flex h-10 items-center overflow-hidden rounded-full"
              >
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="খুঁজুন..."
                  className="w-full bg-transparent px-3.5 text-sm outline-none placeholder:text-ink-soft/60 dark:placeholder:text-white/40"
                />
              </motion.form>
            ) : null}
          </AnimatePresence>
          <button
            aria-label="সার্চ"
            onClick={() => (searchOpen ? submitSearch() : setSearchOpen(true))}
            className="focusable grid size-10 place-items-center rounded-full glass transition-transform hover:scale-105 active:scale-95"
          >
            <Search className="size-[17px]" />
          </button>
          <ThemeToggle />
          <Link
            href="/join"
            className="focusable hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-blue to-blue-bright px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue/25 transition-transform hover:scale-[1.04] active:scale-95 md:flex"
          >
            <Sparkles className="size-4" />
            যোগ দিন
          </Link>
          <button
            aria-label="মেনু"
            onClick={() => setMobileOpen((v) => !v)}
            className="focusable grid size-10 place-items-center rounded-full glass transition-transform active:scale-95 lg:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-strong mx-auto mt-2 max-w-6xl overflow-hidden rounded-[1.75rem] p-3 lg:hidden"
          >
            {[...mainLinks, ...moreLinks].map((l, i) => (
              <motion.div
                key={l.href}
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * i, type: "spring", stiffness: 300, damping: 26 }}
              >
                <Link
                  href={l.href}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-black/[0.05] hover:text-ink dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white",
                    pathname === l.href && "bg-black/[0.05] text-ink dark:bg-white/10 dark:text-white"
                  )}
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <Link
              href="/join"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue to-blue-bright px-4 py-3.5 text-sm font-semibold text-white"
            >
              <Sparkles className="size-4" />
              আমাদের পরিবারের অংশ হোন
            </Link>
            {isAdmin && <div className="hidden" />}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
