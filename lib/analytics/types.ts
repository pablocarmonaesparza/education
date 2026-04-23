/**
 * Tipos compartidos para `lib/analytics/`.
 *
 * Estas shapes corresponden 1:1 a las views creadas en migrations 003 y 009:
 *   - section_analytics       → SectionAnalytics
 *   - lecture_funnel          → LectureFunnelRow
 *   - user_current_section    → UserCurrentSection
 *   - section_dropoffs        → SectionDropoff
 *   - slide_flags_admin       → SlideFlagAdminRow
 *
 * Education usa estas types para el dashboard interno de funnel.
 * Gamification extiende con queries user-facing (XP, badges, racha).
 */

import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Resultado uniforme de toda query del módulo. Discriminada por `error`:
 * en el camino feliz `error === null` y `data` tiene el shape esperado;
 * en falla `error` es no-null y `data` mantiene un fallback seguro
 * (array vacío, `null`, o el "zero" de la entidad) para que el caller
 * pueda renderizar un placeholder degradado sin reventar — pero el caller
 * debería discriminar explícitamente con `if (res.error) { ... }` antes
 * de mostrar `data` como números reales.
 */
export type AnalyticsResult<T> =
  | { data: T; error: null }
  | { data: T; error: PostgrestError };

export type SectionAnalytics = {
  section_id: number;
  section_name: string;
  display_order: number;
  est_lectures: number | null;
  total_users_ever: number;
  active_last_30d: number;
  active_last_7d: number;
  users_completed_any: number;
  median_seconds_per_lecture: number | null;
  total_xp_awarded: number;
};

export type LectureFunnelRow = {
  section_id: number;
  section_name: string;
  lecture_id: string;
  lecture_order: number;
  lecture_title: string;
  users_started: number;
  users_completed: number;
  users_dropped: number;
  completion_rate_pct: number | null;
};

export type UserCurrentSection = {
  user_id: string;
  current_section_id: number;
  current_section_name: string;
  current_lecture_order: number;
  current_lecture_title: string;
  last_active_at: string;
  last_lecture_completed: boolean;
};

export type SectionDropoff = {
  section_id: number;
  section_name: string;
  users_dropped: number;
  dropped_at_lectures: number[];
};

export type SlideFlagReason =
  | 'wrong_correct_answer'
  | 'wrong_incorrect_answer'
  | 'unclear_explanation'
  | 'typo_or_grammar'
  | 'visual_issue'
  | 'other';

export type SlideFlagAdminRow = {
  slide_id: string;
  lecture_id: string;
  slide_kind: string;
  slide_order: number;
  lecture_title: string;
  section_id: number;
  section_name: string;
  flag_count: number;
  open_count: number;
  last_30d_count: number;
  /** Histórico — todos los reasons que ese slide alguna vez tuvo. */
  reasons: SlideFlagReason[];
  /** Subset vivo — reasons cuyos flags siguen `open`. Vacío si todos
   * los flags de ese slide ya fueron resueltos (en cuyo caso open_count
   * también es 0 y la fila no debería aparecer en queries `onlyOpen`). */
  open_reasons: SlideFlagReason[];
  last_flagged_at: string;
};

/** Vista `open_flags_by_section` (migration 012) — agregado SQL-side. */
export type OpenFlagsBySection = {
  section_id: number;
  section_name: string;
  open_flags: number;
};

export const FLAG_REASON_LABEL: Record<SlideFlagReason, string> = {
  wrong_correct_answer: 'mi respuesta era correcta',
  wrong_incorrect_answer: 'la respuesta correcta no lo es',
  unclear_explanation: 'no entendí la explicación',
  typo_or_grammar: 'error de tipeo o gramática',
  visual_issue: 'imagen o visual confuso',
  other: 'otro',
};
