"use client";

import { useState } from "react";
import { Loader2, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "বার্তা পাঠানো যায়নি");
        return;
      }
      setDone(true);
    } catch {
      setError("সংযোগ ত্রুটি");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="glass-card p-8 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
        <h3 className="mt-3 text-[17px] font-bold">বার্তা পৌঁছেছে!</h3>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--ink-3)" }}>
          ধন্যবাদ — শীঘ্রই উত্তর দেওয়া হবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass-card space-y-4 p-6 sm:p-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>নাম</span>
          <input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="আপনার নাম" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>ইমেইল</span>
          <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-semibold" style={{ color: "var(--ink-2)" }}>বার্তা</span>
        <textarea className="field min-h-[130px] resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required minLength={5} placeholder="আপনার বার্তা লিখুন…" />
      </label>
      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-500 animate-shake">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-brand w-full !py-3 disabled:opacity-60">
        {loading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        বার্তা পাঠান
      </button>
    </form>
  );
}
