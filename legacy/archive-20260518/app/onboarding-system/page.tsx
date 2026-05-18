'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.css';

type Choice = {
  id: string;
  label: string;
};

type Scene = {
  id: string;
  signal: string;
  title: string;
  choices: Choice[];
};

const scenes: Scene[] = [
  {
    id: 'outcome',
    signal: 'valor',
    title: '¿qué necesita ver la empresa?',
    choices: [
      { id: 'revenue', label: 'más ventas' },
      { id: 'speed', label: 'menos horas' },
      { id: 'quality', label: 'mejor criterio' },
      { id: 'risk', label: 'menos riesgo' },
    ],
  },
  {
    id: 'workflow',
    signal: 'workflow',
    title: '¿dónde se atasca el trabajo?',
    choices: [
      { id: 'proposals', label: 'propuestas' },
      { id: 'customers', label: 'clientes' },
      { id: 'reports', label: 'reportes' },
      { id: 'handoffs', label: 'entregas' },
    ],
  },
  {
    id: 'gap',
    signal: 'gap',
    title: '¿qué falla más con IA?',
    choices: [
      { id: 'context', label: 'mal contexto' },
      { id: 'validation', label: 'no validan' },
      { id: 'privacy', label: 'datos sensibles' },
      { id: 'adoption', label: 'nadie repite' },
    ],
  },
  {
    id: 'case',
    signal: 'caso vivo',
    title: '¿qué caso entrenamos primero?',
    choices: [
      { id: 'lost-deal', label: 'deal en riesgo' },
      { id: 'angry-client', label: 'cliente molesto' },
      { id: 'slow-report', label: 'reporte urgente' },
      { id: 'messy-process', label: 'proceso roto' },
    ],
  },
];

const diagnosticChoices: Choice[] = [
  { id: 'paste', label: 'copiar todo' },
  { id: 'generic', label: 'pedir resumen' },
  { id: 'redact', label: 'anonimizar y decidir' },
  { id: 'pause', label: 'esperar al jefe' },
];

const defaults: Record<string, string> = {
  outcome: 'quality',
  workflow: 'customers',
  gap: 'validation',
  case: 'angry-client',
};

function scoreFor(decision: string) {
  if (decision === 'redact') return 82;
  if (decision === 'generic') return 61;
  if (decision === 'pause') return 57;
  return 34;
}

function summaryCopy(answers: Record<string, string>) {
  if (answers.case === 'lost-deal') return 'rescatar un deal con criterio';
  if (answers.case === 'slow-report') return 'entregar un reporte confiable';
  if (answers.case === 'messy-process') return 'ordenar un proceso con IA';
  return 'responder a clientes sin exponer datos';
}

export default function OnboardingSystemPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState(defaults);
  const [diagnostic, setDiagnostic] = useState('redact');

  const total = scenes.length + 2;
  const scene = scenes[index];
  const isDiagnostic = index === scenes.length;
  const isSummary = index === scenes.length + 1;
  const score = scoreFor(diagnostic);
  const progress = useMemo(() => ((index + 1) / total) * 100, [index, total]);

  const choose = (sceneId: string, choiceId: string) => {
    setAnswers((current) => ({ ...current, [sceneId]: choiceId }));
  };

  const goBack = () => setIndex((current) => Math.max(0, current - 1));
  const goNext = () => setIndex((current) => Math.min(total - 1, current + 1));

  return (
    <main className={styles.screen}>
      <div className={styles.aura} />

      <section className={styles.window}>
        <div className={styles.progressLine}>
          <div style={{ width: `${progress}%` }} />
        </div>

        {scene && (
          <div className={styles.scene}>
            <span className={styles.signal}>{scene.signal}</span>
            <h1>{scene.title}</h1>

            <div className={styles.picker}>
              {scene.choices.map((choice) => {
                const active = answers[scene.id] === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={active ? styles.choiceActive : styles.choice}
                    onClick={() => choose(scene.id, choice.id)}
                  >
                    <strong>{choice.label}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isDiagnostic && (
          <div className={styles.scene}>
            <span className={styles.signal}>criterio</span>
            <h1>un cliente molesto llega con datos sensibles</h1>

            <div className={styles.listPicker}>
              {diagnosticChoices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  className={diagnostic === choice.id ? styles.listChoiceActive : styles.listChoice}
                  onClick={() => setDiagnostic(choice.id)}
                >
                  <strong>{choice.label}</strong>
                </button>
              ))}
            </div>
          </div>
        )}

        {isSummary && (
          <div className={styles.summary}>
            <div className={styles.scoreCard}>
              <strong>{score}</strong>
              <span>readiness</span>
            </div>

            <div className={styles.summaryBody}>
              <h1>caso vivo recomendado</h1>
              <p>{summaryCopy(answers)}</p>
            </div>
          </div>
        )}

        <footer className={styles.assistantFooter}>
          <button type="button" onClick={goBack} disabled={index === 0} className={styles.secondaryButton}>
            atrás
          </button>

          <button type="button" onClick={goNext} disabled={isSummary} className={styles.primaryButton}>
            {isSummary ? 'entrar' : 'continuar'}
          </button>
        </footer>
      </section>
    </main>
  );
}
