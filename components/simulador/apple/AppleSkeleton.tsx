"use client";

import { Skeleton, type SkeletonProps } from "@heroui/react";
import { cn } from "./utils";

export function AppleSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      {...props}
      className={cn("rounded-[var(--radius-md)] bg-[var(--surface-2)]", className)}
    />
  );
}
