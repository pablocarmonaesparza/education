"use client";

/**
 * OnboardingNav — nav minimal para `/onboarding/*`.
 *
 * Sólo el logo Itera. Sin link "Dashboard" (no aplica al onboarding —
 * el user aún no ha terminado el flujo). Background transparent que
 * hereda del surface-canvas del padre, no la barra blur de HeroUI
 * Navbar que se veía como un strip distinto.
 */

import Image from "next/image";
import Link from "next/link";

export function OnboardingNav() {
  return (
    <nav className="w-full">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-6">
        <Link href="/" className="flex items-center" aria-label="Inicio">
          <Image
            src="/images/itera-logo-light.png"
            alt="Itera"
            width={64}
            height={32}
            className="h-6 w-auto"
            priority
          />
        </Link>
      </div>
    </nav>
  );
}
