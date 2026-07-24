"use client";

import { Chip, type ChipProps } from "@heroui/react";
import { cn } from "./utils";

type AppleBadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const toneClass: Record<AppleBadgeTone, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
  accent: "accent-bg-soft accent-text",
  success: "bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
  warning: "bg-[var(--band-m-bg)] text-[var(--band-m-text)]",
  danger: "bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
};

export function AppleBadge({
  className,
  tone = "neutral",
  radius = "sm",
  size = "sm",
  pill = false,
  ...props
}: ChipProps & { tone?: AppleBadgeTone; pill?: boolean }) {
  return (
    <Chip
      // pill: chips v2 completamente redondeados; sin pill conserva el radius clásico
      radius={pill ? "full" : radius}
      size={size}
      variant="flat"
      {...props}
      className={cn("px-2 ts-footnote font-bold", toneClass[tone], className)}
    />
  );
}
