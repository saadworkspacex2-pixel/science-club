"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "লাইট মোড" : "ডার্ক মোড"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`glass group relative grid h-10 w-10 place-items-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95 ${className}`}
    >
      <span
        className={`absolute transition-all duration-500 ease-spring ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      >
        <SunMedium className="h-[18px] w-[18px] text-amber-500" />
      </span>
      <span
        className={`absolute transition-all duration-500 ease-spring ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      >
        <Moon className="h-[17px] w-[17px] text-sky-400" />
      </span>
    </button>
  );
}
