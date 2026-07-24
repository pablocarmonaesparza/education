import { SimuladorProviders } from "./(app)/providers";
import LandingPage from "@/components/simulador/LandingPage";
import "./(app)/simulador.css";

// --font-jakarta ahora se carga en app/layout.tsx (root) — promoción v2
// 2026-07-16. Este archivo ya no monta la fuente localmente.

export default function Home() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <LandingPage />
      </SimuladorProviders>
    </div>
  );
}
