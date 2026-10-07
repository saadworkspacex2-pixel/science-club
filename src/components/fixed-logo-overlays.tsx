"use client";

import { usePathname } from "next/navigation";
import type { FixedLogoPlacement } from "@/lib/branding-config";

function matchesPage(pathname: string, target: FixedLogoPlacement["page"]) {
  if (target === "*") return true;
  if (target === "/") return pathname === "/";
  return pathname === target || pathname.startsWith(`${target}/`);
}

export default function FixedLogoOverlays({ placements }: { placements: FixedLogoPlacement[] }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return null;
  const visible = placements.filter((placement) => matchesPage(pathname, placement.page));

  if (visible.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[55]">
      {visible.map((placement) => (
        <img
          key={placement.id}
          src={placement.url}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute rounded-lg object-contain drop-shadow-sm"
          style={{
            left: `${placement.x}vw`,
            top: `${placement.y}vh`,
            width: `${placement.size}px`,
            height: `${placement.size}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  );
}
