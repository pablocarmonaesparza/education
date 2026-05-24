export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col bg-[var(--surface)] text-[var(--text-primary)]">
      <section className="flex-grow container mx-auto px-6 py-12 max-w-4xl">
        <div className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] mb-3">política de privacidad</div>
        <h1 className="display display-tight text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-3">
          tus datos en itera simulador.
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">última actualización: {currentDate}</p>

        <div className="rounded-[var(--radius-xl)] border border-[var(--hairline)] bg-[var(--surface-2)] p-6 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">qué procesamos</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Itera Simulador procesa datos personales de participantes empleados: identificación básica (nombre, email), datos de uso (respuestas del caso vivo, transcript de prompts), outputs de IA durante el runtime, y datos comerciales (nombre de organización, plan contratado).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">marco legal</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              México: LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares, DOF 20/03/2025).
              Colombia: Ley 1581 de 2012 + decretos reglamentarios.
              Las transferencias a sub-procesadores en US (Supabase, Anthropic, Stripe, AgentMail, Vercel) se rigen por Standard Contractual Clauses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">tus derechos</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Como titular de datos puedes solicitar: acceso, rectificación, eliminación, oposición y portabilidad. Envía tu solicitud a <a href="mailto:privacy@itera.la" className="text-[var(--accent)] hover:underline">privacy@itera.la</a> y respondemos dentro de 5 días business. Eliminación toma hasta 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">retención</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              Sessions activas + 30 días post-cierre. Reportes ejecutivos 12 meses, luego anonimizados. Audit logs 24 meses (baseline regulatorio). Eliminación a solicitud dentro de 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">contacto</h2>
            <p className="text-base leading-7 text-[var(--text-secondary)]">
              <a href="mailto:privacy@itera.la" className="text-[var(--accent)] hover:underline">privacy@itera.la</a> para temas de datos personales.
              <br />
              <a href="mailto:legal@itera.la" className="text-[var(--accent)] hover:underline">legal@itera.la</a> para DPA enterprise y compliance.
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
