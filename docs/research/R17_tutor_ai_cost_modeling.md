# R17 — tutor AI cost modeling

> ¿El tutor AI de Itera rompe unit economics? Análisis de costo por user activo, comparativa de modelos, y caps operativos necesarios.
>
> **Hallazgo principal:** el tutor NO rompe unit economics si se usa default barato (Haiku 4.5 o gpt-4o-mini) con prompt caching. Opus 4.6 sí sangraría si fuera default o si un user consumer abusa sin cap — ~30% del revenue si el user mete 20 conversaciones/mes en Opus.
>
> **Desbloquea:** decisión de re-activar tutor (hoy offline), Finance unit economics, Backend model registry cleanup.

---

## 1. TL;DR — recomendación

**Re-activar tutor con default en Claude Haiku 4.5 + prompt caching obligatorio + rate limits por tier.**

Razones:
1. Costo promedio con Haiku + cache heavy: **~$0.38/user activo/mes** (20 conv/mes). Sub-2% del ACV consumer ($19/mes).
2. GPT-4o-mini es aún más barato (~$0.10/user/mes); Gemini 2.5 Flash intermedio (~$0.16/user/mes) — alternativas defendibles.
3. Opus 4.6 como opción premium (solo Enterprise o power users) — su cost/conversación es ~15x el de Haiku.
4. Caps por tier + caching obligatorio + cap de contexto mantienen costo predecible incluso en abuso.

**Problema crítico que encontré en código (no es research pero lo flago):** el RAG pipeline apunta a tabla `education_system` que fue **eliminada en migration 000** (`lib/tutor/rag.ts:30,62`). El embedding usa `text-embedding-ada-002` pero `lecture_embeddings` (migration 003) usa `text-embedding-3-small`. **El tutor, si se re-activa mañana, no funciona.** Backend tiene que reescribir el RAG para apuntar a `lecture_embeddings` + `slides.content` antes de re-lanzar.

---

## 2. Estado actual del tutor

**Está offline** desde el commit `dc2f307`. El endpoint `/api/tutor-chat/route.ts` devuelve placeholder `'No disponible en este momento.'`. La infra completa (6 modelos, 3 providers, RAG, system prompt robusto) sigue en el repo — solo falta restaurar la llamada al provider.

**Infra disponible:**
- 6 modelos en `lib/tutor/models.ts` (OpenAI + Anthropic + Google)
- Streaming multi-provider en `lib/tutor/providers.ts`
- System prompt con estudiante + learning path + RAG + transcripción de clase en `lib/tutor/context.ts`
- RAG en `lib/tutor/rag.ts` (bug: apunta a tabla dropped)
- Conversaciones persistidas en `tutor_conversations` + `tutor_messages` (preservadas en nuke)

**Model registry actual** (nombres de display anacrónicos pero `apiModel` real):

| Display | apiModel | price indicator |
|---|---|---|
| ChatGPT 5.2 | gpt-4o | 4 |
| ChatGPT (Mini) | gpt-4o-mini | 1 |
| Gemini Pro 3 | gemini-2.5-pro | 3 |
| Gemini Flash 3 | gemini-2.5-flash | 2 |
| Claude Opus 4.6 | claude-opus-4-6 | 4 |
| Claude Haiku 4.5 | claude-haiku-4-5-20251001 | 2 |

---

## 3. Pricing verificado 2026 (USD por 1M tokens)

| Modelo | Input | Output | Cached input | Context |
|---|---|---|---|---|
| **gpt-4o-mini** | $0.15 | $0.60 | $0.075 | 128K |
| **gpt-4o** | ~$2.50 | ~$10.00 | ~$1.25 | 128K |
| **gemini-2.5-flash** | $0.15 | $0.60 | sin cache público | 1M |
| **gemini-2.5-pro** | $1.25 | $10.00 | sin cache público | 200K |
| **claude-haiku-4.5** | $1.00 | $5.00 | $0.10 (read) / $1.25 (write 5min) | 200K |
| **claude-opus-4.6** | ~$15 | ~$75 | ~$1.50 | 200K |

Fuentes: [pricepertoken.com/pricing-page/model/openai-gpt-4o-mini](https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini), [aifreeapi.com/en/posts/gemini-api-pricing-2026](https://www.aifreeapi.com/en/posts/gemini-api-pricing-2026), [pricepertoken.com/pricing-page/model/anthropic-claude-haiku-4.5](https://pricepertoken.com/pricing-page/model/anthropic-claude-haiku-4.5), [evolink.ai/blog/claude-api-pricing-guide-2026](https://evolink.ai/blog/claude-api-pricing-guide-2026).

**Nota:** pricing Claude Opus 4.6 es estimado; validar con Anthropic pricing oficial antes de activar como opción en UI.

---

## 4. Token budget por conversación — baseline

System prompt construido por `buildSystemPrompt()` (ver `lib/tutor/context.ts`):

| Componente | Tokens típicos | Tokens en caso extendido |
|---|---|---|
| Identidad + instrucciones fijas | ~800 | ~800 |
| `<estudiante>` (nombre, proyecto, progreso, módulo actual) | 150-300 | 500 |
| `<clase_actual>` transcripción completa | 500-3,000 | 8,000+ |
| `<plan_aprendizaje>` resumen fases | 200-500 | 1,000 |
| `<material_relevante>` RAG 5 docs (truncated 1500 chars c/u) | 1,800-2,500 | 3,500 |
| **System prompt total** | **~3,500-7,000** | **~13,000+** |

Por turno:
- User message: 50-200 tokens
- Assistant response: 80 palabras máx (política del system prompt) → ~120-180 tokens output

Conversación típica (10 turnos):
- System prompt (enviado cada turno sin cache): 10 × 5,000 = 50,000 input tokens
- User messages: 10 × 100 = 1,000 input tokens
- Assistant responses: 10 × 150 = 1,500 output tokens

**Sin caching: ~51k input + 1.5k output por conversación.** Caro.

**Con prompt caching** (el system prompt no cambia entre turnos de la misma conversación):
- System prompt primera vez: 5,000 cache write
- System prompt siguientes 9 turnos: 9 × 5,000 = 45,000 cached reads
- User + assistant igual

Ahorro con caching: 90% del costo del system prompt a partir del turno 2.

---

## 5. Costo por conversación — matriz por modelo

**Asunción estándar:** conversación de 10 turnos, system prompt 5,000 tokens (primer turno = cache write, turnos 2-10 = cached reads), user messages 100 tokens/turno, assistant 150 tokens/turno. Totales: 5,000 cache write + 45,000 cached reads + 1,000 input regular + 1,500 output.

| Modelo | Con caching | Sin caching | Notas |
|---|---|---|---|
| gpt-4o-mini | **~$0.005** | $0.009 | Baratísimo, calidad decente para tutoring |
| gemini-2.5-flash (sin cache público) | **~$0.008** | $0.008 | Mismo precio; sin cache discount claro |
| claude-haiku-4.5 | **~$0.019** | $0.058 | Con cache heavy, sigue competitivo |
| gpt-4o | **~$0.086** | $0.140 | ~17x más caro que mini; calidad marginal para tutoring vertical |
| gemini-2.5-pro | **~$0.078** | $0.078 | Caro relativamente; sin cache; 8x output más que Flash |
| claude-opus-4.6 | **~$0.29** | $0.87 | Opus es para power users; no default |

**Cálculo ejemplo (Haiku 4.5):**
- Cache write: 5,000 × $1.25/1M = $0.0063
- Cached reads: 45,000 × $0.10/1M = $0.0045
- User messages: 1,000 × $1.00/1M = $0.001
- Output: 1,500 × $5.00/1M = $0.0075
- **Total: $0.019 por conversación**

**Lectura:** default Haiku 4.5 cuesta ~2 centavos por conversación completa; gpt-4o-mini ~medio centavo.

---

## 6. Proyección por escenario B2B

**Asunciones:**
- Cuenta B2B Business = 50 seats
- 60% usuarios activos/mes (30 usuarios)
- 40% de activos usan tutor = 12 usuarios tutor activos
- 15 conversaciones/mes por usuario activo de tutor = 180 conversaciones/mes/cuenta

Costo mensual tutor por cuenta de 50 seats Business tier (ACV mensual ~$750):

| Modelo default | Costo/mes por cuenta | % del ACV mensual |
|---|---|---|
| gpt-4o-mini | **$0.90** | 0.12% |
| gemini-2.5-flash | **$1.44** | 0.19% |
| claude-haiku-4.5 | **$3.42** | 0.46% |
| gpt-4o (si user-selectable) | $15.48 | 2.06% |
| gemini-2.5-pro | $14.04 | 1.87% |
| claude-opus-4.6 | $52.20 | 6.96% |

**Mix realista** si el default es Haiku y usuarios ocasionalmente escogen gpt-4o/Opus:
- 80% conversaciones con default Haiku: 144 × $0.019 = $2.74
- 15% con gpt-4o: 27 × $0.086 = $2.32
- 5% con Opus: 9 × $0.29 = $2.61
- **Total mezclado: ~$7.67/mes por cuenta de 50 seats = ~1% del ACV**

**No rompe unit economics.** Pero Opus como default o sin cap sí lo haría (casi 7% del ACV solo por tutor).

---

## 7. Costo por user consumer individual

**Asunciones:**
- Usuario consumer individual $19/mes
- Uso promedio: 20 conversaciones/mes
- Default Haiku con caching

20 × $0.019 = **$0.38/user/mes**. Ratio cost-of-tutor/revenue = 2.0%.

Si user abusa y usa Opus el 100% del tiempo: 20 × $0.29 = $5.80/mes = **30.5% del revenue**. **Crítico capear Opus** — sin cap, un power user consumer destroza margen.

---

## 8. Rate limits y caps recomendados

Para mantener costo predecible incluso en abuso:

| Tier | Default model | Modelos disponibles | Conversaciones/día | Max turnos/conv |
|---|---|---|---|---|
| Consumer $19 | Haiku 4.5 | Haiku + Flash + gpt-4o-mini | 10 | 20 |
| B2B Team | Haiku 4.5 | Haiku + Flash + gpt-4o-mini + gpt-4o | 20 | 30 |
| B2B Business | Haiku 4.5 | Todos excepto Opus | 30 | 30 |
| B2B Enterprise | Haiku 4.5 (o custom) | Todos incluido Opus | Unlimited | 50 |

**Si user quema cap diario:** mensaje "has usado tu tutor AI de hoy, vuelve mañana". No sorprende, es predecible.

**Caching obligatorio en todos los tiers.** Anthropic y OpenAI lo soportan nativo; Gemini no tiene cache API público pero el context largo (1M) mitiga.

**Contexto máximo:** cap de 8,000 tokens en system prompt. Si RAG + transcripción exceden, truncar transcripción primero (RAG es más útil que transcripción completa para tutoring).

---

## 9. Ejemplo de modelo financiero — Itera año 1

**Escenario estándar de [`CONTEXT.md`](../CONTEXT.md):** ~500 users consumer + ~30 cuentas B2B en M12.

Costo tutor mensual estimado M12:
- Consumer: 500 users × 40% activos × $0.38 = **$76/mes**
- B2B Team/Business: 30 cuentas × $5-8/cuenta promedio = **$150-240/mes**
- **Total: ~$225-315/mes** = $2,700-3,800/año

Comparado con revenue year 1 proyectado $100k ARR:
- Costo tutor / revenue = **2.7-3.8%**

Dentro del rango cómodo de SaaS B2B (benchmark COGS: 20-30%, de los cuales AI es típicamente <5%).

---

## 10. Bugs detectados en el código del tutor (informativo, no research)

Flagear a Backend antes de re-activar:

1. **`lib/tutor/rag.ts:30`** — `searchRelevantDocuments` llama al RPC `search_videos_hybrid` que opera sobre `education_system`. Esa tabla fue **eliminada en migration 000** (nuke legacy). El tutor tira error silenciosamente al hacer RAG.

2. **`lib/tutor/rag.ts:55-93`** — `getCurrentClassTranscript` también lee de `education_system` (dropped).

3. **`lib/tutor/rag.ts:15`** — usa `model: 'text-embedding-ada-002'` (legacy, 1536 dims). Pero `lecture_embeddings` (migration 003) usa `text-embedding-3-small` (también 1536 dims pero espacio vectorial distinto). Los vectores NO son comparables cross-modelo.

4. **`lib/tutor/models.ts`** — labels inventados ("ChatGPT 5.2", "Gemini Pro 3", "Claude Opus 4.6") no corresponden a nombres reales de 2026. Confunde a users en la UI dropdown.

5. **`lib/tutor/context.ts:82-102`** — el matching con `user_progress` usa `order` como ID, pero `user_progress.lecture_id` es UUID. El context del tutor nunca matchea correctamente; "current video" devuelve null.

**Implicación para el cost modeling:** los números de este doc asumen que el tutor funciona. Hoy no funciona aunque se re-active. Backend tiene que:
- Reescribir RAG para apuntar a `lecture_embeddings` + `slides.content` (no `education_system`).
- Cambiar `generateQueryEmbedding` a `text-embedding-3-small`.
- Renombrar labels de modelos a nombres actuales.
- Arreglar matching UUID vs order en context.

Costo estimado de este fix: **1-2 días de trabajo backend**. Sin esto, el costo del tutor será muy bajo pero la calidad también (el tutor responderá sin contexto real).

---

## 11. Decisión recomendada

| Pregunta | Respuesta |
|---|---|
| ¿Re-activar tutor? | Sí, después del fix backend de bugs §10. |
| Default model | Claude Haiku 4.5 |
| Prompt caching | Obligatorio en todos los tiers |
| Opción GPT-4o | Sí para tiers Team+ |
| Opción Opus | Solo Enterprise |
| Cap consumer | 10 conversaciones/día, 20 turnos/conv, max 8k tokens en system prompt |
| Cap B2B | Progresivo por tier (ver §8) |
| Monitoreo | PostHog event `tutor_conversation_completed` con token counts para detectar abuse temprano |

---

## 12. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Modelo Opus abusado → sangrar unit economics | Cap diario + disponible solo Enterprise |
| Anthropic/OpenAI suben precios >50% | Switch a Gemini 2.5 Flash (ya wireado, solo cambiar default) |
| Prompt caching no funciona con conversaciones largas | Truncar historial a últimos 5 turnos + resumen persistido en DB |
| RAG apunta a tabla dropped → tutor sin contexto | Fix backend antes de re-activar (ver §10) |
| Usuario genera contexto gigantesco con transcripción de clase | Cap 8k tokens system prompt; truncar transcripción primero |
| Providers requieren rate limits propios | Haiku: 50 req/min tier 1; gpt-4o-mini: 500 req/min; Flash: 1000 RPM. Todos suficientes para Itera año 1. |

---

## 13. Fuentes

- [pricepertoken.com/pricing-page/model/openai-gpt-4o-mini](https://pricepertoken.com/pricing-page/model/openai-gpt-4o-mini)
- [pecollective.com/tools/gpt-4o-pricing/](https://pecollective.com/tools/gpt-4o-pricing/)
- [aifreeapi.com/en/posts/gemini-api-pricing-2026](https://www.aifreeapi.com/en/posts/gemini-api-pricing-2026)
- [pricepertoken.com/pricing-page/model/anthropic-claude-haiku-4.5](https://pricepertoken.com/pricing-page/model/anthropic-claude-haiku-4.5)
- [evolink.ai/blog/claude-api-pricing-guide-2026](https://evolink.ai/blog/claude-api-pricing-guide-2026)
- [platform.claude.com/docs/en/about-claude/pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [tokenmix.ai/blog/ai-chatbot-cost-calculator](https://tokenmix.ai/blog/ai-chatbot-cost-calculator)
- [iternal.ai/token-usage-guide](https://iternal.ai/token-usage-guide)
- `app/api/tutor-chat/route.ts`, `lib/tutor/*.ts` — código del repo

---

**Versión 2** — 2026-04-22. Corregido tras review: per-conversation costs recalculados con cache-write + cached-read correctos (v1 subcontaba ~2-3x). Conclusiones generales se mantienen: tutor no rompe unit economics con default Haiku + caps; Opus requiere cap estricto para no sangrar.
