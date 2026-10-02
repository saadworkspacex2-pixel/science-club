"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Images, Trophy, Users, FlaskConical, GalleryHorizontalEnd, Crown,
  Handshake, Megaphone, CalendarDays, FolderDown, Inbox, Settings2, ShieldCheck,
  LogOut, Atom, Bell, ArrowRight,
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import ResourceManager, { type ResourceConfig } from "./manager";
import { ApplicationsManager, SettingsManager } from "./special";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

const t = (key: string, label: string, extra?: Partial<FieldDef>): FieldDef => ({ key, label, type: "text", half: true, ...extra });
type FieldDef = ResourceConfig["fields"][number];

const configs: Record<string, ResourceConfig> = {
  slides: {
    resource: "slides", title: "হিরো স্লাইডার", singular: "স্লাইড", sortable: true,
    fields: [
      t("title", "শিরোনাম"), t("subtitle", "সাবটাইটেল", { half: false }),
      t("imageUrl", "ব্যানার ছবি (১৬:৯)", { type: "image", aspect: 16 / 9, half: false }),
    ],
    displayTitle: (r) => r.title, displaySub: (r) => r.subtitle, displayImage: (r) => r.imageUrl,
  },
  achievements: {
    resource: "achievements", title: "অর্জনসমূহ", singular: "অর্জন", sortable: true,
    fields: [
      t("title", "শিরোনাম", { half: false }), t("subtitle", "সাবটাইটেল", { half: false }),
      t("coverImage", "কভার ছবি", { type: "image", aspect: 4 / 5, half: false }),
      t("eventName", "ইভেন্টের নাম"), t("location", "স্থান"),
      t("date", "তারিখ", { placeholder: "2025-11-22" }), t("prizes", "পুরস্কার সংখ্যা", { type: "number" }),
      t("medals", "পদক সংখ্যা", { type: "number" }),
      t("description", "পূর্ণ বিবরণ", { type: "textarea", half: false }),
      t("photos", "ইভেন্টের ছবিগুলো", { type: "images", half: false }),
    ],
    displayTitle: (r) => r.title, displaySub: (r) => `${r.eventName} • ${r.date}`, displayImage: (r) => r.coverImage,
  },
  members: {
    resource: "members", title: "সদস্যবৃন্দ", singular: "সদস্য", sortable: true,
    fields: [
      t("name", "পুরো নাম"),
      t("role", "পদবি", { placeholder: "সভাপতি / সদস্য" }),
      t("className", "শ্রেণি", { type: "select", options: ["ষষ্ঠ", "সপ্তম", "অষ্টম", "নবম", "দশম"].map((v) => ({ value: v, label: v })) }),
      t("section", "শাখা", { type: "select", options: ["ক", "খ", "গ", "ঘ"].map((v) => ({ value: v, label: v })) }),
      t("roll", "ক্লাস রোল"),
      t("isLeadership", "লিডারশিপ প্যানেলে দেখান", { type: "checkbox", half: false }),
      t("photoUrl", "প্রোফাইল ছবি (৩:৪)", { type: "image", aspect: 3 / 4, half: false }),
      t("bio", "জীবনী / পরিচিতি", { type: "textarea", half: false }),
      t("achievements", "অর্জনসমূহ (প্রতি লাইনে একটি)", { type: "textarea", half: false }),
      t("participations", "অংশগ্রহণসমূহ (প্রতি লাইনে একটি)", { type: "textarea", half: false }),
      t("whatsapp", "হোয়াটসঅ্যাপ"), t("facebook", "ফেসবুক লিংক"), t("instagram", "ইনস্টাগ্রাম ইউজারনেম"),
    ],
    displayTitle: (r) => r.name, displaySub: (r) => `${r.role} • শ্রেণি ${r.className}`, displayImage: (r) => r.photoUrl,
  },
  projects: {
    resource: "projects", title: "প্রকল্পসমূহ", singular: "প্রকল্প", sortable: true,
    fields: [
      t("title", "প্রকল্পের নাম", { half: false }),
      t("summary", "সংক্ষিপ্ত বিবরণ", { type: "textarea", half: false }),
      t("status", "অবস্থা", { type: "select", options: [
        { value: "success", label: "সফল" }, { value: "ongoing", label: "চলমান" },
        { value: "failed", label: "ব্যর্থ/শিক্ষা" }, { value: "future", label: "ভবিষ্যৎ পরিকল্পনা" },
      ] }),
      t("imageUrl", "প্রকল্পের ছবি (১৬:১০)", { type: "image", aspect: 16 / 10, half: false }),
      t("description", "পূর্ণ বিবরণ", { type: "textarea", half: false }),
      t("successes", "সফলতা (প্রতি লাইনে)", { type: "textarea", half: false }),
      t("failures", "ব্যর্থতা/শিক্ষা (প্রতি লাইনে)", { type: "textarea", half: false }),
      t("futurePlans", "ভবিষ্যৎ পরিকল্পনা (প্রতি লাইনে)", { type: "textarea", half: false }),
    ],
    displayTitle: (r) => r.title, displaySub: (r) => r.summary, displayImage: (r) => r.imageUrl,
  },
  gallery: {
    resource: "gallery", title: "গ্যালারি", singular: "মিডিয়া", sortable: true,
    fields: [
      t("kind", "ধরন", { type: "select", options: [{ value: "image", label: "ছবি" }, { value: "video", label: "ভিডিও" }] }),
      t("category", "বিভাগ", { type: "select", options: [
        { value: "school", label: "স্কুল" }, { value: "team", label: "টিম মেম্বার" },
        { value: "alumni", label: "প্রাক্তন সদস্য" }, { value: "events", label: "নেটওয়ার্ক / ইভেন্ট" },
      ] }),
      t("title", "ক্যাপশন", { half: false }),
      t("url", "ছবি / ভিডিও আপলোড", { type: "media", half: false }),
    ],
    displayTitle: (r) => r.title || "(ক্যাপশন নেই)",
    displaySub: (r) => ({ school: "স্কুল", team: "টিম", alumni: "প্রাক্তন", events: "ইভেন্ট" } as any)[r.category] + (r.kind === "video" ? " • ভিডিও" : ""),
    displayImage: (r) => (r.kind === "video" ? undefined : r.url),
  },
  halloffame: {
    resource: "halloffame", title: "হল অফ ফেম", singular: "কিংবদন্তি", sortable: true,
    fields: [
      t("name", "নাম"), t("award", "পুরস্কার / সম্মাননা"),
      t("photoUrl", "ছবি (৩:৪)", { type: "image", aspect: 3 / 4, half: false }),
      t("description", "বিবরণ", { type: "textarea", half: false }),
    ],
    displayTitle: (r) => r.name, displaySub: (r) => r.award, displayImage: (r) => r.photoUrl,
  },
  sponsors: {
    resource: "sponsors", title: "স্পনসর ও পার্টনার", singular: "পার্টনার", sortable: true,
    fields: [
      t("name", "প্রতিষ্ঠানের নাম"), t("website", "ওয়েবসাইট (ঐচ্ছিক)"),
      t("logoUrl", "লোগো", { type: "image", aspect: 3 / 2, half: false }),
    ],
    displayTitle: (r) => r.name, displaySub: (r) => r.website, displayImage: (r) => r.logoUrl || undefined,
  },
  news: {
    resource: "news", title: "সংবাদ ও ঘোষণা", singular: "ঘোষণা",
    fields: [
      t("title", "শিরোনাম", { half: false }),
      t("body", "বিস্তারিত", { type: "textarea", half: false }),
      t("mediaKind", "মিডিয়ার ধরন", { type: "select", options: [
        { value: "none", label: "কোনোটিই নয়" }, { value: "image", label: "ছবি" }, { value: "video", label: "ভিডিও" },
      ] }),
      t("isInternal", "শুধু সদস্যদের জন্য (অভ্যন্তরীণ)", { type: "checkbox", half: false }),
      t("mediaUrl", "ছবি / ভিডিও (ঐচ্ছিক)", { type: "media", half: false }),
    ],
    displayTitle: (r) => r.title,
    displaySub: (r) => `${r.isInternal ? "অভ্যন্তরীণ • " : ""}${(r.body || "").slice(0, 50)}`,
    displayImage: (r) => (r.mediaKind === "image" ? r.mediaUrl : undefined),
  },
  events: {
    resource: "events", title: "ইভেন্টস", singular: "ইভেন্ট", sortable: true,
    fields: [
      t("title", "ইভেন্টের নাম", { half: false }),
      t("date", "তারিখ", { placeholder: "2026-02-15" }), t("location", "স্থান"),
      t("description", "বিবরণ", { type: "textarea", half: false }),
      t("imageUrl", "ছবি (১৬:৯)", { type: "image", aspect: 16 / 9, half: false }),
    ],
    displayTitle: (r) => r.title, displaySub: (r) => `${r.date} • ${r.location}`, displayImage: (r) => r.imageUrl,
  },
  resources: {
    resource: "resources", title: "রিসোর্স লাইব্রেরি", singular: "রিসোর্স",
    fields: [
      t("title", "রিসোর্সের নাম", { half: false }),
      t("category", "বিভাগ", { type: "select", options: ["নোট", "গাইড", "প্রশ্নপত্র", "ম্যাগাজিন", "লিংক"].map((v) => ({ value: v, label: v })) }),
      t("description", "বিবরণ", { type: "textarea", half: false }),
      t("fileUrl", "ফাইল আপলোড (PDF/ছবি/জিপ)", { type: "file", half: false }),
    ],
    displayTitle: (r) => r.title, displaySub: (r) => r.category,
  },
  users: {
    resource: "users", title: "অ্যাডমিন অ্যাকাউন্ট", singular: "অ্যাডমিন",
    fields: [
      t("username", "ইউজারনেম"), t("name", "নাম"),
      t("role", "ভূমিকা", { type: "select", options: [
        { value: "editor", label: "এডিটর" }, { value: "super_admin", label: "সুপার অ্যাডমিন" },
      ] }),
      t("password", "পাসওয়ার্ড", { type: "password", half: false }),
    ],
    displayTitle: (r) => r.name, displaySub: (r) => `@${r.username} • ${r.role === "super_admin" ? "সুপার অ্যাডমিন" : "এডিটর"}`,
  },
  memberaccounts: {
    resource: "memberaccounts", title: "সদস্য লগইন অ্যাক্সেস", singular: "অ্যাক্সেস",
    fields: [
      t("memberId", "সদস্য নির্বাচন", { type: "dynamic-select", half: false }),
      t("username", "ইউজারনেম"), t("password", "পাসওয়ার্ড", { type: "password" }),
    ],
    displayTitle: (r) => `@${r.username}`, displaySub: (r) => `সদস্য আইডি: ${r.memberId}`,
  },
};

type Tab = { key: string; label: string; Icon: any; superOnly?: boolean };

const tabs: Tab[] = [
  { key: "overview", label: "ওভারভিউ", Icon: LayoutDashboard },
  { key: "applications", label: "সদস্য আবেদন", Icon: Inbox },
  { key: "slides", label: "হিরো স্লাইডার", Icon: Images },
  { key: "achievements", label: "অর্জন", Icon: Trophy },
  { key: "members", label: "সদস্য", Icon: Users },
  { key: "projects", label: "প্রকল্প", Icon: FlaskConical },
  { key: "gallery", label: "গ্যালারি", Icon: GalleryHorizontalEnd },
  { key: "halloffame", label: "হল অফ ফেম", Icon: Crown },
  { key: "sponsors", label: "স্পনসর", Icon: Handshake },
  { key: "news", label: "সংবাদ", Icon: Megaphone },
  { key: "events", label: "ইভেন্টস", Icon: CalendarDays },
  { key: "resources", label: "রিসোর্স", Icon: FolderDown },
  { key: "memberaccounts", label: "সদস্য অ্যাক্সেস", Icon: ShieldCheck },
  { key: "users", label: "অ্যাডমিনরা", Icon: ShieldCheck, superOnly: true },
  { key: "settings", label: "সেটিংস", Icon: Settings2 },
];

async function fetchList(resource: string): Promise<any[]> {
  const res = await fetch(`/api/admin/${resource}`);
  if (!res.ok) return [];
  return res.json().catch(() => []);
}

export default function AdminDashboard({ name, role }: { name: string; role: string }) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [pending, setPending] = useState(0);
  const [toast, setToast] = useState("");
  const baseline = useRef<number | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [memberOpts, setMemberOpts] = useState<{ value: string; label: string }[]>([]);

  const visibleTabs = tabs.filter((t) => !t.superOnly || role === "super_admin");

  // Poll applications for notifications
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const apps = await fetchList("applications");
      const count = apps.filter((a) => a.status === "pending").length;
      if (!mounted) return;
      if (baseline.current !== null && count > baseline.current) {
        setToast(`${count - baseline.current}টি নতুন সদস্য আবেদন এসেছে!`);
        setTimeout(() => setToast(""), 6000);
      }
      baseline.current = count;
      setPending(count);
    };
    check();
    const iv = setInterval(check, 12000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  // Overview stats + member options
  useEffect(() => {
    (async () => {
      const [a, m, p, g, n, r] = await Promise.all([
        fetchList("achievements"), fetchList("members"), fetchList("projects"),
        fetchList("gallery"), fetchList("news"), fetchList("resources"),
      ]);
      setStats({ achievements: a.length, members: m.length, projects: p.length, gallery: g.length, news: n.length, resources: r.length });
      setMemberOpts(m.map((x) => ({ value: String(x.id), label: `${x.name} — ${x.role}` })));
    })();
  }, []);

  const cfg = configs[tab];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        className="glass-strong flex flex-wrap items-center gap-3 rounded-[1.75rem] p-4 sm:p-5">
        <span className="grid size-11 place-items-center rounded-2xl bg-ink text-white dark:bg-white dark:text-night">
          <Atom className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-lg font-extrabold">অ্যাডমিন কন্ট্রোল প্যানেল</p>
          <p className="text-xs font-semibold text-ink-soft dark:text-white/55">
            {name} • {role === "super_admin" ? "সুপার অ্যাডমিন" : "এডিটর"}
          </p>
        </div>
        <button onClick={() => setTab("applications")} aria-label="নোটিফিকেশন"
          className="relative grid size-11 place-items-center rounded-full glass transition-transform hover:scale-105 active:scale-95">
          <Bell className="size-[18px]" />
          {pending > 0 && (
            <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red text-[10px] font-extrabold text-white shadow-md">
              {pending}
            </span>
          )}
        </button>
        <ThemeToggle />
        <button
          onClick={async () => { await fetch("/api/admin-auth", { method: "DELETE" }); router.replace("/"); router.refresh(); }}
          className="flex h-11 items-center gap-2 rounded-full bg-red/10 px-4 text-sm font-bold text-red transition-transform hover:scale-[1.03] active:scale-95">
          <LogOut className="size-4" /> <span className="hidden sm:inline">লগআউট</span>
        </button>
      </motion.div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr]">
        {/* Sidebar */}
        <aside className="no-scrollbar flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:self-start">
          {visibleTabs.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={cn(
                "relative flex shrink-0 items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-bold transition-colors",
                tab === key ? "text-white" : "glass text-ink-soft hover:text-ink dark:text-white/60 dark:hover:text-white"
              )}>
              {tab === key && (
                <motion.span layoutId="admin-tab"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue to-blue-bright shadow-lg shadow-blue/25"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }} />
              )}
              <span className="relative flex items-center gap-2.5">
                <Icon className="size-4" />
                {label}
                {key === "applications" && pending > 0 && (
                  <span className={cn("grid size-5 place-items-center rounded-full text-[10px] font-extrabold",
                    tab === key ? "bg-white text-blue" : "bg-red text-white")}>{pending}</span>
                )}
              </span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <motion.section key={tab}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 22 }}
          className="min-w-0">
          {tab === "overview" && <Overview stats={stats} pending={pending} go={setTab} />}
          {tab === "applications" && <ApplicationsManager />}
          {tab === "settings" && <SettingsManager />}
          {cfg && (
            <ResourceManager
              cfg={cfg}
              dynamicOptions={tab === "memberaccounts" ? { memberId: memberOpts } : undefined}
            />
          )}
        </motion.section>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.button
            onClick={() => { setTab("applications"); setToast(""); }}
            initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="glass-strong fixed bottom-6 right-5 z-[95] flex items-center gap-3 rounded-full py-3 pl-4 pr-5 text-sm font-extrabold shadow-2xl">
            <span className="relative grid size-9 place-items-center rounded-full bg-ink text-white dark:bg-white dark:text-night">
              <Bell className="size-4" />
              <span className="absolute -right-1 -top-1 size-3 animate-ping rounded-full bg-red" />
              <span className="absolute -right-1 -top-1 size-3 rounded-full bg-red" />
            </span>
            {toast}
            <ArrowRight className="size-4 text-blue" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Overview({ stats, pending, go }: { stats: Record<string, number>; pending: number; go: (t: string) => void }) {
  const items = useMemo(() => [
    { key: "applications", label: "নতুন আবেদন", value: pending },
    { key: "achievements", label: "অর্জন", value: stats.achievements ?? 0 },
    { key: "members", label: "সদস্য", value: stats.members ?? 0 },
    { key: "projects", label: "প্রকল্প", value: stats.projects ?? 0 },
    { key: "gallery", label: "গ্যালারি মিডিয়া", value: stats.gallery ?? 0 },
    { key: "news", label: "সংবাদ", value: stats.news ?? 0 },
    { key: "resources", label: "রিসোর্স", value: stats.resources ?? 0 },
  ], [stats, pending]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((it, i) => (
          <motion.button key={it.key} onClick={() => go(it.key)}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 160, damping: 20 }}
            className="card group relative overflow-hidden rounded-3xl! p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lift">
            <p className="font-display text-3xl font-extrabold">{String(it.value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)])}</p>
            <p className="mt-1 text-xs font-bold text-ink-soft dark:text-white/55">{it.label}</p>
            <span className="absolute bottom-4 right-4 grid size-8 place-items-center rounded-full bg-black/[0.06] text-ink opacity-0 transition-all group-hover:opacity-100 dark:bg-white/10 dark:text-white">
              <ArrowRight className="size-4" />
            </span>
          </motion.button>
        ))}
      </div>
      <div className="glass mt-5 rounded-3xl p-6">
        <h3 className="font-display text-base font-extrabold">দ্রুত নির্দেশনা</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink-soft dark:text-white/60">
          <li>• প্রতিটি সেকশনে <b>+ নতুন</b> বাটন দিয়ে কনটেন্ট যোগ করুন; পেন্সিল আইকনে সম্পাদনা করুন।</li>
          <li>• ছবি/ভিডিও/ফাইল সরাসরি কম্পিউটার থেকে ড্র্যাগ-ড্রপ করে আপলোড হবে। ছবি আপলোডের সময় ক্রপ করার সুযোগ পাবেন।</li>
          <li>• তালিকার বামে থাকা হ্যান্ডেল ধরে টেনে ক্রম (রিঅর্ডার) পরিবর্তন করুন।</li>
          <li>• নতুন সদস্য আবেদন এলে উপরে বেল আইকনে নোটিফিকেশন পাবেন।</li>
        </ul>
      </div>
    </div>
  );
}
