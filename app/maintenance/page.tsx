"use client";

import Link from "next/link";
import { SimuladorProviders } from "../(app)/providers";
import {
  AppleButton,
  AppleCard,
  AppleCardBody,
  AppleIcon,
} from "@/components/simulador/apple";
import "../(app)/simulador.css";

export default function MaintenancePage() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <main className="grid min-h-screen place-items-center px-6">
          <AppleCard className="w-full max-w-xl">
            <AppleCardBody className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                <AppleIcon name="settings" size="lg" />
              </div>
              <div className="eyebrow mt-6">Mantenimiento</div>
              <h1 className="display display-tight mt-3 text-[34px] text-[var(--text-primary)]">
                Estamos ajustando el simulador.
              </h1>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                Volvemos en unos minutos. Si ya estabas completando un caso, tu
                progreso se guarda automáticamente.
              </p>
              <div className="mt-8">
                <AppleButton as={Link} href="/" tone="secondary">
                  Volver al inicio
                </AppleButton>
              </div>
            </AppleCardBody>
          </AppleCard>
        </main>
      </SimuladorProviders>
    </div>
  );
}
