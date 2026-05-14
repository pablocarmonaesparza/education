/**
 * Layout para rutas públicas (landing). No requiere auth.
 * Wrappea con .simulador-root + SimuladorProviders + simulador.css del
 * design system del Simulador.
 *
 * OAuthRedirectHandler escucha en home porque algunos providers OAuth
 * (Google, etc.) aterrizan en `/?code=...` antes del callback explícito.
 */

import { Suspense } from "react";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import StructuredData from "@/components/shared/StructuredData";
import { SimuladorProviders } from "../(app)/providers";
import "../(app)/simulador.css";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <StructuredData />
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
