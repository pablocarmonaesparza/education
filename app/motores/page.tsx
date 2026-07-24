import type { Metadata } from "next";
import { MotoresClient } from "./MotoresClient";

// dev-only · no indexa, fuera de navegación productiva. Consola de lectura
// que muestra cómo está organizado cada motor (educativo + operativo).
// Registrada en docs/simulador/front/FRONT_CONTRACT.md.
export const metadata: Metadata = {
  title: "Engines · organization console",
  robots: { index: false, follow: false },
};

export default function MotoresPage() {
  return <MotoresClient />;
}
