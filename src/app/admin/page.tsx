import type { Metadata } from "next";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import LoginForm from "@/components/login-form";
import AdminDashboard from "@/components/admin/dashboard";

export const metadata: Metadata = {
  title: "অ্যাডমিন প্যানেল",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    return (
      <div className="relative grid min-h-[85vh] place-items-center px-5 pb-16 pt-28">
        <div className="ambient left-[12%] top-32 size-72 bg-blue/30" />
        <div className="ambient bottom-16 right-[12%] size-72 bg-teal/30" />
        <LoginForm
          endpoint="/api/admin-auth"
          redirectTo="/admin"
          title="অ্যাডমিন প্যানেল"
          subtitle="ক্লাব ম্যানেজমেন্ট সিস্টেমে প্রবেশ করুন"
        />
      </div>
    );
  }
  const [user] = await db.select().from(users).where(eq(users.id, session.uid));
  return <AdminDashboard name={user?.name || "অ্যাডমিন"} role={session.role} />;
}
