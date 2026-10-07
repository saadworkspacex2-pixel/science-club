export type MemberCertificate = {
  id: string;
  title: string;
  url: string;
  mime: string;
};

export const MAX_MEMBER_CERTIFICATES = 200;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const UPLOAD_PATH = /^\/api\/files\/[a-z0-9._-]+$/i;

function safeMime(value: unknown, url: string) {
  if (typeof value === "string" && ALLOWED_MIME_TYPES.has(value.toLowerCase())) {
    return value.toLowerCase();
  }
  const extension = url.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "application/pdf";
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  if (extension === "avif") return "image/avif";
  return "";
}

export function normalizeMemberCertificates(input: unknown): MemberCertificate[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, MAX_MEMBER_CERTIFICATES).flatMap((entry, index) => {
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Record<string, unknown>;
    const url = typeof value.url === "string" ? value.url.trim() : "";
    const mime = safeMime(value.mime, url);
    if (!UPLOAD_PATH.test(url) || !mime) return [];

    const rawId = typeof value.id === "string" ? value.id.trim() : "";
    const id = /^[a-zA-Z0-9_-]{1,80}$/.test(rawId) ? rawId : `certificate-${index + 1}`;
    const rawTitle = typeof value.title === "string" ? value.title.trim() : "";
    const title = (rawTitle || `সার্টিফিকেট ${index + 1}`).slice(0, 160);
    return [{ id, title, url, mime }];
  });
}

export function validateMemberCertificates(input: unknown):
  | { certificates: MemberCertificate[] }
  | { error: string } {
  if (!Array.isArray(input) || input.length > MAX_MEMBER_CERTIFICATES) {
    return { error: `একজন সদস্যের জন্য সর্বোচ্চ ${MAX_MEMBER_CERTIFICATES}টি সার্টিফিকেট যোগ করা যাবে` };
  }
  const certificates = normalizeMemberCertificates(input);
  if (certificates.length !== input.length) {
    return { error: "সার্টিফিকেটের ফাইল বা তথ্য সঠিক নয়" };
  }
  if (certificates.some((certificate) => !certificate.title.trim())) {
    return { error: "প্রতিটি সার্টিফিকেটের নাম লিখুন" };
  }
  return { certificates };
}
