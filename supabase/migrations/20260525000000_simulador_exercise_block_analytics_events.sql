-- Frente C: agregar al catálogo los 4 eventos de telemetría por bloque
-- canónico (declarados en lib/simulador/analytics.ts). Sin estos rows,
-- npm run check:simulador falla porque el script valida paridad TS↔BD.
--
-- Surface "app" porque los disparan renderers extraídos en
-- app/exercise-lab/blocks/* y components/simulador/ExerciseBlockRenderer.tsx
-- cuando el usuario interactúa con un bloque dentro de un caso.
--
-- Formato: una fila por línea (el parser scripts/simulador/check-analytics-catalog.mjs
-- usa regex `\('([a-z0-9_]+)',\s*'[^']+',` que requiere event_name + surface
-- en la misma línea, sin newline después del paréntesis abierto).

insert into simulador.analytics_events_catalog
  (event_name, surface, payload_schema, description, owner)
values
  ('exercise_block_started', 'app', '{"required":["block_id","slide_id","session_id"],"properties":{"block_id":{"type":"string"},"slide_id":{"type":"string"},"session_id":{"type":"string"}}}'::jsonb, 'Renderer del bloque canónico montó y registró tiempo de inicio para telemetría.', 'shared'),
  ('exercise_block_completed', 'app', '{"required":["block_id","slide_id","session_id"],"properties":{"block_id":{"type":"string"},"slide_id":{"type":"string"},"session_id":{"type":"string"},"time_ms":{"type":"number"},"payload_bytes":{"type":"number"}}}'::jsonb, 'Bloque canónico marcó completion via su completionPredicate (todos los campos requeridos llenos).', 'shared'),
  ('exercise_block_validation_failed', 'app', '{"required":["block_id","slide_id","session_id","validation_error"],"properties":{"block_id":{"type":"string"},"slide_id":{"type":"string"},"session_id":{"type":"string"},"validation_error":{"type":"string"}}}'::jsonb, 'API rechazó payload del bloque con 422 (shape malformado contra Zod schema).', 'shared'),
  ('exercise_block_abandoned', 'app', '{"required":["block_id","slide_id","session_id"],"properties":{"block_id":{"type":"string"},"slide_id":{"type":"string"},"session_id":{"type":"string"},"time_ms":{"type":"number"}}}'::jsonb, 'Usuario salió del slide sin completar el bloque (navegó atrás, cerró pestaña, timeout).', 'shared')
on conflict (event_name) do nothing;
