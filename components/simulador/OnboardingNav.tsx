"use client";

/**
 * OnboardingNav — nav minimal para `/onboarding/*`.
 *
 * Marca (mismo patrón AppleLogoMark + wordmark que la landing/PublicNav) +
 * chrome de progreso estilo caso: chevron anterior, AppleStepBar y chevron
 * siguiente. El siguiente sólo se habilita cuando el usuario ya desbloqueó
 * ese paso y volvió hacia atrás.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppleIcon, AppleLogoMark, AppleStepBar, cn } from "./apple";
import {
  getOnboardingUnlockedStep,
  ONBOARDING_ROUTES,
} from "@/lib/simulador/onboarding-progress";

interface OnboardingNavProps {
  progress?: {
    total: number;
    current: number;
    ariaLabel: string;
  };
}

export function OnboardingNav({ progress }: OnboardingNavProps = {}) {
  const router = useRouter();
  const [unlockedStep, setUnlockedStep] = useState(0);

  useEffect(() => {
    function updateUnlockedStep() {
      setUnlockedStep(getOnboardingUnlockedStep());
    }

    updateUnlockedStep();
    window.addEventListener("storage", updateUnlockedStep);
    window.addEventListener("onboarding-progress-updated", updateUnlockedStep);
    return () => {
      window.removeEventListener("storage", updateUnlockedStep);
      window.removeEventListener("onboarding-progress-updated", updateUnlockedStep);
    };
  }, []);

  const current = progress?.current ?? 0;
  const previousRoute = current > 0 ? ONBOARDING_ROUTES[current - 1] : undefined;
  const nextRoute =
    current < ONBOARDING_ROUTES.length - 1
      ? ONBOARDING_ROUTES[current + 1]
      : undefined;
  const canGoPrevious = Boolean(previousRoute);
  const canGoNext = Boolean(nextRoute && unlockedStep > current);

  return (
    <nav className="w-full">
      <div className="mx-auto grid h-20 max-w-7xl grid-cols-[112px_minmax(0,1fr)_112px] items-center px-4 sm:grid-cols-[140px_minmax(0,1fr)_140px] sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 justify-self-start"
          aria-label="Home"
        >
          <AppleLogoMark size={38} />
          <span className="ts-title-2 font-extrabold tracking-[-0.8px] text-[var(--text-primary)]">
            itera<span className="text-[var(--accent)]">.</span>
          </span>
        </Link>

        {progress && (
          <div
            className="col-start-2 flex min-w-0 items-center gap-3"
          >
            <NavChevron
              direction="left"
              disabled={!canGoPrevious}
              label="Previous step"
              onClick={() => {
                if (previousRoute) router.push(previousRoute);
              }}
            />
            <AppleStepBar
              total={progress.total}
              current={progress.current}
              ariaLabel={progress.ariaLabel}
              className="flex-1"
            />
            <NavChevron
              direction="right"
              disabled={!canGoNext}
              label="Next step"
              onClick={() => {
                if (nextRoute) router.push(nextRoute);
              }}
            />
          </div>
        )}
      </div>
    </nav>
  );
}

function NavChevron({
  direction,
  disabled,
  label,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-11 w-11 flex-none place-items-center rounded-[var(--radius-md)] border transition-colors",
        disabled
          ? "cursor-not-allowed border-[var(--surface-3)] text-[var(--text-disabled)]"
          : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]",
      )}
    >
      <AppleIcon
        name={direction === "left" ? "chevronLeft" : "chevronRight"}
        size="md"
      />
    </button>
  );
}
