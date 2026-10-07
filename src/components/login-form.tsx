"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Loader2, LogIn, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme";

export default function LoginForm({
  mode,
  hint,
  clubLogo = "",
  clubName = "",
}: {
  mode: "admin" | "member";
  hint?: { u: string; p: string };
  clubLogo?: string;
  clubName?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "লগইন ব্যর্থ");
        return;
      }
      if (mode === "admin" && (data.role === "superadmin" || data.role === "super_admin" || data.role === "editor")) {
        router.push("/admin");
      } else {
        router.push(mode === "admin" ? "/admin" : "/profile");
      }
      router.refresh();
    } catch {
      setError("সংযোগ ত্রুটি — আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dot-grid flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="fixed right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="mb-6 flex items-center gap-2 text-[13.5px] font-medium" style={{ color: "var(--ink-3)" }}>
        <ArrowRight className="h-4 w-4" /> হোমে ফিরুন
      </Link>
      <div className="glass-strong w-full max-w-md rounded-[2rem] p-8 shadow-[var(--shadow-lift)] sm:p-10" style={{ animation: "loginIn .7s cubic-bezier(.22,1,.36,1) both" }}>
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="float-soft"><Logo size={56} src={clubLogo} alt={clubName || "ক্লাব লোগো"} /></span>
          {clubName && <p className="mt-3 text-[13px] font-semibold" style={{ color: "var(--ink-2)" }}>{clubName}</p>}
          <h1 className="mt-5 text-[22px] font-bold tracking-tight">
            {mode === "admin" ? "অ্যাডমিন প্যানেল" : "সদস্য লগইন"}
          </h1>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
            {mode === "admin"
              ? "ওয়েবসাইট পরিচালনা করতে লগইন করুন"
              : "আপনার পোর্টফোলিও ও অভ্যন্তরীণ কনটেন্ট দেখুন"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              ইউজারনেম
            </span>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--ink-3)" }} />
              <input
                className="field !pl-11"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="আপনার ইউজারনেম"
                autoComplete="username"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
              পাসওয়ার্ড
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--ink-3)" }} />
              <input
                className="field !pl-11"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-brand w-full !py-3.5 disabled:opacity-60">
            {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <LogIn className="h-4.5 w-4.5" />}
            লগইন করুন
          </button>
        </form>

        {hint && (
          <div className="mt-6 rounded-2xl bg-black/[0.04] px-4 py-3 text-center text-[12px] leading-relaxed dark:bg-white/5" style={{ color: "var(--ink-3)" }}>
            ডেমো অ্যাক্সেস — ইউজারনেম: <b className="text-[var(--ink-2)]">{hint.u}</b> · পাসওয়ার্ড:{" "}
            <b className="text-[var(--ink-2)]">{hint.p}</b>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes loginIn {
          from { opacity: 0; transform: translateY(30px) scale(.97); filter: blur(6px); }
          to { opacity: 1; transform: none; filter: none; }
        }
      `}</style>
    </div>
  );
}
