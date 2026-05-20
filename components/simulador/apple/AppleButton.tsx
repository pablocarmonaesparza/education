"use client";

import { Button, type ButtonProps } from "@heroui/react";
import { cn } from "./utils";

type AppleButtonTone =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive";

const toneClass: Record<AppleButtonTone, string> = {
  primary:
    "accent-bg text-white border border-transparent hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
  secondary:
    "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
  ghost:
    "bg-transparent text-[var(--text-primary)] border border-transparent hover:bg-[var(--surface-3)]",
  danger:
    "bg-[var(--band-b-bar)] text-white border border-transparent hover:opacity-95",
  destructive:
    "bg-[var(--band-b-bar)] text-white border border-transparent hover:opacity-95",
};

export function AppleButton({
  className,
  tone = "primary",
  radius = "sm",
  size = "md",
  ...props
}: ButtonProps & { tone?: AppleButtonTone }) {
  return (
    <Button
      radius={radius}
      size={size}
      {...props}
      className={cn(
        "min-h-11 px-4 text-[15px] font-medium shadow-none transition-[transform,opacity,background-color,border-color] duration-[var(--motion-fast)] ease-[var(--motion-ease)] active:scale-[0.98] active:opacity-95 disabled:scale-100",
        toneClass[tone],
        className,
      )}
    />
  );
}
