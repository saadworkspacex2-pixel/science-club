export function safeExternalWebUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Only allow known map providers in iframe embeds. */
export function safeMapEmbedUrl(value: unknown): string | null {
  const href = safeExternalWebUrl(value);
  if (!href) return null;

  try {
    const url = new URL(href);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    const isGoogle = host === "google.com" || host.endsWith(".google.com");
    if (isGoogle && /^\/maps\/embed(?:\/|$)/.test(url.pathname)) return url.toString();
    if (host === "www.openstreetmap.org" && url.pathname === "/export/embed.html") {
      return url.toString();
    }
    return null;
  } catch {
    return null;
  }
}
