import { Suspense } from "react";
import OAuthRedirectHandler from "@/components/shared/OAuthRedirectHandler";
import StructuredData from "@/components/shared/StructuredData";
import { SimuladorProviders } from "./(app)/providers";
import LandingPage from "@/components/simulador/LandingPage";
import "./(app)/simulador.css";

export default function Home() {
  return (
    <div className="simulador-root dark min-h-screen surface-canvas">
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
