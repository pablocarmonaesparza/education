import type { Metadata } from "next";
import { SimuladorProviders } from "./providers";
import "./simulador.css";

export const metadata: Metadata = {
  title: "El Simulador — Itera",
  description:
    "diagnóstico de criterio IA para equipos de negocio. medimos si tu equipo decide bien con IA antes de que lo haga con clientes, datos sensibles o campañas reales.",
};

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="simulador-root min-h-screen surface-canvas">
      <SimuladorProviders>{children}</SimuladorProviders>
    </div>
  );
}
