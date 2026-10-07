import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { getSession, isStaff } from "@/lib/auth";
import { getBranding } from "@/lib/settings";
import AdminShell from "@/components/admin/shell";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!isStaff(session)) redirect("/admin/login");

  const [pendingRows, branding] = await Promise.all([
    db
      .select({ c: count() })
      .from(applications)
      .where(eq(applications.status, "pending")),
    getBranding(),
  ]);
  const pending = pendingRows[0]?.c ?? 0;

  return (
    <AdminShell
      userName={session!.n}
      role={session!.r}
      pending={pending}
      clubLogo={branding.clubLogo}
      clubName={branding.clubName}
    >
      {children}
    </AdminShell>
  );
}
