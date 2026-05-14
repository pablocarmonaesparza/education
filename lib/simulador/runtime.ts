import { nowIso, toStepKey } from './contracts';
import type {
  BehaviorEvent,
  BehaviorEventType,
  CaseTemplateContract,
  DimensionScores,
  EvaluationStubResult,
  RiskEvent,
  SimulationSessionDraft,
  SimulationStepEvent,
  SimulationStepEventType,
  SimulatorDimension,
  SimulatorJsonObject,
  SimulatorSeverity,
} from './types';

const DEFAULT_DIMENSION_SCORE = 70;

export function createSimulationSessionDraft(input: {
  id: string;
  assignmentId: string;
  caseVariantId: string;
  userId: string;
  sprintId?: string;
  metadata?: SimulatorJsonObject;
}): SimulationSessionDraft {
  const startedAt = nowIso();
  return {
    id: input.id,
    assignmentId: input.assignmentId,
    caseVariantId: input.caseVariantId,
    userId: input.userId,
    sprintId: input.sprintId,
    status: 'in_progress',
    startedAt,
    lastEventAt: startedAt,
    metadata: input.metadata ?? {},
  };
}

export function getNextStep(template: CaseTemplateContract, completedStepIds: string[]): {
  id: string;
  ordinal: number;
} | null {
  const completed = new Set(completedStepIds);
  const nextIndex = template.steps.findIndex((step) => !completed.has(toStepKey(step.id)));
  if (nextIndex < 0) return null;
  return {
    id: toStepKey(template.steps[nextIndex].id),
    ordinal: nextIndex + 1,
  };
}

export function buildStepEvent(input: {
  simulationSessionId: string;
  stepId?: string;
  stepOrdinal: number;
  eventType: SimulationStepEventType;
  payload?: SimulatorJsonObject;
  capturedAt?: string;
}): SimulationStepEvent {
  return {
    simulationSessionId: input.simulationSessionId,
    stepId: input.stepId,
    stepOrdinal: input.stepOrdinal,
    eventType: input.eventType,
    payload: input.payload ?? {},
    capturedAt: input.capturedAt ?? nowIso(),
  };
}

export function buildBehaviorEvent(input: {
  simulationSessionId: string;
  stepId?: string;
  eventType: BehaviorEventType;
  payload?: SimulatorJsonObject;
  capturedAt?: string;
}): BehaviorEvent {
  return {
    simulationSessionId: input.simulationSessionId,
    stepId: input.stepId,
    eventType: input.eventType,
    payload: input.payload ?? {},
    capturedAt: input.capturedAt ?? nowIso(),
  };
}

export function buildRiskEvent(input: {
  simulationSessionId: string;
  stepId?: string;
  eventType: string;
  severity: SimulatorSeverity;
  dimension?: SimulatorDimension;
  sensitiveDataType?: string;
  evidenceText?: string;
  actionTaken?: string;
  payload?: SimulatorJsonObject;
  createdAt?: string;
}): RiskEvent {
  return {
    simulationSessionId: input.simulationSessionId,
    stepId: input.stepId,
    eventType: input.eventType,
    severity: input.severity,
    dimension: input.dimension,
    sensitiveDataType: input.sensitiveDataType,
    evidenceText: input.evidenceText,
    actionTaken: input.actionTaken,
    payload: input.payload ?? {},
    createdAt: input.createdAt ?? nowIso(),
  };
}

export function collectDecisionReplay(events: SimulationStepEvent[]): SimulationStepEvent[] {
  return events
    .filter((event) => (
      event.eventType === 'decision_submitted' ||
      event.eventType === 'llm_prompt_submitted' ||
      event.eventType === 'llm_response_received'
    ))
    .sort((a, b) => a.capturedAt.localeCompare(b.capturedAt));
}

export function createEvaluationStub(input: {
  template: CaseTemplateContract;
  simulationSessionId: string;
  stepEvents: SimulationStepEvent[];
  riskEvents: RiskEvent[];
  triggeredGaps?: string[];
}): EvaluationStubResult {
  const triggeredGaps = input.triggeredGaps ?? inferTriggeredGaps(input.stepEvents, input.riskEvents);
  const dimensionScores = createDefaultScores();

  for (const gapKey of triggeredGaps) {
    const gap = input.template.gap_definitions?.[gapKey];
    if (!gap) continue;
    dimensionScores[gap.dimension] = Math.min(
      dimensionScores[gap.dimension],
      scoreCapForSeverity(gap.severity)
    );
  }

  for (const riskEvent of input.riskEvents) {
    const dimension = riskEventToDimension(riskEvent);
    dimensionScores[dimension] = Math.min(
      dimensionScores[dimension],
      scoreCapForSeverity(riskEvent.severity)
    );
  }

  return {
    simulationSessionId: input.simulationSessionId,
    rubricRef: input.template.rubric_ref,
    rubricVersion: input.template.rubric_version_used,
    dimensionScores,
    triggeredGaps,
    riskSummary: summarizeRisk(input.riskEvents),
    decisionReplay: collectDecisionReplay(input.stepEvents),
  };
}

export function isSessionComplete(template: CaseTemplateContract, events: SimulationStepEvent[]): boolean {
  const completedSteps = new Set(
    events
      .filter((event) => event.eventType === 'step_completed')
      .map((event) => event.stepId)
      .filter(Boolean)
  );

  return template.steps.every((step) => completedSteps.has(toStepKey(step.id)));
}

function createDefaultScores(): DimensionScores {
  return {
    contexto: DEFAULT_DIMENSION_SCORE,
    privacidad: DEFAULT_DIMENSION_SCORE,
    validacion: DEFAULT_DIMENSION_SCORE,
    juicio: DEFAULT_DIMENSION_SCORE,
    decision: DEFAULT_DIMENSION_SCORE,
  };
}

function inferTriggeredGaps(events: SimulationStepEvent[], riskEvents: RiskEvent[]): string[] {
  const explicitGaps = events.flatMap((event) => {
    const raw = event.payload.triggered_gaps;
    return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : [];
  });

  const riskGaps = riskEvents.flatMap((event) => {
    const raw = event.payload.triggered_gap;
    return typeof raw === 'string' ? [raw] : [];
  });

  return Array.from(new Set([...explicitGaps, ...riskGaps]));
}

function scoreCapForSeverity(severity: SimulatorSeverity): number {
  switch (severity) {
    case 'critical':
      return 20;
    case 'high':
      return 35;
    case 'medium':
      return 55;
    case 'low':
      return 70;
  }
}

function riskEventToDimension(event: RiskEvent): SimulatorDimension {
  if (event.dimension) return event.dimension;
  if (event.sensitiveDataType) return 'privacidad';
  if (event.eventType.includes('validation')) return 'validacion';
  if (event.eventType.includes('decision')) return 'decision';
  return 'juicio';
}

function summarizeRisk(riskEvents: RiskEvent[]): EvaluationStubResult['riskSummary'] {
  return riskEvents.reduce<EvaluationStubResult['riskSummary']>(
    (summary, event) => {
      summary[event.severity] += 1;
      return summary;
    },
    { low: 0, medium: 0, high: 0, critical: 0 }
  );
}
