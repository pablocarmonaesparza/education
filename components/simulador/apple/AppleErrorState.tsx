"use client";

import { AppleButton } from "./AppleButton";
import { AppleCard, AppleCardBody } from "./AppleCard";
import { AppleIcon } from "./AppleIcon";

export function AppleErrorState({
  title = "No pudimos cargar esto.",
  body,
  actionLabel = "Intentar de nuevo",
  onAction,
}: {
  title?: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <AppleCard variant="danger">
      <AppleCardBody className="flex flex-col items-start gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--band-b-bg)] text-[var(--band-b-text)]">
          <AppleIcon name="alert" size="md" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
            {title}
          </h2>
          {body && (
            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--text-secondary)]">
              {body}
            </p>
          )}
        </div>
        {onAction && (
          <AppleButton tone="secondary" size="sm" onPress={onAction}>
            {actionLabel}
          </AppleButton>
        )}
      </AppleCardBody>
    </AppleCard>
  );
}
