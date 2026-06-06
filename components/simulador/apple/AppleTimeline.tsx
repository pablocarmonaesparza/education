"use client";

import { cn } from "./utils";

export interface AppleTimelineEvent {
  when: string;
  what: string;
  who?: string;
  emphasis?: boolean;
}

/**
 * AppleTimeline — línea de tiempo vertical (dots + eventos cronológicos).
 * Extraída del bloque reading_timeline; el bloque la consume. El último evento
 * (o cualquiera con `emphasis`) va en acento. Hereda tokens de `.simulador-root`.
 */
export function AppleTimeline({
  events,
  className,
}: {
  events: AppleTimelineEvent[];
  className?: string;
}) {
  return (
    <ol className={cn("relative", className)}>
      {events.map((event, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li key={idx} className="relative grid grid-cols-[64px_1fr] gap-4">
            <div className="relative flex flex-col items-end pt-1">
              <span
                className={`ts-caption-1 font-medium tabular-nums ${
                  event.emphasis
                    ? "text-[var(--accent)]"
                    : "text-[var(--text-tertiary)]"
                }`}
              >
                {event.when}
              </span>
            </div>
            <div className={`relative pb-6 ${isLast ? "pb-0" : ""}`}>
              {!isLast && (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-3 bottom-0 w-px bg-[var(--hairline)]"
                />
              )}
              <span
                aria-hidden
                className={`absolute left-0 top-2 grid h-[11px] w-[11px] place-items-center rounded-full border-2 ${
                  event.emphasis
                    ? "border-[var(--accent)] bg-[var(--accent)]"
                    : "border-[var(--text-tertiary)] bg-[var(--surface)]"
                }`}
              />
              <div className="pl-5">
                <div
                  className={`ts-body ${
                    event.emphasis
                      ? "font-semibold text-[var(--text-primary)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {event.what}
                </div>
                {event.who && (
                  <div className="mt-0.5 ts-footnote text-[var(--text-tertiary)]">
                    {event.who}
                  </div>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
