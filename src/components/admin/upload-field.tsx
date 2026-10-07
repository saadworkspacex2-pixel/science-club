"use client";

import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  UploadCloud,
  Loader2,
  FileText,
  Crop as CropIcon,
  X,
  Scissors,
  ZoomIn,
} from "lucide-react";
import { cropImageToBlob, compressImage, type PixelCrop } from "@/lib/crop-image";
import { bn } from "@/lib/utils";

const ASPECTS = [
  { label: "১৬:৯", value: 16 / 9 },
  { label: "৪:৩", value: 4 / 3 },
  { label: "১:১", value: 1 },
  { label: "৩:৪", value: 3 / 4 },
  { label: "মুক্ত", value: 0 },
];

/* ---------- Crop dialog ---------- */
function CropDialog({
  src,
  fileType,
  onCancel,
  onDone,
}: {
  src: string;
  fileType: string;
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number>(16 / 9);
  const [pixels, setPixels] = useState<PixelCrop | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onComplete = useCallback((_a: Area, pixels: Area) => {
    setPixels(pixels);
  }, []);

  const confirm = async () => {
    if (!pixels) return;
    setBusy(true);
    setErr("");
    try {
      const blob = await cropImageToBlob(src, pixels, {
        forcePng: fileType === "image/png",
      });
      onDone(blob);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "ক্রপ ব্যর্থ — আবার চেষ্টা করুন");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex flex-col bg-black/85 backdrop-blur-xl" style={{ animation: "cropBg .3s ease both" }}>
      <div
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col p-3 sm:p-5"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          animation: "cropIn .45s cubic-bezier(.34,1.56,.64,1) both",
        }}
      >
        <div className="glass-strong mb-3 flex items-center justify-between rounded-2xl px-4 py-3">
          <span className="flex items-center gap-2 text-[14px] font-bold">
            <CropIcon className="h-4.5 w-4.5" style={{ color: "var(--brand)" }} />
            ছবি ক্রপ করুন
          </span>
          <button onClick={onCancel} className="glass grid h-9 w-9 place-items-center rounded-full" aria-label="বাতিল">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-black/60">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
            cropShape="rect"
            showGrid
            style={{ containerStyle: { borderRadius: 24 } }}
          />
        </div>

        <div className="glass-strong mt-3 space-y-3 rounded-2xl p-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                onClick={() => setAspect(a.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-bold transition-all duration-300 ${
                  aspect === a.value ? "text-white" : "glass"
                }`}
                style={aspect === a.value ? { background: "var(--brand)" } : undefined}
              >
                {a.label}
              </button>
            ))}
          </div>
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
          {err && <p className="rounded-xl bg-red-500/10 px-4 py-2 text-[12.5px] font-medium text-red-500">{err}</p>}
          <div className="flex gap-2.5">
            <button onClick={onCancel} className="btn-glass flex-1 !py-3 text-sm">
              বাতিল
            </button>
            <button onClick={confirm} disabled={busy} className="btn-brand flex-[1.6] !py-3 text-sm disabled:opacity-60">
              {busy ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Scissors className="h-4.5 w-4.5" />}
              ক্রপ করে আপলোড
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes cropBg { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cropIn { from { opacity: 0; transform: translateY(26px) scale(.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

/* ---------- Upload field with client-side crop + compression ---------- */
export default function UploadField({
  value,
  onChange,
  accept,
  kind,
  crop = true,
}: {
  value: string;
  onChange: (url: string) => void;
  accept: string;
  kind: "image" | "media" | "file";
  crop?: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<{ url: string; file: File } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadBlob = async (blob: Blob, fileName: string) => {
    setUploading(true);
    setProgress(12);
    setError("");
    const fd = new FormData();
    fd.append("file", blob, fileName);
    try {
      const tick = setInterval(() => setProgress((p) => Math.min(90, p + 11)), 200);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      clearInterval(tick);
      let data: { url?: string; error?: string } = {};
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(res.ok ? "অপ্রত্যাশিত উত্তর" : `সার্ভার ত্রুটি (${res.status}) — আবার চেষ্টা করুন`);
      }
      if (!res.ok || !data.url) throw new Error(data.error || "আপলোড ব্যর্থ");
      setProgress(100);
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "আপলোড ব্যর্থ হয়েছে — আবার চেষ্টা করুন");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 450);
    }
  };

  const handleFile = (file: File) => {
    setError("");
    const isImage = file.type.startsWith("image/");
    // Images open the cropper first (phone photos get compressed before upload)
    if (isImage && crop) {
      const url = URL.createObjectURL(file);
      setCropSrc({ url, file });
      return;
    }
    void (async () => {
      let blob: Blob = file;
      if (isImage) {
        try {
          blob = await compressImage(file);
        } catch {
          blob = file;
        }
      }
      await uploadBlob(blob, file.name || "upload");
    })();
  };

  const finishCrop = async (blob: Blob) => {
    const f = cropSrc?.file;
    if (cropSrc) URL.revokeObjectURL(cropSrc.url);
    setCropSrc(null);
    const ext = f?.type === "image/png" ? ".png" : ".jpg";
    const base = (f?.name || "image").replace(/\.[^.]+$/, "");
    await uploadBlob(blob, `${base}${ext}`);
  };

  const skipCrop = async () => {
    const f = cropSrc?.file;
    if (cropSrc) URL.revokeObjectURL(cropSrc.url);
    setCropSrc(null);
    if (!f) return;
    let blob: Blob = f;
    try {
      blob = await compressImage(f);
    } catch {
      blob = f;
    }
    await uploadBlob(blob, f.name || "image");
  };

  const isVideo = value?.match(/\.(mp4|webm|mov)$/i);
  const isPdf = value?.match(/\.pdf$/i);

  return (
    <div>
      <div
        className={`relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-300 ${
          dragOver ? "border-[var(--brand)] bg-[color-mix(in_srgb,var(--brand)_8%,transparent)]" : "hover:border-black/25 dark:hover:border-white/25"
        } ${error ? "border-red-400/60" : ""}`}
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
          if (f) handleFile(f);
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--brand)" }} />
            <p className="text-[12.5px] font-medium" style={{ color: "var(--ink-3)" }}>
              আপলোড হচ্ছে… {bn(progress)}%
            </p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <div className="h-full rounded-full bg-[var(--brand)] transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : value ? (
          <div className="w-full">
            {kind !== "file" && !isVideo && !isPdf && (
              <img src={value} alt="প্রিভিউ" className="mx-auto max-h-44 rounded-xl object-cover shadow" />
            )}
            {isVideo && <video src={value} className="mx-auto max-h-44 rounded-xl shadow" muted playsInline />}
            {(kind === "file" || isPdf) && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-black/5 px-4 py-3 text-[13px] font-medium dark:bg-white/10">
                <FileText className="h-4 w-4" style={{ color: "var(--brand)" }} />
                {value.split("/").pop()}
              </span>
            )}
            <p className="mt-2 text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              পরিবর্তন করতে ক্লিক বা টেনে আনুন
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-7 w-7" style={{ color: "var(--ink-3)" }} />
            <p className="text-[13px] font-semibold">ক্লিক করুন অথবা ফাইল টেনে আনুন</p>
            <p className="text-[11.5px]" style={{ color: "var(--ink-3)" }}>
              {kind === "file"
                ? "PDF · সর্বোচ্চ ৮০MB"
                : kind === "media"
                  ? "ছবি (ক্রপসহ) বা ভিডিও"
                  : "ছবি — আপলোডের আগে ক্রপ ও কমপ্রেস হবে"}
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-2 text-[12px] font-medium text-red-500 animate-shake">
          <X className="h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {cropSrc && (
        <div>
          <CropDialog
            src={cropSrc.url}
            fileType={cropSrc.file.type}
            onCancel={() => {
              URL.revokeObjectURL(cropSrc.url);
              setCropSrc(null);
            }}
            onDone={(b) => void finishCrop(b)}
          />
          {/* Skip-crop option rendered as floating action under the dialog */}
          <button
            onClick={() => void skipCrop()}
            className="glass-strong fixed bottom-4 left-1/2 z-[96] -translate-x-1/2 rounded-full px-5 py-2.5 text-[12.5px] font-bold shadow-[var(--shadow-lift)] transition-transform hover:scale-105 active:scale-95"
            style={{ color: "var(--ink-2)" }}
          >
            ক্রপ ছাড়াই আপলোড
          </button>
        </div>
      )}
    </div>
  );
}

