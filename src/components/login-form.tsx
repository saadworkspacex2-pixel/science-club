"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Lock, LogIn, Loader2, LogOut } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3.5 pl-11 text-sm font-medium outline-none transition-all placeholder:text-ink-soft/50 focus:border-blue/40 focus:bg-white focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10 dark:placeholder:text-white/35";

export default function LoginForm({
  endpoint,
  redirectTo,
  title,
  subtitle,
}: {
  endpoint: string;
  redirectTo: string;
  title: string;
  subtitle: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "লগইন ব্যর্থ হয়েছে");
      router.replace(redirectTo);
      router.refresh();
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "লগইন ব্যর্থ হয়েছে");
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="glass mx-auto w-full max-w-md rounded-[2rem] p-7 sm:p-9"
    >
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-black/[0.06] text-ink dark:bg-white/10 dark:text-white">
          <Lock className="size-6" />
        </span>
        <h1 className="font-display mt-4 text-2xl font-extrabold">{title}</h1>
        <p className="mt-1.5 text-sm text-ink-soft dark:text-white/55">{subtitle}</p>
      </div>
      <div className="mt-7 space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70 dark:text-white/40" />
          <input required value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="ইউজারনেম" className={inputCls} autoComplete="username" />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-soft/70 dark:text-white/40" />
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="পাসওয়ার্ড" className={inputCls} autoComplete="current-password" />
        </div>
      </div>
      {err && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-4 rounded-2xl bg-red/10 px-4 py-3 text-center text-sm font-bold text-red">
          {err}
        </motion.p>
      )}
      <button type="submit" disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue/30 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        {loading ? "যাচাই হচ্ছে..." : "লগইন করুন"}
      </button>
    </motion.form>
  );
}

export function LogoutButton({ endpoint, label }: { endpoint: string; label: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch(endpoint, { method: "DELETE" });
        router.replace("/");
        router.refresh();
      }}
      className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-red transition-transform hover:scale-105 active:scale-95"
    >
      <LogOut className="size-3.5" />
      {label}
    </button>
  );
}
