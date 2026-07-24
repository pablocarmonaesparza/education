"use client";

import type { ReactNode } from "react";
import { AppleStepBar } from "./AppleStepBar";
import { cn } from "./utils";

export interface AppleCaseHeaderProps {
  total: number;
  current: number;
  /** Si se da, "Cerrar" es un link; si no, usa onClose. */
  closeHref?: string;
  onClose?: () => void;
  onPrev?: () => void;
  prevDisabled?: boolean;
  onNext?: () => void;
  nextDisabled?: boolean;
  onFeedback?: () => void;
  ariaLabel?: string;
  className?: string;
}

const NAV_BASE =
  "grid h-12 w-12 place-items-center rounded-[var(--radius-md)] border transition-colors";
const NAV_ENABLED =
  "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]";
const NAV_DISABLED = "border-[var(--surface-3)] text-[var(--text-disabled)] cursor-not-allowed";

/**
 * AppleCaseHeader — chrome del player de casos: botones cuadrados Cerrar (X) +
 * Atrás (‹) a la izquierda, `AppleStepBar` al centro, Adelante (›) + feedback a
 * la derecha. Extraído del runtime de case-demo; cada control es opcional.
 * Hereda los tokens de color del ancestro `.simulador-root`.
 */
export function AppleCaseHeader({
  total,
  current,
  closeHref,
  onClose,
  onPrev,
  prevDisabled = false,
  onNext,
  nextDisabled = false,
  onFeedback,
  ariaLabel,
  className,
}: AppleCaseHeaderProps) {
  const hasClose = Boolean(closeHref || onClose);
  const hasLeft = hasClose || Boolean(onPrev);
  const hasRight = Boolean(onNext) || Boolean(onFeedback);
  return (
    <div className={cn("pt-6 pb-6", className)}>
      {/* Mismo ancho responsivo que el runtime: 65% fijo aplastaba el header en mobile */}
      <div className="mx-auto flex w-[92%] max-w-[1200px] items-center gap-4 sm:w-[80%] lg:w-[65%]">
        {hasLeft && (
          <div className="flex items-center gap-2">
            {hasClose &&
              (closeHref ? (
                <a
                  href={closeHref}
                  aria-label="Close case"
                  className={cn(NAV_BASE, NAV_ENABLED)}
                >
                  <Glyph path="M6 6L18 18M18 6L6 18" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close case"
                  className={cn(NAV_BASE, NAV_ENABLED)}
                >
                  <Glyph path="M6 6L18 18M18 6L6 18" />
                </button>
              ))}
            {onPrev && (
              <NavButton onClick={onPrev} disabled={prevDisabled} label="Previous slide">
                <Glyph path="M15 6L9 12L15 18" />
              </NavButton>
            )}
          </div>
        )}
        <AppleStepBar
          total={total}
          current={current}
          className="flex-1"
          ariaLabel={ariaLabel ?? "Progress"}
        />
        {hasRight && (
          <div className="flex items-center gap-2">
            {onNext && (
              <NavButton
                onClick={onNext}
                disabled={nextDisabled}
                label="Next slide"
              >
                <Glyph path="M9 6L15 12L9 18" />
              </NavButton>
            )}
            {onFeedback && (
              <button
                type="button"
                onClick={onFeedback}
                aria-label="Send a suggestion or correction"
                className={cn(NAV_BASE, NAV_ENABLED)}
              >
                <Glyph path="M21 11.5a8.4 8.4 0 0 1-0.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-0.9L3 21l1.9-5.7a8.4 8.4 0 0 1-0.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-0.9h0.5a8.5 8.5 0 0 1 8 8v0.5z" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(NAV_BASE, disabled ? NAV_DISABLED : NAV_ENABLED)}
    >
      {children}
    </button>
  );
}

function Glyph({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d={path}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
