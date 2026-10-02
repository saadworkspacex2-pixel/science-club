"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  X,
  Loader2,
  Check,
  Crop,
  Video,
  FileIcon,
  Plus,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Convert a File to base64 string
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = (err) => reject(err || new Error("ফাইল রিড করতে ব্যর্থ"));
    reader.readAsDataURL(file);
  });
}

// Client-side image compression using Canvas
// Downscales photos to max 1600px dimension and 85% JPEG/PNG quality
// This ensures images upload in under a second directly to NEON PostgreSQL
async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.85
): Promise<{ base64: string; mime: string; name: string }> {
  if (!file.type.startsWith("image/") || /svg|gif/.test(file.type)) {
    const b64 = await fileToBase64(file);
    return { base64: b64, mime: file.type || "application/octet-stream", name: file.name };
  }

  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("ছবি লোড করতে ব্যর্থ"));
      i.src = url;
    });

    let { naturalWidth: w, naturalHeight: h } = img;
    const maxSide = Math.max(w, h);
    let scale = 1;
    if (maxSide > maxDim) {
      scale = maxDim / maxSide;
    }

    w = Math.max(1, Math.round(w * scale));
    h = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    const isPng = file.type === "image/png";
    const mime = isPng ? "image/png" : "image/jpeg";
    const base64 = canvas.toDataURL(mime, isPng ? 0.9 : quality);
    const ext = isPng ? ".png" : ".jpg";
    const cleanName = file.name.replace(/\.[^/.]+$/, "") + ext;

    return { base64, mime, name: cleanName };
  } catch {
    // If canvas decoding fails, fallback to direct base64
    const b64 = await fileToBase64(file);
    return { base64: b64, mime: file.type || "image/jpeg", name: file.name };
  }
}

// Uploads an image/file directly to NEON Database via standard JSON POST
export async function uploadFile(
  input: File | { base64: string; mime: string; name: string }
): Promise<string> {
  let payload: { name: string; mime: string; data: string };

  if (input instanceof File) {
    if (input.type.startsWith("image/")) {
      const compressed = await compressImage(input);
      payload = {
        name: compressed.name,
        mime: compressed.mime,
        data: compressed.base64,
      };
    } else {
      const b64 = await fileToBase64(input);
      payload = {
        name: input.name,
        mime: input.type || "application/octet-stream",
        data: b64,
      };
    }
  } else {
    payload = {
      name: input.name || "image.jpg",
      mime: input.mime || "image/jpeg",
      data: input.base64,
    };
  }

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `আপলোড ত্রুটি (${res.status})`);
  }

  if (!data.url) {
    throw new Error("সার্ভার থেকে সঠিক ইউআরএল পাওয়া যায়নি");
  }

  return data.url as string;
}

// ---------- Visual Image Cropper ----------
function CropDialog({
  file,
  aspect = 16 / 10,
  onDone,
  onCancel,
}: {
  file: File;
  aspect?: number;
  onDone: (payload: { base64: string; mime: string; name: string }) => void;
  onCancel: () => void;
}) {
  const url = useRef(URL.createObjectURL(file)).current;
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const clamp = useCallback(
    (o: { x: number; y: number }, s: number) => {
      const frame = frameRef.current;
      const img = imgRef.current;
      if (!frame || !img || !img.naturalWidth) return o;
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;
      const fs = Math.max(fw / img.naturalWidth, fh / img.naturalHeight) * s;
      const rw = img.naturalWidth * fs;
      const rh = img.naturalHeight * fs;
      const maxX = Math.max(0, (rw - fw) / 2);
      const maxY = Math.max(0, (rh - fh) / 2);
      return {
        x: Math.max(-maxX, Math.min(maxX, o.x)),
        y: Math.max(-maxY, Math.min(maxY, o.y)),
      };
    },
    []
  );

  const doCrop = async () => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    setBusy(true);

    try {
      const fw = frame.clientWidth || 400;
      const fh = frame.clientHeight || Math.round(fw / aspect);
      const fs = Math.max(fw / img.naturalWidth, fh / img.naturalHeight) * scale;
      const rw = img.naturalWidth * fs;
      const rh = img.naturalHeight * fs;

      const outW = 1400;
      const outH = Math.round(1400 / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context failed");

      // Fill background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);

      // Safe draw without clipping negative coordinates
      const ratio = outW / fw;
      const destW = rw * ratio;
      const destH = rh * ratio;
      const destX = (outW - destW) / 2 + offset.x * ratio;
      const destY = (outH - destH) / 2 + offset.y * ratio;

      ctx.drawImage(img, destX, destY, destW, destH);
      const base64 = canvas.toDataURL("image/jpeg", 0.85);

      onDone({
        base64,
        mime: "image/jpeg",
        name: file.name.replace(/\.[^/.]+$/, "") + "-cropped.jpg",
      });
    } catch (e) {
      console.error(e);
      onCancel();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass-strong w-full max-w-2xl rounded-[1.75rem] p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display flex items-center gap-2 text-sm font-extrabold">
            <Crop className="size-4 text-blue" /> ছবি পজিশন করুন — টেনে বা জুম করে সাজান
          </p>
          <button
            onClick={onCancel}
            type="button"
            className="grid size-8 place-items-center rounded-full glass"
          >
            <X className="size-4" />
          </button>
        </div>
        <div
          ref={frameRef}
          className="relative mx-auto w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-black/90 active:cursor-grabbing"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            drag.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const next = {
              x: drag.current.ox + (e.clientX - drag.current.sx),
              y: drag.current.oy + (e.clientY - drag.current.sy),
            };
            setOffset(clamp(next, scale));
          }}
          onPointerUp={() => (drag.current = null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={url}
            alt="ক্রপ প্রিভিউ"
            draggable={false}
            onLoad={() => setOffset((o) => clamp(o, scale))}
            className="absolute left-1/2 top-1/2 max-w-none select-none"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-white/60 ring-inset" />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-xs font-bold text-ink-soft dark:text-white/55">জুম</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={scale}
            onChange={(e) => {
              const s2 = Number(e.target.value);
              setScale(s2);
              setOffset((o) => clamp(o, s2));
            }}
            className="w-full accent-blue"
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full glass py-3 text-sm font-bold"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={doCrop}
            disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-3 text-sm font-extrabold text-white shadow-lg disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} ক্রপ সম্পন্ন
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Single Upload / Image Field ----------
export function UploadField({
  value,
  onChange,
  accept = "image/*",
  kind = "image",
  aspect,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  kind?: "image" | "media" | "file";
  aspect?: number;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [cropSrc, setCropSrc] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");

  const handleFileSelect = async (file?: File | null) => {
    if (!file) return;
    setErr("");

    // If it's an image with an aspect ratio, open the cropper
    if (kind === "image" && aspect && file.type.startsWith("image/")) {
      setCropSrc(file);
      return;
    }

    setBusy(true);
    try {
      const uploadedUrl = await uploadFile(file);
      onChange(uploadedUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "আপলোড ব্যর্থ হয়েছে";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleCropDone = async (payload: { base64: string; mime: string; name: string }) => {
    setCropSrc(null);
    setBusy(true);
    setErr("");
    try {
      const uploadedUrl = await uploadFile(payload);
      onChange(uploadedUrl);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "আপলোড ব্যর্থ হয়েছে";
      setErr(msg);
    } finally {
      setBusy(false);
    }
  };

  const applyManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setManualUrl("");
      setShowUrlInput(false);
      setErr("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && <p className="text-[13px] font-bold">{label}</p>}
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-blue hover:underline"
        >
          {showUrlInput ? "ফাইল আপলোড মোড" : "অথবা সরাসরি লিংক (URL) দিন"}
        </button>
      </div>

      {showUrlInput ? (
        <form onSubmit={applyManualUrl} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://... বা /api/files/..."
              className="w-full rounded-2xl border border-black/[0.06] bg-mist py-2.5 pl-10 pr-3 text-xs font-medium outline-none focus:border-blue/40 dark:border-white/10 dark:bg-white/5"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-bright"
          >
            সেট করুন
          </button>
        </form>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFileSelect(e.dataTransfer.files?.[0]);
          }}
          onClick={() => !busy && inputRef.current?.click()}
          className={cn(
            "relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-3 text-center transition-all",
            dragOver
              ? "border-blue bg-blue/10 scale-[1.01]"
              : "border-black/10 bg-mist hover:border-blue/50 dark:border-white/15 dark:bg-white/5"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              handleFileSelect(e.target.files?.[0]);
              e.target.value = "";
            }}
          />

          {busy ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 className="size-7 animate-spin text-blue" />
              <span className="text-xs font-bold text-blue">NEON ডাটাবেজে আপলোড হচ্ছে...</span>
            </div>
          ) : value ? (
            <div className="relative group/preview w-full flex items-center justify-center">
              {kind === "file" && !value.match(/\.(jpe?g|png|webp|gif|avif|svg)$/i) ? (
                <div className="flex items-center gap-2 rounded-xl bg-black/[0.05] p-3 text-xs font-bold text-blue dark:bg-white/10">
                  <FileIcon className="size-5 shrink-0" />
                  <span className="truncate max-w-[200px]">{value}</span>
                </div>
              ) : value.match(/\.(mp4|webm|mov)$/i) ? (
                <div className="flex items-center gap-2 rounded-xl bg-black/[0.05] p-3 text-xs font-bold text-blue dark:bg-white/10">
                  <Video className="size-5 shrink-0" />
                  <span>ভিডিও আপলোড হয়েছে</span>
                </div>
              ) : (
                <div className="relative max-h-40 overflow-hidden rounded-xl border border-black/10 dark:border-white/15">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={value}
                    alt="প্রিভিউ"
                    className="max-h-36 w-auto max-w-full rounded-xl object-contain bg-black/5"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover/preview:opacity-100">
                    <span className="text-xs font-bold text-white">পরিবর্তন করতে ক্লিক করুন</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setErr("");
                }}
                className="absolute right-2 top-2 z-10 grid size-7 place-items-center rounded-full bg-red text-white shadow-md transition-transform hover:scale-110 active:scale-95"
                title="মুছুন"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-3 text-ink-soft dark:text-white/60">
              <span className="grid size-11 place-items-center rounded-2xl bg-blue/10 text-blue dark:bg-white/10">
                <UploadCloud className="size-6" />
              </span>
              <p className="text-xs font-bold">
                কম্পিউটার বা ফোন থেকে ছবি সিলেক্ট করুন বা ড্র্যাগ করুন
              </p>
              <p className="text-[10px] text-ink-soft/70 dark:text-white/40">
                ছবি স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে NEON ডাটাবেজে সেভ হবে
              </p>
            </div>
          )}
        </div>
      )}

      {value && (
        <div className="flex items-center justify-between text-[11px] text-ink-soft dark:text-white/50 px-1">
          <span className="truncate max-w-[280px]">পাথ: {value}</span>
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue hover:underline shrink-0"
          >
            খুলুন <ExternalLink className="size-3" />
          </a>
        </div>
      )}

      {err && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red/10 px-3.5 py-2 text-xs font-bold text-red"
        >
          {err}
        </motion.div>
      )}

      <AnimatePresence>
        {cropSrc && (
          <CropDialog
            file={cropSrc}
            aspect={aspect}
            onCancel={() => setCropSrc(null)}
            onDone={handleCropDone}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Multi Image Upload Field ----------
export function MultiImagesField({
  value,
  onChange,
  label,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMultiUpload = async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    setErr("");
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const url = await uploadFile(file);
        newUrls.push(url);
      }
      onChange([...value, ...newUrls]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "একাধিক ছবি আপলোডে সমস্যা হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-bold">{label}</p>
        <span className="text-[11px] text-ink-soft dark:text-white/50">
          {value.length} টি ছবি সংযুক্ত
        </span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {value.map((url, i) => (
          <div key={url + i} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`ছবি ${i + 1}`}
              className="size-20 rounded-2xl object-cover border border-black/10 dark:border-white/10"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-red text-white shadow-md transition-transform hover:scale-110 active:scale-95"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="grid size-20 place-items-center rounded-2xl border-2 border-dashed border-black/15 text-blue transition-colors hover:border-blue hover:bg-blue/5 dark:border-white/15 dark:hover:bg-white/5 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleMultiUpload(files);
            e.target.value = "";
          }}
        />
      </div>

      {err && (
        <p className="rounded-xl bg-red/10 px-3 py-1.5 text-xs font-bold text-red">
          {err}
        </p>
      )}
    </div>
  );
}
