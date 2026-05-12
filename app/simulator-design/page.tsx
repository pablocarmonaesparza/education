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

export default function SimuladorLanding() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SurfaceNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute inset-0 grain opacity-40" />
        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <Chip
              size="md"
              variant="flat"
              color="secondary"
              className="mb-8 backdrop-blur-md border border-white/10"
            >
              simulador de criterio IA · LATAM B2B 2026
            </Chip>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight max-w-5xl">
              <span className="text-white/95">te mostramos si tu equipo</span>
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">
                puede usar IA con criterio
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/60 max-w-3xl leading-relaxed">
              en situaciones reales de negocio, antes de que lo haga con
              clientes, datos sensibles o campañas reales. evidencia conductual,
              no test de opción múltiple.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Button
                as={Link}
                href="/simulator-design/runtime/caso-1"
                color="primary"
                size="lg"
                className="font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30"
              >
                diagnóstico de 1 caso · gratis
              </Button>
              <Button
                as={Link}
                href="/simulator-design/dashboard"
                variant="bordered"
                size="lg"
                className="border-white/15 text-white"
              >
                ver Sprint completo →
              </Button>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
              <span>· {SPRINT_META.geoTarget.join(" / ")}</span>
              <span>· 50-500 empleados</span>
              <span>· SaaS B2B / ecommerce / servicios</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-2 gap-12 items-start"
          >
            <div>
              <span className="text-xs uppercase tracking-widest text-white/40">
                el problema
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                tu equipo ya usa IA.
                <br />
                <span className="text-white/50">
                  la pregunta no es si — es si lo hace bien.
                </span>
              </h2>
            </div>
            <div className="space-y-6 text-white/70">
              <p className="leading-relaxed">
                <span className="text-white">88% de adopción organizacional</span>{" "}
                (Stanford AI Index 2026). pero solo un tercio está escalando
                valor real. el cuello de botella no es acceso a modelos — es
                criterio.
              </p>
              <p className="leading-relaxed">
                completion rates de cursos, badges y horas de training no te
                dicen{" "}
                <span className="text-white">
                  si tu equipo decide bien con IA
                </span>{" "}
                cuando hay deadline, datos sensibles y un VP pidiéndole
                resultados a las 9 AM.
              </p>
              <p className="leading-relaxed">
                el Simulador hace eso. mide criterio en escenarios reales con
                consecuencias observables.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-white/40">
              cómo funciona
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              el loop completo del Sprint
            </h2>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { n: "01", label: "caso vivo", desc: "situación laboral real" },
              { n: "02", label: "decisión", desc: "5 pasos observables" },
              { n: "03", label: "evaluación", desc: "5 dimensiones + LLM judge" },
              { n: "04", label: "práctica", desc: "microbeat correctivo" },
              { n: "05", label: "re-simulación", desc: "variante 7 días después" },
              { n: "06", label: "evidencia", desc: "manager toma acción" },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Card className="bg-white/[0.02] border border-white/5 backdrop-blur-sm h-full">
                  <CardBody className="p-5">
                    <div className="text-xs text-white/30 font-mono mb-3">
                      {s.n}
                    </div>
                    <div className="text-white font-medium mb-1">{s.label}</div>
                    <div className="text-sm text-white/40 leading-snug">
                      {s.desc}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 DIMENSIONES */}
      <section className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs uppercase tracking-widest text-white/40">
                qué medimos
              </span>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
                5 dimensiones de criterio operativo con IA
              </h2>
              <p className="mt-6 text-white/60 leading-relaxed">
                no evaluamos si tu equipo "sabe IA". evaluamos si decide bien
                cuando hay presión, datos sensibles, autoridad y consecuencias.
                bandas alto / medio / bajo por dimensión.
              </p>
            </div>

            <div className="space-y-2">
              {DIMENSIONS.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Card className="bg-white/[0.02] border border-white/5">
                    <CardBody className="p-5 flex flex-row gap-4 items-start">
                      <div className="text-xs font-mono text-white/30 mt-1 min-w-[24px]">
                        0{i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-white capitalize">
                          {d.label}
                        </div>
                        <div className="text-sm text-white/50 mt-1 leading-relaxed">
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

      {/* 8 CASOS DEL SPRINT */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-white/40">
              {SPRINT_META.publicName}
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              8 casos vivos, no 8 lecciones
            </h2>
            <p className="mt-4 text-white/50 max-w-2xl mx-auto">
              cada caso simula una situación que tu equipo de marketing vive
              cada trimestre. con datos, presión y stakeholders reales.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {SPRINT_CASES.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card className="bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors h-full">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="text-xs font-mono text-white/30">
                        caso 0{c.order}
                      </div>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          c.difficulty === "advanced"
                            ? "danger"
                            : c.difficulty === "intermediate"
                            ? "warning"
                            : "default"
                        }
                        className="text-[10px]"
                      >
                        {c.difficulty}
                      </Chip>
                    </div>
                    <h3 className="text-white font-medium text-lg leading-tight">
                      {c.title}
                    </h3>
                    <p className="text-sm text-white/40 mt-2">
                      tensión: {c.tension}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {c.dimensions.map((d) => (
                        <Chip
                          key={d}
                          size="sm"
                          variant="flat"
                          className="bg-white/5 text-white/60 text-[10px]"
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

      {/* MANAGER ACTIONS */}
      <section className="border-t border-white/5 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-white/40">
              el output
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              1 reporte. 1 recomendación. 1 acción.
            </h2>
            <p className="mt-4 text-white/50 max-w-2xl mx-auto">
              no dashboards infinitos. al cierre del Sprint, tu equipo cae en
              una de estas 4 acciones.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {MANAGER_ACTIONS.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card className="bg-white/[0.02] border border-white/5 h-full">
                  <CardBody className="p-6">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={a.color}
                      className="mb-3"
                    >
                      {a.label}
                    </Chip>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {a.description}
                    </p>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <span className="text-xs uppercase tracking-widest text-white/40">
            precio
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
            ${SPRINT_META.pricing.min}–${SPRINT_META.pricing.max}{" "}
            <span className="text-white/40 text-2xl">USD</span>
            <span className="block text-base text-white/40 font-normal mt-2">
              por seat · por Sprint
            </span>
          </h2>
          <p className="mt-6 text-white/50 max-w-xl mx-auto">
            equipo mínimo de 5 personas. precio según seniority y tamaño de
            cohorte. el primer caso es diagnóstico gratis.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              href="/simulator-design/runtime/caso-1"
              color="primary"
              size="lg"
              className="font-medium bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30"
            >
              arrancar diagnóstico
            </Button>
            <Button
              as={Link}
              href="/simulator-design/reporte/P001"
              variant="bordered"
              size="lg"
              className="border-white/15 text-white"
            >
              ver reporte de ejemplo →
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Divider className="bg-white/5 mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
              <span>el simulador · itera</span>
            </div>
            <div className="flex items-center gap-6">
              <span>diseño en preview · no producción</span>
              <Link
                href="https://itera.la"
                size="sm"
                className="text-white/40 hover:text-white"
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
