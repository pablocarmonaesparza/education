/**
 * Analytics library — base helpers para consumir las views de Supabase
 * sobre progreso del curso, funnel de lecciones y flags de slides.
 *
 * Owner: Education (T1.2 dashboard interno de funnel + T1.1 slide_flags).
 * Gamification extiende con queries user-facing (XP, racha, badges) sin
 * tocar este módulo — agrega archivos nuevos en `lib/analytics/` que
 * importen de aquí.
 *
 * Convención: cada función recibe un `SupabaseClient` ya inicializado por
 * el caller (server o admin). No creamos cliente acá para no acoplar al
 * factory ni romper si alguien quiere pasar service_role.
 */

export * from './types';
export * from './sections';
export * from './funnel';
export * from './flags';
export * from './user';
export * from './global';
