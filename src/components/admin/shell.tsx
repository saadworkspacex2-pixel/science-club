"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Images,
  Trophy,
  Users,
  Image as ImageIcon,
  FlaskConical,
  Star,
  Handshake,
  FolderDown,
  Newspaper,
  Calendar,
  UserPlus,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Globe,
  Bell,
  Search,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";
import { bn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { href: "/admin/applications", label: "সদস্য আবেদন", icon: UserPlus, badge: true },
  { href: "/admin/slides", label: "হিরো স্লাইড", icon: Images },
  { href: "/admin/achievements", label: "অর্জনসমূহ", icon: Trophy },
  { href: "/admin/members", label: "সদস্য ও নেতৃত্ব", icon: Users },
  { href: "/admin/gallery", label: "গ্যালারী", icon: ImageIcon },
  { href: "/admin/projects", label: "প্রকল্প", icon: FlaskConical },
  { href: "/admin/hall-of-fame", label: "হল অফ ফেম", icon: Star },
  { href: "/admin/sponsors", label: "স্পনসর ওয়াল", icon: Handshake },
  { href: "/admin/resources", label: "রিসোর্স", icon: FolderDown },
  { href: "/admin/news", label: "সংবাদ", icon: Newspaper },
  { href: "/admin/events", label: "ইভেন্ট", icon: Calendar },
  { href: "/admin/messages", label: "বার্তা", icon: Bell },
  { href: "/admin/settings", label: "সাইট সেটিংস", icon: Settings },
  { href: "/admin/seo", label: "এসইও সেটিংস", icon: Search },
  { href: "/admin/users", label: "ব্যবহারকারী", icon: ShieldCheck },
];

export default function AdminShell({
  children,
  userName,
  role,
  pending,
  clubLogo = "",
  clubName = "",
}: {
  children: ReactNode;
  userName: string;
  role: string;
  pending: number;
  clubLogo?: string;
  clubName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
              active
                ? "bg-[color-mix(in_srgb,var(--brand)_14%,transparent)] text-[var(--brand)]"
                : "hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
          >
            <Icon className="h-[17px] w-[17px] shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.badge && pending > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10.5px] font-bold text-white">
                {bn(pending)}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar - desktop */}
      <aside className="glass-strong sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r lg:flex" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Logo size={34} src={clubLogo} alt={clubName || "ক্লাব লোগো"} />
          <div className="min-w-0 leading-tight">
            <p className="text-[15px] font-bold">অ্যাডমিন প্যানেল</p>
            <p className="truncate text-[10.5px]" style={{ color: "var(--ink-3)" }}>
              {clubName || "বিউএসএস সাইেন্স ক্লাব"}
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">{nav}</div>
        <div className="border-t p-3">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
            <Globe className="h-[17px] w-[17px]" /> সাইট দেখুন
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="glass-strong absolute left-0 top-0 flex h-dvh w-72 flex-col" style={{ borderRadius: 0 }}>
            <div className="flex items-center gap-2.5 px-5 py-5">
              <Logo size={32} src={clubLogo} alt={clubName || "ক্লাব লোগো"} />
              <div className="min-w-0 leading-tight">
                <p className="text-[15px] font-bold">অ্যাডমিন প্যানেল</p>
                <p className="truncate text-[10px]" style={{ color: "var(--ink-3)" }}>
                  {clubName || "বিউএসএস সাইেন্স ক্লাব"}
                </p>
              </div>
              <button className="ml-auto" onClick={() => setOpen(false)} aria-label="বন্ধ">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4">{nav}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-strong sticky top-0 z-40 flex items-center gap-2 border-b px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3" style={{ borderRadius: 0 }}>
          <button className="glass grid h-9 w-9 place-items-center rounded-full lg:hidden" onClick={() => setOpen(true)} aria-label="মেনু">
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="flex-1" />
          <span className="hidden items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--brand)_10%,transparent)] px-3 py-1.5 text-[12px] font-semibold sm:flex" style={{ color: "var(--brand)" }}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {(role === "superadmin" || role === "super_admin") ? "সুপার অ্যাডমিন" : role === "editor" ? "এডিটর" : "সদস্য"}
          </span>
          <span className="hidden max-w-[120px] truncate text-[13px] font-semibold xs:inline sm:max-w-none sm:text-[13.5px]">{userName}</span>
          <ThemeToggle />
          <button
            onClick={logout}
            className="glass flex h-9 items-center gap-2 rounded-full px-3.5 text-[13px] font-medium transition-all hover:scale-[1.03] active:scale-95"
          >
            <LogOut className="h-4 w-4 text-red-500" />
            <span className="hidden sm:inline">লগআউট</span>
          </button>
        </header>
        <main className="flex-1 p-3.5 pb-16 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
