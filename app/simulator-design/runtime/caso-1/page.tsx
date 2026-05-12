"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Chip,
  CircularProgress,
  Divider,
  Progress,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SurfaceNav } from "../../_components/SurfaceNav";
import { SAMPLE_FEEDBACK_ROWS } from "../../_data/case-data";

const STEPS = [
  { id: 1, key: "data_scope", label: "preparar datos" },
  { id: 2, key: "llm_beat", label: "interacción con IA" },
  { id: 3, key: "artifact_review", label: "revisión de output" },
  { id: 4, key: "decision_select", label: "entrega" },
  { id: 5, key: "decision_open_short", label: "follow-up" },
];

const FIELD_OPTIONS = ["usar tal cual", "transformar", "descartar"];

const FIELDS = [
  "name",
  "email",
  "company",
  "complaint_or_praise",
  "revenue_potential_usd",
  "signed_at",
];

const MODEL_RESPONSE_SAMPLE = `Basado en el análisis del feedback de clientes, aquí están 3 ángulos para tu campaña:

1. "Resuelve el cuello de botella que tu CFO ve antes que tú"
Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga. CFOs y heads of finance pierden visibilidad justo cuando más la necesitan. El gap real es performance, no features.

2. "WhatsApp Business: tu canal más grande sigue desatendido"
Insight: La integración con WhatsApp Business es la solicitud #1 de clientes LATAM con presencia en Colombia, México y Argentina. Empresas como DigitalUp y similares no pueden escalar sin esto. Posicionar Loop como el primer CRM que entiende el canal real.

3. "Onboarding caótico, adopción imparable"
Insight: 8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas. La paradoja vende: dolor inicial × retención brutal. Ángulo: "no te vamos a mentir, los primeros 14 días son intensos. después no podrás imaginar trabajar sin Loop."

Stack recomendado: LinkedIn carousel para ángulo 1, email a list para ángulo 2, video testimonial para ángulo 3.`;

const REVIEW_TARGETS = [
  { id: "unverifiable_claim", label: "cifra o claim sin evidencia" },
  { id: "exposed_sensitive_data", label: "dato sensible expuesto" },
  { id: "weak_segment_logic", label: "lógica de segmentación débil" },
  { id: "generic_positioning", label: "posicionamiento genérico" },
];

const SEGMENTS = [
  {
    id: 0,
    text: '1. "Resuelve el cuello de botella que tu CFO ve antes que tú" — Insight: 41% de los clientes reportan que el módulo de reportes se traba bajo carga.',
  },
  {
    id: 1,
    text: '2. "WhatsApp Business: tu canal más grande sigue desatendido" — La integración con WhatsApp Business es la solicitud #1 de clientes LATAM. Empresas como DigitalUp y similares no pueden escalar sin esto.',
  },
  {
    id: 2,
    text: '3. "Onboarding caótico, adopción imparable" — 8 de cada 10 clientes describe el onboarding como difícil — pero 0 quiere volver atrás después de 2 semanas.',
  },
];

const ENTREGA_OPTIONS = [
  {
    id: "clean_bullets",
    label: "los 3 ángulos finales en bullets, listos para campaña",
  },
  {
    id: "bullets_with_context",
    label:
      "los 3 ángulos + nota corta de qué validaste, qué descartaste, qué riesgo viste",
  },
  {
    id: "bullets_plus_legal_flag",
    label:
      "los 3 ángulos + sugerencia de que legal revise el copy antes de lanzar",
  },
  {
    id: "raw_llm_output",
    label: "le mando el output crudo del LLM, ella decide qué usar",
  },
];

export default function RuntimePage() {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = STEPS[stepIndex];

  const [fieldActions, setFieldActions] = useState<Record<string, string>>({});
  const [step1Reasoning, setStep1Reasoning] = useState("");

  const [userPrompt, setUserPrompt] = useState("");
  const [modelResponse, setModelResponse] = useState<string | null>(null);
  const [isModelThinking, setIsModelThinking] = useState(false);
  const [followupText, setFollowupText] = useState("");

  const [segmentFlags, setSegmentFlags] = useState<Record<number, string[]>>({});

  const [option4, setOption4] = useState("");
  const [step5Text, setStep5Text] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setShowResults(true);
      }, 2400);
    }
  }

  async function sendPrompt() {
    if (!userPrompt.trim()) return;
    setIsModelThinking(true);
    setTimeout(() => {
      setModelResponse(MODEL_RESPONSE_SAMPLE);
      setIsModelThinking(false);
    }, 1600);
  }

  const canAdvance = useMemo(() => {
    switch (currentStep.id) {
      case 1:
        return Object.keys(fieldActions).length === FIELDS.length;
      case 2:
        return modelResponse !== null && followupText.trim().length > 10;
      case 3:
        return Object.keys(segmentFlags).length >= 1;
      case 4:
        return option4 !== "";
      case 5:
        return step5Text.trim().length > 20;
      default:
        return false;
    }
  }, [
    currentStep.id,
    fieldActions,
    modelResponse,
    followupText,
    segmentFlags,
    option4,
    step5Text,
  ]);

  if (isEvaluating) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SurfaceNav />
        <div className="grid place-items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CircularProgress
              size="lg"
              color="secondary"
              className="mb-6"
              aria-label="evaluando sesión"
            />
            <div className="text-2xl font-medium">evaluando tu sesión</div>
            <div className="text-white/40 mt-2">~12 segundos</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SurfaceNav />
        <div className="mx-auto max-w-3xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Chip color="success" variant="flat" className="mb-4">
              caso terminado
            </Chip>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              tu sesión queda guardada.
            </h1>
            <p className="mt-4 text-white/60 leading-relaxed">
              tu reporte personalizado estará disponible en ~24 horas con
              bandas A/M/B por dimensión + sugerencias específicas.
            </p>
            <p className="mt-2 text-white/40 text-sm">
              tu manager ve agregados del equipo, no transcripts individuales.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <Button
                color="primary"
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                onPress={() => {
                  window.location.href = "/simulator-design/reporte/P001";
                }}
              >
                ver mi reporte de ejemplo
              </Button>
              <Button
                variant="bordered"
                size="lg"
                className="border-white/15 text-white"
                onPress={() => {
                  setStepIndex(0);
                  setShowResults(false);
                  setFieldActions({});
                  setModelResponse(null);
                  setUserPrompt("");
                  setFollowupText("");
                  setSegmentFlags({});
                  setOption4("");
                  setStep5Text("");
                }}
              >
                volver al sprint
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SurfaceNav />

      {/* Progress + step indicator */}
      <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-white/40">
                paso {currentStep.id}/5
              </span>
              <span className="text-sm font-medium">{currentStep.label}</span>
            </div>
            <Chip size="sm" variant="flat" color="secondary">
              caso 1 · marketing
            </Chip>
          </div>
          <Progress
            aria-label={`progreso del caso, paso ${currentStep.id} de 5`}
            value={progress}
            color="secondary"
            classNames={{
              indicator: "bg-gradient-to-r from-indigo-500 to-fuchsia-500",
              track: "bg-white/5",
            }}
            className="max-w-full"
          />
        </div>
      </div>

      {/* Contexto fijo arriba */}
      <div className="mx-auto max-w-5xl px-6 pt-8 pb-2">
        <Card className="bg-white/[0.02] border border-white/5 mb-6">
          <CardBody className="p-5">
            <div className="flex items-start gap-4">
              <Avatar
                size="md"
                className="bg-gradient-to-br from-pink-500 to-orange-400 text-white flex-shrink-0"
                name="C"
              />
              <div className="flex-1">
                <div className="text-xs text-white/40 mb-1 flex items-center gap-2">
                  <span className="font-medium text-white">Camila</span>
                  <span>·</span>
                  <span>VP of Growth · jueves 4:30 PM</span>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  "hey, necesito 3 ángulos para LinkedIn ads + 1 email a la lista
                  de prospects para mañana 9 AM. revisa el feedback que CS nos
                  pasó hace 2 meses, ahí está todo. no me metas a legal hoy, ya
                  están cerrados. confío en tu criterio."
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* STEP CONTENT */}
      <div className="mx-auto max-w-5xl px-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep.id === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    ¿qué haces con cada campo del CSV antes de pasarlo al modelo?
                  </h2>
                  <p className="text-white/50 mt-2 text-sm">
                    el dataset tiene 60 filas con feedback de clientes (PII +
                    behavioral). cada campo abajo necesita decisión.
                  </p>
                </div>

                <Card className="bg-white/[0.02] border border-white/5">
                  <CardHeader className="border-b border-white/5 px-5 py-3">
                    <div className="text-xs uppercase tracking-widest text-white/40">
                      sample · 3 de 60 filas
                    </div>
                  </CardHeader>
                  <CardBody className="p-0">
                    <Table
                      aria-label="muestra del dataset de feedback de clientes"
                      removeWrapper
                      classNames={{
                        th: "bg-white/[0.02] text-white/40 text-xs font-medium uppercase tracking-wider",
                        td: "text-white/70 text-sm",
                        tr: "border-t border-white/5",
                      }}
                    >
                      <TableHeader>
                        <TableColumn>name</TableColumn>
                        <TableColumn>email</TableColumn>
                        <TableColumn>company</TableColumn>
                        <TableColumn>complaint</TableColumn>
                        <TableColumn>revenue</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {SAMPLE_FEEDBACK_ROWS.slice(0, 3).map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.name}</TableCell>
                            <TableCell className="text-white/50 text-xs">
                              {r.email}
                            </TableCell>
                            <TableCell>{r.company}</TableCell>
                            <TableCell className="text-white/60 text-xs max-w-[280px] truncate">
                              {r.complaint}
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              ${r.revenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardBody>
                </Card>

                <div className="space-y-2">
                  {FIELDS.map((field) => (
                    <Card
                      key={field}
                      className="bg-white/[0.02] border border-white/5"
                    >
                      <CardBody className="p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="font-mono text-sm text-white/70 md:min-w-[200px]">
                          {field}
                        </div>
                        <RadioGroup
                          aria-label={`acción para el campo ${field}`}
                          orientation="horizontal"
                          value={fieldActions[field] ?? ""}
                          onValueChange={(v) =>
                            setFieldActions({ ...fieldActions, [field]: v })
                          }
                          classNames={{ wrapper: "flex-wrap gap-3" }}
                        >
                          {FIELD_OPTIONS.map((opt) => (
                            <Radio key={opt} value={opt} size="sm">
                              <span className="text-sm text-white/80">{opt}</span>
                            </Radio>
                          ))}
                        </RadioGroup>
                      </CardBody>
                    </Card>
                  ))}
                </div>

                <Textarea
                  label="¿por qué? (máx 60 palabras)"
                  placeholder="explica tu razonamiento..."
                  value={step1Reasoning}
                  onValueChange={setStep1Reasoning}
                  variant="bordered"
                  maxLength={400}
                  classNames={{
                    inputWrapper: "bg-white/[0.02] border-white/10",
                    label: "text-white/60",
                  }}
                />
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    redacta tu prompt al modelo
                  </h2>
                  <p className="text-white/50 mt-2 text-sm">
                    el modelo va a responder UNA vez. opcionalmente puedes pedir
                    un segundo turn. después decides qué hacer con el output.
                  </p>
                </div>

                <Card className="bg-white/[0.02] border border-white/5">
                  <CardBody className="p-5">
                    <Textarea
                      aria-label="prompt al modelo"
                      placeholder="actúa como copywriter B2B SaaS. ejemplos buenos: '...'  audiencia: ops managers LATAM mid-market. genera 3 ángulos..."
                      value={userPrompt}
                      onValueChange={setUserPrompt}
                      variant="flat"
                      minRows={6}
                      classNames={{
                        inputWrapper: "bg-transparent border-0 shadow-none",
                        input: "text-white",
                      }}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-white/30 font-mono">
                        modelo: itera_default · temperature 0
                      </span>
                      <Button
                        color="secondary"
                        size="sm"
                        onPress={sendPrompt}
                        isLoading={isModelThinking}
                        isDisabled={!userPrompt.trim() || modelResponse !== null}
                        className="bg-gradient-to-r from-indigo-500 to-fuchsia-500"
                      >
                        {modelResponse
                          ? "respuesta recibida"
                          : "enviar al modelo"}
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                {modelResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="bg-indigo-500/5 border border-indigo-500/20">
                      <CardHeader className="px-5 py-3 border-b border-indigo-500/10">
                        <div className="flex items-center gap-2 text-xs text-indigo-300">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                          respuesta del modelo
                        </div>
                      </CardHeader>
                      <CardBody className="p-5">
                        <pre className="whitespace-pre-wrap text-sm text-white/80 font-sans leading-relaxed">
                          {modelResponse}
                        </pre>
                      </CardBody>
                    </Card>

                    <div className="mt-6">
                      <Textarea
                        label="¿qué usas, descartas, validas? (máx 320 chars)"
                        placeholder="del ángulo 1 valido la cifra de 41%. del 2 uso la insight. del 3 reescribo..."
                        value={followupText}
                        onValueChange={setFollowupText}
                        variant="bordered"
                        maxLength={320}
                        classNames={{
                          inputWrapper: "bg-white/[0.02] border-white/10",
                          label: "text-white/60",
                        }}
                      />
                      <div className="text-right mt-1 text-xs text-white/30 font-mono">
                        {followupText.length}/320
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    revisa el output del modelo
                  </h2>
                  <p className="text-white/50 mt-2 text-sm">
                    marca qué partes NO enviarías a Camila tal cual. puedes
                    marcar múltiples problemas por segmento.
                  </p>
                </div>

                {SEGMENTS.map((seg) => (
                  <Card
                    key={seg.id}
                    className="bg-white/[0.02] border border-white/5"
                  >
                    <CardBody className="p-5">
                      <div className="text-xs uppercase tracking-widest text-white/30 mb-2">
                        segmento {seg.id + 1}
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed mb-4">
                        {seg.text}
                      </p>
                      <Divider className="bg-white/5 my-3" />
                      <CheckboxGroup
                        label="problemas detectados (marca todos los que apliquen)"
                        value={segmentFlags[seg.id] ?? []}
                        onValueChange={(values) =>
                          setSegmentFlags({ ...segmentFlags, [seg.id]: values })
                        }
                        orientation="horizontal"
                        classNames={{
                          base: "gap-2",
                          label: "text-xs text-white/40 mb-2",
                          wrapper: "flex-wrap gap-2",
                        }}
                      >
                        {REVIEW_TARGETS.map((t) => (
                          <Checkbox
                            key={t.id}
                            value={t.id}
                            size="sm"
                            classNames={{
                              label: "text-xs text-white/80",
                            }}
                          >
                            {t.label}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}

            {currentStep.id === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Camila te pide los ángulos por slack. ¿cómo se los entregas?
                  </h2>
                  <p className="text-white/40 mt-2 text-xs">
                    después de elegir no podrás cambiar tu respuesta en este caso.
                  </p>
                </div>

                <RadioGroup
                  aria-label="opción de entrega a Camila"
                  value={option4}
                  onValueChange={setOption4}
                  classNames={{ wrapper: "gap-3" }}
                >
                  {ENTREGA_OPTIONS.map((opt) => (
                    <Card
                      key={opt.id}
                      className={`bg-white/[0.02] border transition-colors ${
                        option4 === opt.id
                          ? "border-indigo-500/50"
                          : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <CardBody className="p-4">
                        <Radio value={opt.id} size="md">
                          <span className="text-white/80 text-sm leading-snug">
                            {opt.label}
                          </span>
                        </Radio>
                      </CardBody>
                    </Card>
                  ))}
                </RadioGroup>
              </div>
            )}

            {currentStep.id === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Camila contesta:
                  </h2>
                </div>

                <Card className="bg-white/[0.02] border border-white/5">
                  <CardBody className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar
                        size="md"
                        className="bg-gradient-to-br from-pink-500 to-orange-400 text-white"
                        name="C"
                      />
                      <p className="text-white/80 text-sm leading-relaxed">
                        "gracias. oye, ¿podemos usar también el revenue_potential
                        para priorizar a quién mandamos el email? rankeamos top
                        20% y a ellos primero."
                      </p>
                    </div>
                  </CardBody>
                </Card>

                <Textarea
                  label="¿qué le respondes? (máx 280 caracteres)"
                  placeholder="escribe directamente..."
                  value={step5Text}
                  onValueChange={setStep5Text}
                  variant="bordered"
                  maxLength={280}
                  minRows={4}
                  classNames={{
                    inputWrapper: "bg-white/[0.02] border-white/10",
                    label: "text-white/60",
                  }}
                />
                <div className="text-right text-xs text-white/30 font-mono">
                  {step5Text.length}/280
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer fijo con next button */}
        <div className="fixed bottom-0 inset-x-0 bg-black/90 backdrop-blur-xl border-t border-white/5 z-20">
          <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="font-mono">paso {currentStep.id}/5</span>
            </div>
            <Button
              color="primary"
              size="lg"
              isDisabled={!canAdvance}
              onPress={next}
              className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium disabled:opacity-30"
            >
              {stepIndex === STEPS.length - 1 ? "terminar caso" : "siguiente paso"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
