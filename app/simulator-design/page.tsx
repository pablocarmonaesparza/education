"use client";

import { Button, Card, CardBody, Chip, Link } from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "./_components/SurfaceNav";
import { SPRINT_CASES, SPRINT_META, MANAGER_ACTIONS } from "./_data/case-data";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function LandingPage() {
  return (
    <>
      <SurfaceNav />

      {/* ============ HERO ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <span className="eyebrow">diagnóstico · 30 días · b2b</span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="display display-tight mt-6 text-[#1d1d1f] text-[44px] sm:text-[64px] md:text-[80px]"
          >
            criterio de IA,
            <br />
            <span className="accent-text">medible.</span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-8 text-[19px] sm:text-[21px] text-[#6e6e73] max-w-2xl mx-auto leading-[1.5]"
          >
            mide y mejora cómo tu equipo decide con IA en flujos reales.
            <br className="hidden sm:block" />
            antes de que lo haga con clientes, datos sensibles o campañas.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            <Button
              as={Link}
              href="/simulator-design/runtime/caso-1"
              radius="full"
              size="lg"
              className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none hover:opacity-90"
            >
              probar el simulador
            </Button>
            <Button
              as={Link}
              href="/simulator-design/dashboard"
              radius="full"
              size="lg"
              variant="bordered"
              className="border-[#d2d2d7] text-[#1d1d1f] bg-white px-7 h-12 text-[15px] font-medium"
            >
              ver dashboard
            </Button>
          </motion.div>

          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-10 text-[13px] text-[#86868b]"
          >
            usado por equipos en SaaS B2B · LATAM
          </motion.p>
        </div>
      </section>

      {/* ============ STATS — clean, single accent ============ */}
      <section className="surface-tinted section-pad-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black/[0.06] rounded-2xl overflow-hidden border border-black/[0.06]">
            {[
              { stat: "88%", label: "de empleados ya usan IA en su día a día", source: "BCG · 2025" },
              { stat: "1/3", label: "puede escalarla con criterio claro", source: "BCG · 2025" },
              { stat: "~30%", label: "más retención cuando se practica vs se enseña", source: "evidencia educativa" },
            ].map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.05 }}
                className="bg-white p-10 text-center"
              >
                <div className="display text-[56px] sm:text-[64px] text-[#1d1d1f]">{s.stat}</div>
                <p className="mt-3 text-[15px] text-[#1d1d1f] leading-snug">{s.label}</p>
                <p className="mt-2 text-[12px] text-[#86868b]">{s.source}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS — 3 steps, Apple-clean ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">cómo funciona</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[#1d1d1f]">
              tres pasos. treinta días.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                n: "01",
                title: "baseline",
                body: "cada persona del equipo entra a un caso de campo de 18 minutos. mide su criterio en privacidad, validación, juicio, decisión y contexto.",
              },
              {
                n: "02",
                title: "práctica",
                body: "tres semanas de simulaciones cortas según el gap detectado. retención por hipercorrección, no por lectura.",
              },
              {
                n: "03",
                title: "reporte",
                body: "ejecutivo, accionable. quién puede pilotar autónomo, quién necesita entrenamiento, qué procesos requieren guardrails.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.05 + i * 0.05 }}
              >
                <div className="text-[#86868b] text-[13px] mono font-medium">
                  {step.n}
                </div>
                <h3 className="display mt-3 text-[24px] text-[#1d1d1f]">
                  {step.title}
                </h3>
                <p className="mt-4 text-[15px] text-[#6e6e73] leading-[1.6]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CASES — minimal cards, no bento chaos ============ */}
      <section className="surface-tinted section-pad">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">contenido del sprint</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[#1d1d1f]">
              ocho casos. una tensión cada uno.
            </h2>
            <p className="mt-5 text-[17px] text-[#6e6e73] max-w-2xl mx-auto">
              cada caso es un escenario real: deadline, dataset con PII, presión de
              autoridad. el equipo decide. nosotros evaluamos.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPRINT_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.03 * i }}
              >
                <Card className="card-apple card-apple-interactive bg-white shadow-none">
                  <CardBody className="p-7">
                    <div className="flex items-start gap-4">
                      <div className="text-[13px] mono font-medium text-[#86868b] flex-shrink-0 mt-1">
                        {String(c.order).padStart(2, "0")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight leading-snug">
                          {c.title}
                        </h3>
                        <p className="mt-1.5 text-[14px] text-[#6e6e73]">
                          tensión: {c.tension}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {c.dimensions.map((d) => (
                            <span
                              key={d}
                              className="text-[11px] text-[#6e6e73] bg-[#f5f5f7] px-2.5 py-1 rounded-full"
                            >
                              {d}
                            </span>
                          ))}
                          <span className="text-[11px] accent-text accent-bg-soft px-2.5 py-1 rounded-full font-medium">
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

      {/* ============ MANAGER OUTCOMES — clean grid ============ */}
      <section className="surface-canvas section-pad">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-16">
            <span className="eyebrow">resultado para managers</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[#1d1d1f]">
              cuatro acciones claras.
            </h2>
            <p className="mt-5 text-[17px] text-[#6e6e73] max-w-2xl mx-auto">
              por persona y por equipo. salida ejecutiva, no dashboard ornamental.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MANAGER_ACTIONS.map((a, i) => (
              <motion.div
                key={a.id}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.04 * i }}
              >
                <Card className="card-apple bg-white shadow-none">
                  <CardBody className="p-7">
                    <h3 className="text-[19px] font-semibold text-[#1d1d1f]">
                      {a.label}
                    </h3>
                    <p className="mt-2 text-[15px] text-[#6e6e73] leading-[1.55]">
                      {a.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING — Apple-clean ============ */}
      <section className="surface-tinted section-pad">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div {...fadeUp}>
            <span className="eyebrow">precio</span>
            <h2 className="display mt-4 text-[36px] sm:text-[48px] text-[#1d1d1f]">
              desde{" "}
              <span className="accent-text">
                ${SPRINT_META.pricing.min}
              </span>{" "}
              por persona
            </h2>
            <p className="mt-5 text-[17px] text-[#6e6e73] max-w-xl mx-auto">
              precio por asiento, 30 días, cohorte de {SPRINT_META.pricing.minSeats}–
              {SPRINT_META.pricing.maxSeats} personas. usd. stripe.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-12"
          >
            <Button
              as={Link}
              href="/simulator-design/runtime/caso-1"
              radius="full"
              size="lg"
              className="accent-bg text-white px-7 h-12 text-[15px] font-medium shadow-none hover:opacity-90"
            >
              empezar caso de muestra →
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-black/[0.06] py-12 surface-canvas">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#86868b]">© 2026 itera · el simulador</p>
          <div className="flex items-center gap-6 text-[13px] text-[#86868b]">
            <span>preview interno</span>
            <span>·</span>
            <span>{SPRINT_META.geoTarget.join(" · ")}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
