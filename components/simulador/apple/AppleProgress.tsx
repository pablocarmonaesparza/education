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
        // h-2: barra chunky v2 (size="sm" de HeroUI es h-1, la estética vieja ultra-fina)
        track: cn("h-2 bg-[var(--surface-3)]", classNames?.track),
        indicator: cn("accent-bg", classNames?.indicator),
        label: cn("ts-subhead text-[var(--text-secondary)]", classNames?.label),
        value: cn("ts-subhead text-[var(--text-secondary)]", classNames?.value),
      }}
    />
  );
}
