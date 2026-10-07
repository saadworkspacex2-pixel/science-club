"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      }}
      className="btn-glass !px-4 !py-2.5 text-[13px]"
    >
      <LogOut className="h-4 w-4 text-red-500" /> লগআউট
    </button>
  );
}
