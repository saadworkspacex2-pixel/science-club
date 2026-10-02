"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, X, Loader2, Check, Crop, Video, FileIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

let _cfgCache: Promise<{ blobAvailable: boolean; maxSize: number }> | null = null;

function detectConfig() {
  if (!_cfgCache) {
    _cfgCache = fetch("/api/upload", { method: "GET" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => ({
        blobAvailable: Boolean(d.blobAvailable),
        maxSize: Number(d.maxSize) || 4 * 1024 * 1024,
      }))
      .catch(() => ({ blobAvailable: false, maxSize: 4 * 1024 * 1024 }));
  }
  return _cfgCache;
}

// Downscale big images in the browser (max 1920px, quality 0.85) so they
// fit comfortably inside the 4MB database/serverless budget and load fast.
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || /svg|gif/.test(file.type)) return file;
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const MAX = 1920;
    const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale >= 1 && file.size < 400 * 1024) {
      URL.revokeObjectURL(url);
      return file; // already small enough
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const type = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File(
      [blob],
      file.name.replace(/\.\w+$/, type === "image/png" ? ".png" : ".jpg"),
      { type }
    );
  } catch {
    return file; // if decoding fails, send original
  }
}

async function postToServer(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `সার্ভার ত্রুটি (${res.status})`);
  return data.url as string;
}

export async function uploadFile(file: File): Promise<string> {
  const prepared = await compressImage(file);
  const cfg = await detectConfig();

  // Oversized non-compressible files (e.g. long videos): use Blob store
  // directly from the browser when it is configured — never touches the
  // 4MB serverless limit.
  if (prepared.size > cfg.maxSize && cfg.blobAvailable) {
    try {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      return blob.url;
    } catch (e) {
      throw new Error(
        `আপলোড ব্যর্থ: ${e instanceof Error ? e.message : "অজানা ত্রুটি"}`
      );
    }
  }

  // Default: store inside the Neon database
  try {
    return await postToServer(prepared);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "আপলোড ব্যর্থ";
    if (prepared.size > cfg.maxSize) {
      throw new Error(
        cfg.blobAvailable
          ? msg
          : `ফাইলটি অনেক বড় — ভিডিও/বড় ফাইলের জন্য Vercel Blob স্টোর চালু করুন, অথবা ৪ মেগাবাইটের ছোট ফাইল দিন`
      );
    }
    throw new Error(msg);
  }
}

// ---------- Simple canvas cropper ----------
function CropDialog({
  file,
  aspect = 16 / 10,
  onDone,
  onCancel,
}: {
  file: File;
  aspect?: number;
  onDone: (f: File) => void;
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
      const frame = frameRef.current, img = imgRef.current;
      if (!frame || !img || !img.naturalWidth) return o;
      const fw = frame.clientWidth, fh = frame.clientHeight;
      const fs = Math.max(fw / img.naturalWidth, fh / img.naturalHeight) * s;
      const rw = img.naturalWidth * fs, rh = img.naturalHeight * fs;
      const maxX = Math.max(0, (rw - fw) / 2), maxY = Math.max(0, (rh - fh) / 2);
      return { x: Math.max(-maxX, Math.min(maxX, o.x)), y: Math.max(-maxY, Math.min(maxY, o.y)) };
    },
    []
  );

  const doCrop = async () => {
    const frame = frameRef.current, img = imgRef.current;
    if (!frame || !img) return;
    setBusy(true);
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const fs = Math.max(fw / img.naturalWidth, fh / img.naturalHeight) * scale;
    const rw = img.naturalWidth * fs;
    const perPx = img.naturalWidth / rw; // image px per rendered px
    const sx = ((rw - fw) / 2 - offset.x) * perPx;
    const sy = ((img.naturalHeight * fs - fh) / 2 - offset.y) * perPx;
    const sw = fw * perPx, sh = fh * perPx;
    const outW = 1600, outH = Math.round(1600 / aspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    canvas.toBlob(
      (blob) => {
        if (blob) onDone(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }));
        else onCancel();
      },
      "image/jpeg",
      0.9
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] grid place-items-center bg-black/60 p-4 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="glass-strong w-full max-w-2xl rounded-[1.75rem] p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display flex items-center gap-2 text-sm font-extrabold">
            <Crop className="size-4 text-blue" /> ছবি ক্রপ করুন — টেনে সাজান
          </p>
          <button onClick={onCancel} className="grid size-8 place-items-center rounded-full glass"><X className="size-4" /></button>
        </div>
        <div
          ref={frameRef}
          className="relative mx-auto w-full cursor-grab touch-none overflow-hidden rounded-2xl bg-black/80 active:cursor-grabbing"
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
          <input type="range" min={1} max={3} step={0.01} value={scale}
            onChange={(e) => { const s2 = Number(e.target.value); setScale(s2); setOffset((o) => clamp(o, s2)); }}
            className="w-full accent-blue" />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="flex-1 rounded-full glass py-3 text-sm font-bold">বাতিল</button>
          <button onClick={doCrop} disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue to-blue-bright py-3 text-sm font-extrabold text-white disabled:opacity-60">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} ক্রপ সম্পন্ন
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------- Upload field (single) ----------
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

  const handle = async (file?: File | null) => {
    if (!file) return;
    if (kind === "image" && aspect) {
      setCropSrc(file);
      return;
    }
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadFile(file));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "আপলোড ব্যর্থ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-2 text-[13px] font-bold">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed p-3 text-center transition-colors",
          dragOver ? "border-blue bg-blue/10" : "border-black/10 bg-mist hover:border-blue/50 dark:border-white/15 dark:bg-white/5"
        )}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={(e) => { handle(e.target.files?.[0]); e.target.value = ""; }} />
        {busy ? (
          <Loader2 className="size-6 animate-spin text-blue" />
        ) : value ? (
          kind === "file" && !value.match(/\.(jpe?g|png|webp|gif|avif|svg)$/i) ? (
            <span className="flex items-center gap-2 text-sm font-bold text-blue"><FileIcon className="size-5" />{value.split("/").pop()}</span>
          ) : value.match(/\.(mp4|webm|mov)$/i) ? (
            <span className="flex items-center gap-2 text-sm font-bold text-blue"><Video className="size-5" />ভিডিও আপলোড হয়েছে</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="প্রিভিউ" className="max-h-32 rounded-xl object-cover" />
          )
        ) : (
          <>
            <UploadCloud className="size-7 text-blue" />
            <span className="text-xs font-bold text-ink-soft dark:text-white/55">
              ক্লিক করুন অথবা কম্পিউটার থেকে ড্র্যাগ করে ছাড়ুন
            </span>
          </>
        )}
        {value && !busy && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full glass text-red"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {err && <p className="mt-1.5 text-xs font-bold text-red">{err}</p>}
      <AnimatePresence>
        {cropSrc && (
          <CropDialog
            file={cropSrc}
            aspect={aspect}
            onCancel={() => setCropSrc(null)}
            onDone={async (f) => {
              setCropSrc(null);
              setBusy(true);
              try { onChange(await uploadFile(f)); } catch { setErr("আপলোড ব্যর্থ"); } finally { setBusy(false); }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------- Multi image field ----------
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
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {value.map((url, i) => (
          <div key={url + i} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`ছবি ${i + 1}`} className="size-19 h-[76px] w-[76px] rounded-2xl object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-red text-white shadow-md">
              <X className="size-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="grid h-[76px] w-[76px] place-items-center rounded-2xl border-2 border-dashed border-black/10 text-blue transition-colors hover:border-blue/50 dark:border-white/15"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
        </button>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            setBusy(true);
            try {
              const urls: string[] = [];
              for (const f of files) urls.push(await uploadFile(f));
              onChange([...value, ...urls]);
            } finally { setBusy(false); e.target.value = ""; }
          }} />
      </div>
    </div>
  );
}
