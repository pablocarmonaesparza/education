import type { Metadata } from "next";
import { AprenderDemoClient } from "./AprenderDemoClient";

// dev-only · no indexa, fuera de navegación productiva. Pantalla de prueba del
// motor educativo (segundo motor). Registrada en docs/simulador/front/FRONT_CONTRACT.md.
export const metadata: Metadata = {
  title: "Aprender · demo del motor educativo",
  robots: { index: false, follow: false },
};

export default function AprenderDemoPage() {
  return <AprenderDemoClient />;
}
