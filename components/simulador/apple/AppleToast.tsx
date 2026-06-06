"use client";

import { AppleIcon } from "./AppleIcon";
import { cn } from "./utils";

type AppleToastTone = "success" | "info" | "warning" | "danger";

const toneClass: Record<AppleToastTone, string> = {
  success: "border-[var(--band-a-text)]/20 bg-[var(--band-a-bg)] text-[var(--band-a-text)]",
  info: "border-[var(--accent)]/20 bg-[var(--accent-soft)] text-[var(--accent)]",
  warning: "border-[var(--band-m-text)]/20 bg-[var(--band-m-bg)] text-[var(--band-m-text)]",
  danger: "border-[var(--band-b-text)]/20 bg-[var(--band-b-bg)] text-[var(--band-b-text)]",
};

const iconName: Record<AppleToastTone, "check" | "bell" | "alert" | "x"> = {
  success: "check",
  info: "bell",
  warning: "alert",
  danger: "x",
};

export function AppleToast({
  title,
  body,
  tone = "info",
  className,
}: {
  title: string;
  body?: string;
  tone?: AppleToastTone;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex max-w-sm items-start gap-3 rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-lg)]",
        toneClass[tone],
        className,
      )}
    >
      <AppleIcon name={iconName[tone]} size="sm" className="mt-0.5" />
      <div>
        <div className="text-[14px] font-semibold">{title}</div>
        {body && <p className="mt-1 text-[13.5px] leading-[1.45] opacity-85">{body}</p>}
      </div>
    </div>
  );
}
