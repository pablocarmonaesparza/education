-- R-07 (RULES_LEDGER): la RLS de rubric_criteria exponía TODA la fila a
-- cualquier usuario autenticado (policy `auth.uid() IS NOT NULL`), incluyendo
-- internal_weight / thresholds / penalties — los internos de la rúbrica que el
-- participante NO debe ver (revelaría cómo se puntúa). Endurecemos: los
-- usuarios autenticados solo leen los criterios marcados públicos.
--
-- El servicio (judge, admin) usa service_role, que bypassa RLS, así que la
-- evaluación no se ve afectada. Esto solo cierra la lectura directa vía la API
-- pública/cliente.

alter table simulador.rubric_criteria enable row level security;

drop policy if exists authenticated_read_rubric_criteria on simulador.rubric_criteria;

create policy authenticated_read_public_rubric_criteria
  on simulador.rubric_criteria
  for select
  to authenticated
  using (is_public = true);
