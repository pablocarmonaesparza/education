# Shell Spec — bloque 2 visual

> **Para codex**: especificación concreta por surface para shell visual del bloque 2.
> Lee primero `FRONT_CONTRACT.md` (scope) + `PRODUCT_VISION_ONE_PAGER.md` (vibe).
> Aquí están las decisiones de jerarquía/layout/contenido por surface — el "qué dice", no el "cómo".
>
> **Reglas globales (no negociables):**
> - Stack: Tailwind utility-first + HeroUI v2 (componentes ya disponibles) + framer-motion para transitions. NO importar `@/components/ui/*` ni `@/components/shared/*` — fueron purgados.
> - Tipografía: minúsculas en headings/body (heredado de Itera). Excepciones: nombres propios (Stripe, AgentMail), siglas (LFPDPPP), KPIs (USD).
> - Color: dark mode default, light mode soportado. Acentos: indigo-600/violet-600 para primary, fucsia para destructivo, verde-500 para success.
> - Tono: conversacional LATAM serio. Sin corporate-bot ("aprovecha al máximo tu experiencia"), sin emoji-spam, sin jerga ("ICP/MVP/P0").
> - Espacio: generoso (sección hero 24/32 unidades vertical, cards 6 padding).
> - Animación: subtle, no over-staggered. Fade+slide 200ms ease-out. Hover scale 1.02 max.
>
> **Anti-patrones a evitar:**
> - "Tu viaje empieza aquí" / "Transforma tu equipo" / "Desbloquea el potencial" → genérico SaaS, fuera
> - Stock illustrations / hero con personas sonriendo en laptop → fuera, mascota geométrica o ningún ilustrado
> - Pricing card típica de 3 columnas con check verde → reemplazar con tabla horizontal seria
> - Testimonial avatars circulares con "CEO at TechCo" → fuera hasta tener customers reales
>
> Pablo aprobó vibe target: **Linear app → Anthropic Console → Vercel Dashboard**.

---

## Tier 1 — surfaces hero (prioridad bloque 2)

### 1. `/` (landing)

**Audiencia:** Head/VP Marketing/Growth/Ops/Sales en empresa LATAM (50-2000 empleados).

**Pregunta que responde:** "¿Cómo evalúo si mi equipo realmente sabe usar IA generativa en flujos críticos, sin un curso de 6 semanas que ya no pega?"

**Estructura vertical (top → bottom):**

1. **Nav minimalista** (sticky, h-14, glass blur):
   - Izquierda: logotipo `itera` (lowercase, tracking tight)
   - Centro: 3 links — `producto`, `precios`, `clientes`
   - Derecha: link `iniciar sesión` (ghost) + botón `agendar diagnóstico` (primary indigo)

2. **Hero** (min-h-screen, padding generoso):
   - Eyebrow: `diagnóstico operativo de criterio en IA` (xs, uppercase tracking-widest, muted)
   - H1 (text-5xl/6xl extrabold tracking-tight): `mide cómo decide tu equipo cuando usa IA en flujos reales.`
   - Sub (text-lg muted, max-w-2xl): `sprint de 30 días. caso vivo con presión real. judge LLM + review humano. reporte ejecutivo accionable. desde $4,000 USD para 5-50 personas.`
   - CTAs (2): `agendar diagnóstico` (primary, lg, arrow icon) + `ver caso demo` (ghost, lg) — el demo abre `/field-test/marketing-urgent-campaign-pii`
   - Visual atrás: gradient mesh sutil indigo→violet en bottom-right, no center

3. **Bento "qué mide"** (3 columns desiguales, gap 6):
   - Card grande (col-span-2): "5 dimensiones operativas" — lista limpia: criterio, verificación, ética/PII, comunicación, decisión
   - Card mediana: "11 risk events" — heading + número grande + "hallucinated_figures, PII_exposure, unapproved_vendor..."
   - Card chica: "judge híbrido" — Opus 4.5 + review humano staff

4. **Cómo funciona** (3 steps horizontal, 4-6 mins lectura):
   - Step 1: "Compra Sprint Diagnóstico" → "buyer paga $4k-$8k vía Stripe en USD. recibe link de invitación para sus 5-50 personas."
   - Step 2: "Equipo corre el caso vivo" → "cada persona recibe brief de Camila (CMO sintética). 6 secciones, ~18 min total. respuestas se graban con texto + voz."
   - Step 3: "Reporte ejecutivo en 48h" → "judge LLM evalúa contra rúbrica. risk events high van a review humano. tú recibes reporte por persona + agregado de equipo + recomendación 7-day."

5. **Precios** (tabla horizontal, no cards):
   - 3 tiers: Diagnóstico ($4k, 5-50 personas, 1 caso, reporte), Sprint Fase 2 ($8k, +1 sesión live debrief), Track avanzado (custom, multi-caso por trimestre)
   - Toda fila bajo el header con check/cross para features comparables

6. **FAQ** (5-7 preguntas, accordion):
   - "¿es certificación?" → No. es diagnóstico operativo de criterio en uso de IA. no acreditamos, medimos.
   - "¿qué LLM usan?" → Opus 4.5 + review humano staff Itera para risk events high.
   - "¿procesan PII real?" → No. los casos usan datos sintéticos. tu equipo no introduce PII de clientes reales en el simulador.
   - "¿factura mx/co/ar?" → Sí. contesta al recibo con RFC/NIT/CUIT.
   - "¿refunds?" → 7 días post-cargo si nadie empezó el caso. después, crédito.

7. **CTA final + footer**:
   - CTA strip: heading "ya tienes un sprint en la mira?" + botón `agendar diagnóstico`
   - Footer: 4 columnas (producto / empresa / legal / contacto) + © Itera

**Animaciones permitidas:**
- Hero CTAs: hover lift (translate-y -1px)
- Bento cards: fade-in scroll-triggered (no stagger pesado)
- Nav: fade-in al scroll bg blur

---

### 2. `/dashboard` (manager B2B)

**Audiencia:** comprador (Head/VP Marketing) viendo sus 5-50 personas después del sprint.

**Pregunta que responde:** "¿Cómo va mi equipo? ¿Quién está alto/bajo? ¿Cuál es el risk más común? ¿Qué acciones concretas hacemos los próximos 7 días?"

**Layout:** sidebar + main (no full-width, sidebar 280px collapsible).

**Sidebar izquierda:**
- Top: logo `itera` + selector de org (dropdown si tiene >1)
- Nav vertical: `inicio` (dashboard), `equipo` (lista personas), `reportes` (todos los reportes generados), `configuración` (org settings + billing)
- Bottom: user menu (avatar + nombre + dropdown logout)

**Main content:**

1. **Header del manager** (h-16, border-b):
   - H1 (text-2xl bold): `equipo marketing — sprint marzo`
   - Sub muted: `5 de 5 completaron · reporte agregado actualizado hace 2h`
   - Acción derecha: botón ghost `descargar reporte completo (.pdf)`

2. **KPI row** (grid 4 cards, gap 4):
   - Card 1: "promedio operativo" → 3.4 / 5 (text-4xl) + caption "5 personas, escala 1-5"
   - Card 2: "high risk events" → 2 (text-4xl, color amber) + caption "PII exposure (1), hallucinated figures (1)"
   - Card 3: "recomendación dominante" → "Entrenar" (text-2xl) + sub "3 de 5 personas"
   - Card 4: "siguiente acción 7 días" → "workshop verificación 1h" (text-base) + caption "para 3 personas"

3. **Matriz dimensión × banda** (table, full-width):
   - Filas: 5 personas
   - Columnas: 5 dimensiones (criterio, verificación, ética/PII, comunicación, decisión) + recomendación final
   - Celdas: pill colored (A=verde / M=amarillo / B=rojo) + tooltip con rationale corta
   - Click en fila → drill-down a `/report/[session_id]` de esa persona

4. **Risk events agregados** (tabla compacta):
   - 3 columnas: tipo de risk, count, severidad mayoritaria
   - Solo si hay risk events; si no, empty state "sin risk events relevantes"

5. **Actividad reciente** (timeline vertical):
   - Últimos 10 eventos: persona X completó caso, reporte Y publicado, risk Z review pending, etc.

**Empty states:**
- Sprint sin sesiones: "tu equipo aún no empieza. cuando alguien complete su caso, verás resultados aquí." + botón "reenviar invitaciones"
- Sesiones in_progress: "3 personas en curso. el dashboard se actualiza cuando completen."

**Animaciones:**
- KPI cards: fade-in stagger 50ms
- Matriz: fade-in completo (no stagger por celda — visualmente caótico)

---

### 3. `/case/[case_id]` (runtime empleado)

**Audiencia:** empleado invitado por su manager, completando el caso vivo.

**Pregunta que responde:** "Estoy en mitad del sprint. ¿Dónde estoy? ¿Qué se espera de mí en este step? ¿Cuánto falta?"

**Layout:** sidebar + main + topbar.

**Topbar (h-12, sticky):**
- Izquierda: logo `itera` + breadcrumb `sprint marzo › caso 1`
- Centro: progreso visual (5 dots, current + completed con fill, pending hollow)
- Derecha: tiempo elapsed (mm:ss) + botón ghost `guardar y salir`

**Sidebar izquierda (320px, collapsible):**
- Header sidebar: case_meta — `marketing urgent campaign pii_v1` + nivel `N1` + duración estimada `18-22 min`
- Lista de 6 secciones del caso (intro/data/draft/escalate/deliver/reflect):
  - Cada item: número + nombre + status (completed / current / locked)
  - Click en completed → puede revisar (read-only)
  - Pending: locked con candado
- Bottom: tooltip "tu progreso se guarda automáticamente"

**Main content (max-w-3xl centered):**

1. **Brief de Camila** (collapsible, expandido al inicio):
   - Avatar geométrico Camila (no foto real) + nombre + cargo "CMO Acme LATAM"
   - Mensaje en formato chat (con timestamp): el brief del caso. presión real ("necesito esto en 2 horas"), sin spoilers evaluativos
   - CTA al collapse: "leí el brief, continuar →"

2. **Step current** (la sección actual):
   - H2 (text-3xl): nombre del step (ej: "datos disponibles")
   - Sub (muted): instrucción concreta del step
   - Componentes del step: input texto + voice recorder + chips de opción (depende del step)
   - Botón abajo: `continuar →` (primary, disabled hasta input válido)

3. **Voice input** (donde aplique):
   - Botón record (circular, primary cuando idle, fucsia cuando recording)
   - Visualización waveform mientras graba
   - Transcript que aparece debajo en real-time (vía Whisper API)

4. **Salir/pausar**:
   - Banner sticky bottom (cerrable): "tu progreso se guarda. puedes volver desde el email de invitación."

**Anti-patrones runtime:**
- NO mostrar dimensiones evaluadas en cada step ("este step mide criterio + ética")
- NO mostrar chips "PII detectada" en tiempo real
- NO timer countdown agresivo (presión es del brief de Camila, no del UI)

**Animaciones:**
- Step transitions: slide-x 200ms ease-out + fade
- Voice recorder: pulse sutil cuando recording
- Save indicator: dot verde fade-in/out por save exitoso

---

### 4. `/report/[session_id]` (reporte individual)

**Audiencia:** empleado viendo su propio reporte + manager viendo reporte de alguien de su equipo.

**Pregunta que responde:** "¿Cómo me/le fue? ¿En qué dimensiones soy fuerte/débil? ¿Qué acciones concretas tomo los próximos 7 días?"

**Layout:** standalone (no sidebar, max-w-4xl centered, navbar minimal arriba).

**Estructura vertical:**

1. **Header del reporte:**
   - Eyebrow muted: `reporte ejecutivo`
   - H1 (text-4xl bold): `pablo carmona — sprint marzo`
   - Sub: case + fecha + duración + badge status (published / pending_review)
   - Acción derecha: botón `descargar pdf` (primary) + botón `compartir link` (ghost, abre modal con token-share)

2. **Recomendación dominante** (banner destacado, glassmorphism sutil):
   - Heading "recomendación: Entrenar" (text-3xl bold + color según rec)
   - Body (text-lg muted, max-w-2xl): rationale corta de 2-3 líneas explicando por qué Entrenar (no Pilotar/Pausar/Escalar)
   - 4 opciones de rec con icon + nombre, current rec destacado

3. **Bandas por dimensión** (5 cards horizontal o grid responsive):
   - Cada card: nombre dimensión + banda (A/M/B) grande + rationale (2 líneas) + score numérico opcional
   - Color de border-l indica banda (verde/amarillo/rojo)

4. **Risk events detectados** (lista o ausente):
   - Si hay risks: tabla con tipo + severidad + step donde ocurrió + evidence text (corta) + jurisdiction tag
   - Si NO hay risks: card neutral "sin risk events relevantes en esta sesión"

5. **Plan 7 días** (3-5 acciones bulletpoint):
   - Cada acción: heading corto + 1 línea de detalle + nivel de prioridad (high/med/low badge)
   - Ej: "workshop 1h verificación con asesoría externa" → high
   - Ej: "lectura: anthropic prompt engineering guide" → med

6. **Transcript expandible** (collapsible, expandido false por default):
   - Lista de los 6 steps con timestamp + input del usuario + comentario judge si aplica
   - Texto monospace, muted, padding generoso

**Empty state pending_review:**
- Banner amber: "tu reporte está en review por nuestro equipo. risk events high requieren validación humana. recibirás email cuando esté listo (24h max)."
- Resto de surface oculto.

**Animaciones:**
- Recomendación banner: fade-in + slight scale 0.95 → 1.0
- Bandas cards: stagger fade 50ms
- Risk events: fade
- Plan 7 días: stagger 30ms

---

## Tier 2 — auth flow + onboarding (próximo wakeup)

> Pendiente de redactar en próximo SHELL_SPEC wakeup. Por ahora codex puede usar
> los placeholders existentes en app/auth/ y app/onboarding/ — solo asegurar
> que el shell visual sea consistente con el de tier 1.

- `/auth/login`, `/auth/signup`, `/auth/callback`, `/auth/confirm`, `/auth/invitation/[token]`
- `/field-test/marketing-urgent-campaign-pii`
- `/onboarding/{org,team,billing,invite,done}`

---

## Tier 3 — transactional + legal (último)

- `/privacy`, `/terms` — ya tienen shell legal serio (refactor 19/05)
- `/cancel`, `/success` — ya tienen shell de confirmación (refactor 19/05)
- `/admin` + subroutes — backoffice staff Itera, shell utilitario (no pulido para customer)

---

## Acuerdos de protocolo

- **Build PASS no negociable**: cada surface tier 1 cierra cuando `bun build` pasa limpio.
- **HTTP smoke**: `curl -I http://localhost:3000/<surface>` retorna 200 (público) o 307 → login (protegido) con shell visible.
- **Mobile 375px**: surfaces deben verse pulidas en 375px. No mobile-broken aceptado en tier 1.
- **Sin imports legacy**: `grep -r '@/components/ui\|@/components/shared\|HashScrollHandler' app/` retorna 0.

Cuando cierres tier 1 (4 surfaces), avisa por `INBOX_CLAUDE.md` con commit hash + screenshots de cada surface (si tienes browser disponible).

— claude · 2026-05-19
