"use client";

import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Link,
} from "@heroui/react";
import { motion } from "framer-motion";
import { SurfaceNav } from "./_components/SurfaceNav";
import {
  DIMENSIONS,
  MANAGER_ACTIONS,
  SPRINT_CASES,
  SPRINT_META,
} from "./_data/case-data";

const STATS = [
  { value: "88%", label: "adopción IA organizacional 2026", source: "Stanford AI Index" },
  { value: "1/3", label: "empresas escalando valor real", source: "McKinsey State of AI" },
  { value: "~30%", label: "transferencia de training a comportamiento", source: "Kirkpatrick L3" },
];

export default function SimuladorLanding() {
  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <SurfaceNav />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        {/* Aurora background */}
        <div className="absolute inset-0 aurora opacity-80" aria-hidden />
        <div className="absolute inset-0 spotlight" aria-hidden />
        <div className="grain" aria-hidden />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(74,222,128)]" />
              <span className="text-[12px] text-white/70 tracking-wide">
                simulador de criterio IA
              </span>
              <span className="text-white/30">·</span>
              <span className="text-[12px] text-white/55 tracking-wide">
                LATAM B2B
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[44px] md:text-6xl lg:text-7xl font-semibold tracking-[-0.025em] leading-[0.98] max-w-5xl">
              <span className="text-white">criterio operativo</span>
              <br />
              <span className="text-white/55">en uso de IA, </span>
              <span className="gradient-text">medible.</span>
            </h1>

            {/* Sub */}
            <p className="mt-8 text-lg md:text-xl text-white/65 max-w-2xl leading-[1.55]">
              te mostramos si tu equipo puede usar IA con criterio en situaciones
              reales de negocio — <span className="text-white/85">antes</span> de
              que lo haga con clientes, datos sensibles o campañas reales.
            </p>

            {/* CTAs */}
            <div className="mt-12 flex flex-col sm:flex-row items-center gap-3">
              <Button
                as={Link}
                href="/simulator-design/runtime/caso-1"
                size="lg"
                className="h-12 px-6 font-medium bg-white text-black hover:bg-white/90 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.4)]"
                radius="full"
              >
                diagnóstico de 1 caso — gratis
                <span className="ml-1">→</span>
              </Button>
              <Button
                as={Link}
                href="/simulator-design/dashboard"
                size="lg"
                variant="flat"
                radius="full"
                className="h-12 px-6 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20"
              >
                ver Sprint completo
              </Button>
            </div>

            {/* Trust strip */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[12px] text-white/40 tracking-wide">
              <span className="flex items-center gap-1.5">
                <span className="text-white/30">·</span>
                {SPRINT_META.geoTarget.join(" · ")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-white/30">·</span>
                50–500 empleados
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-white/30">·</span>
                SaaS B2B / ecommerce / servicios
              </span>
            </div>
          </motion.div>

          {/* Bento stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-24 grid md:grid-cols-3 gap-3"
          >
            {STATS.map((s, i) => (
              <Card
                key={i}
                className="bg-white/[0.025] border border-white/[0.06] card-lift"
                shadow="none"
              >
                <CardBody className="p-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                      {s.value}
                    </span>
                  </div>
                  <div className="mt-2 text-[14px] text-white/75 leading-snug">
                    {s.label}
                  </div>
                  <div className="mt-3 text-[11px] text-white/35 tracking-wide uppercase">
                    {s.source}
                  </div>
                </CardBody>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ PROBLEMA ============ */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-8 items-start">
            <div className="md:col-span-5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                el problema
              </span>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-[-0.02em] leading-[1.05]">
                tu equipo ya usa IA.
                <br />
                <span className="text-white/45">
                  la pregunta no es si — es si lo hace bien.
                </span>
              </h2>
            </div>
            <div className="md:col-span-7 md:pt-2 space-y-5">
              <p className="text-[16px] md:text-[17px] text-white/75 leading-[1.65]">
                <span className="text-white font-medium">
                  88% de adopción organizacional
                </span>{" "}
                en 2026 (Stanford AI Index). pero solo un tercio está escalando
                valor real. el cuello de botella no es acceso a modelos — es{" "}
                <span className="text-white font-medium">criterio</span>.
              </p>
              <p className="text-[16px] md:text-[17px] text-white/75 leading-[1.65]">
                completion rates de cursos, badges y horas de training no te
                dicen{" "}
                <span className="text-white font-medium">
                  si tu equipo decide bien con IA
                </span>{" "}
                cuando hay deadline, datos sensibles y un VP pidiéndole
                resultados a las 9 AM.
              </p>
              <p className="text-[16px] md:text-[17px] text-white/75 leading-[1.65]">
                el Simulador mide{" "}
                <span className="text-white font-medium">
                  comportamiento en escenarios reales
                </span>{" "}
                con consecuencias observables. evidencia conductual, no test de
                opción múltiple.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA — LOOP ============ */}
      <section className="relative border-t border-white/[0.06] bg-gradient-to-b from-transparent via-white/[0.015] to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
              cómo funciona
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
              el loop completo del Sprint
            </h2>
            <p className="mt-3 text-white/55 text-[15px]">
              6 etapas. 30 días. evidencia accionable al cierre.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { n: "01", label: "caso vivo", desc: "situación laboral real con presión y datos" },
              { n: "02", label: "decisión", desc: "5 pasos observables, no opciones múltiples" },
              { n: "03", label: "evaluación", desc: "rúbrica versionada + LLM judge calibrado" },
              { n: "04", label: "práctica", desc: "microbeat correctivo, ≤2 min" },
              { n: "05", label: "re-simulación", desc: "variante a 7 días para probar transferencia" },
              { n: "06", label: "evidencia", desc: "reporte ejecutivo + acción del manager" },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  className="bg-white/[0.025] border border-white/[0.06] h-full card-lift"
                  shadow="none"
                >
                  <CardBody className="p-5">
                    <div className="text-[11px] mono text-white/30 mb-3">
                      {s.n}
                    </div>
                    <div className="text-white font-medium text-[15px]">
                      {s.label}
                    </div>
                    <div className="text-[13px] text-white/55 leading-snug mt-1.5">
                      {s.desc}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5 DIMENSIONES ============ */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid md:grid-cols-12 gap-x-12 gap-y-10">
            <div className="md:col-span-5">
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
                qué medimos
              </span>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.02em] leading-tight">
                5 dimensiones de criterio operativo con IA
              </h2>
              <p className="mt-5 text-white/65 text-[15px] leading-relaxed">
                no evaluamos si tu equipo "sabe IA". evaluamos si decide bien
                cuando hay presión, datos sensibles, autoridad y consecuencias.
              </p>
              <p className="mt-3 text-white/55 text-[14px] leading-relaxed">
                bandas alto / medio / bajo por dimensión. nada de scores
                puntuales falsos.
              </p>
            </div>

            <div className="md:col-span-7 space-y-2">
              {DIMENSIONS.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Card
                    className="bg-white/[0.025] border border-white/[0.06] card-lift"
                    shadow="none"
                  >
                    <CardBody className="p-5 flex flex-row gap-5 items-start">
                      <div className="mono text-[12px] text-white/35 mt-0.5 min-w-[28px]">
                        0{i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white capitalize text-[15px]">
                          {d.label}
                        </div>
                        <div className="text-[13px] text-white/60 mt-1.5 leading-relaxed">
                          {d.description}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ 8 CASOS DEL SPRINT ============ */}
      <section className="relative border-t border-white/[0.06] bg-gradient-to-b from-transparent via-white/[0.015] to-transparent">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
              {SPRINT_META.publicName}
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
              8 casos vivos, no 8 lecciones
            </h2>
            <p className="mt-3 text-white/55 text-[15px]">
              cada caso simula una situación que tu equipo vive cada trimestre.
              datos, presión y stakeholders reales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {SPRINT_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
              >
                <Card
                  className="bg-white/[0.025] border border-white/[0.06] h-full card-lift"
                  shadow="none"
                >
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="mono text-[11px] text-white/30 tracking-wider">
                        caso 0{c.order}
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        classNames={{
                          base:
                            c.difficulty === "advanced"
                              ? "h-5 bg-rose-500/15 border border-rose-500/25"
                              : c.difficulty === "intermediate"
                              ? "h-5 bg-amber-500/15 border border-amber-500/25"
                              : "h-5 bg-white/[0.04] border border-white/10",
                          content:
                            c.difficulty === "advanced"
                              ? "text-[10px] tracking-wider text-rose-300 uppercase"
                              : c.difficulty === "intermediate"
                              ? "text-[10px] tracking-wider text-amber-300 uppercase"
                              : "text-[10px] tracking-wider text-white/50 uppercase",
                        }}
                      >
                        {c.difficulty}
                      </Chip>
                    </div>
                    <h3 className="text-white font-semibold text-[17px] leading-tight">
                      {c.title}
                    </h3>
                    <p className="text-[13px] text-white/55 mt-2 leading-relaxed">
                      tensión: {c.tension}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {c.dimensions.map((d) => (
                        <Chip
                          key={d}
                          size="sm"
                          variant="flat"
                          classNames={{
                            base: "h-5 bg-white/[0.03] border border-white/[0.08]",
                            content: "text-[10px] text-white/60 capitalize",
                          }}
                        >
                          {d}
                        </Chip>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ MANAGER ACTIONS ============ */}
      <section className="relative border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
              el output
            </span>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-[-0.02em]">
              1 reporte. 1 recomendación. 1 acción.
            </h2>
            <p className="mt-3 text-white/55 text-[15px]">
              no dashboards infinitos. al cierre del Sprint tu equipo cae en una
              de estas 4 acciones.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MANAGER_ACTIONS.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <Card
                  className="bg-white/[0.025] border border-white/[0.06] h-full card-lift"
                  shadow="none"
                >
                  <CardBody className="p-5">
                    <Chip
                      size="sm"
                      variant="flat"
                      classNames={{
                        base:
                          a.color === "success"
                            ? "h-6 bg-emerald-500/15 border border-emerald-500/25 mb-4"
                            : a.color === "primary"
                            ? "h-6 bg-indigo-500/15 border border-indigo-500/25 mb-4"
                            : a.color === "warning"
                            ? "h-6 bg-amber-500/15 border border-amber-500/25 mb-4"
                            : "h-6 bg-rose-500/15 border border-rose-500/25 mb-4",
                        content:
                          a.color === "success"
                            ? "text-[11px] tracking-wider text-emerald-300 uppercase font-medium"
                            : a.color === "primary"
                            ? "text-[11px] tracking-wider text-indigo-300 uppercase font-medium"
                            : a.color === "warning"
                            ? "text-[11px] tracking-wider text-amber-300 uppercase font-medium"
                            : "text-[11px] tracking-wider text-rose-300 uppercase font-medium",
                      }}
                    >
                      {a.label}
                    </Chip>
                    <p className="text-[13px] text-white/70 leading-relaxed">
                      {a.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section className="relative border-t border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 aurora-soft opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/40 font-medium">
            precio
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.02em]">
            <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
              ${SPRINT_META.pricing.min}–${SPRINT_META.pricing.max}
            </span>{" "}
            <span className="text-white/45 text-3xl font-medium">USD</span>
          </h2>
          <p className="mt-3 text-white/55 text-[15px]">
            por seat · por Sprint · equipo mínimo 5 personas
          </p>
          <p className="mt-5 text-white/65 max-w-xl mx-auto text-[15px] leading-relaxed">
            precio según seniority y tamaño de cohorte. el primer caso es
            diagnóstico gratis para que vivas el formato.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              as={Link}
              href="/simulator-design/runtime/caso-1"
              size="lg"
              className="h-12 px-6 font-medium bg-white text-black hover:bg-white/90 shadow-[0_8px_32px_-8px_rgba(255,255,255,0.4)]"
              radius="full"
            >
              arrancar diagnóstico →
            </Button>
            <Button
              as={Link}
              href="/simulator-design/reporte/P001"
              size="lg"
              variant="flat"
              radius="full"
              className="h-12 px-6 bg-white/[0.04] border border-white/10 text-white hover:bg-white/[0.08] hover:border-white/20"
            >
              ver reporte de ejemplo
            </Button>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/40">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />
              <span className="text-white/55">el simulador · itera</span>
            </div>
            <div className="flex items-center gap-6">
              <span>diseño en preview · no producción</span>
              <Link
                href="https://itera.la"
                size="sm"
                className="text-white/40 hover:text-white text-[12px]"
              >
                itera.la
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
