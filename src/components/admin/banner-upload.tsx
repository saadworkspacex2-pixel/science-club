"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  UploadCloud,
  Loader2,
  Monitor,
  Smartphone,
  X,
  ZoomIn,
  ArrowRight,
  Check,
} from "lucide-react";
import { cropImageToBlob, type PixelCrop } from "@/lib/crop-image";
import { bn } from "@/lib/utils";

type Stage = "desktop" | "mobile";

const STAGES: Record<
  Stage,
  { label: string; hint: string; aspect: number; icon: typeof Monitor; maxDim: number }
> = {
  desktop: {
    label: "কম্পিউটার ভিউ",
    hint: "ওয়াইড ব্যানার — ল্যাপটপ ও ট্যাবলেটে এটি দেখাবে",
    aspect: 16 / 9,
    icon: Monitor,
    maxDim: 2000,
  },
  mobile: {
    label: "মোবাইল ভিউ",
    hint: "লম্বা ব্যানার — ফোনে এটি পুরো স্ক্রিন জুড়ে দেখাবে",
    aspect: 4 / 5,
    icon: Smartphone,
    maxDim: 1400,
  },
};

export default function BannerUpload({
  desktopValue,
  mobileValue,
  onChange,
}: {
  desktopValue: string;
  mobileValue: string;
  onChange: (v: { desktop?: string; mobile?: string }) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [fileType, setFileType] = useState("image/jpeg");
  const [stage, setStage] = useState<Stage>("desktop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const desktopUrlRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const onComplete = useCallback((_a: Area, px: Area) => setPixels(px), []);

  const reset = () => {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setStage("desktop");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixels(null);
    setStep("");
  };

  const pick = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("শুধু ছবি আপলোড করা যাবে");
      return;
    }
    setError("");
    setFileType(file.type);
    setSrc(URL.createObjectURL(file));
    setStage("desktop");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const upload = async (blob: Blob, label: string): Promise<string> => {
    setStep(`${label} আপলোড হচ্ছে…`);
    const fd = new FormData();
    fd.append("file", blob, `banner-${Date.now()}.jpg`);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const text = await res.text();
    let data: { url?: string; error?: string } = {};
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`সার্ভার ত্রুটি (${res.status})`);
    }
    if (!res.ok || !data.url) throw new Error(data.error || "আপলোড ব্যর্থ");
    return data.url;
  };

  const next = async () => {
    if (!pixels || !src) return;
    setBusy(true);
    setError("");
    try {
      const cfg = STAGES[stage];
      const blob = await cropImageToBlob(src, pixels, {
        maxDim: cfg.maxDim,
        forcePng: fileType === "image/png",
      });

      if (stage === "desktop") {
        desktopUrlRef.current = await upload(blob, "কম্পিউটার ব্যানার");
        onChange({ desktop: desktopUrlRef.current });
        // move to mobile crop of the SAME source image
        setStage("mobile");
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setPixels(null);
        setStep("");
      } else {
        const mobileUrl = await upload(blob, "মোবাইল ব্যানার");
        onChange({ mobile: mobileUrl });
        reset();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  const cfg = STAGES[stage];
  const StageIcon = cfg.icon;

  return (
    <div>
      {/* Previews */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        {(
          [
            { key: "desktop" as const, url: desktopValue, label: "কম্পিউটার", icon: Monitor, ratio: "aspect-[16/9]" },
            { key: "mobile" as const, url: mobileValue, label: "মোবাইল", icon: Smartphone, ratio: "aspect-[4/5]" },
          ]
        ).map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.key} className="rounded-2xl border p-2">
              <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold" style={{ color: "var(--ink-3)" }}>
                <Icon className="h-3.5 w-3.5" /> {p.label}
              </p>
              {p.url ? (
                <img src={p.url} alt={p.label} className={`w-full rounded-xl object-cover ${p.ratio}`} />
              ) : (
                <div className={`grid w-full place-items-center rounded-xl bg-black/[0.04] text-[11px] dark:bg-white/5 ${p.ratio}`} style={{ color: "var(--ink-3)" }}>
                  নেই
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drop zone */}
      <div
        className={`flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-300 ${
          dragOver ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]" : "hover:border-black/25 dark:hover:border-white/25"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) pick(f);
        }}
      >
        <UploadCloud className="h-6 w-6" style={{ color: "var(--ink-3)" }} />
        <p className="text-[13px] font-semibold">ব্যানার ছবি নির্বাচন করুন</p>
        <p className="text-[11px]" style={{ color: "var(--ink-3)" }}>
          একবার আপলোড — পরপর <b>কম্পিউটার</b> ও <b>মোবাইল</b> দুই ভিউয়ের জন্য ক্রপ করবেন
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pick(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mt-2 rounded-xl bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-500">{error}</p>
      )}

      {/* Dual crop dialog */}
      {src && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-black/85 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-3 sm:p-5"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
            {/* Stepper header */}
            <div className="glass-strong mb-3 rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[14px] font-bold">
                  <StageIcon className="h-4.5 w-4.5" style={{ color: "var(--brand)" }} />
                  {cfg.label}
                </span>
                <button onClick={reset} className="glass grid h-9 w-9 place-items-center rounded-full" aria-label="বাতিল">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <p className="mt-1 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
                ধাপ {bn(stage === "desktop" ? 1 : 2)}/{bn(2)} · {cfg.hint}
              </p>
              <div className="mt-2 flex gap-1.5">
                <span className="h-1.5 flex-1 rounded-full" style={{ background: "var(--brand)" }} />
                <span
                  className="h-1.5 flex-1 rounded-full transition-colors duration-500"
                  style={{ background: stage === "mobile" ? "var(--brand)" : "rgba(128,128,128,.3)" }}
                />
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-black/60">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={cfg.aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onComplete}
                showGrid
                style={{ containerStyle: { borderRadius: 24 } }}
              />
            </div>

            <div className="glass-strong mt-3 space-y-3 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <ZoomIn className="h-4 w-4 shrink-0" style={{ color: "var(--ink-3)" }} />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[var(--brand)]"
                  aria-label="জুম"
                />
                <span className="w-12 text-right text-[12px] font-bold tabular-nums" style={{ color: "var(--ink-2)" }}>
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              {step && (
                <p className="flex items-center gap-2 text-[12.5px] font-medium" style={{ color: "var(--brand)" }}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {step}
                </p>
              )}
              {error && (
                <p className="rounded-xl bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-500">{error}</p>
              )}
              <button onClick={next} disabled={busy} className="btn-brand w-full !py-3 text-sm disabled:opacity-60">
                {busy ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : stage === "desktop" ? (
                  <ArrowRight className="h-4.5 w-4.5" />
                ) : (
                  <Check className="h-4.5 w-4.5" />
                )}
                {stage === "desktop" ? "পরবর্তী: মোবাইল ক্রপ" : "সম্পন্ন করুন"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
