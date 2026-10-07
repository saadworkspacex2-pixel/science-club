"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, UserPlus } from "lucide-react";

const HIDDEN = ["/join", "/login", "/admin", "/profile"];

export default function MobileCTA() {
  const pathname = usePathname();
  if (HIDDEN.some((p) => pathname.startsWith(p))) return null;

  return (
    <div
      className="fixed inset-x-3 z-40 sm:hidden"
      style={{ bottom: "max(0.85rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass-strong flex items-center gap-2 rounded-full p-1.5 shadow-[var(--shadow-lift)]" style={{ animation: "ctaIn .8s cubic-bezier(.34,1.56,.64,1) .4s both" }}>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("sc:open-search"))}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-semibold active:scale-95 transition-transform"
          style={{ color: "var(--ink-2)" }}
        >
          <Search className="h-4 w-4" />
          সার্চ করুন
        </button>
        <Link
          href="/join"
          className="flex h-11 flex-[1.3] items-center justify-center gap-2 rounded-full text-[13.5px] font-bold text-white active:scale-95 transition-transform"
          style={{ background: "linear-gradient(135deg,#0a84ff,#0060c9)", boxShadow: "0 8px 20px -6px rgba(10,132,255,.55)" }}
        >
          <UserPlus className="h-4 w-4" />
          যোগ দিন
        </Link>
      </div>
      <style jsx>{`
        @keyframes ctaIn {
          from { opacity: 0; transform: translateY(70px) scale(.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
