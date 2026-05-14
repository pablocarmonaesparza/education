import {
  SIMULATOR_DIMENSIONS,
  SIMULATOR_EVIDENCE_KINDS,
  SIMULATOR_MANAGER_ACTIONS,
  SIMULATOR_STEP_TYPES,
  type SimulatorDimension,
  type SimulatorEvidenceKind,
  type SimulatorManagerAction,
  type SimulatorStepType,
} from './types';

export function isSimulatorDimension(value: unknown): value is SimulatorDimension {
  return typeof value === 'string' && SIMULATOR_DIMENSIONS.includes(value as SimulatorDimension);
}

export function isSimulatorStepType(value: unknown): value is SimulatorStepType {
  return typeof value === 'string' && SIMULATOR_STEP_TYPES.includes(value as SimulatorStepType);
}

export function isSimulatorEvidenceKind(value: unknown): value is SimulatorEvidenceKind {
  return typeof value === 'string' && SIMULATOR_EVIDENCE_KINDS.includes(value as SimulatorEvidenceKind);
}

export function isSimulatorManagerAction(value: unknown): value is SimulatorManagerAction {
  return typeof value === 'string' && SIMULATOR_MANAGER_ACTIONS.includes(value as SimulatorManagerAction);
}

export function uniqueValues<T extends string>(values: T[]): T[] {
  return Array.from(new Set(values));
}

export function templateRefToSlugVersion(templateRef: string): { slug: string; version: number | null } {
  const [slug, rawVersion] = templateRef.split('@v');
  const version = rawVersion ? Number(rawVersion) : null;
  return {
    slug,
    version: Number.isFinite(version) ? version : null,
  };
}

export function toStepKey(stepId: number | string): string {
  const raw = String(stepId).trim();
  if (raw.startsWith('step_')) return raw;
  return `step_${raw}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
