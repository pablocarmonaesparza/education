"use client";

import { Button, Card, CardBody, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { PublicNav } from "@/components/simulador/PublicNav";
import {
  SPRINT_CASES,
  SPRINT_META,
  MANAGER_ACTIONS,
} from "@/lib/simulador/config";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LandingPage() {
  return (
    <>
      <PublicNav />

      {/* ============ HERO ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <span className="eyebrow">
              Para Head/VP de Marketing, Growth y Operations · LATAM
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="display display-tight mt-6 text-[var(--text-primary)] text-[44px] sm:text-[64px] md:text-[80px]"
          >
            ¿Tu equipo usa IA
            <br />
            <span className="accent-text">con criterio?</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-8 text-[19px] sm:text-[21px] text-[var(--text-secondary)] max-w-2xl mx-auto leading-[1.5]"
          >
            Mide y mejora cómo tu equipo decide cuando usa IA en flujos reales.
            <br className="hidden sm:block" />
            Diagnóstico operativo de 30 días. Reporte ejecutivo por persona.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              as={Link}
              href="/auth/signup?next=%2Fonboarding%2Forg"
              radius="md"
              size="lg"
              className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none hover:opacity-90"
            >
              Agendar diagnóstico para mi equipo
            </Button>
            <Button
              as={Link}
              href="/field-test/marketing-urgent-campaign-pii"
              radius="md"
              size="lg"
              variant="bordered"
              className="border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] px-7 h-12 text-[15px] font-medium"
            >
              Probar 1 caso de muestra →
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-10 text-[13px] text-[var(--text-tertiary)]"
          >
            SaaS B2B mid-market · servicios profesionales · ecommerce · LATAM
          </motion.p>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="surface-tinted section-pad-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--hairline)] rounded-2xl overflow-hidden border border-[var(--hairline)]">
            {[
              { stat: "88%", label: "De empleados ya usan IA en su día a día.", source: "BCG · 2025" },
              { stat: "1/3", label: "Puede escalarla con criterio claro.", source: "BCG · 2025" },
              { stat: "~30%", label: "Más retención cuando se practica vs. se lee.", source: "Evidencia educativa" },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="bg-[var(--surface)] p-10 text-center"
              >
                <div className="display text-[56px] sm:text-[64px] text-[var(--text-primary)]">{s.stat}</div>
                <p className="mt-3 text-[15px] text-[var(--text-primary)] leading-snug">{s.label}</p>
                <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">{s.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="como-funciona" className="surface-canvas section-pad scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Cómo funciona</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
              Tres pasos. Treinta días.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "Baseline.",
                body: "Cada persona del equipo entra a un caso de campo de 18 minutos. Medimos su criterio en privacidad, validación, juicio, decisión y contexto.",
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
              <motion.div
                key={step.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.05 }}
              >
                <div className="text-[var(--text-tertiary)] text-[13px] mono font-medium">
                  {step.n}
                </div>
                <h3 className="display mt-3 text-[24px] text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-4 text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASES ============ */}
      <section id="casos" className="surface-tinted section-pad scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Contenido del sprint</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
              Ocho casos. Una tensión cada uno.
            </h2>
            <p className="mt-5 text-[17px] text-[var(--text-secondary)] max-w-2xl mx-auto">
              Cada caso es un escenario real: deadline, dataset con PII, presión
              de autoridad. El equipo decide; nosotros evaluamos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPRINT_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.03 * i }}
              >
                <Card className="card-apple card-apple-interactive bg-[var(--surface)] shadow-none">
                  <CardBody className="p-7">
                    <div className="flex items-start gap-4">
                      <div className="text-[13px] mono font-medium text-[var(--text-tertiary)] flex-shrink-0 mt-1">
                        {String(c.order).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-semibold text-[var(--text-primary)] tracking-tight leading-snug capitalize-first">
                          {c.title.charAt(0).toUpperCase() + c.title.slice(1)}.
                        </h3>
                        <p className="mt-1.5 text-[14px] text-[var(--text-secondary)]">
                          Tensión: {c.tension}.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {c.dimensions.map((d) => (
                            <span
                              key={d}
                              className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface-3)] px-2.5 py-1 rounded-full capitalize"
                            >
                              {d}
                            </span>
                          ))}
                          <span className="text-[11px] accent-text accent-bg-soft px-2.5 py-1 rounded-full font-medium capitalize">
                            {c.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANAGER OUTCOMES ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">Resultado para managers</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
              Cuatro acciones claras.
            </h2>
            <p className="mt-5 text-[17px] text-[var(--text-secondary)] max-w-2xl mx-auto">
              Por persona y por equipo. Salida ejecutiva, no dashboard ornamental.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MANAGER_ACTIONS.map((a, i) => (
              <motion.div
                key={a.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.04 * i }}
              >
                <Card className="card-apple bg-[var(--surface)] shadow-none">
                  <CardBody className="p-7">
                    <h3 className="text-[19px] font-semibold text-[var(--text-primary)] capitalize">
                      {a.label}.
                    </h3>
                    <p className="mt-2 text-[15px] text-[var(--text-secondary)] leading-[1.55]">
                      {a.description.charAt(0).toUpperCase() +
                        a.description.slice(1)}
                      .
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="precio" className="surface-tinted section-pad scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <span className="eyebrow">Precio</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[var(--text-primary)]">
              Desde{" "}
              <span className="accent-text">
                ${SPRINT_META.pricing.fase_1_min_usd.toLocaleString("en-US")}
              </span>{" "}
              por sprint.
            </h2>
            <p className="mt-5 text-[17px] text-[var(--text-secondary)] max-w-xl mx-auto">
              Fase 1 — diagnóstico operativo: $
              {SPRINT_META.pricing.fase_1_min_usd.toLocaleString("en-US")}–$
              {SPRINT_META.pricing.fase_1_max_usd.toLocaleString("en-US")} para
              cohortes de {SPRINT_META.pricing.minSeats}–
              {SPRINT_META.pricing.maxSeats} personas. USD vía Stripe.
              <br className="hidden sm:block" />
              Fase 2 — práctica + re-diagnóstico: $
              {SPRINT_META.pricing.fase_2_min_usd.toLocaleString("en-US")}–$
              {SPRINT_META.pricing.fase_2_max_usd.toLocaleString("en-US")}.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              as={Link}
              href="/auth/signup?next=%2Fonboarding%2Forg"
              radius="md"
              size="lg"
              className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none hover:opacity-90"
            >
              Agendar diagnóstico →
            </Button>
            <Button
              as={Link}
              href="/field-test/marketing-urgent-campaign-pii"
              radius="md"
              size="lg"
              variant="bordered"
              className="border-[var(--border-strong)] text-[var(--text-primary)] bg-[var(--surface)] px-7 h-12 text-[15px] font-medium"
            >
              Probar 1 caso
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[var(--hairline)] py-12 surface-canvas">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[var(--text-tertiary)]">© 2026 Itera</p>
          <div className="flex items-center gap-6 text-[13px] text-[var(--text-tertiary)]">
            <span>{SPRINT_META.geoTarget.join(" · ")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
