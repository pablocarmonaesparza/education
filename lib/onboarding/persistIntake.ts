import type { SupabaseClient } from '@supabase/supabase-js';

export type CourseMode = 'personalized' | 'full';

export interface IntakeDraftPatch {
  projectIdea?: string;
  courseMode?: CourseMode;
  questionnaire?: Record<string, unknown>;
  step?: 'description' | 'questionnaire_complete';
}

interface IntakeRow {
  id: string;
  responses: Record<string, unknown> | null;
}

/**
 * Devuelve el último draft recuperable del usuario.
 * Considera recuperable:
 *   - filas sin generated_path (aún no generado), y
 *   - filas con generated_path._error = true (generación falló, se puede reintentar).
 * Si no existe, devuelve null.
 */
export async function findLatestIntakeDraft(
  supabase: SupabaseClient,
  userId: string
): Promise<IntakeRow | null> {
  const { data, error } = await supabase
    .from('intake_responses')
    .select('id, responses, generated_path')
    .eq('user_id', userId)
    .or('generated_path.is.null,generated_path->_error.eq.true')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, responses: data.responses };
}

export interface RehydratedDraft {
  id: string;
  projectIdea: string | null;
  courseMode: CourseMode | null;
  questionnaire: Record<string, unknown> | null;
  step: 'description' | 'questionnaire_complete' | null;
}

/**
 * Carga el draft activo y lo devuelve con shape pensado para rehidratar el
 * sessionStorage del flow (projectIdea, courseMode, questionnaire, step).
 * Si no hay draft, devuelve null. No escribe nada.
 */
export async function loadLatestDraftForRehydrate(
  supabase: SupabaseClient,
  userId: string
): Promise<RehydratedDraft | null> {
  const draft = await findLatestIntakeDraft(supabase, userId);
  if (!draft) return null;
  const r = (draft.responses || {}) as Record<string, unknown>;
  const mode = r.course_mode;
  const step = r.step;
  return {
    id: draft.id,
    projectIdea: typeof r.project_idea === 'string' ? r.project_idea : null,
    courseMode: mode === 'personalized' || mode === 'full' ? (mode as CourseMode) : null,
    questionnaire:
      typeof r.questionnaire === 'object' && r.questionnaire !== null
        ? (r.questionnaire as Record<string, unknown>)
        : null,
    step:
      step === 'description' || step === 'questionnaire_complete' ? step : null,
  };
}

/**
 * Guarda (upsert) el progreso del onboarding en intake_responses.
 *
 * Lógica:
 *  - Si `existingId` viene, UPDATE esa fila.
 *  - Si no, busca la última fila sin generated_path del user; si existe, UPDATE;
 *    si no, INSERT nueva.
 *
 * El merge es shallow sobre `responses`, así cada paso solo parchea sus
 * campos (project_idea, course_mode, questionnaire, step).
 */
export async function upsertIntakeDraft(
  supabase: SupabaseClient,
  userId: string,
  patch: IntakeDraftPatch,
  existingId?: string
): Promise<{ id: string } | { error: string }> {
  const patchResponses: Record<string, unknown> = {
    last_updated_at: new Date().toISOString(),
  };
  if (patch.projectIdea !== undefined) patchResponses.project_idea = patch.projectIdea;
  if (patch.courseMode !== undefined) patchResponses.course_mode = patch.courseMode;
  if (patch.questionnaire !== undefined) patchResponses.questionnaire = patch.questionnaire;
  if (patch.step !== undefined) patchResponses.step = patch.step;

  let rowId = existingId;
  let existing: IntakeRow | null = null;

  if (rowId) {
    const { data } = await supabase
      .from('intake_responses')
      .select('id, responses')
      .eq('id', rowId)
      .eq('user_id', userId)
      .maybeSingle();
    existing = data ? { id: data.id, responses: data.responses } : null;
    if (!existing) rowId = undefined;
  }

  if (!rowId) {
    existing = await findLatestIntakeDraft(supabase, userId);
    rowId = existing?.id;
  }

  if (rowId && existing) {
    const merged = { ...(existing.responses || {}), ...patchResponses };
    const { error } = await supabase
      .from('intake_responses')
      .update({ responses: merged })
      .eq('id', rowId)
      .eq('user_id', userId);
    if (error) return { error: error.message };
    return { id: rowId };
  }

  const { data, error } = await supabase
    .from('intake_responses')
    .insert({
      user_id: userId,
      responses: { ...patchResponses, submitted_at: new Date().toISOString() },
    })
    .select('id')
    .single();
  if (error || !data) return { error: error?.message || 'insert failed' };
  return { id: data.id };
}
