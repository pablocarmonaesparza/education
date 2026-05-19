/**
 * Layout publico para field-tests del Simulador.
 *
 * No pasa por auth y hereda el tema claro global del Simulador.
 */

import { SimuladorProviders } from "../(app)/providers";
import "../(app)/simulador.css";

export default function FieldTestLayout({
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
