'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBriefcase,
  IconBuildingCommunity,
  IconChartBar,
  IconChecks,
  IconClipboardText,
  IconMessage2Question,
  IconReportAnalytics,
  IconScale,
  IconShieldCheck,
  IconSparkles,
  IconTargetArrow,
  IconTool,
} from '@tabler/icons-react';
import Button from '@/components/ui/Button';
import Card, { CardFlat } from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Tag from '@/components/ui/Tag';
import { Textarea } from '@/components/ui/Input';
import { Body, Caption, Headline, Subtitle, Title } from '@/components/ui/Typography';

type Icon = ComponentType<{ className?: string; stroke?: number }>;

type SkillScore = {
  label: string;
  value: number;
  note: string;
};

type Scenario = {
  id: string;
  title: string;
  department: string;
  companyNeed: string;
  userMission: string;
  risk: string;
  aiMove: string;
  finalDecision: string;
  evidence: string[];
  scores: SkillScore[];
  icon: Icon;
};

type Step = {
  label: string;
  title: string;
  body: string;
  action: string;
  icon: Icon;
};

const steps: Step[] = [
  {
    label: 'contexto',
    title: 'entiende la situación',
    body: 'el usuario recibe un caso laboral con objetivo, restricciones, datos incompletos y riesgos reales.',
    action: 'identificar qué falta antes de pedirle algo a la IA',
    icon: IconClipboardText,
  },
  {
    label: 'criterio',
    title: 'decide cómo usar IA',
    body: 'no se evalúa si sabe escribir un prompt bonito; se evalúa si sabe elegir herramienta, contexto y límites.',
    action: 'separar tarea, información sensible y output esperado',
    icon: IconTool,
  },
  {
    label: 'ejecución',
    title: 'trabaja con la IA',
    body: 'la simulación le pide redactar instrucciones, pedir aclaraciones y mejorar una respuesta inicial.',
    action: 'convertir una instrucción vaga en una instrucción operable',
    icon: IconSparkles,
  },
  {
    label: 'evaluación',
    title: 'detecta calidad y riesgo',
    body: 'el usuario revisa si la respuesta inventa datos, rompe privacidad, ignora restricciones o no sirve para trabajo real.',
    action: 'marcar errores y justificar correcciones',
    icon: IconShieldCheck,
  },
  {
    label: 'decisión',
    title: 'entrega una decisión',
    body: 'la salida final no es un quiz: es una recomendación breve con tradeoffs, siguiente paso y nivel de riesgo.',
    action: 'decidir qué se puede usar, qué se debe revisar y qué no se debe automatizar',
    icon: IconChecks,
  },
];

const scenarios: Scenario[] = [
  {
    id: 'support',
    title: 'responder tickets con datos de clientes',
    department: 'operaciones',
    companyNeed: 'el equipo quiere reducir tiempo de respuesta sin exponer datos sensibles.',
    userMission: 'proponer un flujo seguro para usar IA en tickets repetidos.',
    risk: 'datos personales, respuestas inventadas y escalaciones mal clasificadas.',
    aiMove: 'crear un prompt con reglas de privacidad, casos de escalación y ejemplo de respuesta.',
    finalDecision: 'usar IA solo como borrador interno y exigir revisión humana en casos con pagos, salud o quejas legales.',
    evidence: [
      'detectó 3 datos que no deben enviarse a una herramienta externa',
      'definió cuándo la IA ayuda y cuándo debe escalar a humano',
      'entregó un flujo aplicable sin prometer automatización total',
    ],
    scores: [
      { label: 'contexto', value: 82, note: 'pidió datos suficientes antes de actuar' },
      { label: 'privacidad', value: 91, note: 'separó datos sensibles del prompt' },
      { label: 'decisión', value: 74, note: 'recomendación útil, falta métrica de seguimiento' },
    ],
    icon: IconShieldCheck,
  },
  {
    id: 'marketing',
    title: 'lanzar campaña sin romper marca ni compliance',
    department: 'marketing',
    companyNeed: 'marketing quiere usar IA para crear 20 variantes de campaña en un día.',
    userMission: 'diseñar un proceso que acelere sin perder tono, promesa ni revisión legal.',
    risk: 'claims exagerados, tono genérico y assets que no pasan aprobación.',
    aiMove: 'dar brief, voz de marca, límites de promesa y matriz de variantes.',
    finalDecision: 'generar variantes con IA, filtrar por promesa válida y pasar solo 5 a revisión.',
    evidence: [
      'usó restricciones de marca antes de generar copy',
      'eliminó claims sin evidencia',
      'propuso una métrica de campaña conectada a negocio',
    ],
    scores: [
      { label: 'brief', value: 78, note: 'buen contexto, faltó audiencia secundaria' },
      { label: 'riesgo', value: 69, note: 'detectó claims, pero tarde' },
      { label: 'aplicabilidad', value: 86, note: 'proceso fácil de repetir por el equipo' },
    ],
    icon: IconTargetArrow,
  },
  {
    id: 'sales',
    title: 'personalizar outbound sin sonar falso',
    department: 'ventas',
    companyNeed: 'ventas necesita contactar 80 cuentas sin mandar mensajes genéricos.',
    userMission: 'usar IA para investigar y redactar mensajes con personalización verificable.',
    risk: 'inventar datos, sonar automatizado o prometer algo que ventas no puede cumplir.',
    aiMove: 'pedir investigación con fuentes, separar hechos de inferencias y crear mensajes auditables.',
    finalDecision: 'usar IA para preparar borradores, pero enviar solo mensajes con datos verificados.',
    evidence: [
      'separó fuente, inferencia y opinión',
      'detectó datos no verificables antes de enviarlos',
      'creó un criterio de calidad para mensajes outbound',
    ],
    scores: [
      { label: 'investigación', value: 88, note: 'pidió fuentes y descartó inferencias débiles' },
      { label: 'tono', value: 76, note: 'mejoró naturalidad, aún suena algo template' },
      { label: 'control', value: 84, note: 'buena regla de verificación antes de envío' },
    ],
    icon: IconBriefcase,
  },
];

export default function SimulatorSystemPage() {
  const [activeScenarioId, setActiveScenarioId] = useState(scenarios[0].id);
  const [activeStep, setActiveStep] = useState(0);

  const scenario = useMemo(
    () => scenarios.find((item) => item.id === activeScenarioId) ?? scenarios[0],
    [activeScenarioId],
  );
  const step = steps[activeStep];
  const ScenarioIcon = scenario.icon;
  const StepIcon = step.icon;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <section className="border-b-2 border-gray-200 bg-white dark:border-gray-900 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap gap-2">
                <Tag variant="primary">simulador</Tag>
                <Tag variant="outline">criterio IA</Tag>
                <Tag variant="neutral">b2b readiness</Tag>
              </div>
              <Title>practica decisiones reales con IA</Title>
              <Subtitle>
                una pantalla de ejemplo para mover Itera de lecciones teóricas a simulaciones
                laborales con evidencia para empresa.
              </Subtitle>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setActiveStep(4)}>
                ver evidencia
              </Button>
              <Button variant="primary" onClick={() => setActiveStep(0)}>
                iniciar simulación
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['unidad', 'simulación', IconBuildingCommunity],
              ['resultado', 'decisión', IconScale],
              ['medición', 'readiness', IconReportAnalytics],
              ['valor', 'evidencia', IconChartBar],
            ].map(([label, value, IconItem]) => {
              const MetricIcon = IconItem as Icon;
              return (
                <CardFlat key={label as string} className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MetricIcon className="h-5 w-5" stroke={2} />
                    </span>
                    <div>
                      <Caption>{label}</Caption>
                      <Body className="font-bold">{value}</Body>
                    </div>
                  </div>
                </CardFlat>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="space-y-4">
          <div>
            <Headline>escenarios</Headline>
            <Caption>casos de trabajo, no módulos de teoría.</Caption>
          </div>

          <div className="space-y-3">
            {scenarios.map((item) => {
              const ItemIcon = item.icon;
              const active = item.id === scenario.id;
              return (
                <Card
                  key={item.id}
                  variant={active ? 'primary' : 'neutral'}
                  interactive
                  padding="md"
                  onClick={() => setActiveScenarioId(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <ItemIcon className="mt-1 h-5 w-5 shrink-0" stroke={2} />
                    <div className="space-y-1">
                      <Body className={active ? 'font-bold text-white' : 'font-bold'}>
                        {item.title}
                      </Body>
                      <Caption className={active ? 'text-white/80' : ''}>
                        departamento: {item.department}
                      </Caption>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card padding="lg" className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <Headline>mesa de simulación</Headline>
                  <Title>{scenario.title}</Title>
                  <Body>{scenario.companyNeed}</Body>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ScenarioIcon className="h-6 w-6" stroke={2} />
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                  <Caption>misión</Caption>
                  <Body className="font-bold">{scenario.userMission}</Body>
                </div>
                <div className="space-y-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                  <Caption>uso de IA</Caption>
                  <Body className="font-bold">{scenario.aiMove}</Body>
                </div>
                <div className="space-y-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                  <Caption>riesgo</Caption>
                  <Body className="font-bold">{scenario.risk}</Body>
                </div>
                <div className="space-y-1 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                  <Caption>decisión esperada</Caption>
                  <Body className="font-bold">{scenario.finalDecision}</Body>
                </div>
              </div>

              <div className="space-y-3">
                <Headline>flujo</Headline>
                <div className="grid gap-2 md:grid-cols-5">
                  {steps.map((item, index) => (
                    <Button
                      key={item.label}
                      variant={index === activeStep ? 'primary' : 'outline'}
                      size="sm"
                      className="justify-center whitespace-normal"
                      onClick={() => setActiveStep(index)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 dark:border-gray-900 dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <StepIcon className="h-5 w-5" stroke={2} />
                  </span>
                  <div className="space-y-2">
                    <Title>{step.title}</Title>
                    <Body>{step.body}</Body>
                    <Tag variant="outline">{step.action}</Tag>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Headline>respuesta del usuario</Headline>
                <Textarea
                  rows={5}
                  value={`Primero separaría datos sensibles del caso. Después usaría IA para crear un borrador con límites claros: qué puede responder, qué debe escalar y qué necesita revisión humana. No automatizaría casos de alto riesgo sin supervisión.`}
                  readOnly
                />
              </div>
            </Card>

            <Card padding="lg" className="space-y-6">
              <div className="space-y-2">
                <Headline>debrief</Headline>
                <Title>qué aprendió Itera de esta práctica</Title>
                <Body>
                  el producto mide criterio observable: cómo decide, qué riesgos detecta y
                  qué puede aplicar en trabajo real.
                </Body>
              </div>

              <div className="space-y-4">
                {scenario.scores.map((score) => (
                  <div key={score.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <Body className="font-bold">{score.label}</Body>
                      <Caption>{score.value}%</Caption>
                    </div>
                    <ProgressBar value={score.value} />
                    <Caption>{score.note}</Caption>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-900 dark:bg-gray-900">
                <div className="flex items-center gap-2">
                  <IconAlertTriangle className="h-5 w-5 text-primary" stroke={2} />
                  <Headline>evidencia para empresa</Headline>
                </div>
                <div className="space-y-3">
                  {scenario.evidence.map((item) => (
                    <div key={item} className="flex gap-3">
                      <IconArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" stroke={2} />
                      <Caption>{item}</Caption>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card variant="primary" padding="lg">
            <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div className="space-y-2">
                <Headline className="text-white/80">reporte</Headline>
                <Title className="text-white">readiness del equipo</Title>
                <Body className="text-white/90">
                  lo que compra la empresa no es una lista de clases vistas; compra visibilidad
                  sobre capacidad, riesgo y mejora por equipo.
                </Body>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  ['fortaleza', 'privacidad y revisión humana'],
                  ['riesgo', 'poca definición de métricas'],
                  ['siguiente simulación', 'medir impacto operativo'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border-2 border-white/30 p-4">
                    <Caption className="text-white/70">{label}</Caption>
                    <Body className="font-bold text-white">{value}</Body>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex items-start gap-3">
              <IconMessage2Question className="mt-1 h-5 w-5 text-primary" stroke={2} />
              <div>
                <Headline>lectura de producto</Headline>
                <Body>
                  este ejemplo mantiene la teoría como soporte. El centro es practicar una
                  situación laboral, tomar una decisión y dejar evidencia útil para el usuario
                  y para la empresa.
                </Body>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
