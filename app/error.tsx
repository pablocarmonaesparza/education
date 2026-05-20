"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SimuladorProviders } from "./(app)/providers";
import {
  AppleButton,
  AppleErrorState,
} from "@/components/simulador/apple";
import "./(app)/simulador.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[itera:error-boundary]", error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="simulador-root min-h-screen surface-canvas">
          <SimuladorProviders>
            <main className="grid min-h-screen place-items-center px-6">
              <div className="w-full max-w-lg">
                <AppleErrorState
                  title="Algo falló en esta pantalla."
                  body="Tu sesión no se perdió. Intenta recargar la vista; si vuelve a pasar, regresa al dashboard."
                  actionLabel="Reintentar"
                  onAction={reset}
                />
                <div className="mt-4 flex justify-center">
                  <AppleButton as={Link} href="/dashboard" tone="ghost">
                    Volver al dashboard
                  </AppleButton>
                </div>
              </div>
            </main>
          </SimuladorProviders>
        </div>
      </body>
    </html>
  );
}
