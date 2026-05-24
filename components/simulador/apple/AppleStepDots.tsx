"use client";

import { AppleIcon } from "./AppleIcon";
import { cn } from "./utils";

export interface AppleStepDot {
  id: string;
  label: string;
  status: "completed" | "current" | "locked" | "pending";
}

export function AppleStepDots({
  steps,
  className,
}: {
  steps: AppleStepDot[];
  className?: string;
}) {
  return (
    <ol className={cn("flex items-center gap-2", className)} aria-label="Progreso">
      {steps.map((step, index) => (
        <li key={step.id} className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-semibold",
              step.status === "completed" &&
                "border-[var(--band-a-text)] bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
              step.status === "current" &&
                "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]",
              step.status === "pending" &&
                "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]",
              step.status === "locked" &&
                "border-[var(--hairline)] bg-[var(--surface-2)] text-[var(--text-disabled)]",
            )}
            aria-current={step.status === "current" ? "step" : undefined}
            title={step.label}
          >
            {step.status === "completed" ? (
              <AppleIcon name="check" size="xs" />
            ) : (
              index + 1
            )}
          </span>
          {index < steps.length - 1 && (
            <span className="h-px w-6 bg-[var(--hairline)]" aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}
