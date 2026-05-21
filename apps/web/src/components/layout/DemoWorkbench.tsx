import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DemoWorkbench({
  controls,
  primary,
  secondary,
  footer,
  className,
}: {
  controls: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-3">{controls}</div>
        <div className="space-y-4 lg:col-span-6">{primary}</div>
        {secondary ? (
          <div className="space-y-4 lg:col-span-3">{secondary}</div>
        ) : null}
      </div>
      {footer ? <div>{footer}</div> : null}
    </div>
  );
}
