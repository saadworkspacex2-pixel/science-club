import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET =
  process.env.AUTH_SECRET || "busssc-science-club-dev-secret-change-in-prod";

function hmac(data: string) {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

export function createToken(payload: Record<string, unknown>, maxAgeSec: number) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + maxAgeSec * 1000 })
  ).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifyToken<T = Record<string, unknown>>(
  token: string | undefined
): (T & { exp: number }) | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || hmac(body) !== sig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

// ---------- Admin ----------
export async function setAdminSession(userId: number, role: string) {
  const c = await cookies();
  c.set("sc_admin", createToken({ uid: userId, role }, 60 * 60 * 24 * 7), {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const c = await cookies();
  c.delete("sc_admin");
}

export async function getAdminSession(): Promise<{
  uid: number;
  role: string;
} | null> {
  const c = await cookies();
  return verifyToken<{ uid: number; role: string }>(c.get("sc_admin")?.value);
}

// ---------- Member ----------
export async function setMemberSession(memberId: number, accountId: number) {
  const c = await cookies();
  c.set("sc_member", createToken({ mid: memberId, aid: accountId }, 60 * 60 * 24 * 30), {
    ...COOKIE_OPTS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearMemberSession() {
  const c = await cookies();
  c.delete("sc_member");
}

export async function getMemberSession(): Promise<{
  mid: number;
  aid: number;
} | null> {
  const c = await cookies();
  return verifyToken<{ mid: number; aid: number }>(c.get("sc_member")?.value);
}
