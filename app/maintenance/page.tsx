"use client";

import Link from "next/link";
import { SimuladorProviders } from "../(app)/providers";
import { AppleButton, AppleIcon } from "@/components/simulador/apple";
import "../(app)/simulador.css";

export default function MaintenancePage() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <main className="px-6 py-16 min-h-screen flex items-center justify-center">
          <div className="max-w-[400px] w-full mx-auto text-center flex flex-col items-center gap-6">
            <div className="h-14 w-14 rounded-full grid place-items-center bg-[var(--accent-soft)] text-[var(--accent)]">
              <AppleIcon name="settings" size="lg" />
            </div>
            <div className="flex flex-col gap-3">
              <h1 className="display display-tight ts-title-1 sm:ts-display leading-[1.1] text-[var(--text-primary)]">
                Estamos ajustando el simulador
              </h1>
              <p className="ts-body leading-[1.55] text-[var(--text-secondary)]">
                Volvemos en unos minutos. Si ya estabas completando un caso, tu
                progreso se guarda automáticamente.
              </p>
            </div>
            <AppleButton as={Link} href="/" tone="secondary" className="w-full">
              Volver al inicio
            </AppleButton>
          </div>
        </main>
      </SimuladorProviders>
    </div>
  );
}
