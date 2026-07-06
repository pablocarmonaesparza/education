-- Motor educativo (2026-07-03): los módulos de TEMA (broadcast — un update del
-- mercado de IA para todas las empresas, ej. module_claude5_fable_n1) no
-- pertenecen a un career específico. Se agrega 'general' al CHECK de
-- career_key para distinguirlos de los beats remediales por career.

alter table simulador.practice_beats
  drop constraint if exists practice_beats_career_key_check;

alter table simulador.practice_beats
  add constraint practice_beats_career_key_check
  check (career_key = any (array[
    'general'::text,
    'marketing'::text, 'growth'::text, 'sales'::text, 'cs'::text, 'ops'::text,
    'finance'::text, 'legal'::text, 'hr'::text, 'product'::text, 'engineering'::text
  ]));
