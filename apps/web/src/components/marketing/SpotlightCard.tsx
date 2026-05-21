"use client";

import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

import { useSpotlightCard } from "./useSpotlightCard";

export function SpotlightCard({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const { ref, onMouseMove } = useSpotlightCard<HTMLDivElement>();

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn("spotlight-card rounded-xl border border-border/80", className)}
      {...props}
    >
      {children}
    </div>
  );
}
