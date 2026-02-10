"use client";

import { useMemo, useState } from "react";
import { Button, Card, ProgressBar, SectionHeader, Tag } from "@/components/ui";

const question = {
  prompt:
    "Quieres que un agente RAG responda con menos alucinaciones. Que cambio tiene mas impacto inmediato?",
  hint: "Piensa en obligar al modelo a justificar su respuesta con evidencia concreta.",
  options: [
    { id: 1, text: "Pedir respuestas mas creativas y largas." },
    { id: 2, text: "Exigir citas de las fuentes recuperadas y marcar cuando no haya evidencia." },
    { id: 3, text: "Aumentar la temperatura para explorar variaciones." },
    { id: 4, text: "Eliminar el paso de recuperacion para ganar velocidad." },
  ],
  correctId: 2,
  explanation:
    "Forzar citas y declarar ausencia de evidencia reduce fabricaciones porque el modelo queda atado al contexto recuperado.",
};

export default function ExperimentExerciseDemoSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [lives, setLives] = useState(3);
  const [completed, setCompleted] = useState(2);
  const total = 5;

  const isCorrect = submitted && selectedId === question.correctId;
  const canSubmit = selectedId !== null && !submitted;

  const feedbackTone = useMemo(() => {
    if (!submitted) return "idle" as const;
    return isCorrect ? ("success" as const) : ("error" as const);
  }, [submitted, isCorrect]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    if (selectedId !== question.correctId) {
      setLives((prev) => Math.max(0, prev - 1));
    } else {
      setCompleted((prev) => Math.min(total, prev + 1));
    }
  };

  const handleRetry = () => {
    setSelectedId(null);
    setSubmitted(false);
    setShowHint(false);
  };

  return (
    <section id="demo" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <SectionHeader
          title="demo de ejercicio"
          subtitle="patron de feedback inmediato: responder, validar al instante y explicar el por que."
          action={<Tag variant="primary">1 pregunta activa</Tag>}
        />

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 items-start">
          <Card variant="neutral" padding="lg" className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Tag variant="outline">Pregunta de opcion multiple</Tag>
              <p className="text-sm font-bold text-[#4b4b4b] dark:text-gray-200">
                Corazones: <span className="text-[#1472FF]">{lives}/3</span>
              </p>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-[#4b4b4b] dark:text-white leading-tight">
              {question.prompt}
            </h3>

            {showHint && (
              <div className="rounded-2xl border-2 border-b-4 border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-800 dark:text-yellow-300">
                  Pista contextual
                </p>
                <p className="mt-1 text-sm text-yellow-900 dark:text-yellow-200">
                  {question.hint}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedId === option.id;
                const isCorrectOption = option.id === question.correctId;

                const stateClass = submitted
                  ? isCorrectOption
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : isSelected
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  : isSelected
                    ? "border-[#1472FF] bg-[#1472FF]/10"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#1472FF]/50";

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => !submitted && setSelectedId(option.id)}
                    className={`w-full text-left rounded-2xl border-2 border-b-4 p-4 transition-all duration-150 ${
                      submitted ? "cursor-default" : "cursor-pointer active:border-b-2 active:mt-[2px]"
                    } ${stateClass}`}
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-[#777777] dark:text-gray-400">
                      Opcion {option.id}
                    </p>
                    <p className="mt-1 text-base text-[#4b4b4b] dark:text-gray-200">
                      {option.text}
                    </p>
                  </button>
                );
              })}
            </div>

            {feedbackTone !== "idle" && (
              <Card
                variant={feedbackTone === "success" ? "completado" : "neutral"}
                padding="md"
                className={
                  feedbackTone === "success"
                    ? ""
                    : "border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                }
              >
                <p
                  className={`text-xs font-bold uppercase tracking-wide ${
                    feedbackTone === "success"
                      ? "text-white/90"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {feedbackTone === "success" ? "Respuesta correcta" : "Respuesta incorrecta"}
                </p>
                <p
                  className={`mt-1 text-sm ${
                    feedbackTone === "success"
                      ? "text-white"
                      : "text-red-900 dark:text-red-200"
                  }`}
                >
                  {question.explanation}
                </p>
              </Card>
            )}

            <div className="flex flex-wrap items-center gap-3">
              {!submitted ? (
                <Button
                  variant="primary"
                  depth="full"
                  rounded2xl
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  Comprobar respuesta
                </Button>
              ) : (
                <Button
                  variant="outline"
                  rounded2xl
                  onClick={handleRetry}
                >
                  Repetir ejercicio
                </Button>
              )}

              <Button
                variant="ghost"
                rounded2xl
                onClick={() => setShowHint((prev) => !prev)}
              >
                {showHint ? "Ocultar pista" : "Ver pista"}
              </Button>
            </div>
          </Card>

          <Card variant="neutral" padding="lg" className="space-y-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#777777] dark:text-gray-400">
              progreso de sesion
            </p>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#4b4b4b] dark:text-gray-200">
                  Ejercicios completados
                </p>
                <p className="text-sm font-bold text-[#1472FF]">
                  {completed}/{total}
                </p>
              </div>
              <ProgressBar value={(completed / total) * 100} size="lg" />
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="font-bold uppercase text-xs tracking-wide text-[#777777] dark:text-gray-400">
                  tiempo estimado
                </p>
                <p className="mt-1 text-[#4b4b4b] dark:text-gray-200">6 minutos</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="font-bold uppercase text-xs tracking-wide text-[#777777] dark:text-gray-400">
                  recompensa
                </p>
                <p className="mt-1 text-[#4b4b4b] dark:text-gray-200">+25 XP</p>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">
                <p className="font-bold uppercase text-xs tracking-wide text-[#777777] dark:text-gray-400">
                  review programado
                </p>
                <p className="mt-1 text-[#4b4b4b] dark:text-gray-200">En 2 dias</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
