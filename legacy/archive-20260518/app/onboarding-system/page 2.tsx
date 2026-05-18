'use client';

import { useMemo, useState } from 'react';
import styles from './page.module.css';

type Option = {
  id: string;
  label: string;
  detail: string;
  signal: string;
};

type Step = {
  id: string;
  kicker: string;
  title: string;
  prompt: string;
  reason: string;
  dashboard: string;
  options: Option[];
};

const steps: Step[] = [
  {
    id: 'role',
    kicker: 'profile',
    title: 'where does your work happen?',
    prompt: 'choose the area that best matches your daily decisions.',
    reason: 'role is the fastest way to make the first simulation feel relevant.',
    dashboard: 'creates readiness views by team and department.',
    options: [
      { id: 'sales', label: 'sales', detail: 'calls, CRM notes, objections, follow-ups', signal: 'department:sales' },
      { id: 'marketing', label: 'marketing', detail: 'campaigns, research, content, performance', signal: 'department:marketing' },
      { id: 'support', label: 'support', detail: 'tickets, customers, docs, response quality', signal: 'department:support' },
      { id: 'ops', label: 'operations', detail: 'processes, reports, coordination, controls', signal: 'department:operations' },
    ],
  },
  {
    id: 'task',
    kicker: 'work pattern',
    title: 'what do you need AI for most often?',
    prompt: 'pick the task pattern that repeats the most in your week.',
    reason: 'task patterns are more useful than generic “skill level” labels.',
    dashboard: 'routes the user into writing, analysis, customer, or decision simulations.',
    options: [
      { id: 'write', label: 'write clearly', detail: 'emails, proposals, briefs, summaries', signal: 'task:writing' },
      { id: 'analyze', label: 'analyze information', detail: 'reports, calls, spreadsheets, documents', signal: 'task:analysis' },
      { id: 'respond', label: 'respond to customers', detail: 'support, sales, objections, follow-up', signal: 'task:customer-response' },
      { id: 'decide', label: 'make decisions', detail: 'tradeoffs, recommendations, risk calls', signal: 'task:decision-support' },
    ],
  },
  {
    id: 'fluency',
    kicker: 'current behavior',
    title: 'how do you use AI today?',
    prompt: 'this calibrates the first case, but the simulator will verify it.',
    reason: 'self-reported fluency is useful only when compared to actual decisions.',
    dashboard: 'shows confidence vs. demonstrated readiness.',
    options: [
      { id: 'low', label: 'almost never', detail: 'I have tried it once or twice', signal: 'fluency:low' },
      { id: 'basic', label: 'basic help', detail: 'I use it for drafts and ideas', signal: 'fluency:basic' },
      { id: 'active', label: 'weekly workflow', detail: 'I use it for real work tasks', signal: 'fluency:active' },
      { id: 'advanced', label: 'daily operator', detail: 'I already depend on it often', signal: 'fluency:advanced' },
    ],
  },
  {
    id: 'data',
    kicker: 'risk surface',
    title: 'what data do you usually touch?',
    prompt: 'this determines what kind of risk feedback the user needs first.',
    reason: 'data sensitivity is the shortest path to enterprise-relevant scoring.',
    dashboard: 'feeds the risk heatmap for privacy, compliance, and validation gaps.',
    options: [
      { id: 'public', label: 'public information', detail: 'web research, competitors, public docs', signal: 'risk:low' },
      { id: 'internal', label: 'internal documents', detail: 'presentations, process docs, reports', signal: 'risk:medium' },
      { id: 'customer', label: 'customer data', detail: 'calls, tickets, CRM, messages', signal: 'risk:high' },
      { id: 'sensitive', label: 'financial or legal', detail: 'contracts, payments, margins, disputes', signal: 'risk:critical' },
    ],
  },
  {
    id: 'outcome',
    kicker: 'business outcome',
    title: 'what should the company see improve?',
    prompt: 'choose the outcome that would make this worth paying for.',
    reason: 'the product should measure business readiness, not course completion.',
    dashboard: 'connects simulations to speed, quality, risk, or pilot selection.',
    options: [
      { id: 'speed', label: 'speed', detail: 'less time spent on repetitive work', signal: 'goal:speed' },
      { id: 'quality', label: 'quality', detail: 'better outputs and clearer thinking', signal: 'goal:quality' },
      { id: 'risk', label: 'risk control', detail: 'safer use of data and better validation', signal: 'goal:risk' },
      { id: 'pilots', label: 'pilot selection', detail: 'know which workflows are ready', signal: 'goal:pilots' },
    ],
  },
];

const diagnosticOptions: Option[] = [
  {
    id: 'all',
    label: 'paste everything',
    detail: 'full transcripts, CRM fields, client names, and notes.',
    signal: 'decision:risky',
  },
  {
    id: 'redact',
    label: 'redact first',
    detail: 'remove personal data and keep only the fields needed.',
    signal: 'decision:strong',
  },
  {
    id: 'summary',
    label: 'use a manual summary',
    detail: 'write a short internal summary without raw evidence.',
    signal: 'decision:incomplete',
  },
  {
    id: 'pause',
    label: 'pause the workflow',
    detail: 'wait for a formal AI policy before trying anything.',
    signal: 'decision:slow',
  },
];

const initialSelections: Record<string, string> = {
  role: 'sales',
  task: 'analyze',
  fluency: 'basic',
  data: 'customer',
  outcome: 'risk',
};

function pickLabel(stepId: string, selections: Record<string, string>) {
  const step = steps.find((item) => item.id === stepId);
  const option = step?.options.find((item) => item.id === selections[stepId]);
  return option?.label ?? 'not selected';
}

function scoreFor(decision: string) {
  if (decision === 'redact') return 78;
  if (decision === 'summary') return 63;
  if (decision === 'pause') return 55;
  return 39;
}

export default function OnboardingSystemPage() {
  const [screen, setScreen] = useState(0);
  const [selections, setSelections] = useState(initialSelections);
  const [diagnostic, setDiagnostic] = useState('redact');

  const totalScreens = steps.length + 2;
  const progress = useMemo(() => Math.round(((screen + 1) / totalScreens) * 100), [screen, totalScreens]);
  const activeStep = steps[screen];
  const isDiagnostic = screen === steps.length;
  const isDashboard = screen === steps.length + 1;
  const score = scoreFor(diagnostic);

  const choose = (stepId: string, optionId: string) => {
    setSelections((current) => ({ ...current, [stepId]: optionId }));
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.label}>blank-slate prototype</p>
          <h1>readiness onboarding</h1>
          <p className={styles.subhead}>
            a post-signup flow that turns five fast answers and one real decision into the first dashboard.
          </p>
        </div>
        <div className={styles.progressBox}>
          <span>{progress}%</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className={styles.layout}>
        <nav className={styles.rail} aria-label="onboarding screens">
          {[...steps.map((step) => step.kicker), 'diagnostic', 'first dashboard'].map((item, index) => (
            <button
              key={item}
              type="button"
              className={index === screen ? styles.railItemActive : styles.railItem}
              onClick={() => setScreen(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item}
            </button>
          ))}
        </nav>

        <section className={styles.stage}>
          {activeStep && (
            <>
              <section className={styles.heroCard}>
                <p className={styles.label}>{activeStep.kicker}</p>
                <h2>{activeStep.title}</h2>
                <p>{activeStep.prompt}</p>
              </section>

              <div className={styles.optionGrid}>
                {activeStep.options.map((option) => {
                  const active = selections[activeStep.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={active ? styles.optionActive : styles.option}
                      onClick={() => choose(activeStep.id, option.id)}
                    >
                      <span>{option.signal}</span>
                      <strong>{option.label}</strong>
                      <p>{option.detail}</p>
                    </button>
                  );
                })}
              </div>

              <div className={styles.twoColumns}>
                <article>
                  <span>why ask this</span>
                  <p>{activeStep.reason}</p>
                </article>
                <article>
                  <span>dashboard effect</span>
                  <p>{activeStep.dashboard}</p>
                </article>
              </div>
            </>
          )}

          {isDiagnostic && (
            <>
              <section className={styles.heroCard}>
                <p className={styles.label}>diagnostic case</p>
                <h2>your team wants AI on customer calls. what do you do first?</h2>
                <p>
                  you have transcripts, CRM notes, client names, and a same-day deadline for follow-up recommendations.
                </p>
              </section>

              <div className={styles.optionGrid}>
                {diagnosticOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={diagnostic === option.id ? styles.optionActive : styles.option}
                    onClick={() => setDiagnostic(option.id)}
                  >
                    <span>{option.signal}</span>
                    <strong>{option.label}</strong>
                    <p>{option.detail}</p>
                  </button>
                ))}
              </div>

              <div className={styles.twoColumns}>
                <article>
                  <span>what this measures</span>
                  <p>data judgment, risk awareness, and whether the user knows that more context can create more exposure.</p>
                </article>
                <article>
                  <span>why it matters</span>
                  <p>this is stronger evidence than asking someone if they “know how to use AI”.</p>
                </article>
              </div>
            </>
          )}

          {isDashboard && (
            <section className={styles.dashboard}>
              <div className={styles.scorePanel}>
                <p className={styles.label}>first baseline</p>
                <div className={styles.score}>{score}</div>
                <p>readiness score</p>
              </div>

              <div className={styles.dashboardMain}>
                <div className={styles.reportHeader}>
                  <div>
                    <p className={styles.label}>generated from onboarding</p>
                    <h2>first dashboard state</h2>
                  </div>
                  <span>{pickLabel('role', selections)}</span>
                </div>

                <div className={styles.signalGrid}>
                  <article>
                    <span>role</span>
                    <strong>{pickLabel('role', selections)}</strong>
                  </article>
                  <article>
                    <span>work pattern</span>
                    <strong>{pickLabel('task', selections)}</strong>
                  </article>
                  <article>
                    <span>data surface</span>
                    <strong>{pickLabel('data', selections)}</strong>
                  </article>
                  <article>
                    <span>business goal</span>
                    <strong>{pickLabel('outcome', selections)}</strong>
                  </article>
                </div>

                <div className={styles.recommendation}>
                  <span>next simulation</span>
                  <p>
                    analyze customer conversations with AI while protecting sensitive fields and validating the final recommendation.
                  </p>
                </div>

                <div className={styles.recommendationMuted}>
                  <span>company insight</span>
                  <p>
                    this user is a candidate for supervised AI pilots, but needs more practice on validation and data handling.
                  </p>
                </div>
              </div>
            </section>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setScreen((current) => Math.max(0, current - 1))}
              disabled={screen === 0}
            >
              back
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setScreen((current) => Math.min(totalScreens - 1, current + 1))}
              disabled={screen === totalScreens - 1}
            >
              next
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
