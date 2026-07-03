-- Eval integrity — expand simulator dimensions from 5 legacy keys to 6 canonical keys.
--
-- Order matters:
--   1. Expand CHECK constraints to allow legacy + canonical keys.
--   2. Re-seed rubric_case_factory_v1@1.0.0 with exactly six canonical dimensions.
--   3. Keep legacy keys allowed until historical rows are cleaned in a later contract pass.

begin;

do $$
declare
  c record;
begin
  for c in
    select conrelid::regclass as table_name, conname
      from pg_constraint
     where contype = 'c'
       and connamespace = 'simulador'::regnamespace
       and conrelid in (
         'simulador.rubric_dimensions'::regclass,
         'simulador.gap_definitions'::regclass,
         'simulador.risk_events'::regclass,
         'simulador.practice_beats'::regclass,
         'simulador.practice_unlocks'::regclass
       )
       and pg_get_constraintdef(oid) like '%dimension_key%'
  loop
    execute format('alter table %s drop constraint %I', c.table_name, c.conname);
  end loop;
end;
$$;

alter table simulador.rubric_dimensions
  add constraint rubric_dimensions_dimension_key_check
  check (dimension_key in (
    'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto',
    'privacidad', 'decision'
  ));

alter table simulador.gap_definitions
  add constraint gap_definitions_dimension_key_check
  check (dimension_key in (
    'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto',
    'privacidad', 'decision'
  ));

alter table simulador.risk_events
  add constraint risk_events_dimension_key_check
  check (dimension_key in (
    'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto',
    'privacidad', 'decision'
  ));

alter table simulador.practice_beats
  add constraint practice_beats_dimension_key_check
  check (dimension_key in (
    'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto',
    'privacidad', 'decision'
  ));

alter table simulador.practice_unlocks
  add constraint practice_unlocks_dimension_key_check
  check (dimension_key in (
    'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto',
    'privacidad', 'decision'
  ));

insert into simulador.rubrics (slug, version, status, title, description)
values (
  'rubric_case_factory_v1',
  '1.0.0',
  'active',
  'Case Factory rubric v1',
  'Seis dimensiones canónicas: contexto, datos, ejecución con IA, validación, juicio e impacto.'
)
on conflict (slug, version) do update
  set status = excluded.status,
      title = excluded.title,
      description = excluded.description,
      updated_at = now();

with target_rubric as (
  select id
    from simulador.rubrics
   where slug = 'rubric_case_factory_v1'
     and version = '1.0.0'
   limit 1
)
delete from simulador.rubric_dimensions
 where rubric_id = (select id from target_rubric)
   and dimension_key not in (
     'contexto', 'datos', 'ejecucion_ia', 'validacion', 'juicio', 'impacto'
   );

with target_rubric as (
  select id
    from simulador.rubrics
   where slug = 'rubric_case_factory_v1'
     and version = '1.0.0'
   limit 1
),
canonical_dimensions as (
  select *
    from (values
      ('contexto', 1, 'Entiende objetivo, audiencia, restricciones, stakeholder y éxito esperado.', 14.000, 14.000),
      ('datos', 2, 'Usa información suficiente, minimizada, con permisos y calidad adecuada.', 18.000, 18.000),
      ('ejecucion_ia', 3, 'Elige y configura prompt, workflow o agente según el nivel del trabajo.', 24.000, 24.000),
      ('validacion', 4, 'Revisa output, claims, logs, fuentes, errores y consistencia antes de actuar.', 16.000, 16.000),
      ('juicio', 5, 'Detecta riesgo, autoridad, escalamiento, consecuencias y límites de autonomía.', 14.000, 14.000),
      ('impacto', 6, 'Convierte el uso de IA en una decisión, ahorro, acción o resultado visible.', 14.000, 14.000)
    ) as d(dimension_key, display_order, public_definition, public_weight, internal_weight)
)
insert into simulador.rubric_dimensions (
  rubric_id,
  dimension_key,
  public_definition,
  display_order,
  public_weight,
  internal_weight
)
select
  target_rubric.id,
  canonical_dimensions.dimension_key,
  canonical_dimensions.public_definition,
  canonical_dimensions.display_order,
  canonical_dimensions.public_weight,
  canonical_dimensions.internal_weight
from target_rubric
cross join canonical_dimensions
on conflict (rubric_id, dimension_key) do update
  set public_definition = excluded.public_definition,
      display_order = excluded.display_order,
      public_weight = excluded.public_weight,
      internal_weight = excluded.internal_weight;

create or replace function simulador.compute_recommendation(p_session_id uuid)
returns table (
  recommendation text,
  justification jsonb
)
language plpgsql
stable
as $$
declare
  v_session_id uuid := p_session_id;
  v_high_risks jsonb;
  v_bands jsonb;
  v_alto_count int;
  v_medio_count int;
  v_bajo_count int;
  v_total_count int;
  v_final text;
  v_reasons jsonb := '[]'::jsonb;
  v_pii_high_in_regulated_jurisdiction boolean := false;
  v_hidden_pii boolean := false;
  v_third_party_nda boolean := false;
  v_unapproved_vendor boolean := false;
  v_hallucinated_figures boolean := false;
  v_any_pii_high boolean := false;
begin
  select dimension_scores_json
    into v_bands
    from simulador.evaluation_runs
   where simulation_session_id = v_session_id
   order by created_at desc
   limit 1;

  if v_bands is null then
    return query select null::text, jsonb_build_object(
      'error', 'no_evaluation_run_found',
      'session_id', v_session_id
    );
    return;
  end if;

  with array_bands as (
    select elem->>'band' as band
      from jsonb_array_elements(
        case
          when jsonb_typeof(v_bands) = 'array' then v_bands
          else '[]'::jsonb
        end
      ) elem
  ),
  object_bands as (
    select
      case
        when jsonb_typeof(value) = 'object' then value->>'band'
        else value #>> '{}'
      end as band
      from jsonb_each(
        case
          when jsonb_typeof(v_bands) = 'object' then v_bands
          else '{}'::jsonb
        end
      )
  ),
  dimension_bands as (
    select band from array_bands
    union all
    select band from object_bands
  )
  select
    count(*) filter (where band in ('alto','Alto','A')),
    count(*) filter (where band in ('medio','Medio','M')),
    count(*) filter (where band in ('bajo','Bajo','B')),
    count(*)
    into v_alto_count, v_medio_count, v_bajo_count, v_total_count
    from dimension_bands;

  for v_high_risks in
    select jsonb_build_object(
      'event_type', event_type,
      'severity', severity,
      'jurisdiction', jurisdiction_of_data_subject,
      'transfer_basis', transfer_basis_documented,
      'dimension', dimension_key
    )
    from simulador.risk_events
   where simulation_session_id = v_session_id
     and severity = 'high'
  loop
    if v_high_risks->>'event_type' = 'exposed_pii_to_model'
       and v_high_risks->>'jurisdiction' in ('MX', 'CO', 'BR')
       and coalesce((v_high_risks->>'transfer_basis')::boolean, false) = false then
      v_pii_high_in_regulated_jurisdiction := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'pii_high_regulated_jurisdiction_no_transfer_basis',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'hidden_pii_usage_from_authority' then
      v_hidden_pii := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'hidden_pii_usage_from_authority',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'shared_third_party_confidential' then
      v_third_party_nda := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'shared_third_party_confidential',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'used_unapproved_vendor' then
      v_unapproved_vendor := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'pausar',
        'reason', 'used_unapproved_vendor_policy_violation',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'event_type' = 'accepted_hallucinated_figures' then
      v_hallucinated_figures := true;
      v_reasons := v_reasons || jsonb_build_object(
        'override', 'entrenar_min',
        'reason', 'accepted_hallucinated_figures_learnable_skill',
        'event', v_high_risks
      );
    end if;

    if v_high_risks->>'dimension' in ('privacidad', 'datos')
       or v_high_risks->>'event_type' in (
         'exposed_pii_to_model',
         'hidden_pii_usage_from_authority',
         'used_sensitive_commercial_data',
         'shared_third_party_confidential'
       ) then
      v_any_pii_high := true;
    end if;
  end loop;

  if v_pii_high_in_regulated_jurisdiction
     or v_hidden_pii
     or v_third_party_nda
     or v_unapproved_vendor then
    v_final := 'pausar';
  elsif v_any_pii_high then
    v_final := 'entrenar';
  elsif v_hallucinated_figures then
    v_final := 'entrenar';
  elsif v_bajo_count >= 2 then
    v_final := 'entrenar';
  elsif v_total_count > 0 and v_alto_count = v_total_count then
    v_final := 'pilotar';
  elsif v_total_count > 0 and v_bajo_count = 0 and v_medio_count between 1 and 2 then
    v_final := 'pilotar';
  else
    v_final := 'entrenar';
  end if;

  return query select v_final, jsonb_build_object(
    'recommendation', v_final,
    'bands_count', jsonb_build_object(
      'alto', v_alto_count,
      'medio', v_medio_count,
      'bajo', v_bajo_count,
      'total', v_total_count
    ),
    'high_risk_count', (
      select count(*)
        from simulador.risk_events
       where simulation_session_id = v_session_id
         and severity = 'high'
    ),
    'override_reasons', v_reasons,
    'computed_at', now()
  );
end;
$$;

comment on function simulador.compute_recommendation is 'Override matrix del contrato §10. Compatible con 5 dims legacy y 6 dims canónicas.';

commit;
