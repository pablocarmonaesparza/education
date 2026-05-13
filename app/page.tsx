/**
 * Home (v3) — landing del Simulador como home oficial de Itera.
 *
 * El producto ahora es "El Simulador": diagnóstico de criterio de IA
 * para equipos B2B. Reemplaza al landing v2 (cursos personalizados),
 * que queda preservado en `app/legacy-v2-cursos/page.tsx`.
 *
 * La página /simulator-design/* sigue activa como espacio de iteración
 * visual y preview interno; usa exactamente el mismo componente para
 * que ambas rutas se mantengan en sync.
 */

import { Suspense } from "react";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import StructuredData from "@/components/shared/StructuredData";
import { SimuladorProviders } from "./simulator-design/providers";
import LandingPage from "./simulator-design/page";
import "./simulator-design/simulador.css";

export default function Home() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <Suspense fallback={null}>
        <OAuthRedirectHandler />
      </Suspense>
      <StructuredData />
      <SimuladorProviders>
        <LandingPage />
      </SimuladorProviders>
    </div>
  );
}
