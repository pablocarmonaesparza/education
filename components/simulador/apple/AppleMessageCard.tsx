"use client";

import type { ReactNode } from "react";
import { cn } from "./utils";

export type AppleMessageChannel = "email" | "chat" | "ticket";

export interface AppleMessageCardProps {
  channel: AppleMessageChannel;
  from: { name: string; role?: string };
  to?: { name: string; role?: string };
  timestamp: string;
  subject?: string;
  body: string;
  className?: string;
}

/**
 * AppleMessageCard — tarjeta de email/chat/ticket (header de canal + from/to con
 * avatar + subject + body con **negritas** inline). Extraída del bloque
 * reading_message; el bloque la consume. Hereda tokens de `.simulador-root`.
 */
export function AppleMessageCard({
  channel,
  from,
  to,
  timestamp,
  subject,
  body,
  className,
}: AppleMessageCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-3">
        <span className="ts-caption-1 font-medium text-[var(--text-tertiary)]">
          {channelLabel(channel)}
        </span>
        <span className="ts-caption-1 text-[var(--text-tertiary)] tabular-nums">{timestamp}</span>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <div
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] ts-callout font-semibold text-[var(--accent)]"
          aria-hidden
        >
          {initials(from.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="ts-body font-medium text-[var(--text-primary)]">{from.name}</span>
            {from.role && (
              <span className="ts-caption-1 text-[var(--text-tertiary)]">· {from.role}</span>
            )}
          </div>
          {to && (
            <div className="mt-0.5 ts-caption-1 text-[var(--text-tertiary)]">
              Para: {to.name}
              {to.role && ` · ${to.role}`}
            </div>
          )}
        </div>
      </div>

      {subject && (
        <div className="mt-4 ts-callout font-semibold text-[var(--text-primary)]">{subject}</div>
      )}

      <div className="mt-3 ts-body leading-[1.6] text-[var(--text-secondary)] whitespace-pre-wrap">
        {renderInlineBold(body)}
      </div>
    </div>
  );
}

function channelLabel(channel: AppleMessageChannel): string {
  switch (channel) {
    case "email":
      return "Email";
    case "chat":
      return "Chat";
    case "ticket":
      return "Ticket";
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function renderInlineBold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--text-primary)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
