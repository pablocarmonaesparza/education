'use client';

import NextSectionIndicator from './NextSectionIndicator';

/**
 * Capacitación section — placeholder vacío.
 * Vive entre Simulador y Pricing en la landing. Content TBD.
 *
 * Nota: el id es ascii-safe (`capacitacion`) para evitar problemas con
 * el hash en URLs y selectores; el label sí lleva acento.
 */
export default function CapacitacionSection() {
  return (
    <section
      id="capacitacion"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <NextSectionIndicator targetId="pricing" label="Precios" />
    </section>
  );
}
