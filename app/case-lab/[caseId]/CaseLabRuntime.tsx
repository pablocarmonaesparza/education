"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DemoCase, DemoCaseSection, DemoSlide } from "@/lib/simulador/case-lab-cases";

type DataChoice = "Usar" | "Anonimizar" | "Agregar" | "Excluir";
type ModelBrand = "internal" | "openai" | "anthropic" | "google" | "meta" | "qwen" | "deepseek";
type ModelOption = {
  id: string;
  label: string;
  badge?: string;
  brand: ModelBrand;
  price: number;
  intel: number;
};

type FlatSlide = {
  section: DemoCaseSection;
  sectionIndex: number;
  slide: DemoSlide;
  slideIndex: number;
};

const sectionNextLabel: Record<DemoCaseSection["name"], string> = {
  Contexto: "Ir a Datos",
  Datos: "Ir a IA",
  IA: "Ir a Revisión",
  Revisión: "Ir a Decisión",
  Decisión: "Ir a Respuesta",
  Respuesta: "Terminar",
};

const modelOptions: ModelOption[] = [
  { id: "gpt-corporativo", label: "GPT Corporativo", badge: "IT", brand: "internal", price: 1, intel: 3 },
  { id: "chatgpt-5.5", label: "ChatGPT 5.5", brand: "openai", price: 3, intel: 4 },
  { id: "chatgpt-5.5-thinking", label: "ChatGPT 5.5", badge: "Thinking", brand: "openai", price: 5, intel: 5 },
  { id: "claude-haiku-4.5", label: "Claude Haiku 4.5", brand: "anthropic", price: 2, intel: 3 },
  { id: "claude-sonnet-4.6", label: "Claude Sonnet 4.6", brand: "anthropic", price: 3, intel: 4 },
  { id: "claude-opus-4.7", label: "Claude Opus 4.7", brand: "anthropic", price: 5, intel: 5 },
  { id: "gemini-3-flash", label: "Gemini 3 Flash", brand: "google", price: 1, intel: 3 },
  { id: "gemini-3-pro", label: "Gemini 3 Pro", brand: "google", price: 3, intel: 5 },
  { id: "meta-ai", label: "Meta AI", badge: "Ads", brand: "meta", price: 2, intel: 3 },
  { id: "qwen-3.6", label: "Qwen 3.6", brand: "qwen", price: 1, intel: 3 },
  { id: "deepseek-v4-pro", label: "Deepseek V4 Pro", brand: "deepseek", price: 2, intel: 4 },
];

const brandMark: Record<ModelBrand, string> = {
  internal: "▣",
  openai: "◎",
  anthropic: "✳",
  google: "✦",
  meta: "∞",
  qwen: "✧",
  deepseek: "◆",
};

function findModel(id: string) {
  return modelOptions.find((model) => model.id === id) ?? modelOptions[0];
}

export function CaseLabRuntime({ demoCase }: { demoCase: DemoCase }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const slides = useMemo<FlatSlide[]>(
    () =>
      demoCase.sections.flatMap((section, sectionIndex) =>
        section.slides.map((slide, slideIndex) => ({
          section,
          sectionIndex,
          slide,
          slideIndex,
        })),
      ),
    [demoCase.sections],
  );
  const isIntro = currentIndex === 0;
  const current = slides[Math.max(0, currentIndex - 1)] ?? slides[0];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length;
  const isLastSlideInSection = !isIntro && current.slideIndex === current.section.slides.length - 1;
  const progress = isIntro ? 0 : ((current.slideIndex + 1) / current.section.slides.length) * 100;
  const selected = isIntro ? "" : selectedOptions[current.slide.id] ?? "";

  function goToSection(sectionIndex: number) {
    const nextIndex = slides.findIndex((item) => item.sectionIndex === sectionIndex);
    if (nextIndex >= 0) setCurrentIndex(nextIndex + 1);
  }

  function setOption(slideId: string, value: string) {
    setSelectedOptions((currentOptions) => ({ ...currentOptions, [slideId]: value }));
  }

  return (
    <main className="simulador-root dark min-h-screen surface-canvas text-[var(--text-primary)]">
      <div className="flex h-screen flex-col overflow-hidden">
        <header className="mx-auto flex h-16 w-full max-w-[1440px] shrink-0 items-center justify-between gap-6 px-6 md:px-10">
          <Link
            href="/case-lab"
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            ← Casos
          </Link>
          <div
            role="progressbar"
            aria-label={isIntro ? "Progreso de sección 0%" : `Progreso de ${current.section.name} ${Math.round(progress)}%`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-1 w-[min(520px,42vw)] overflow-hidden rounded-full bg-[var(--surface-3)]"
          >
            <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
          </div>
          <Link
            href="/exercise-lab"
            className="rounded-[10px] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]"
          >
            Ejercicios
          </Link>
        </header>

        <div className="mx-auto grid min-h-0 w-full max-w-[1440px] flex-1 gap-6 px-6 pb-8 md:px-10 lg:grid-cols-[172px_minmax(0,1fr)] xl:grid-cols-[286px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden min-h-0 lg:block xl:hidden">
            <div className="flex h-full flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm font-semibold leading-5">{demoCase.title}</p>
              </div>
              <nav className="mt-5 grid gap-2">
                {demoCase.sections.map((section, index) => (
                  <button
                    key={section.name}
                    type="button"
                    onClick={() => goToSection(index)}
                    aria-label={section.name}
                    title={section.name}
                    className={[
                      "flex items-center gap-2 rounded-[14px] px-2 py-2 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-white/18 text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>
              <p className="mt-auto text-xs leading-5 text-[var(--text-tertiary)]">
                {isIntro ? "Inicio del caso" : `${current.section.name} · ${current.slideIndex + 1}/5`}
              </p>
            </div>
          </aside>

          <aside className="hidden min-h-0 xl:block">
            <div className="flex h-full flex-col rounded-[24px] border border-[var(--border)] bg-[var(--surface-2)] p-5">
              <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--accent)]">
                    {demoCase.level}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{demoCase.profile}</span>
                </div>
                <h1 className="text-lg font-semibold leading-6">{demoCase.title}</h1>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {demoCase.company} · {demoCase.minutes} min
                </p>
              </div>

              <nav className="mt-6 grid gap-2">
                {demoCase.sections.map((section, index) => (
                  <button
                    key={section.name}
                    type="button"
                    onClick={() => goToSection(index)}
                    className={[
                      "flex items-center gap-3 rounded-[14px] px-3 py-3 text-left transition",
                      !isIntro && current.sectionIndex === index
                        ? "bg-[var(--accent-soft)] text-[var(--text-primary)]"
                        : "text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold",
                        !isIntro && current.sectionIndex === index
                          ? "bg-[var(--accent)] text-white"
                          : "border border-[var(--border)] text-[var(--text-secondary)]",
                      ].join(" ")}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{section.name}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-auto rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs text-[var(--text-tertiary)]">Brief para manager</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {demoCase.managerBrief}
                </p>
              </div>
            </div>
          </aside>

          <section className="min-h-0 overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface-2)]">
            <AnimatePresence mode="wait">
              <motion.article
                key={isIntro ? "case-intro" : current.slide.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid h-full grid-rows-[minmax(0,1fr)_auto]"
              >
                {isIntro ? (
                  <IntroPanel
                    demoCase={demoCase}
                    timerEnabled={timerEnabled}
                    setTimerEnabled={setTimerEnabled}
                  />
                ) : (
                  <div
                    className={[
                      "grid min-h-0 overflow-hidden",
                      current.slide.type === "reading"
                        ? "place-items-center gap-6 p-6 md:p-8"
                        : "gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(320px,0.82fr)] lg:items-center",
                    ].join(" ")}
                  >
                    <div className="mx-auto w-full max-w-[720px] xl:mx-0">
                      <div className="flex items-center justify-between gap-4">
                        <p className="eyebrow text-[var(--text-tertiary)]">
                          {current.section.name} · {current.slide.eyebrow}
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {current.slideIndex + 1} / {current.section.slides.length}
                        </p>
                      </div>
                      <h2
                        className={[
                          "display leading-[1.04]",
                          current.slide.type === "reading"
                            ? "mt-8 text-[34px] md:text-[46px] xl:text-[52px]"
                            : "mt-5 text-[30px] md:text-[38px] xl:text-[44px]",
                        ].join(" ")}
                      >
                        {current.slide.title}
                      </h2>
                      <p
                        className={[
                          "max-w-[680px] text-[var(--text-secondary)]",
                          current.slide.type === "reading"
                            ? "mt-5 text-[17px] leading-8 md:text-[19px]"
                            : "mt-4 text-[15px] leading-7 md:text-[17px]",
                        ].join(" ")}
                      >
                        {current.slide.body}
                      </p>
                    </div>

                    {current.slide.type !== "reading" ? (
                      <div className="mx-auto w-full max-w-[560px]">
                        <ExercisePanel
                          slide={current.slide}
                          selected={selected}
                          setSelected={(value) => setOption(current.slide.id, value)}
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                <footer className="flex shrink-0 items-center justify-between border-t border-[var(--hairline)] px-6 py-4 md:px-8">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                    disabled={isFirst}
                    className="rounded-[12px] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((index) => Math.min(slides.length, index + 1))}
                    disabled={isLast}
                    className="rounded-[12px] bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
                  >
                    {isIntro
                      ? "Comenzar"
                      : isLast
                      ? "Listo"
                      : isLastSlideInSection
                        ? sectionNextLabel[current.section.name]
                        : "Continuar"}
                  </button>
                </footer>
              </motion.article>
            </AnimatePresence>
          </section>
        </div>
      </div>
    </main>
  );
}

function IntroPanel({
  demoCase,
  timerEnabled,
  setTimerEnabled,
}: {
  demoCase: DemoCase;
  timerEnabled: boolean;
  setTimerEnabled: (value: boolean) => void;
}) {
  return (
    <div className="grid min-h-0 place-items-center overflow-hidden p-6 md:p-8">
      <div className="mx-auto grid w-full max-w-[860px] gap-8">
        <div>
          <p className="eyebrow text-[var(--text-tertiary)]">Inicio del caso</p>
          <h2 className="display mt-8 text-[36px] leading-[1.04] md:text-[54px]">
            {demoCase.title}
          </h2>
          <p className="mt-5 max-w-[740px] text-[18px] leading-8 text-[var(--text-secondary)] md:text-[20px]">
            {demoCase.summary} Trabajarás con herramientas reales de IA y marketing, datos sintéticos,
            revisión de salida y una recomendación final para manager.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Herramientas del caso</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {demoCase.tools.map((tool) => (
                <div key={tool} className="rounded-[16px] bg-[var(--surface-3)] px-4 py-3 text-sm font-medium">
                  {tool}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-sm font-medium text-[var(--text-tertiary)]">Timer</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Tiempo sugerido: {demoCase.minutes} min.
            </p>
            <button
              type="button"
              onClick={() => setTimerEnabled(!timerEnabled)}
              className={[
                "mt-5 w-full rounded-[14px] px-4 py-3 text-sm font-medium transition",
                timerEnabled
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-3)] text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {timerEnabled ? "Timer activado" : "Activar timer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExercisePanel({
  slide,
  selected,
  setSelected,
}: {
  slide: DemoSlide;
  selected: string;
  setSelected: (value: string) => void;
}) {
  if (slide.type === "data_table" && slide.rows) {
    return <CaseDataTable rows={slide.rows} />;
  }

  if (slide.type === "ai_textfield") {
    return <CasePromptComposer placeholder={slide.prompt ?? slide.body} />;
  }

  if (slide.type === "guided_prompt") {
    return <GuidedPromptBlock />;
  }

  if (slide.type === "agent_brief") {
    return <AgentBriefBlock />;
  }

  if (slide.type === "permission_matrix" && slide.options) {
    return <PermissionMatrixBlock options={slide.options} />;
  }

  if ((slide.type === "output_review" || slide.type === "log_review" || slide.type === "decision") && slide.options) {
    if (slide.type === "decision") {
      return <DecisionBlock body={slide.body} options={slide.options} selected={selected} setSelected={setSelected} />;
    }
    return <OutputReviewBlock options={slide.options} selected={selected} setSelected={setSelected} logMode={slide.type === "log_review"} />;
  }

  if (slide.type === "memo") {
    return <DecisionMemoBlock />;
  }

  return (
    <PanelShell title="Ejercicio">
      <p className="text-[var(--text-secondary)]">Ejercicio aplicado al caso.</p>
    </PanelShell>
  );
}

function CaseDataTable({ rows }: { rows: NonNullable<DemoSlide["rows"]> }) {
  const [choices, setChoices] = useState<Record<string, DataChoice | "">>({});
  const actions: DataChoice[] = ["Usar", "Anonimizar", "Agregar", "Excluir"];

  return (
    <PanelShell title="02 · Tabla editable de datos">
      <div className="overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-3 border-b border-[var(--hairline)] p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_160px] md:items-center"
          >
            <div>
              <p className="text-[15px] font-semibold text-[var(--text-primary)]">{row.label}</p>
              <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">{row.detail}</p>
            </div>
            <div className="relative">
              <select
                value={choices[row.label] ?? ""}
                onChange={(event) =>
                  setChoices((current) => ({ ...current, [row.label]: event.target.value as DataChoice }))
                }
                className="min-h-11 w-full appearance-none rounded-[14px] border border-[var(--border)] bg-[var(--surface-2)] py-2 pl-3 pr-10 text-[14px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">Decidir</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-tertiary)]" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function GuidedPromptBlock() {
  const [activeStep, setActiveStep] = useState(0);
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [limits, setLimits] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [intelligence, setIntelligence] = useState(60);
  const [security, setSecurity] = useState(80);
  const [cost, setCost] = useState(40);
  const [prompt, setPrompt] = useState("");
  const steps = ["Objetivo", "Audiencia", "Límites", "Modelo"];
  const recommendedModel = model || chooseModel({ intelligence, security, cost });
  const selectedModel = findModel(recommendedModel);
  const canCreate = Boolean(objective && audience && limits.length > 0 && recommendedModel);

  function toggleLimit(limit: string) {
    setLimits((current) => current.includes(limit) ? current.filter((item) => item !== limit) : [...current, limit]);
  }

  function updateMetric(metric: "intelligence" | "security" | "cost", value: number) {
    if (metric === "intelligence") setIntelligence(value);
    if (metric === "security") setSecurity(value);
    if (metric === "cost") setCost(value);
    setModel("");
  }

  function createPrompt() {
    if (!canCreate) return;
    setPrompt(
      `Objetivo: ${objective}.\nAudiencia: ${audience}.\nModelo sugerido: ${selectedModel.label}${selectedModel.badge ? ` · ${selectedModel.badge}` : ""}.\n\nUsa sólo datos agregados o anonimizados del caso. Límites: ${limits.join("; ")}.\n\nEntrega tres ángulos de campaña, riesgos visibles y validaciones humanas pendientes antes de publicar.`,
    );
  }

  return (
    <PanelShell title="01B · Textfield de IA guiado">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]">
        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="mb-3 grid grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => setActiveStep(index)}
                className={[
                  "min-h-10 rounded-[12px] border px-2 text-[12px] font-medium transition",
                  activeStep === index
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                    : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
                ].join(" ")}
              >
                {step}
              </button>
            ))}
          </div>

          {activeStep === 0 && (
            <OptionStack
              options={["Reactivar cuentas con bajo uso", "Proponer tres ángulos de campaña", "Resumir feedback para ventas"]}
              selected={objective}
              onSelect={setObjective}
            />
          )}
          {activeStep === 1 && (
            <OptionStack
              options={["VP de Marketing", "Equipo de ventas enterprise", "Cliente final"]}
              selected={audience}
              onSelect={setAudience}
            />
          )}
          {activeStep === 2 && (
            <OptionStack
              options={["No usar nombres ni correos", "Marcar afirmaciones sin fuente", "Dejar supuestos como borrador interno", "Explicar dudas antes de publicar"]}
              selected={limits.join("|")}
              onSelect={toggleLimit}
              multi
            />
          )}
          {activeStep === 3 && (
            <div className="grid gap-3">
              <div className="rounded-[18px] bg-[var(--surface-2)] p-3">
                <div className="flex items-center gap-3">
                  <ModelBadge model={selectedModel} />
                  <div>
                    <p className="text-sm text-[var(--text-tertiary)]">Modelo recomendado</p>
                    <p className="font-semibold">{selectedModel.label}{selectedModel.badge ? ` · ${selectedModel.badge}` : ""}</p>
                  </div>
                </div>
              </div>
              <MetricRow label="Inteligencia" value={intelligence} onChange={(value) => updateMetric("intelligence", value)} />
              <MetricRow label="Seguridad" value={security} onChange={(value) => updateMetric("security", value)} />
              <MetricRow label="Costo" value={cost} onChange={(value) => updateMetric("cost", value)} />
              <button
                type="button"
                onClick={createPrompt}
                disabled={!canCreate}
                className="min-h-11 rounded-[14px] bg-[var(--accent)] px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]"
              >
                Crear prompt
              </button>
            </div>
          )}
        </div>

        <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-sm font-medium text-[var(--text-tertiary)]">Respuestas</p>
          <div className="mt-3 grid gap-2 text-sm">
            <AnswerLine label="Objetivo" value={objective} />
            <AnswerLine label="Audiencia" value={audience} />
            <AnswerLine label="Límites" value={limits.join("; ")} />
            <AnswerLine label="Modelo" value={canCreate ? `${selectedModel.label}${selectedModel.badge ? ` · ${selectedModel.badge}` : ""}` : ""} />
          </div>
          <div className="mt-3 min-h-[112px] whitespace-pre-wrap rounded-[18px] bg-[var(--surface-2)] p-3 text-[13px] leading-6 text-[var(--text-secondary)]">
            {prompt || "El prompt aparecerá aquí cuando completes las selecciones y pulses Crear prompt."}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function CasePromptComposer({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState("");
  const [model, setModel] = useState("gpt-corporativo");
  const [open, setOpen] = useState(false);
  const selectedModel = findModel(model);

  return (
    <PanelShell title="01A · Textfield de IA libre">
      <div className="rounded-[26px] border border-[var(--border)] bg-[var(--surface)] p-4">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="min-h-[150px] w-full resize-none bg-transparent text-[15px] leading-7 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
        />
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex items-center gap-2">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-3)]" aria-label="Agregar archivo">
              +
            </button>
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="flex min-h-9 items-center gap-2 rounded-[14px] px-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-3)]"
            >
              <ModelBadge model={selectedModel} />
              <span>{selectedModel.label}{selectedModel.badge ? ` · ${selectedModel.badge}` : ""}</span>
              <span>⌄</span>
            </button>
            {open && (
              <div className="absolute bottom-full left-0 z-20 mb-2 w-[290px] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)] py-2 shadow-2xl">
                {modelOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setModel(option.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[var(--surface-3)]"
                  >
                    <ModelBadge model={option} />
                    <span className="flex-1">{option.label}{option.badge ? ` · ${option.badge}` : ""}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">${option.price} · ✦{option.intel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-3)]" aria-label="Nota de voz">⌕</button>
            <button type="button" disabled={!value.trim()} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent)] text-white disabled:bg-[var(--surface-3)] disabled:text-[var(--text-disabled)]">↑</button>
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function PermissionMatrixBlock({ options }: { options: string[] }) {
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  return (
    <PanelShell title="03 · Matriz de permisos">
      <div className="grid gap-3">
        {options.map((option) => (
          <div key={option} className="grid gap-3 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[1fr_260px] md:items-center">
            <p className="font-medium">{option}</p>
            <div className="grid grid-cols-3 gap-2">
              {["Permitir", "Revisar", "Bloquear"].map((choice) => (
                <ChoiceButton key={choice} selected={permissions[option] === choice} onClick={() => setPermissions((current) => ({ ...current, [option]: choice }))}>
                  {choice}
                </ChoiceButton>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PanelShell>
  );
}

function OutputReviewBlock({
  options,
  selected,
  setSelected,
  logMode,
}: {
  options: string[];
  selected: string;
  setSelected: (value: string) => void;
  logMode: boolean;
}) {
  const selectedSet = new Set(selected ? selected.split("|") : []);
  function toggle(option: string) {
    const next = new Set(selectedSet);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    setSelected(Array.from(next).join("|"));
  }
  return (
    <PanelShell title={logMode ? "08 · Revisión de logs" : "04 · Revisión de output"}>
      <div className="grid gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            className={[
              "min-h-[64px] rounded-[18px] border p-4 text-left text-[15px] leading-6 transition",
              selectedSet.has(option)
                ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
                : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
            ].join(" ")}
          >
            {option}
          </button>
        ))}
      </div>
    </PanelShell>
  );
}

function DecisionBlock({
  body,
  options,
  selected,
  setSelected,
}: {
  body: string;
  options: string[];
  selected: string;
  setSelected: (value: string) => void;
}) {
  return (
    <PanelShell title="11 · Decisión con ventajas y costos">
      <p className="mb-4 text-sm leading-6 text-[var(--text-secondary)]">{body}</p>
      <div className="grid gap-3">
        {options.map((option) => (
          <ChoiceCard key={option} selected={selected === option} onClick={() => setSelected(option)} title={option} />
        ))}
      </div>
    </PanelShell>
  );
}

function DecisionMemoBlock() {
  const [decision, setDecision] = useState("");
  const [memo, setMemo] = useState("");
  const options = ["Enviar propuesta con riesgos visibles", "Pedir validación antes de publicar", "Pausar la campaña"];
  return (
    <PanelShell title="11 · Decisión + memo">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <div className="grid gap-2">
          {options.map((option) => (
            <ChoiceButton key={option} selected={decision === option} onClick={() => setDecision(option)}>
              {option}
            </ChoiceButton>
          ))}
        </div>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          className="min-h-[230px] w-full resize-none rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 text-[16px] leading-8 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]"
          placeholder="Escribe una recomendación breve: acción, dos razones y validación pendiente..."
        />
      </div>
    </PanelShell>
  );
}

function AgentBriefBlock() {
  const [active, setActive] = useState(0);
  const [answers, setAnswers] = useState(["", "", "", ""]);
  const fields = [
    { label: "Tarea", options: ["Preparar borradores", "Enviar mensajes", "Actualizar pipeline"] },
    { label: "Acceso permitido", options: ["Sólo datos agregados", "CRM completo", "Notas internas completas"] },
    { label: "Puede hacer", options: ["Crear borrador", "Enviar externo", "Cerrar oportunidad"] },
    { label: "Debe detenerse si", options: ["Falta fuente", "Hay dato personal", "Confianza alta"] },
  ];
  return (
    <PanelShell title="07 · Brief para agente">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-4 grid grid-cols-4 gap-2">
            {fields.map((field, index) => (
              <button key={field.label} type="button" onClick={() => setActive(index)} className={`min-h-10 rounded-[12px] border px-2 text-[12px] ${active === index ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)]"}`}>
                {index + 1}. {field.label}
              </button>
            ))}
          </div>
          <OptionStack
            options={fields[active].options}
            selected={answers[active]}
            onSelect={(value) => {
              const next = [...answers];
              next[active] = value;
              setAnswers(next);
              setActive(Math.min(fields.length - 1, active + 1));
            }}
          />
        </div>
        <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm font-medium text-[var(--text-tertiary)]">Brief del agente</p>
          <div className="mt-4 grid gap-2">
            {fields.map((field, index) => <AnswerLine key={field.label} label={field.label} value={answers[index]} />)}
          </div>
        </div>
      </div>
    </PanelShell>
  );
}

function OptionStack({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid gap-2">
      {options.map((option) => (
        <ChoiceButton
          key={option}
          selected={multi ? selected.split("|").includes(option) : selected === option}
          onClick={() => onSelect(option)}
        >
          {option}
        </ChoiceButton>
      ))}
    </div>
  );
}

function ChoiceButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-10 rounded-[14px] border px-3 py-2 text-left text-sm font-medium transition",
        selected
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ChoiceCard({ selected, onClick, title }: { selected: boolean; onClick: () => void; title: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "min-h-[68px] rounded-[18px] border p-4 text-left text-[15px] leading-6 transition",
        selected
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-3)]",
      ].join(" ")}
    >
      {title}
    </button>
  );
}

function AnswerLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-2)] p-2.5">
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
      <p className={`mt-1 min-h-5 text-sm ${value ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
        {value || "\u00A0"}
      </p>
    </div>
  );
}

function MetricRow({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid grid-cols-[92px_1fr_44px] items-center gap-3 text-sm">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        step={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-[var(--accent)]"
      />
      <span className="text-right font-medium">{value}</span>
    </label>
  );
}

function ModelBadge({ model }: { model: ModelOption }) {
  return (
    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] bg-[var(--surface-3)] text-sm text-[var(--accent)]">
      {brandMark[model.brand]}
    </span>
  );
}

function chooseModel({ intelligence, security, cost }: { intelligence: number; security: number; cost: number }) {
  if (security <= 30 && cost <= 30) return "qwen-3.6";
  if (security <= 40 && intelligence >= 60) return "deepseek-v4-pro";
  if (security >= 80 && cost <= 40) return "gpt-corporativo";
  if (intelligence >= 90 && cost >= 70) return "claude-opus-4.7";
  if (intelligence >= 80 && security >= 70) return "claude-sonnet-4.6";
  if (intelligence >= 80 && cost <= 50) return "gemini-3-pro";
  if (cost <= 30) return "gemini-3-flash";
  if (security >= 70) return "chatgpt-5.5";
  return "meta-ai";
}

function PanelShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-5 text-[var(--text-tertiary)]">{title}</p>
      {children}
    </div>
  );
}
