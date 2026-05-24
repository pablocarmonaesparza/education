export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--text-primary)]">
      <section className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-3">términos del servicio</div>
        <h1 className="display display-tight text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
          contrato de uso de itera simulador.
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">última actualización: {currentDate}</p>

        <div className="rounded-[var(--radius-xl)] border border-[var(--hairline)] bg-[var(--surface-2)] p-6 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">naturaleza del servicio</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Itera Simulador es un servicio B2B de diagnóstico operativo de criterio en uso de IA. No es certificación, no es curso, no es asesoría psicométrica. Mide cómo decide tu equipo en flujos reales con IA generativa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">precios y facturación</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Precios listados en USD vía Stripe. Plan Diagnóstico desde $4,000 USD por sprint de 30 días, 5-50 participantes. Sprint Fase 2 y Track avanzado disponibles. La factura llega al email del comprador. Para factura fiscal MX/CO/AR, contesta al recibo con RFC/NIT/CUIT y se emite en 1-2 días business.
            </p>
          </section>

          <hr className="border-[var(--hairline)]" />

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">refunds</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Reembolso completo dentro de 7 días post-cargo si nadie de tu equipo ha empezado el caso vivo. Pasado ese plazo, convertimos a crédito para próximo sprint. Refunds extra-policy se evalúan caso-por-caso si el issue es bug nuestro.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">limitaciones de responsabilidad</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Liability cap: 12 meses de fees pagados por el customer. Excluida: indirect/consequential damages, lost profits. No exclusiones: gross negligence, willful misconduct, breach of confidentiality, data breach por Itera.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">jurisdicción</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Customer MX: jurisdicción CDMX, legislación México. Customer CO: jurisdicción Bogotá, legislación Colombia. Disputes se intentan resolver amigablemente 30 días antes de litigio.
            </p>
          </section>

          <hr className="border-[var(--hairline)]" />

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">contacto</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              <a href="mailto:soporte@itera.la" className="text-[var(--accent)] hover:underline">soporte@itera.la</a> para temas de servicio.
              <br />
              <a href="mailto:legal@itera.la" className="text-[var(--accent)] hover:underline">legal@itera.la</a> para términos y compliance.
            </p>
          </section>
        </div>
      </section>
      <footer className="border-t border-[var(--hairline)] px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
        © {new Date().getFullYear()} Itera
      </footer>
    </main>
  );
}
