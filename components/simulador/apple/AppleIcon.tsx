"use client";

import type { ComponentType } from "react";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBrain,
  IconBuilding,
  IconChartBar,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconCreditCard,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconHome,
  IconLoader2,
  IconMail,
  IconMenu2,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconShare,
  IconShieldCheck,
  IconSparkles,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { cn } from "./utils";

type IconComponent = ComponentType<{
  className?: string;
  stroke?: number;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const icons = {
  alert: IconAlertTriangle,
  arrowLeft: IconArrowLeft,
  arrowRight: IconArrowRight,
  bell: IconBell,
  brain: IconBrain,
  building: IconBuilding,
  chart: IconChartBar,
  check: IconCheck,
  chevronDown: IconChevronDown,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  clock: IconClock,
  creditCard: IconCreditCard,
  download: IconDownload,
  external: IconExternalLink,
  fileText: IconFileText,
  home: IconHome,
  loader: IconLoader2,
  mail: IconMail,
  menu: IconMenu2,
  refresh: IconRefresh,
  search: IconSearch,
  settings: IconSettings,
  share: IconShare,
  shield: IconShieldCheck,
  sparkles: IconSparkles,
  user: IconUser,
  users: IconUsers,
  x: IconX,
} satisfies Record<string, IconComponent>;

type AppleIconName = keyof typeof icons;
type AppleIconSize = "xs" | "sm" | "md" | "lg" | "xl";

const sizeClass: Record<AppleIconSize, string> = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export function AppleIcon({
  name,
  size = "md",
  className,
}: {
  name: AppleIconName;
  size?: AppleIconSize;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <Icon
      stroke={1.5}
      aria-hidden="true"
      className={cn("shrink-0", sizeClass[size], className)}
    />
  );
}

export type { AppleIconName, AppleIconSize };
