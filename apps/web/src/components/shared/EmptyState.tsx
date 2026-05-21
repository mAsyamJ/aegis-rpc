import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceCard } from "@/components/shared/SurfaceCard";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <SurfaceCard
      className={cn(
        "grid min-h-[14rem] place-items-center border-dashed p-8 text-center",
        className,
      )}
      padding="none"
    >
      <div className="max-w-md space-y-4">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        {(primaryHref || secondaryHref) && (
          <div className="flex flex-wrap justify-center gap-2">
            {primaryHref && primaryLabel ? (
              <Button asChild className="bg-aegis text-aegis-foreground hover:bg-aegis/90">
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
            ) : null}
            {secondaryHref && secondaryLabel ? (
              <Button asChild variant="outline">
                <Link href={secondaryHref}>{secondaryLabel}</Link>
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </SurfaceCard>
  );
}
