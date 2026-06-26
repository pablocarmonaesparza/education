"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppleIcon, type AppleIconName } from "./AppleIcon";
import { cn } from "./utils";

export interface AppleSidebarItem {
  href: string;
  label: string;
  icon?: AppleIconName;
  badge?: string | number;
}

export function AppleSidebar({
  title,
  subtitle,
  items,
  footer,
  className,
}: {
  title: string;
  subtitle?: string;
  items: AppleSidebarItem[];
  footer?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden min-h-screen w-[280px] shrink-0 border-r border-[var(--hairline)] bg-[var(--surface)] px-4 py-5 lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="px-2 pb-5">
        <div className="ts-body font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          {title}
        </div>
        {subtitle && (
          <p className="mt-1 ts-subhead leading-[1.4] text-[var(--text-tertiary)]">
            {subtitle}
          </p>
        )}
      </div>

      <nav aria-label={title} className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-[var(--radius-sm)] px-3 ts-callout font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
              )}
            >
              {item.icon && <AppleIcon name={item.icon} size="sm" />}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="rounded-full bg-[var(--surface-3)] px-2 py-0.5 ts-caption-1 text-[var(--text-tertiary)]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {footer && <div className="border-t border-[var(--hairline)] pt-4">{footer}</div>}
    </aside>
  );
}
