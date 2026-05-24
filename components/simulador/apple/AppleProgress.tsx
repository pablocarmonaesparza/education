"use client";

import { Progress, type ProgressProps } from "@heroui/react";
import { cn } from "./utils";

export function AppleProgress({ classNames, ...props }: ProgressProps) {
  return (
    <Progress
      radius="full"
      size="sm"
      {...props}
      classNames={{
        base: cn("max-w-full", classNames?.base),
        track: cn("bg-[var(--surface-3)]", classNames?.track),
        indicator: cn("accent-bg", classNames?.indicator),
        label: cn("text-[13px] text-[var(--text-secondary)]", classNames?.label),
        value: cn("text-[13px] text-[var(--text-secondary)]", classNames?.value),
      }}
    />
  );
}
