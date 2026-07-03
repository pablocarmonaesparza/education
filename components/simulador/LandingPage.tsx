"use client";

import Link from "next/link";
import {
  AppleButton,
  AppleCard,
  AppleCardBody,
} from "@/components/simulador/apple";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { PublicNav } from "@/components/simulador/PublicNav";
import {
  SPRINT_CASES,
  SPRINT_META,
  MANAGER_ACTIONS,
} from "@/lib/simulador/config";
import { SIMULADOR_TIERS } from "@/lib/simulador/billing";

// Secciones below-the-fold: revela al entrar al viewport por scroll real.
// `amount` (fracción visible) dispara más confiable que `margin` negativo.
// (El hero NO usa esto: anima por CSS para no depender de JS — ver .hero-rise.)
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LandingPage() {
  return (
    // LazyMotion + m: solo carga el subset domAnimation de framer-motion en el
    // bundle de la landing. `strict` garantiza que nadie reintroduzca motion.X
    // (el bundle completo) dentro de este árbol.
    <LazyMotion features={domAnimation} strict>
      <PublicNav />

      {/* ============ HERO ============
          Animación de entrada por CSS (.hero-rise en globals.css), NO por
          framer-motion: el contenido above-the-fold nunca debe depender de JS
          ni de un IntersectionObserver para ser visible. */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="hero-rise">
            <span className="eyebrow">
              Para Head/VP de Marketing, Growth y Operations · LATAM
            </span>
          </div>

          <h1
            className="hero-rise display display-tight mt-6 text-[var(--text-primary)] ts-display-lg sm:ts-display-4xl md:ts-display-5xl"
            style={{ animationDelay: "0.05s" }}
          >
            ¿Tu equipo usa IA
            <br />
            <span className="accent-text">con criterio?</span>
          </h1>

          <p
            className="hero-rise mt-8 ts-body-lg sm:ts-body-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-[1.5]"
            style={{ animationDelay: "0.1s" }}
          >
            Mide y mejora cómo tu equipo decide cuando usa IA en flujos reales.
            <br className="hidden sm:block" />
            Diagnóstico operativo de 30 días. Reporte ejecutivo por persona.
          </p>

          <div
            className="hero-rise mt-12 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "0.15s" }}
          >
            <AppleButton
              as={Link}
              href="/auth/signup?next=%2Fonboarding%2Forg"
              tone="primary"
              size="lg"
              className="px-7 h-12"
            >
              Agendar diagnóstico para mi equipo
            </AppleButton>
          </div>

          <p
            className="hero-rise mt-10 ts-subhead text-[var(--text-tertiary)]"
            style={{ animationDelay: "0.2s" }}
          >
            SaaS B2B mid-market · servicios profesionales · ecommerce · LATAM
          </p>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="surface-tinted section-pad-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--hairline)] rounded-[var(--radius-lg)] overflow-hidden">
            {[
              { stat: "88%", label: "De empleados ya usan IA en su día a día.", source: "BCG · 2025" },
              { stat: "1/3", label: "Puede escalarla con criterio claro.", source: "BCG · 2025" },
              { stat: "~30%", label: "Más retención cuando se practica vs. se lee.", source: "Evidencia educativa" },
            ].map((s, i) => (
              <m.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="bg-[var(--surface)] p-10 text-center"
              >
                <div className="display ts-display-2xl sm:ts-display-4xl text-[var(--text-primary)]">{s.stat}</div>
                <p className="mt-3 ts-body text-[var(--text-primary)] leading-snug">{s.label}</p>
                <p className="mt-2 ts-footnote text-[var(--text-tertiary)]">{s.source}</p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="como-funciona" className="surface-canvas section-pad scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <m.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Cómo funciona</span>
            <h2 className="display mt-4 ts-display sm:ts-display-xl text-[var(--text-primary)]">
              Tres pasos. Treinta días.
            </h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Baseline.",
                body: "Cada persona del equipo entra a un caso de campo de 18 minutos. Medimos su criterio en contexto, datos, ejecución con IA, validación, juicio e impacto.",
              },
              {
                n: "02",
                title: "Práctica.",
                body: "Tres semanas de simulaciones cortas, ajustadas al gap detectado. La retención sube por hipercorrección, no por lectura.",
              },
              {
                n: "03",
                title: "Reporte.",
                body: "Ejecutivo, accionable. Quién puede pilotar autónomo, quién necesita entrenamiento, qué procesos requieren guardrails.",
              },
            ].map((step, i) => (
              <m.div
                key={step.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.05 }}
              >
                <div className="text-[var(--text-tertiary)] ts-subhead mono font-medium">
                  {step.n}
                </div>
                <h3 className="display mt-3 ts-title-2 text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-4 ts-body text-[var(--text-secondary)] leading-[1.6]">
                  {step.body}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASES ============ */}
      <section id="casos" className="surface-tinted section-pad scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <m.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Contenido del sprint</span>
            <h2 className="display mt-4 ts-display sm:ts-display-xl text-[var(--text-primary)]">
              Ocho casos. Una tensión cada uno.
            </h2>
            <p className="mt-5 ts-headline text-[var(--text-secondary)] max-w-2xl mx-auto">
              Cada caso es un escenario real: deadline, dataset con PII, presión
              de autoridad. El equipo decide; nosotros evaluamos.
            </p>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPRINT_CASES.map((c, i) => (
              <m.div
                key={c.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.03 * i }}
              >
                <AppleCard className="card-apple card-apple-interactive bg-[var(--surface)] shadow-none">
                  <AppleCardBody className="p-7">
                    <div className="flex items-start gap-4">
                      <div className="ts-subhead mono font-medium text-[var(--text-tertiary)] flex-shrink-0 mt-1">
                        {String(c.order).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="ts-headline font-semibold text-[var(--text-primary)] tracking-tight leading-snug capitalize-first">
                          {c.title.charAt(0).toUpperCase() + c.title.slice(1)}.
                        </h3>
                        <p className="mt-1.5 ts-callout text-[var(--text-secondary)]">
                          Tensión: {c.tension}.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {c.dimensions.map((d) => (
                            <span
                              key={d}
                              className="ts-caption-1 text-[var(--text-secondary)] bg-[var(--surface-3)] px-2.5 py-1 rounded-full capitalize"
                            >
                              {d}
                            </span>
                          ))}
                          <span className="ts-caption-1 accent-text accent-bg-soft px-2.5 py-1 rounded-full font-medium capitalize">
                            {c.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </AppleCardBody>
                </AppleCard>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANAGER OUTCOMES ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6">
          <m.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Resultado para managers</span>
            <h2 className="display mt-4 ts-display sm:ts-display-xl text-[var(--text-primary)]">
              Cuatro acciones claras.
            </h2>
            <p className="mt-5 ts-headline text-[var(--text-secondary)] max-w-2xl mx-auto">
              Por persona y por equipo. Salida ejecutiva, no dashboard ornamental.
            </p>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MANAGER_ACTIONS.map((a, i) => (
              <m.div
                key={a.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.04 * i }}
              >
                <AppleCard className="card-apple bg-[var(--surface)] shadow-none">
                  <AppleCardBody className="p-7">
                    <h3 className="ts-body-lg font-semibold text-[var(--text-primary)] capitalize">
                      {a.label}.
                    </h3>
                    <p className="mt-2 ts-body text-[var(--text-secondary)] leading-[1.55]">
                      {a.description.charAt(0).toUpperCase() +
                        a.description.slice(1)}
                      .
                    </p>
                  </AppleCardBody>
                </AppleCard>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="precio" className="surface-tinted section-pad scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <m.div {...fadeUp}>
            <span className="eyebrow">Precio</span>
            <h2 className="display mt-4 ts-display sm:ts-display-xl text-[var(--text-primary)]">
              Desde{" "}
              <span className="accent-text">
                ${SIMULADOR_TIERS[SIMULADOR_TIERS.length - 2].pricePerSeatUsd}
              </span>{" "}
              por persona al mes.
            </h2>
            <p className="mt-5 ts-headline text-[var(--text-secondary)] max-w-xl mx-auto">
              Por asiento, mensual o anual. El precio por persona baja cuando
              crece tu equipo. USD vía Stripe.
            </p>
          </m.div>

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.06 }}
            className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {SIMULADOR_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="rounded-[var(--radius-lg)] bg-[var(--surface)] p-5 text-left"
              >
                <div className="ts-callout font-semibold text-[var(--text-primary)]">
                  {tier.label}
                </div>
                <div className="mt-2 ts-title-2 font-semibold tabular-nums text-[var(--text-primary)]">
                  ${tier.pricePerSeatUsd}
                  <span className="ts-footnote font-medium text-[var(--text-tertiary)]">
                    {" "}
                    /persona/mes
                  </span>
                </div>
                <div className="mt-2 ts-caption-1 text-[var(--text-tertiary)]">
                  {tier.maxSeats
                    ? `${tier.minSeats}–${tier.maxSeats} personas`
                    : `${tier.minSeats}+ personas`}
                  {!tier.selfServe && " · contacto"}
                </div>
              </div>
            ))}
          </m.div>

          <m.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <AppleButton
              as={Link}
              href="/auth/signup?next=%2Fonboarding%2Forg"
              tone="primary"
              size="lg"
              className="px-7 h-12"
            >
              Agendar diagnóstico →
            </AppleButton>
          </m.div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="surface-canvas section-pad scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6">
          <m.div {...fadeUp} className="text-center mb-12">
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="display mt-4 ts-display sm:ts-display-xl text-[var(--text-primary)]">
              Lo que más nos preguntan.
            </h2>
          </m.div>

          <div className="divide-y divide-[var(--hairline)] border-y border-[var(--hairline)]">
            {[
              {
                q: "¿Es certificación?",
                a: "No. Es diagnóstico operativo de criterio en uso de IA. No acreditamos, medimos. El reporte se traduce en acciones concretas, no en un certificado de pared.",
              },
              {
                q: "¿Qué LLM usan para evaluar?",
                a: "Opus 4.5 con rúbrica versionada. Risk events high pasan por review de humano staff Itera antes de publicarse en el reporte. Cada evaluación queda auditable.",
              },
              {
                q: "¿Procesan PII real de mis clientes?",
                a: "No. Los casos usan datasets sintéticos. Tu equipo no introduce información personal de clientes reales en el simulador. Compliance LATAM (LFPDPPP MX 2025, Ley 1581 CO).",
              },
              {
                q: "¿Pueden facturar en MX, CO o AR?",
                a: "Sí. Comprador paga en USD vía Stripe. Para factura fiscal mexicana, colombiana o argentina, respondes al recibo con tu RFC/NIT/CUIT y emitimos en 1-2 días hábiles.",
              },
              {
                q: "¿Política de refunds?",
                a: "Reembolso completo dentro de los primeros 7 días del primer cobro. Después de ese plazo puedes cancelar cuando quieras: conservas acceso hasta el final del período ya pagado y no se hacen cobros nuevos.",
              },
            ].map((item, i) => (
              <m.details
                key={item.q}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.03 * i }}
                className="group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer ts-headline font-medium text-[var(--text-primary)]">
                  <span>{item.q}</span>
                  <span className="ml-4 text-[var(--text-tertiary)] transition-transform group-open:rotate-45 ts-body-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 ts-body text-[var(--text-secondary)] leading-[1.6]">
                  {item.a}
                </p>
              </m.details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA STRIP ============ */}
      <section className="surface-tinted section-pad-sm">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <m.div {...fadeUp}>
            <h2 className="display ts-display sm:ts-display-lg text-[var(--text-primary)]">
              ¿Ya tienes un sprint en la mira?
            </h2>
            <p className="mt-4 ts-body text-[var(--text-secondary)] max-w-xl mx-auto">
              Treinta días, cinco a cincuenta personas, un reporte ejecutivo accionable.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <AppleButton
                as={Link}
                href="/auth/signup?next=%2Fonboarding%2Forg"
                tone="primary"
                size="lg"
                className="px-7 h-12"
              >
                Agendar diagnóstico
              </AppleButton>
              <AppleButton
                as={Link}
                href="mailto:hola@itera.la"
                tone="ghost"
                size="lg"
                className="text-[var(--text-secondary)] px-5 h-12 ts-body font-medium hover:text-[var(--text-primary)]"
              >
                Hablar con ventas →
              </AppleButton>
            </div>
          </m.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[var(--hairline)] py-16 surface-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <p className="ts-footnote mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
                Producto
              </p>
              <ul className="space-y-2 ts-callout text-[var(--text-secondary)]">
                <li><a href="#como-funciona" className="hover:text-[var(--text-primary)]">Cómo funciona</a></li>
                <li><a href="#casos" className="hover:text-[var(--text-primary)]">Casos del sprint</a></li>
                <li><a href="#precio" className="hover:text-[var(--text-primary)]">Precios</a></li>
              </ul>
            </div>
            <div>
              <p className="ts-footnote mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
                Empresa
              </p>
              <ul className="space-y-2 ts-callout text-[var(--text-secondary)]">
                <li><a href="#faq" className="hover:text-[var(--text-primary)]">FAQ</a></li>
                <li><a href="mailto:hola@itera.la" className="hover:text-[var(--text-primary)]">Contacto comercial</a></li>
                <li><a href="mailto:soporte@itera.la" className="hover:text-[var(--text-primary)]">Soporte</a></li>
              </ul>
            </div>
            <div>
              <p className="ts-footnote mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
                Legal
              </p>
              <ul className="space-y-2 ts-callout text-[var(--text-secondary)]">
                <li><Link href="/privacy" className="hover:text-[var(--text-primary)]">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--text-primary)]">Términos</Link></li>
                <li><a href="mailto:legal@itera.la" className="hover:text-[var(--text-primary)]">DPA enterprise</a></li>
              </ul>
            </div>
            <div>
              <p className="ts-footnote mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
                Acceso
              </p>
              <ul className="space-y-2 ts-callout text-[var(--text-secondary)]">
                <li><Link href="/auth/login" className="hover:text-[var(--text-primary)]">Iniciar sesión</Link></li>
                <li><Link href="/auth/signup" className="hover:text-[var(--text-primary)]">Crear cuenta</Link></li>
                <li><Link href="/dashboard" className="hover:text-[var(--text-primary)]">Dashboard manager</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="ts-subhead text-[var(--text-tertiary)]">© 2026 Itera. Diagnóstico operativo de criterio en IA.</p>
            <p className="ts-subhead text-[var(--text-tertiary)]">{SPRINT_META.geoTarget.join(" · ")}</p>
          </div>
        </div>
      </footer>
    </LazyMotion>
  );
}
