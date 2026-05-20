import type { ReactNode } from "react";
import { AppleCard, AppleCardBody } from "./AppleCard";

export function AppleEmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <AppleCard>
      <AppleCardBody className="flex flex-col items-center p-8 text-center">
        {icon ? <div className="mb-5 text-[var(--text-tertiary)]">{icon}</div> : null}
        <h2 className="text-[22px] font-semibold tracking-[-0.022em] text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-2 max-w-md text-[15px] leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
        {action ? <div className="mt-6">{action}</div> : null}
      </AppleCardBody>
    </AppleCard>
  );
}
