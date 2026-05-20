"use client";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  type CardProps,
} from "@heroui/react";
import { cn } from "./utils";

type AppleCardVariant =
  | "default"
  | "elevated"
  | "interactive"
  | "success"
  | "warning"
  | "danger";

type AppleCardPadding = "none" | "sm" | "md" | "lg";

const variantClass: Record<AppleCardVariant, string> = {
  default: "bg-[var(--surface)]",
  elevated: "bg-[var(--surface)] shadow-[var(--shadow-md)]",
  interactive: "card-apple-interactive bg-[var(--surface)] cursor-pointer",
  success: "bg-[var(--band-a-bg)] border-[var(--band-a-text)]/25",
  warning: "bg-[var(--band-m-bg)] border-[var(--band-m-text)]/25",
  danger: "bg-[var(--band-b-bg)] border-[var(--band-b-text)]/25",
};

const paddingClass: Record<AppleCardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function AppleCard({
  className,
  isPressable,
  variant = "default",
  padding = "none",
  ...props
}: CardProps & {
  variant?: AppleCardVariant;
  padding?: AppleCardPadding;
}) {
  const pressable = isPressable;
  return (
    <Card
      shadow="none"
      radius="lg"
      isPressable={pressable}
      {...props}
      className={cn(
        "card-apple text-[var(--text-primary)]",
        variantClass[variant],
        paddingClass[padding],
        pressable && "transition-transform active:scale-[0.99]",
        className,
      )}
    />
  );
}

export { CardBody as AppleCardBody };
export { CardHeader as AppleCardHeader };
export { CardFooter as AppleCardFooter };
