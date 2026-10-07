"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileBadge2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import type { MemberCertificate } from "@/lib/member-certificates";
import { MAX_MEMBER_CERTIFICATES } from "@/lib/member-certificates";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_FILE_SIZE = 80 * 1024 * 1024;

function titleFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 160);
}

export default function MemberCertificatesEditor({
  value,
  onChange,
}: {
  value: MemberCertificate[];
  onChange: (certificates: MemberCertificate[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const certificates = Array.isArray(value) ? value : [];

  const uploadFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || uploading) return;
    setError("");
    const chosen = Array.from(fileList);
    const available = Math.max(0, MAX_MEMBER_CERTIFICATES - certificates.length);
    const candidates = chosen.slice(0, available);
    const rejected: string[] = [];

    if (chosen.length > available) {
      rejected.push(`সর্বোচ্চ ${MAX_MEMBER_CERTIFICATES}টি সার্টিফিকেট রাখা যাবে`);
    }
    const files = candidates.filter((file) => {
      if (!ACCEPTED_TYPES.has(file.type)) {
        rejected.push(`${file.name}: PDF বা ছবি হতে হবে`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`${file.name}: ফাইল ৮০ MB-এর বেশি`);
        return false;
      }
      return true;
    });

    if (!files.length) {
      setError(rejected[0] || "আপলোড করার মতো কোনো ফাইল নেই");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const uploaded: Array<MemberCertificate | undefined> = new Array(files.length);
    const failed: string[] = [];
    let cursor = 0;
    let complete = 0;

    const worker = async () => {
      while (cursor < files.length) {
        const index = cursor++;
        const file = files[index];
        try {
          const formData = new FormData();
          formData.append("file", file, file.name);
          const response = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await response.json().catch(() => ({})) as { url?: string; type?: string; error?: string };
          if (!response.ok || !data.url) throw new Error(data.error || "আপলোড ব্যর্থ");
          uploaded[index] = {
            id: globalThis.crypto?.randomUUID?.() ?? `certificate-${Date.now()}-${index}`,
            title: titleFromFileName(file.name) || `Certificate ${certificates.length + index + 1}`,
            url: data.url,
            mime: data.type || file.type,
          };
        } catch {
          failed.push(file.name);
        } finally {
          complete += 1;
          setProgress({ done: complete, total: files.length });
        }
      }
    };

    try {
      await Promise.all(Array.from({ length: Math.min(4, files.length) }, () => worker()));
      const successfulUploads = uploaded.filter((certificate): certificate is MemberCertificate => Boolean(certificate));
      if (successfulUploads.length) onChange([...certificates, ...successfulUploads]);
      const messages = [...rejected, ...(failed.length ? [`${failed.length}টি ফাইল আপলোড হয়নি: ${failed.slice(0, 3).join(", ")}`] : [])];
      if (messages.length) setError(messages.join(" · "));
    } finally {
      setUploading(false);
      setProgress({ done: 0, total: 0 });
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const updateTitle = (index: number, title: string) => {
    onChange(certificates.map((certificate, rowIndex) =>
      rowIndex === index ? { ...certificate, title } : certificate
    ));
  };

  const remove = (index: number) => {
    onChange(certificates.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="rounded-2xl border p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold">PDF বা ছবির সার্টিফিকেট একবারে অনেকগুলো নির্বাচন করুন</p>
          <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
            একসাথে ১২+ ফাইল আপলোড হবে; সার্ভারে চাপ কমাতে চারটি করে আপলোড হয়। প্রতিটি ফাইল সর্বোচ্চ ৮০ MB।
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || certificates.length >= MAX_MEMBER_CERTIFICATES}
          className="btn-brand shrink-0 !px-3.5 !py-2 text-[12px] disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
          {uploading ? `আপলোড ${progress.done}/${progress.total}` : "সার্টিফিকেট আপলোড"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,image/avif,.pdf"
          className="hidden"
          disabled={uploading}
          onChange={(event) => void uploadFiles(event.target.files)}
        />
      </div>

      {uploading && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10" aria-label="আপলোডের অগ্রগতি">
          <div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
        </div>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-[11.5px] text-red-600 dark:text-red-300">{error}</p>}

      {certificates.length > 0 ? (
        <div className="mt-3 max-h-80 space-y-2 overflow-y-auto rounded-xl border p-2">
          {certificates.map((certificate, index) => (
            <div key={certificate.id || index} className="flex min-w-0 items-center gap-2 rounded-xl bg-black/[0.025] p-2 dark:bg-white/[0.035]">
              {certificate.mime.startsWith("image/") ? (
                <img src={certificate.url} alt="" className="h-10 w-12 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--brand)_12%,transparent)] text-[var(--brand)]">
                  <FileText className="h-5 w-5" />
                </span>
              )}
              <input
                className="field min-w-0 flex-1 !py-2 text-[11.5px]"
                maxLength={160}
                value={certificate.title}
                disabled={uploading}
                aria-label={`সার্টিফিকেট ${index + 1}-এর নাম`}
                onChange={(event) => updateTitle(index, event.target.value)}
                placeholder="সার্টিফিকেটের নাম"
              />
              <a href={certificate.url} target="_blank" rel="noopener noreferrer" className="glass grid h-8 w-8 shrink-0 place-items-center rounded-full" aria-label="সার্টিফিকেট খুলুন">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button type="button" disabled={uploading} onClick={() => remove(index)} className="glass grid h-8 w-8 shrink-0 place-items-center rounded-full text-red-500 disabled:opacity-50" aria-label={`${certificate.title} মুছুন`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 grid min-h-24 place-items-center rounded-xl border border-dashed text-center">
          <div>
            <FileBadge2 className="mx-auto mb-1.5 h-5 w-5" style={{ color: "var(--ink-3)" }} />
            <p className="text-[11px]" style={{ color: "var(--ink-3)" }}>এখনও কোনো সার্টিফিকেট যোগ করা হয়নি</p>
          </div>
        </div>
      )}
      <p className="mt-2 text-right text-[10px]" style={{ color: "var(--ink-3)" }}>
        {certificates.length}/{MAX_MEMBER_CERTIFICATES} ফাইল
      </p>
    </div>
  );
}
