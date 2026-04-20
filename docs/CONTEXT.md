# Itera — contexto del producto

> Documento de orientación. Describe qué es Itera, cómo funciona, cómo está
> estructurado pedagógica y técnicamente, y hacia dónde va. Apunta a los
> documentos fuente específicos para el detalle.

---

## 1. Qué es Itera

Plataforma de educación en AI para **audiencia no-técnica LATAM**. El formato principal son **ejercicios interactivos cortos** (no videos), organizados en lecciones de 10 slides cada una. El usuario puede tomar la **ruta completa** del curso o una **ruta personalizada** generada a partir de lo que quiere construir.

**Tesis central:** el mercado ya tiene información sobre AI gratis (YouTube, blogs, docs). Lo que no tiene es un **sistema de retención** que convierta esa información en ejecución real en las próximas 24 horas. Itera vende retención + ejecución, no información.

---

## 2. Producto

### Formato de lección
- **10 slides fijas** (regla pedagógica): 1 Engage (pregunta-trampa con hypercorrection) + 2-3 Explore + 1-2 Explain + 3-5 Elaborate + 2 Evaluate (callback al Engage + celebración).
- **11 tipos de slide:**
  - Informativas: concept, concept-visual, celebration
  - Ejercicios: mcq (una correcta), multi-select, true-false, fill-blank, order-steps, tap-match, code-completion, build-prompt

### Dos rutas de consumo
- **Ruta completa:** 100 lecciones en orden de las 10 secciones.
- **Ruta personalizada:** usuario describe qué quiere construir → sistema vectoriza las lecciones con OpenAI embeddings, Cohere rerank refina el top-N, arma un curso custom. Requiere que cada lección sea **autocontenida** (cero callbacks cross-lección).

### Audiencia
Gente de a pie LATAM, sin background técnico. Test: *"¿lo entendería alguien de 55 años que jamás programó?"*. Escenarios evergreen, fun, universales — nunca médicos, financieros íntimos ni personales.

---

## 3. Metodología pedagógica

**Fuente de verdad:** [`docs/METODOLOGIA.md`](./METODOLOGIA.md) (v0.10)

**Pilares:**
- **Modelo 5E** (Bybee) — Engage → Explore → Explain → Elaborate → Evaluate, orden no-negociable.
- **Productive Failure** (Kapur, Cohen's d=0.36) + **Hypercorrection** (Butterfield & Metcalfe) en el Engage: pregunta-trampa que el alumno responde mal con confianza; la corrección crea memoria episódica fuerte.
- **Auto-clasificación Bloom** — ruta conceptual (40/60 explicación/ejercicio) vs procedimental (25/75) vs mixta (30/70), según el verbo del learning objective + test de éxito como tiebreaker.
- **Roster de 30 nombres LATAM** + variable `{user_first_name}` (self-reference effect, Symons & Johnson, d≈0.5).

**14 reglas de forma** (títulos minúsculas, setup de preguntas ≤180 chars, mayúscula consistente, markdown solo en body/explanation, moneda siempre USD, lecciones autocontenidas, etc.) + **rubric de 10 checks** antes de publicar.

---

## 4. Estructura del curso — 10 secciones, 100 lecciones

**Fuente de verdad:** [`docs/LESSONS_v1.md`](./LESSONS_v1.md)

| # | Sección | Lecciones | Temas |
|---|---|---|---|
| 1 | introducción | 2 | Onboarding del formato y las rutas |
| 2 | fundamentos | 12 | AI, LLM, tokens, ventana de contexto, prompting |
| 3 | asistentes | 10 | Claude, ChatGPT, Gemini, Perplexity, Grok |
| 4 | contenido | 10 | Flux, Seedance, Kling, ElevenLabs, Nano Banana |
| 5 | automatización | 12 | Claude Code Routines, MCP schedulers, n8n, Apify |
| 6 | bases de datos | 12 | Supabase, Notion, CRMs, RAG, embeddings, seguridad |
| 7 | APIs, MCPs y skills | 14 | MCP servers, Claude Agent SDK, Anthropic Skills |
| 8 | agentes | 10 | Browser, voice, OpenClaw, A2A, multi-agente |
| 9 | vibe coding | 8 | Claude Code, Cursor, Codex, GitHub |
| 10 | implementación | 10 | Deploy, monitoreo, go-to-market, despedida |

El crecimiento futuro del catálogo (200, 400, 1000 lecciones) vive en expansiones de secciones existentes y en lecciones complementarias para la ruta personalizada.

---

## 5. Arquitectura técnica

### Stack
- **Frontend:** Next.js 16 (Turbopack), React 19, Tailwind, design system propio (`CLAUDE.md`)
- **Backend:** Supabase (Postgres + Auth + Storage + pgvector para ruta personalizada)
- **IA SDKs:** `@anthropic-ai/sdk`, `openai`, `cohere-ai`
- **Pagos:** Stripe + Mercado Pago (para LATAM)

### Schema de DB
**Fuente de verdad:** `supabase/migrations/`

**3 tablas centrales:**
- `sections` (10 filas, smallint id 1..10, container entity)
- `lectures` (uuid, versionable con `supersedes_lecture_id`, freshness tracking con `last_reviewed_at`, campos pedagógicos nullable hasta publicación)
- `slides` (uuid, JSONB content, 11 kinds enum, mismo versioning + freshness)

**Tablas auxiliares planeadas** (post-MVP): `user_progress`, `slide_flags` (feedback button), `lecture_embeddings` (pgvector para ruta personalizada).

**Estrategia de versioning soft** — regenerar una lección crea una nueva row con `supersedes_lecture_id` apuntando a la vieja. No snapshots completos.

### Pipeline de generación de contenido

```
metadata de lección (workshop manual)
       ↓
generador automático (skill /generate-lecture futura)
       ↓
slides JSON (1 archivo por lección)
       ↓
lint (scripts/lint-lessons.py — 9 reglas automatizables)
       ↓
revisión manual (rubric subjetivo, 10 puntos)
       ↓
import a DB
```

---

## 6. Modelo de negocio

### Pricing
- **Consumer:** $19 USD/mes
- **B2B** (pendiente definir): probablemente $12-15 USD/seat con descuento por volumen, contratos anuales

### Proyecciones ARR (estimaciones honestas)
Asumiendo ejecución decente y el timing AI de 2026:

| Año | Conservador | Estándar | Agresivo |
|---|---|---|---|
| 1 | $200K USD | $500K USD | $800K USD |
| 3 | $5M USD | $12M USD | $25M USD |
| 5 | $15M USD | $40M USD | $80M+ USD |

Variable que más mueve la aguja: **distribución**. Producto y mercado son favorables; lo que separa los escenarios es velocidad y calidad de distribución.

### Ruta a exit
Compradores naturales: Platzi, Crehana, Duolingo, Coursera, Udemy, strategic (Anthropic/OpenAI/Microsoft). Múltiplos edtech 2026: 3-6x ARR flat, 6-10x con growth, 10-15x premium, 15-30x strategic fit.

- Exit solo-founder año 3-4 con $1-3M ARR: $4-18M valuation
- Exit con equipo pequeño año 4-5 con $5-10M ARR: $30-100M
- Home run año 5-7 con $30M+ ARR + strategic fit: $300M-1B

---

## 7. Mapa de documentos

```
CLAUDE.md                                          → design system (UI source of truth)
docs/CONTEXT.md                                    → este documento
docs/METODOLOGIA.md                                → contrato pedagógico
docs/LESSONS_v1.md                                 → 100 lecciones firmadas
supabase/migrations/000_nuke_legacy.sql            → limpieza del schema viejo
supabase/migrations/001_init_content_schema.sql    → sections + lectures + slides
supabase/migrations/002_seed_sections.sql          → seed de las 10 secciones
scripts/lint-lessons.py                            → lint automático de reglas
components/experiment/ExperimentLesson.tsx         → renderer de lecciones
```

---

## 8. Roadmap estratégico

### Fase 1 — MVP (~50 lecciones)
Content core: intro completa + fundamentos completo + asistentes completo + 1 lección "seed" por cada otra sección para tener superficie de retrieval para ruta personalizada. Target: validar formato + unit economics con primeros usuarios reales.

### Fase 2 — Completar catálogo (100 lecciones)
Rellenar las 7 secciones restantes en batches. Implementar ruta personalizada completa (embeddings + rerank). Feedback loop de usuarios via botón de bandera en cada slide.

### Fase 3 — Escala y especialización (200-1000 lecciones)
Cada sección crece a 20-40+ lecciones. Rutas especializadas (founder, marketer, developer, etc.). Contenido específico por industria. Posible internacionalización a US-Hispano, España, Brasil.

### Fase 4 — Exit strategy
Año 3-5. Depende de si se contrata equipo (necesario para B2B escalable) o se mantiene solo-founder (techo más bajo, exit más modesto).

---

## 9. Backlog del producto (diferido con intención)

Cosas que sabemos que hay que hacer pero que no son la pelea de hoy. Se activan cuando el producto lo pida o cuando llegue su fase.

- **Planeación financiera de mecánicas B2C** — sistema de vidas tipo Duolingo (hearts), monetización por consumibles, tiers premium para lives ilimitadas, pricing por tier de gamificación. Deferido porque el foco actual es ejecución y B2B; cuando el curso tenga usuarios reales pagando, se diseña.
- **Feedback button por slide** — botón de bandera para que el usuario reporte errores. Columna `slide_flags` en schema ya anticipada; UI + backend cuando haya volumen de usuarios.
- **Q&A system para corregir errores puntuales** — eventualmente integrar con `/gstack` u otro sistema que tome reportes del flag y abra tasks de corrección.
- **Lint en pre-commit hook** — para que nadie pueda commitear contenido con violaciones automatizables. Trivial de agregar cuando el flujo de generación madure.
- **Archivar `docs/OUTLINE_2026.md`** — ya no es fuente de verdad (ahora es `LESSONS_v1.md`). Renombrar a `OUTLINE_2026_legacy.md` o moverlo fuera de `docs/` para evitar confusión.

---

## 10. Decisiones estratégicas abiertas

Temas que necesitan call explícito del founder, no del sistema:

1. **Cuándo contratar** — afecta directo el techo de ARR y valuation de exit. Solo-founder indefinido vs. equipo de 2-3 personas en año 2-3.
2. **Plan de distribución** — la variable más grande. ¿YouTube LATAM? ¿LinkedIn founders? ¿Paid ads? ¿Referral B2B? Sin plan claro, el producto no compensa.
3. **Tier B2B real** — $19/mes consumer no cierra unit economics sola. Definir pricing + features de tier empresa en año 1-2 o el negocio se quiebra.
4. **Internacionalización** — ¿stay LATAM-only o expandir a España / US-Hispano / Brasil? El ceiling de mercado se multiplica 3-4x si se expande.
