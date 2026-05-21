import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ConicCtaButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex overflow-hidden rounded-full p-px focus:outline-none focus-visible:ring-2 focus-visible:ring-aegis focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <span
        className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,color-mix(in_oklab,var(--aegis-glow)_80%,transparent)_0%,var(--aegis)_50%,color-mix(in_oklab,var(--aegis-glow)_80%,transparent)_100%)] opacity-70 transition-opacity group-hover:opacity-100 motion-reduce:animate-none"
        aria-hidden
      />
      <span className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-background px-4 py-1.5 text-xs font-medium text-foreground backdrop-blur-3xl transition-colors group-hover:bg-card">
        {children}
      </span>
    </Link>
  );
}
