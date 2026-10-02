"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { School, GraduationCap, User, Hash, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";
import { InstagramIcon, WhatsAppIcon } from "./icons";

const schools = [
  "Bur Uttam Shaheed Samad School and College",
  "Cantt Board Girls School, Rangpur",
];
const classes = ["৬", "৭", "৮", "৯", "১০"];

const inputCls =
  "w-full rounded-2xl border border-black/[0.06] bg-mist px-4 py-3.5 text-sm font-medium outline-none transition-all placeholder:text-ink-soft/50 focus:border-blue/40 focus:bg-white focus:ring-4 focus:ring-blue/10 dark:border-white/10 dark:bg-white/5 dark:focus:bg-white/10 dark:placeholder:text-white/35";

function Field({
  label,
  required,
  Icon,
  children,
}: {
  label: string;
  required?: boolean;
  Icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-[13px] font-bold">
        <Icon className="size-4 text-blue" />
        {label}
        {required && <span className="text-red">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function JoinForm() {
  const [form, setForm] = useState({
    school: "",
    className: "",
    fullName: "",
    classRoll: "",
    phone: "",
    whatsapp: "",
    instagram: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErr("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সমস্যা হয়েছে");
      setState("done");
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "সমস্যা হয়েছে, আবার চেষ্টা করুন");
      setState("error");
    }
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 160, damping: 20 }}
            className="glass flex flex-col items-center rounded-[2rem] p-10 text-center sm:p-14"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
              className="grid size-20 place-items-center rounded-full bg-black/[0.06] text-green dark:bg-white/10"
            >
              <CheckCircle2 className="size-10" />
            </motion.span>
            <h2 className="font-display mt-6 text-2xl font-extrabold sm:text-3xl">আবেদন গৃহীত হয়েছে!</h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft dark:text-white/60">
              ধন্যবাদ {form.fullName}! আপনার আবেদনটি আমাদের অ্যাডমিন প্যানেলে পৌঁছেছে এবং তাঁদের কাছে
              নোটিফিকেশন পাঠানো হয়েছে। শীঘ্রই আমরা ফোন বা হোয়াটসঅ্যাপে যোগাযোগ করব ইনশাআল্লাহ।
            </p>
            <button
              onClick={() => {
                setForm({ school: "", className: "", fullName: "", classRoll: "", phone: "", whatsapp: "", instagram: "" });
                setState("idle");
              }}
              className="mt-7 rounded-full glass px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03] active:scale-95"
            >
              নতুন আরেকটি আবেদন করুন
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="glass rounded-[2rem] p-6 sm:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="স্কুল" required Icon={School}>
                <select required value={form.school} onChange={set("school")} className={inputCls}>
                  <option value="" disabled>স্কুল নির্বাচন করুন</option>
                  {schools.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="শ্রেণি" required Icon={GraduationCap}>
                <select required value={form.className} onChange={set("className")} className={inputCls}>
                  <option value="" disabled>শ্রেণি নির্বাচন করুন</option>
                  {classes.map((c) => (
                    <option key={c} value={c}>{c}ম</option>
                  ))}
                </select>
              </Field>
              <Field label="পুরো নাম" required Icon={User}>
                <input required value={form.fullName} onChange={set("fullName")}
                  placeholder="আপনার পুরো নাম" className={inputCls} maxLength={80} />
              </Field>
              <Field label="ক্লাস রোল" required Icon={Hash}>
                <input required value={form.classRoll} onChange={set("classRoll")}
                  placeholder="যেমন: ১২" className={inputCls} maxLength={10} />
              </Field>
              <Field label="ফোন নম্বর" required Icon={Phone}>
                <input required value={form.phone} onChange={set("phone")} type="tel"
                  placeholder="01XXXXXXXXX" className={inputCls} maxLength={15}
                  pattern="[0-9+]{10,15}" />
              </Field>
              <Field label="হোয়াটসঅ্যাপ নম্বর" required Icon={WhatsAppIcon}>
                <input required value={form.whatsapp} onChange={set("whatsapp")} type="tel"
                  placeholder="01XXXXXXXXX" className={inputCls} maxLength={15}
                  pattern="[0-9+]{10,15}" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="ইনস্টাগ্রাম ইউজারনেম (ঐচ্ছিক)" Icon={InstagramIcon}>
                  <input value={form.instagram} onChange={set("instagram")}
                    placeholder="@ ছাড়া ইউজারনেম" className={inputCls} maxLength={40} />
                </Field>
              </div>
            </div>

            {state === "error" && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-2xl bg-red/10 px-4 py-3 text-center text-sm font-bold text-red"
              >
                {err}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-4 text-base font-extrabold text-white shadow-xl shadow-blue/30 transition-transform hover:scale-[1.015] active:scale-[0.98] disabled:opacity-70"
            >
              {state === "loading" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
              {state === "loading" ? "পাঠানো হচ্ছে..." : "আবেদন জমা দিন"}
            </button>
            <p className="mt-4 text-center text-xs text-ink-soft dark:text-white/45">
              আবেদন জমা দিলে অ্যাডমিন দল যাচাই করে আপনার সাথে যোগাযোগ করবে।
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
