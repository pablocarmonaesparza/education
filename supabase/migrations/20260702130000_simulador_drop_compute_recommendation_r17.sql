-- R-17 (docs/coord/RULES_LEDGER.md): simulador.compute_recommendation se creó como
-- "espejo SQL para auditoría" de lib/simulador/judge/apply-overrides.ts, pero las
-- reglas divergieron (la SQL pausa solo con 4 event_types y trata 2+ bandas B como
-- 'entrenar'; el TS capea a 'pausar' con cualquier risk high y con 2+ B en dimensiones
-- críticas) y NO tiene callers en código (grep = solo el comentario que la citaba).
-- Un espejo que audita con reglas distintas es peor que ninguno: se retira. La única
-- fuente de las reglas de recomendación es apply-overrides.ts.

drop function if exists simulador.compute_recommendation(uuid);
