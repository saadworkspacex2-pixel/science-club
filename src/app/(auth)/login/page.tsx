import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { getBranding } from "@/lib/settings";
import LoginForm from "@/components/login-form";

export const dynamic = "force-dynamic";

export const metadata = { title: "সদস্য লগইন", robots: { index: false, follow: false } };

export default async function MemberLoginPage() {
  const session = await getSession();
  if (isStaff(session)) redirect("/admin");
  if (session) redirect("/profile");
  const branding = await getBranding();
  return <LoginForm mode="member" hint={{ u: "student", p: "student123" }} clubLogo={branding.clubLogo} clubName={branding.clubName} />;
}
