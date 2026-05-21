"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type DemoStep = {
  id: string;
  label: string;
  description?: string;
};

export function DemoStepper({
  steps,
  activeIndex,
  completedThrough,
  orientation = "vertical",
  className,
  size = "default",
}: {
  steps: DemoStep[];
  activeIndex: number;
  completedThrough?: number;
  orientation?: "vertical" | "horizontal";
  className?: string;
  size?: "default" | "lg";
}) {
  const done = completedThrough ?? activeIndex - 1;

  if (orientation === "horizontal") {
    return (
      <ol
        className={cn(
          "flex flex-wrap items-center gap-2 text-xs",
          className,
        )}
      >
        {steps.map((step, i) => {
          const isComplete = i <= done;
          const isActive = i === activeIndex;
          return (
            <li key={step.id} className="flex items-center gap-2">
              <StepDot complete={isComplete} active={isActive} index={i + 1} size={size} />
              <span
                className={cn(
                  "font-medium",
                  isActive ? "text-aegis" : isComplete ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {i < steps.length - 1 ? (
                <span className="text-muted-foreground/40">→</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className={cn("space-y-0", className)}>
      {steps.map((step, i) => {
        const isComplete = i <= done;
        const isActive = i === activeIndex;
        return (
          <li key={step.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <StepDot complete={isComplete} active={isActive} index={i + 1} size={size} />
              {i < steps.length - 1 ? (
                <span
                  className={cn(
                    "my-1 w-px flex-1 min-h-[1.25rem]",
                    isComplete ? "bg-aegis/40" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-4", i === steps.length - 1 && "pb-0")}>
              <div
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-aegis" : isComplete ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </div>
              {step.description ? (
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StepDot({
  complete,
  active,
  index,
  size = "default",
}: {
  complete: boolean;
  active: boolean;
  index: number;
  size?: "default" | "lg";
}) {
  const lg = size === "lg";
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-semibold",
        lg ? "h-9 w-9 text-xs" : "h-7 w-7 text-[11px]",
        complete && "border-aegis/50 bg-aegis/20 text-aegis",
        active &&
          !complete &&
          "border-aegis bg-aegis/15 text-aegis shadow-[0_0_14px_3px_color-mix(in_oklab,var(--aegis-glow)_60%,transparent)]",
        !complete && !active && "border-border bg-background/60 text-muted-foreground",
      )}
    >
      {complete ? <Check className={cn(lg ? "h-4 w-4" : "h-3.5 w-3.5")} /> : index}
    </span>
  );
}
