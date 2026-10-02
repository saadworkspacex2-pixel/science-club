import Link from "next/link";
import { Megaphone } from "lucide-react";

export type TickerItem = { id: number; title: string };

export default function NewsTicker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;
  const doubled = [...items, ...items, ...items];
  return (
    <div className="marquee-paused relative overflow-hidden py-2">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-3 sm:px-5">
        <Link
          href="/news"
          className="glass z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold text-blue shadow-md sm:text-sm"
        >
          <Megaphone className="size-4 animate-pulse" />
          <span className="hidden sm:inline">সর্বশেষ ঘোষণা</span>
          <span className="sm:hidden">ঘোষণা</span>
        </Link>
        <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
          <div className="marquee-track gap-10">
            {doubled.map((n, i) => (
              <Link
                key={`${n.id}-${i}`}
                href="/news"
                className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-blue dark:text-white/65"
              >
                <span className="size-1.5 rounded-full bg-blue/70" />
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
