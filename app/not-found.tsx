"use client";

import Link from "next/link";
import { SimuladorProviders } from "./(app)/providers";
import { AppleButton, AppleIcon } from "@/components/simulador/apple";
import "./(app)/simulador.css";

export default function NotFound() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <main className="px-6 py-16 min-h-screen flex items-center justify-center">
          <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
            <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--surface-3)]">
              <AppleIcon
                name="search"
                size="lg"
                className="text-[var(--text-secondary)]"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
                No encontramos esta pantalla
              </h1>
              <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
                El simulador ya está en su nueva estructura. Vuelve al inicio o
                entra a tu dashboard.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <AppleButton as={Link} href="/" tone="primary" className="w-full">
                Volver al inicio
              </AppleButton>
              <AppleButton
                as={Link}
                href="/dashboard"
                tone="secondary"
                className="w-full"
              >
                Ir al dashboard
              </AppleButton>
            </div>
          </div>
        </main>
      </SimuladorProviders>
    </div>
  );
}
