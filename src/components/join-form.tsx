"use client";

import { useState } from "react";
import {
  School,
  GraduationCap,
  User,
  Hash,
  Phone,
  Loader2,
  CheckCircle2,
  Send,
} from "lucide-react";
import { InstagramIcon, WhatsappIcon } from "@/components/brand-icons";
import { CLUB } from "@/lib/utils";

const CLASSES = ["৬", "৭", "৮", "৯", "১০"];

export default function JoinForm() {
  const [form, setForm] = useState({
    school: "",
    classLevel: "",
    fullName: "",
    roll: "",
    phone: "",
    whatsapp: "",
    instagram: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "কিছু একটা ভুল হয়েছে");
        return;
      }
      setDone(true);
    } catch {
      setError("সংযোগ ত্রুটি — ইন্টারনেট যাচাই করে আবার চেষ্টা করুন");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="glass-strong mx-auto max-w-xl rounded-[1.6rem] p-7 text-center sm:rounded-[2rem] sm:p-10 shadow-[var(--shadow-lift)]" style={{ animation: "popIn .6s cubic-bezier(.34,1.56,.64,1) both" }}>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/15">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </span>
        <h2 className="mt-5 text-[22px] font-bold tracking-tight">আবেদন সফল হয়েছে!</h2>
        <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          ধন্যবাদ {form.fullName}! আপনার আবেদন আমাদের অ্যাডমিন প্যানেলে পৌঁছেছে।
          খুব শীঘ্রই আমাদের টীম হোয়াটসঅ্যাপে যোগাযোগ করবে।
        </p>
        <button onClick={() => { setDone(false); setForm({ school: "", classLevel: "", fullName: "", roll: "", phone: "", whatsapp: "", instagram: "" }); }} className="btn-glass mt-7">
          আরেকটি আবেদন করুন
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="glass-strong mx-auto max-w-xl rounded-[1.6rem] p-5 shadow-[var(--shadow-lift)] sm:rounded-[2rem] sm:p-9"
      style={{ animation: "popIn .7s cubic-bezier(.22,1,.36,1) both" }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <School className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> স্কুল <span className="text-red-500">*</span>
          </span>
          <select className="field" value={form.school} onChange={(e) => set("school", e.target.value)} required>
            <option value="" disabled>স্কুল নির্বাচন করুন</option>
            {CLUB.schools.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <GraduationCap className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> শ্রেণি <span className="text-red-500">*</span>
          </span>
          <select className="field" value={form.classLevel} onChange={(e) => set("classLevel", e.target.value)} required>
            <option value="" disabled>শ্রেণি</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>শ্রেণি {c}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <Hash className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> ক্লাস রোল <span className="text-red-500">*</span>
          </span>
          <input className="field" value={form.roll} onChange={(e) => set("roll", e.target.value)} placeholder="যেমন: ১২" required />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <User className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> সম্পূর্ণ নাম <span className="text-red-500">*</span>
          </span>
          <input className="field" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="আপনার পুরো নাম লিখুন" required minLength={3} />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <Phone className="h-3.5 w-3.5" style={{ color: "var(--brand)" }} /> ফোন নম্বর <span className="text-red-500">*</span>
          </span>
          <input className="field" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="01XXXXXXXXX" required />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <WhatsappIcon className="h-3.5 w-3.5" /> হোয়াটসঅ্যাপ নম্বর <span className="text-red-500">*</span>
          </span>
          <input className="field" type="tel" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="01XXXXXXXXX" required />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>
            <InstagramIcon className="h-3.5 w-3.5" /> ইনস্টাগ্রাম ইউজারনেম <span className="font-normal" style={{ color: "var(--ink-3)" }}>(ঐচ্ছিক)</span>
          </span>
          <input className="field" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@ ছাড়া ইউজারনেম" />
        </label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-brand mt-6 w-full !py-3.5 disabled:opacity-60">
        {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        আবেদন জমা দিন
      </button>
      <p className="mt-4 text-center text-[11.5px]" style={{ color: "var(--ink-3)" }}>
        জমা দিয়ে আপনি ক্লাবের যোগাযোগ ও যাচাই প্রক্রিয়ায় সম্মত হচ্ছেন
      </p>
      <style jsx>{`
        @keyframes popIn { from { opacity: 0; transform: translateY(26px) scale(.97); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
      `}</style>
    </form>
  );
}
