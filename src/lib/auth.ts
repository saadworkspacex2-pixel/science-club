import { cookies } from "next/headers";
import { createHmac } from "crypto";
import bcrypt from "bcryptjs";
import "@/lib/env"; // durable env overrides (SESSION_SECRET)

const COOKIE = "sc_session";
const SECRET = process.env.SESSION_SECRET || "sc-dev-secret-change-me";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "super_admin" | "superadmin" | "editor" | "member";

export type Session = {
  u: string; // username
  r: Role;
  n: string; // display name
  mid: number | null; // linked member id
};

function sign(payload: string) {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  try {
    return bcrypt.compareSync(password, hash);
  } catch {
    return false;
  }
}

export function encodeSession(session: Session) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}

export async function setSessionCookie(session: Session) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function isStaff(session: Session | null) {
  return (
    !!session &&
    (session.r === "superadmin" || session.r === "super_admin" || session.r === "editor")
  );
}

export function roleLabel(r: string) {
  return r === "superadmin" || r === "super_admin"
    ? "সুপার অ্যাডমিন"
    : r === "editor"
      ? "এডিটর"
      : "সদস্য";
}
