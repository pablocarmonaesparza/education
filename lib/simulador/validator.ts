import {
  isSimulatorDimension,
  isSimulatorEvidenceKind,
  isSimulatorManagerAction,
  isSimulatorStepType,
  uniqueValues,
} from './contracts';
import type {
  CaseTemplateContract,
  CaseVariantContract,
  ContractIssue,
  PracticeBeatContract,
  SprintPackageContract,
} from './types';

function issue(
  severity: ContractIssue['severity'],
  code: string,
  path: string,
  message: string
): ContractIssue {
  return { severity, code, path, message };
}

export function validateCaseTemplateContract(template: CaseTemplateContract): ContractIssue[] {
  const issues: ContractIssue[] = [];

  if (!template.id) {
    issues.push(issue('error', 'missing_case_id', 'case_template.id', 'El caso necesita id.'));
  }

  if (!template.rubric_ref) {
    issues.push(issue('error', 'missing_rubric_ref', 'case_template.rubric_ref', 'El caso necesita rubrica.'));
  }

  if (!Array.isArray(template.steps) || template.steps.length === 0) {
    issues.push(issue('error', 'missing_steps', 'case_template.steps', 'El caso necesita steps ejecutables.'));
    return issues;
  }

  const stepIds = template.steps.map((step) => String(step.id));
  const duplicateStepIds = stepIds.filter((id, index) => stepIds.indexOf(id) !== index);
  if (duplicateStepIds.length > 0) {
    issues.push(issue(
      'error',
      'duplicate_step_id',
      'case_template.steps',
      `Steps duplicados: ${uniqueValues(duplicateStepIds).join(', ')}.`
    ));
  }

  template.steps.forEach((step, index) => {
    const path = `case_template.steps[${index}]`;
    if (!isSimulatorStepType(step.type)) {
      issues.push(issue('error', 'invalid_step_type', `${path}.type`, `Step type no soportado: ${String(step.type)}.`));
    }

    const evaluated = [
      ...(step.evaluates ?? []),
      ...(step.evaluates_prompt ?? []),
      ...(step.followup?.evaluates ?? []),
    ];

    evaluated.forEach((dimension) => {
      if (!isSimulatorDimension(dimension)) {
        issues.push(issue(
          'error',
          'invalid_dimension',
          `${path}.evaluates`,
          `Dimension no soportada: ${String(dimension)}.`
        ));
      }
    });

    if (step.type === 'llm_beat') {
      const maxTurns = step.max_turns;
      if (typeof maxTurns === 'number' && maxTurns > 2) {
        issues.push(issue('error', 'llm_turn_limit', `${path}.max_turns`, 'V0 permite maximo 2 turns por llm_beat.'));
      }
    }
  });

  template.evidence_emitted?.forEach((evidence, index) => {
    if (!isSimulatorEvidenceKind(evidence.kind)) {
      issues.push(issue(
        'error',
        'invalid_evidence_kind',
        `case_template.evidence_emitted[${index}].kind`,
        `Evidence kind no soportado: ${String(evidence.kind)}.`
      ));
    }
  });

  const possibleActions = template.expected_manager_action?.possible ?? [];
  possibleActions.forEach((action, index) => {
    if (!isSimulatorManagerAction(action)) {
      issues.push(issue(
        'error',
        'invalid_manager_action',
        `case_template.expected_manager_action.possible[${index}]`,
        `Manager action no soportada: ${String(action)}.`
      ));
    }
  });

  if (!template.evidence_emitted?.some((evidence) => evidence.kind === 'transfer_delta')) {
    issues.push(issue(
      'warning',
      'missing_transfer_delta',
      'case_template.evidence_emitted',
      'El contrato v0 espera transfer_delta para probar re-simulacion.'
    ));
  }

  return issues;
}

export function validateCaseVariantContract(
  variant: CaseVariantContract,
  template: CaseTemplateContract
): ContractIssue[] {
  const issues: ContractIssue[] = [];

  if (!variant.template_ref.startsWith(`${template.id}@v${template.version}`)) {
    issues.push(issue(
      'error',
      'variant_template_mismatch',
      'case_variant.template_ref',
      `La variante apunta a ${variant.template_ref}, pero el template es ${template.id}@v${template.version}.`
    ));
  }

  if (variant.inputs_resolved?.synthetic !== true) {
    issues.push(issue(
      'error',
      'variant_not_synthetic',
      'case_variant.inputs_resolved.synthetic',
      'Los casos canonicos deben marcar datos sinteticos.'
    ));
  }

  if (variant.variant_role === 'resimulation' && !variant.parent_variant_ref) {
    issues.push(issue(
      'error',
      'resim_missing_parent',
      'case_variant.parent_variant_ref',
      'Una resimulacion debe apuntar a una variante primary.'
    ));
  }

  return issues;
}

export function validatePracticeBeatContract(practiceBeat: PracticeBeatContract): ContractIssue[] {
  const issues: ContractIssue[] = [];

  if (!practiceBeat.id) {
    issues.push(issue('error', 'missing_practice_id', 'practice_beat.id', 'El practice beat necesita id.'));
  }

  if (!isSimulatorDimension(practiceBeat.dimension)) {
    issues.push(issue(
      'error',
      'invalid_practice_dimension',
      'practice_beat.dimension',
      `Dimension no soportada: ${String(practiceBeat.dimension)}.`
    ));
  }

  if (practiceBeat.duration_max_seconds > 120) {
    issues.push(issue(
      'warning',
      'practice_too_long',
      'practice_beat.duration_max_seconds',
      'V0 prometio micro-practicas de maximo 2 minutos.'
    ));
  }

  return issues;
}

export function validateSprintPackageContract(sprint: SprintPackageContract): ContractIssue[] {
  const issues: ContractIssue[] = [];
  const readyCases = sprint.contents.cases_included.filter((item) => item.status === 'ready');

  sprint.contents.cases_included.forEach((item, index) => {
    if (item.status === 'ready' && (!item.primary_variant_ref || !item.resim_variant_ref)) {
      issues.push(issue(
        'error',
        'ready_case_missing_variants',
        `sprint_package.contents.cases_included[${index}]`,
        `El caso ready ${item.id} necesita primary_variant_ref y resim_variant_ref.`
      ));
    }

    if (item.status === 'ready' && (!item.dimensions_emphasized?.length || !item.difficulty || !item.tension)) {
      issues.push(issue(
        'error',
        'ready_case_missing_sprint_metadata',
        `sprint_package.contents.cases_included[${index}]`,
        `El caso ready ${item.id} necesita dimensiones, dificultad y tension para vender progresion.`
      ));
    }

    item.dimensions_emphasized?.forEach((dimension) => {
      if (!isSimulatorDimension(dimension)) {
        issues.push(issue(
          'error',
          'invalid_sprint_dimension',
          `sprint_package.contents.cases_included[${index}].dimensions_emphasized`,
          `Dimension no soportada: ${String(dimension)}.`
        ));
      }
    });
  });

  if (readyCases.length < 1) {
    issues.push(issue(
      'warning',
      'no_ready_cases',
      'sprint_package.contents.cases_included',
      'El sprint necesita al menos un caso ready para design partners.'
    ));
  }

  return issues;
}
