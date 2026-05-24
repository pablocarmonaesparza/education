"use client";

import Link from "next/link";
import { SimuladorProviders } from "./(app)/providers";
import { AppleButton, AppleEmptyState, AppleIcon } from "@/components/simulador/apple";
import "./(app)/simulador.css";

export default function NotFound() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <main className="grid min-h-screen place-items-center px-6">
          <AppleEmptyState
            icon={<AppleIcon name="search" size="xl" className="text-[var(--accent)]" />}
            title="No encontramos esta pantalla."
            description="El simulador ya está en su nueva estructura. Vuelve al inicio o entra a tu dashboard."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <AppleButton as={Link} href="/" tone="primary">
                  Volver al inicio
                </AppleButton>
                <AppleButton as={Link} href="/dashboard" tone="secondary">
                  Ir al dashboard
                </AppleButton>
              </div>
            }
          />
        </main>
      </SimuladorProviders>
    </div>
  );
}
