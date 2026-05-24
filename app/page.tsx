import { SimuladorProviders } from "./(app)/providers";
import LandingPage from "@/components/simulador/LandingPage";
import "./(app)/simulador.css";

export default function Home() {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>
        <LandingPage />
      </SimuladorProviders>
    </div>
  );
}
