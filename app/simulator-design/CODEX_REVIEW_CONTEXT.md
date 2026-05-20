# Contexto para revisores externos (Codex / otros agentes)

Lee esto **antes** de revisar cualquier archivo bajo `app/simulator-design/`.
El resto del repo es otro producto (Itera Courses B2C). Ignóralo.

---

## 1. Qué es esto

**El Simulador** — diagnóstico B2B de criterio de IA para equipos. Cada participante entra a un caso de campo de 18 minutos (e.g. "campaña urgente con feedback de clientes con PII"), toma decisiones bajo presión, y el sistema evalúa su criterio en 5 dimensiones (contexto, privacidad, validación, juicio, decisión).

Hoy es **mockup visual interno** — la UI está clavada, el backend de scoring/LLM real aún no existe. La home oficial (`/`) ya está apuntando aquí.

---

## 2. Stack (versiones exactas)

- **Next.js 16.2** con Turbopack
- **Tailwind 3.4.18** (`darkMode: ["media", "class"]`)
- **HeroUI v2.8.10** (no v3 — incompatible con Tailwind 3)
- **Framer Motion 12.38**
- **next-themes 0.4.6** (con `forcedTheme="dark"` actualmente)
- **openai 6.9.1** (solo en `app/api/transcribe/route.ts` para Whisper)
- React 19 + TypeScript estricto

---

## 3. Reglas duras (no romper bajo ningún concepto)

1. **CERO imports** de `@/components/ui`, `@/components/shared`, `@/lib/design-tokens`.
   Esto es Itera DS y aquí está prohibido. Solo HeroUI + Framer Motion + bloques inline estilo 21st.dev.
2. **CERO líneas decorativas horizontales** en el runtime (`<hr>`, `border-t`/`border-b` como divider visual). Las únicas líneas permitidas son bordes de contenedores (cards, inputs).
3. **Accent único** `--accent: #1472FF` (azul Itera). No gradientes multi-color, no rainbow.
4. **Capitalización gramatical** en todo el copy. Inicia oraciones con mayúscula. Nombres propios capitalizados (Itera, Camila, Loop, LinkedIn Ads, Slack, Legal).
5. **Dark mode** está forzado vía `providers.tsx`. Toda nueva clase debe usar CSS vars que tienen variantes light + dark.

---

## 4. Estructura del runtime (`runtime/caso-1/page.tsx`)

State machine principal: `sectionIdx` (0-5) + `slideIdx` (0-N) + `maxReached`.

```
6 SECCIONES (sidebar):
  0. Contexto      → 5 slides (presentación · rol · situación · pasos · reglas)
  1. Datos         → 8 slides (brief + dataset preview + 6 campos PII)
  2. IA            → 3 slides (prompt · respuesta · followup)
  3. Revisión      → 3 slides (1 por ángulo del modelo)
  4. Decisión      → 1 slide
  5. Respuesta     → 2 slides (mensaje Camila · respuesta del usuario)
```

Navegación:
- **Avanzar** solo si `canAdvance` del slide actual es true.
- **Retroceder** vía sidebar a cualquier sección ya visitada (`i <= maxReached`).
- **Cápsulas top** = N cápsulas según slides de la sección actual.
- **Layout**: sidebar fija izq + content block centrado vertical+horizontal en viewport (NO text-center, solo block-center).

---

## 5. Componentes clave a revisar

| Componente | Archivo | Qué hace |
|---|---|---|
| `BrandMark` | runtime/caso-1/page.tsx | Logo en `/public/brands/*.png` (22×22 uniform) |
| `LevelMeter` | runtime/caso-1/page.tsx | 5 barras ascendentes (escala precio/inteligencia 1-5) |
| `useVoiceTranscription` | runtime/caso-1/page.tsx | Hook: MediaRecorder → /api/transcribe (Whisper) |
| `RecordingBanner` | runtime/caso-1/page.tsx | Overlay 3 estados (recording/processing/error) |
| `AIPromptInput` | runtime/caso-1/page.tsx | Full chat input (model selector + send + mic) |
| `ChatStyleTextarea` | runtime/caso-1/page.tsx | Variante simple (solo mic, sin model/send) |
| `MicButton` | runtime/caso-1/page.tsx | Botón 4 estados visuales |
| `SurfaceNav` | _components/SurfaceNav.tsx | Top nav con logo Itera real |

---

## 6. CSS variables (definidas en `simulador.css`)

Todas las superficies, texto, bordes y bandas usan vars que cambian light↔dark:

```
Superficies     · --surface, --surface-2, --surface-3
Texto           · --text-primary, --text-secondary, --text-tertiary, --text-disabled
Bordes          · --border, --border-strong, --hairline
Accent          · --accent, --accent-soft, --accent-ring (no cambia entre modos)
Bands (status)  · --band-{a,m,b}-{bg,text,bar}
```

Si encuentras un `text-[#hex]` o `bg-white` hardcoded en runtime, ES BUG (debe ser CSS var).

---

## 7. API routes propias (única que existe)

- `app/api/transcribe/route.ts` — proxy a OpenAI Whisper para el botón de voz. Acepta `FormData { audio, language? }`. Retorna `{ text }`.

---

## 8. Lo que SÍ debes revisar

- Correctness del state machine (¿se puede llegar a slides inalcanzables? ¿`maxReached` se actualiza bien?)
- Accesibilidad: `aria-label`, focus order, keyboard navigation (especialmente sidebar y action bar)
- Inconsistencias visuales entre slides (paddings, tamaños tipográficos, alturas)
- React anti-patterns (useEffect con deps incorrectas, refs sin cleanup, memo missing en componentes grandes)
- Performance (re-renders innecesarios en AnimatePresence, listeners no removidos)
- TypeScript: tipos `any` ocultos, casts inseguros
- Dark mode: cualquier hardcoded color que no respete las CSS vars
- Mobile (`md:` breakpoint a 768px — el sidebar se oculta, ¿hay otro problema?)

## 9. Lo que NO debes revisar (sería ruido)

- Resto del repo bajo `app/` (Itera courses, dashboard antiguo, intake, auth) — son otro producto
- `lib/`, `components/`, `tailwind.config.ts` global (solo si afecta directamente al simulator-design)
- `docs/` — son strategic, no del producto
- Backend de scoring real / LLM evaluator / generación de casos → **no existe todavía**, no busques bugs ahí

---

## 10. Output esperado del review

PASS / FAIL global + lista de issues citados como `file:line — descripción + sugerencia`.
Prioridad: P0 (bugs / crashes / accesibilidad bloqueante) → P1 (inconsistencias visuales / DX) → P2 (refactor opcional).
