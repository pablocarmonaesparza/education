"use client";

import { AppleButton } from "./AppleButton";
import { cn } from "./utils";

export interface AppleTabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export function AppleTabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  items: AppleTabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex max-w-full gap-1 overflow-x-auto rounded-[var(--radius-md)] bg-[var(--surface-2)] p-1",
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <AppleButton
            key={item.id}
            role="tab"
            aria-selected={selected}
            tone={selected ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              // Los tabs son labels, no CTAs: peso 700 uniforme (el tone
              // secondary v2 traería extrabold y border-2 — aquí se pinnea
              // border 1px para que el pill seleccionado no sea 2px más ancho
              // que sus hermanos ghost). Sin labio: secondary/ghost no lo llevan.
              "h-9 min-h-9 whitespace-nowrap px-3 ts-subhead font-bold",
              selected
                ? "border border-[var(--border-strong)] bg-[var(--surface)] shadow-xs"
                : "text-[var(--text-secondary)]",
            )}
            onPress={() => onChange(item.id)}
          >
            {item.label}
            {item.badge !== undefined && (
              <span className="ml-2 rounded-full bg-[var(--surface-3)] px-1.5 ts-caption-1 text-[var(--text-tertiary)]">
                {item.badge}
              </span>
            )}
          </AppleButton>
        );
      })}
    </div>
  );
}
