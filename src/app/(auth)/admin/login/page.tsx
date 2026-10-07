import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { getBranding } from "@/lib/settings";
import LoginForm from "@/components/login-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "অ্যাডমিন লগইন", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (isStaff(session)) redirect("/admin");
  if (session) redirect("/profile");
  const branding = await getBranding();
  return <LoginForm mode="admin" hint={{ u: "admin", p: "admin123" }} clubLogo={branding.clubLogo} clubName={branding.clubName} />;
}
