/**
 * Glyphs y micro-componentes visuales para el composer rico.
 *
 * Extraído del monolito `ExerciseLabClient.tsx` (Codex). Sin cambios.
 */

"use client";

import type { BrandKey, Level5 } from "./types";
import { brandLogo } from "./models";

export function BrandMark({ brand }: { brand: BrandKey }) {
  const logo = brandLogo[brand];
  if (!logo) {
    return (
      <span
        className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md bg-[var(--text-primary)] text-[var(--surface)]"
        aria-hidden
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
          <path
            d="M8 2L13 4v4.5C13 11 11 13 8 14C5 13 3 11 3 8.5V4L8 2Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </span>
    );
  }

  return (
    <span className="grid h-[22px] w-[22px] shrink-0 place-items-center" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.light}
        alt=""
        width={22}
        height={22}
        className={logo.dark ? "block dark:hidden" : "block"}
        style={{ width: 22, height: 22, objectFit: "contain" }}
      />
      {logo.dark && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo.dark}
          alt=""
          width={22}
          height={22}
          className="hidden dark:block"
          style={{ width: 22, height: 22, objectFit: "contain" }}
        />
      )}
    </span>
  );
}

export function LevelMeter({ value, ariaLabel }: { value: Level5; ariaLabel: string }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-label={`${ariaLabel} ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className="block w-[2.5px] rounded-[var(--radius-xs)] transition-colors"
          style={{
            height: `${3 + level * 1.6}px`,
            backgroundColor: level <= value ? "currentColor" : "var(--border-strong)",
            opacity: level <= value ? 1 : 0.5,
          }}
        />
      ))}
    </span>
  );
}

export function MicGlyph() {
  return (
    <svg className="relative h-4 w-4" viewBox="0 0 16 16" fill="none">
      <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 8C3 10.7614 5.23858 13 8 13M8 13C10.7614 13 13 10.7614 13 8M8 13V14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function PlusGlyph() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 3.5V12.5M3.5 8H12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function AttachmentGlyph({ type }: { type: string }) {
  const isImage = type.startsWith("image/");

  if (isImage) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
        <rect x="2.5" y="3" width="11" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M4.5 10.8L6.6 8.6L8.2 10.1L9.7 8.4L11.8 10.8"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.4"
        />
        <circle cx="10.8" cy="5.8" r="1" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5 2.5H9.2L12 5.3V12.5C12 13.05 11.55 13.5 11 13.5H5C4.45 13.5 4 13.05 4 12.5V3.5C4 2.95 4.45 2.5 5 2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
      <path d="M9.2 2.7V5.3H11.8" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
    </svg>
  );
}

export function SparkGlyph() {
  return (
    <svg className="h-2.5 w-2.5" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" />
    </svg>
  );
}

export function WaveBars() {
  return (
    <span className="inline-flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className="block w-[2px] rounded-[var(--radius-xs)] bg-[var(--band-b-bar)]"
          style={{
            height: "100%",
            animation: `simulador-wave 0.9s ease-in-out ${index * 0.12}s infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
      <style>{`
        @keyframes simulador-wave {
          0%, 100% { transform: scaleY(0.35); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </span>
  );
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;
  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`;
}
