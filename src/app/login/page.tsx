import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getMemberSession } from "@/lib/auth";

export const metadata: Metadata = { title: "সদস্য লগইন" };

export default async function LoginPage() {
  const session = await getMemberSession();
  if (session) redirect("/portal");
  return (
    <div className="relative grid min-h-[80vh] place-items-center px-5 pb-16 pt-32">
      <div className="ambient left-[15%] top-32 size-72 bg-blue/30" />
      <div className="ambient right-[15%] bottom-20 size-72 bg-teal/30" />
      <LoginForm
        endpoint="/api/member-auth"
        redirectTo="/portal"
        title="সদস্য পোর্টাল"
        subtitle="স্কুলের অনুমোদিত সদস্যদের জন্য বিশেষ এলাকা"
      />
    </div>
  );
}
