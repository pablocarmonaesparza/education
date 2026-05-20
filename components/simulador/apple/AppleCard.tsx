"use client";

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  type CardProps,
} from "@heroui/react";
import { cn } from "./utils";

export function AppleCard({
  className,
  isPressable,
  ...props
}: CardProps) {
  return (
    <Card
      shadow="none"
      radius="lg"
      isPressable={isPressable}
      {...props}
      className={cn(
        "card-apple bg-[var(--surface)] text-[var(--text-primary)]",
        isPressable &&
          "card-apple-interactive transition-transform active:scale-[0.99]",
        className,
      )}
    />
  );
}

export { CardBody as AppleCardBody };
export { CardHeader as AppleCardHeader };
export { CardFooter as AppleCardFooter };
