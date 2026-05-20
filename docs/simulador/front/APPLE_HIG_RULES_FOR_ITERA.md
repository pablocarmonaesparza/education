# Apple HIG Rules para Itera Simulador — Contrato de Diseño v1.0

> **Estatus:** contrato vigente. Cada regla es ejecutable y auditable.
> **Fuente primaria:** `APPLE_HIG_REFERENCE.md` (enciclopedia scraped 2026-05-19).
> **Fuente secundaria:** decisiones explícitas Pablo (CTO) cuando Apple no opina (B2B SaaS dashboards).
> **Versión:** 1.0 · 2026-05-19 · claude

## Orden de autoridad

Cuando dos guías entran en conflicto, gana la más alta:

1. **Apple HIG** (referenciado en este doc)
2. **Accesibilidad** (WCAG AA mínimo, AAA cuando posible)
3. **Contrato del producto** (`FRONT_CONTRACT.md`, `DIAGNOSTICO_1_CASO_V0.md`)
4. **Decisión explícita de Pablo** (CTO/CPO/CMO/CFO)
5. **Referencias inspiracionales** (Linear, Vercel, Anthropic, 21st.dev, Typeform)
6. **Gusto del agente** (claude/codex) — última prioridad, requiere justificación

## Apple manda vs. Apple no aplica

Apple HIG manda en lo que Apple sí cubre directamente: accesibilidad, contraste, legibilidad, hit targets, focus, motion, feedback, dark mode, formularios, navegación básica, modales/sheets, jerarquía visual y uso de materiales. Si una surface contradice esas reglas, se corrige aunque se vea "más SaaS".

Apple no decide por Itera el modelo de negocio, el contenido del diagnóstico, la rúbrica, el pricing, el funnel B2B, las métricas del manager ni la densidad exacta de dashboards empresariales. En esos casos gana el contrato de producto y se usan Linear, Vercel, Anthropic Console, Typeform y 21st.dev como referencias subordinadas.

Regla operativa: cuando Apple no aplica, documenta la decisión como `DEC-*` en la living section, con owner y razón. No se resuelve por gusto del agente.

## Notación

- **MUST** — obligatorio. Si no cumple, bloquea merge.
- **SHOULD** — fuertemente recomendado. Si no cumple, requiere justificación en commit message.
- **AVOID** — no usar salvo razón documentada en commit body.
- **ID** — `HIG-RULES-{CATEGORY}-{NN}` para referencia cruzada.
- **Source** — sección de Apple HIG citada (o "decisión Itera" si no aplica).
- **Screen** — surfaces afectadas (de las 20 rutas v2 allowlist).
- **Consequence** — qué se rompe si no se cumple.

---

## 1. Accessibility (A11Y)

### HIG-RULES-A11Y-01 · Contraste mínimo texto/fondo
- **MUST**: 4.5:1 para body text ≤17pt; 3:1 para text ≥18pt o ≥14pt bold (WCAG AA + Apple HIG)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Accessibility — Vision (tabla "Minimum contrast ratio")
- **Consequence**: falla audit accesibilidad; lectura imposible para baja visión

### HIG-RULES-A11Y-02 · Hit target mínimo
- **MUST**: 44×44 px mínimo para todo elemento clickeable en mobile/touch; 32×32 px aceptable en desktop con cursor cuando hay separación suficiente entre elementos
- **SHOULD**: 12px padding entre elementos clickeables con bezel; 24px sin bezel
- **Screen**: Landing CTAs, Dashboard botones, Runtime continue, Forms submit, Footer links, IconButtons
- **Source**: Apple HIG / Foundations / Accessibility — Mobility + Components / Buttons — Best practices (hit region 44×44 pt iOS)
- **Consequence**: untappable en mobile; no acepta criterio "premium"

### HIG-RULES-A11Y-03 · Color no único portador de información
- **MUST**: nunca usar solo color para diferenciar estado (success/error/warning/banda A/M/B). Acompañar con icono, label de texto, o forma distinta.
- **Screen**: Dashboard bandas A/M/B (ya cumple — usa letra+color), Report risk severity (✓), Forms validation
- **Source**: Apple HIG / Foundations / Accessibility — Vision; Color / Inclusive color
- **Consequence**: usuarios color-blind no perciben estados; falla WCAG 1.4.1

### HIG-RULES-A11Y-04 · Respetar prefers-reduced-motion
- **MUST**: framer-motion `useReducedMotion` hook en TODAS las animaciones decorativas
- **MUST**: cuando reduced-motion activo, reemplazar slides/scales por fades simples o eliminar animación
- **SHOULD**: animar nunca debe bloquear progreso del usuario
- **Screen**: TODAS (especialmente Landing fadeUp, Report cards stagger, Runtime step transitions)
- **Source**: Apple HIG / Foundations / Accessibility — Cognitive (Be cautious with fast-moving animations) + Motion / Best practices
- **Consequence**: usuarios sensibles a movimiento → mareo o crisis; falla WCAG 2.3.3

### HIG-RULES-A11Y-05 · Texto escalable hasta 200%
- **MUST**: todo tamaño de texto debe escalar al 200% sin romper layout (Apple: 200% en iOS, 140% en watchOS)
- **MUST**: usar `rem`/`em` para font-size, no `px` fijos en body/headings
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Accessibility — Vision (Support larger text sizes)
- **Consequence**: usuarios con baja visión no pueden leer

### HIG-RULES-A11Y-06 · Keyboard nav completa
- **MUST**: toda funcionalidad accesible vía teclado (Tab/Shift+Tab para focus, Enter para activar, Esc para cerrar, arrows para listas/radios)
- **MUST**: focus visible en TODOS los elementos focusables (no `outline: none` sin reemplazo equivalente)
- **MUST**: no anular shortcuts del sistema (Cmd+R, Cmd+W, Cmd+T, Cmd+F)
- **Screen**: TODAS, crítico en Runtime (caso vivo) y Forms (Auth/Onboarding)
- **Source**: Apple HIG / Foundations / Accessibility — Speech (Full Keyboard Access) + Mobility
- **Consequence**: usuarios keyboard-only no pueden completar tareas

### HIG-RULES-A11Y-07 · Etiquetas semánticas + ARIA
- **MUST**: usar HTML semántico (`button`, `nav`, `main`, `aside`, `article`, `section`) sobre `div` plano
- **MUST**: `aria-label` en botones sin texto (icon-only), `aria-describedby` en errores de form, `aria-live` en regiones que cambian (toast, validation feedback)
- **SHOULD**: `aria-current="page"` en nav del current path
- **AVOID**: ARIA roles cuando HTML semántico aplica (`role="button"` en `<div>` cuando un `<button>` lo soluciona)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Accessibility — Vision (VoiceOver)
- **Consequence**: screen readers no anuncian contexto; falla WCAG 4.1.2

---

## 2. Typography (TYPO)

### HIG-RULES-TYPO-01 · Font stack sistema
- **MUST**: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **MUST**: nunca embed SF Pro (Apple no licencia para web fuera de Apple platforms) — usar fallback chain con `-apple-system`
- **Screen**: TODAS (ya cumple en `app/(app)/simulador.css` línea 7)
- **Source**: Apple HIG / Foundations / Typography — Using system fonts
- **Consequence**: si no cumple, fonts genéricos = no Apple-feel

### HIG-RULES-TYPO-02 · Tamaño mínimo body
- **MUST**: 14px mínimo body en web (Apple iOS 11pt min ≈ 14px web; Apple iOS default 17pt ≈ 17-22px web)
- **SHOULD**: 16-17px default body en B2B SaaS desktop (mejor legibilidad sostenida)
- **AVOID**: text-xs (12px) salvo captions/microcopy auxiliar
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Typography — Specifications + Ensuring legibility
- **Consequence**: body <14px ilegible para aging users

### HIG-RULES-TYPO-03 · Pesos permitidos
- **MUST**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **AVOID**: Ultralight (100), Thin (200), Light (300) — Apple los descarta explícito por legibilidad
- **AVOID**: Black (900) — reservar solo para display ≥48px en hero, rara vez justificado
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Typography — Ensuring legibility ("avoid light font weights")
- **Consequence**: thin weights → texto borroso en pantallas pequeñas; aging users no leen

### HIG-RULES-TYPO-04 · Letter-spacing
- **MUST**: displays ≥32px → `letter-spacing: -0.022em` (Apple SF Pro tracking values)
- **SHOULD**: body 14-17px → `letter-spacing: -0.011em` (ya en simulador.css línea 11)
- **MUST**: eyebrows uppercase (text-xs) → `letter-spacing: 0.05em` (tracking-widest)
- **AVOID**: tracking expandido (>0.02em) en body
- **Screen**: Landing hero, Dashboard headers, Report H1, Runtime case title, todos los eyebrows
- **Source**: Apple HIG / Foundations / Typography — Tracking values (variable font dynamic tracking)
- **Consequence**: displays sin tight tracking → texto genérico/no Apple

### HIG-RULES-TYPO-05 · Una sola typeface
- **MUST**: una typeface family en TODO el producto (SF Pro fallback chain definido en TYPO-01)
- **AVOID**: mezclar serif + sans + display fonts en la misma surface
- **EXCEPCIÓN**: New York serif solo si Itera adopta dual-typeface intencional (decisión Pablo pendiente; default es no)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Typography — Conveying hierarchy ("Minimize the number of typefaces")
- **Consequence**: múltiples fonts → inconsistente, obstaculiza jerarquía visual

### HIG-RULES-TYPO-06 · Jerarquía con weight + size + color
- **MUST**: máximo 5 niveles tipográficos por surface (Display, Title, Subtitle, Body, Caption)
- **MUST**: diferenciar niveles con weight + size + color combinados — no solo size
- **SHOULD**: line-height inverso al size: 1.1-1.2 para displays, 1.3-1.4 para titles, 1.5-1.65 para body
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Typography — Conveying hierarchy + Using built-in text styles
- **Consequence**: >5 niveles → confusión jerárquica

---

## 3. Color (COLOR)

### HIG-RULES-COLOR-01 · Significado consistente
- **MUST**: cada color tiene un significado semántico fijo en todo el producto:
  - **Accent** (`var(--accent)` `#1472FF`): interactividad, links, primary action
  - **Success** (`var(--band-a-text)` verde `#22c55e`): completado, banda alta, confirmación
  - **Warning** (banda M ámbar): atención requerida, pending review
  - **Destructive** (`var(--band-b-text)` rojo): error, delete, banda baja
- **AVOID**: usar accent color en texto noninteractive (rompe affordance de "clickeable")
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Color — Best practices (Avoid using the same color to mean different things)
- **Consequence**: usuario no aprende qué es clickeable

### HIG-RULES-COLOR-02 · Variantes light + dark + increased contrast
- **MUST**: cada color tiene variante definida para light Y dark mode en `simulador.css`
- **MUST**: contraste verificado en AMBOS modos (no solo light)
- **SHOULD**: variante "increased contrast" cuando `prefers-contrast: more` (Apple lo recomienda)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Color — Best practices + Dark Mode / Dark Mode colors
- **Consequence**: dark mode roto; usuarios con increase-contrast ON no ven nada

### HIG-RULES-COLOR-03 · No hardcode hex inline
- **MUST**: usar CSS variables (`var(--accent)`, `var(--text-primary)`) — nunca `bg-[#1472FF]` ni `text-[#4b4b4b]`
- **SHOULD**: extender `simulador.css` con nuevas variables ANTES de inventar tonos
- **AVOID**: `bg-blue-500`, `text-gray-700` y similares Tailwind defaults (Material-flavored)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Color — System colors (Avoid hard-coding system color values)
- **Consequence**: cambios futuros de paleta = refactor masivo + inconsistencia

### HIG-RULES-COLOR-04 · Test contrast en ambos modos
- **MUST**: validar WCAG AA en light Y dark con axe-core o Lighthouse antes de merge
- **SHOULD**: usar APCA además de WCAG para texto pequeño (Apple lo recomienda en HIG 2025)
- **Screen**: TODAS, especialmente Report (mucho texto), Dashboard (badges densos), Runtime
- **Source**: Apple HIG / Foundations / Accessibility — Vision + Color
- **Consequence**: falla audit accesibilidad

---

## 4. Dark Mode (DARK)

### HIG-RULES-DARK-01 · No app-specific appearance toggle
- **AVOID**: agregar toggle "dark mode" dentro del app — Apple lo desaconseja explícito ("Avoid offering an app-specific appearance setting")
- **MUST**: respetar `prefers-color-scheme` del OS — sin override en app
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Dark Mode — Best practices
- **Consequence**: usuario ajusta dark mode 2 veces (OS + app); UX confusa

### HIG-RULES-DARK-02 · Soften white backgrounds en dark
- **MUST**: imágenes con fondo blanco en dark mode usar variante darken (filter brightness 0.9) o contenedor con border
- **Screen**: Landing (cuando haya logos de partners/customers), Report (cuando haya screenshots embed)
- **Source**: Apple HIG / Foundations / Dark Mode — Soften the color of white backgrounds
- **Consequence**: fondo blanco "glow" molesto en dark mode

### HIG-RULES-DARK-03 · Contraste 7:1 para small text en dark
- **SHOULD**: para texto <14px en dark mode, aspirar a 7:1 (no solo WCAG AA 4.5:1)
- **Screen**: Captions, micro-labels, badges, eyebrows
- **Source**: Apple HIG / Foundations / Dark Mode — Aim for sufficient color contrast
- **Consequence**: small text borroso en dark mode

---

## 5. Layout (LAYOUT)

### HIG-RULES-LAYOUT-01 · Agrupar con whitespace
- **MUST**: agrupar elementos relacionados con whitespace (4/8/16/24/32px scale) — no solo con borders/colors
- **SHOULD**: separación entre grupos mínimo 24px en desktop, 16px en mobile
- **Screen**: Dashboard cards groups, Report sections, Forms field groups
- **Source**: Apple HIG / Foundations / Layout — Best practices (Group related items)
- **Consequence**: contenido apretado = baja escaneabilidad

### HIG-RULES-LAYOUT-02 · Spacing scale 4pt grid
- **MUST**: todos los spacings son múltiplos de 4 (Tailwind default 4px base ya cumple)
- **MUST**: padding interno cards 24px (`p-6`) default; 32px (`p-8`) cards hero
- **SHOULD**: margins entre secciones 64-96px (`my-16` a `my-24`)
- **AVOID**: valores arbitrarios (`p-[17px]`, `mt-[23px]`) sin razón documentada
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Layout — 8pt grid implicit (Apple Design Resources)
- **Consequence**: spacing arbitrario rompe ritmo visual

### HIG-RULES-LAYOUT-03 · Container max-width
- **MUST**: contenido legible (texto largo) `max-w-prose` (~65ch)
- **MUST**: surfaces hero/dashboard `max-w-6xl` (1152px) o `max-w-7xl` (1280px)
- **SHOULD**: padding horizontal `px-6` desktop / `px-4` mobile
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Layout + Typography (line-length readability)
- **Consequence**: texto demasiado ancho > 75ch = ilegible

### HIG-RULES-LAYOUT-04 · Alineación consistente
- **MUST**: alineación leading (izquierda en LTR) por default
- **MUST**: baseline alignment cuando mezclan tamaños diferentes en la misma línea
- **AVOID**: alineación center en bloques de texto >2 líneas
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Layout — Visual hierarchy (Align components)
- **Consequence**: alineaciones rotas → caos visual

### HIG-RULES-LAYOUT-05 · Reading order top-leading
- **MUST**: información más importante en esquina top-leading (top-left en LTR)
- **MUST**: títulos arriba, acciones primarias debajo, info secundaria al lado
- **Screen**: TODAS (Landing hero, Dashboard header, Report H1)
- **Source**: Apple HIG / Foundations / Layout — Visual hierarchy (Place items to convey importance)
- **Consequence**: usuario no encuentra info clave

---

## 6. Materials & Surfaces (MAT)

### HIG-RULES-MAT-01 · Liquid Glass solo en navigation chrome
- **MUST**: `backdrop-blur` solo en nav sticky, modals, popovers, command palette
- **AVOID**: backdrop-blur en cards de contenido (Apple advierte explícito: "Don't use Liquid Glass in the content layer")
- **Screen**: Landing nav top, Dashboard sidebar header, Runtime topbar, Modal overlays
- **Source**: Apple HIG / Foundations / Materials — Liquid Glass
- **Consequence**: visual ruidoso si glass en cards de contenido

### HIG-RULES-MAT-02 · Dimming layer cuando glass sobre fondo brillante
- **SHOULD**: si fondo detrás del glass es brillante (image, gradient), agregar `bg-black/35` debajo
- **Screen**: Modal overlays sobre Landing hero, Popovers sobre Dashboard
- **Source**: Apple HIG / Foundations / Materials — clear Liquid Glass (dimming layer 35%)
- **Consequence**: glass ilegible sobre fondos coloridos

### HIG-RULES-MAT-03 · Border radius scale (decisión Itera + Apple proporcional)
- **MUST**: usar tokens (definir en `simulador.css` si no existen):
  - `--radius-xs`: 4px (badges, chips, tags)
  - `--radius-sm`: 8px (buttons, inputs, small cards)
  - `--radius-md`: 12px (cards default)
  - `--radius-lg`: 16px (cards grandes, alerts)
  - `--radius-xl`: 20px (modals, hero containers)
  - `--radius-2xl`: 24px (sheets, presentation)
  - `--radius-full`: solo dots, avatares circulares, badges pill específicos
- **AVOID**: `rounded-full` en botones default (es decisión Material/21st.dev, no Apple)
- **Screen**: TODAS
- **Source**: Apple HIG implicit (Apple usa radius proporcional al tamaño del elemento)
- **Consequence**: feel material/web no-Apple

### HIG-RULES-MAT-04 · Shadow scale sutil
- **MUST**: usar tokens (definir en `simulador.css` si no existen):
  - `--shadow-xs`: `0 1px 2px rgba(0,0,0,0.04)` — micro-elevation
  - `--shadow-sm`: `0 2px 4px rgba(0,0,0,0.06)` — buttons hover, inputs focus
  - `--shadow-md`: `0 4px 12px rgba(0,0,0,0.08)` — cards elevated
  - `--shadow-lg`: `0 8px 24px rgba(0,0,0,0.10)` — popovers, dropdowns
  - `--shadow-xl`: `0 16px 48px rgba(0,0,0,0.12)` — modals, sheets
- **AVOID**: Tailwind `shadow-lg` / `shadow-xl` / `shadow-2xl` defaults (demasiado pesados, Material-style)
- **Screen**: TODAS
- **Source**: Apple HIG implicit (Apple shadows always subtle, never dramatic)
- **Consequence**: shadows pesados = visual Material no Apple

---

## 7. Motion (MOTION)

### HIG-RULES-MOTION-01 · Animar con propósito
- **MUST**: cada animación comunica algo (status, jerarquía, transición de estado, feedback)
- **AVOID**: animaciones decorativas sin propósito (Apple advierte "gratuitous animation")
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Motion — Best practices ("Add motion purposefully")
- **Consequence**: usuario distraído o mareado

### HIG-RULES-MOTION-02 · Duraciones — brevedad
- **MUST**: tokens en `simulador.css`:
  - `--motion-fast`: 150ms (tap feedback, hover micro)
  - `--motion-base`: 250ms (state changes, button press)
  - `--motion-slow`: 450ms (component enter/exit, modal appear)
  - `--motion-page`: 600ms máximo (page transitions raras)
- **AVOID**: animations >600ms salvo onboarding storytelling deliberado
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Motion — Aim for brevity (200-300ms UI, 400-500ms larger elements)
- **Consequence**: animaciones lentas = friction percibida

### HIG-RULES-MOTION-03 · Easing curves Apple
- **MUST**: usar tokens en `simulador.css`:
  - `--motion-ease`: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple-style ease-out, default para casi todo)
  - `--motion-spring`: `cubic-bezier(0.34, 1.56, 0.64, 1)` (solo sheet presentations + drag responses)
  - `--motion-linear`: `linear` (solo progress bars determinate)
- **AVOID**: `ease-in-out` Tailwind default (`cubic-bezier(0.4, 0, 0.2, 1)`) — es Material
- **AVOID**: bouncy springs en transitions UI normales
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Motion — Realistic feedback motion + framer-motion conventions
- **Consequence**: easing material-flavored = no Apple

### HIG-RULES-MOTION-04 · No animar UI frecuente
- **AVOID**: animar transitions que se ejecutan muchas veces (hover de cada item en lista de 20)
- **MUST**: stagger pesado >50ms solo cuando lista <8 items
- **SHOULD**: lista >8 items → fade-in conjunto, no stagger individual
- **Screen**: Runtime list de steps, Dashboard cards stagger, Report dimensiones list
- **Source**: Apple HIG / Foundations / Motion — Avoid adding motion to UI interactions that occur frequently
- **Consequence**: spam de microanimations = ruido visual

### HIG-RULES-MOTION-05 · Cancelable
- **MUST**: usuario puede cancelar animaciones largas (>1s) con tap, keyboard, o scroll
- **MUST**: animaciones nunca bloquean input del usuario
- **Screen**: Onboarding splash, Loading transitions, Report polling
- **Source**: Apple HIG / Foundations / Motion — Let people cancel motion
- **Consequence**: usuario frustrado esperando

### HIG-RULES-MOTION-06 · Tap feedback obligatorio
- **MUST**: todo elemento clickeable tiene press state visible
- **MUST**: `whileTap={{ scale: 0.98, opacity: 0.96 }}` en buttons + cards interactivas (framer-motion)
- **AVOID**: solo cambio de bg-color como tap feedback (Material-style)
- **Screen**: TODAS botones + cards interactive
- **Source**: Apple HIG / Components / Buttons — Always include a press state for a custom button
- **Consequence**: app se siente unresponsive

---

## 8. Writing (WRITE)

### HIG-RULES-WRITE-01 · Voz Itera definida
- **MUST**: voz Itera = directa, clara, en minúsculas (excepto nombres propios + siglas)
- **MUST**: imperativo en CTAs ("agendar diagnóstico", no "empieza tu camino")
- **AVOID**: jerga corporate ("aprovecha al máximo", "desbloquea", "transforma", "ICP/MVP"), interjecciones ("oops!", "uh-oh"), pronombres posesivos innecesarios ("tu reporte" cuando "reporte" basta), "we" en error messages (Apple lo prohíbe)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Writing — Voice + decisión Itera CLAUDE.md
- **Consequence**: copy genérico SaaS, no Itera

### HIG-RULES-WRITE-02 · Capitalization rules Itera
- **MUST**:
  - Botones acción primaria: Sentence case ("Agendar diagnóstico", "Continuar")
  - Headings H1/H2/H3: Sentence case con punto final ("Las cinco dimensiones.")
  - Eyebrows (uppercase small): UPPERCASE ("DIAGNÓSTICO OPERATIVO")
  - Labels/captions/microcopy: lowercase ("nombre", "email", "última actualización")
- **AVOID**: Title Case tipo Apple iOS ("Save Changes") — Itera no es Apple-native, es B2B LATAM serio
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Writing — Capitalization rules ("apply consistently") + decisión Itera
- **Consequence**: copy inconsistente

### HIG-RULES-WRITE-03 · Error messages accionables
- **MUST**: error explica QUÉ hacer para corregir, no QUÉ está mal
  - ✓ "Elige una contraseña de al menos 8 caracteres"
  - ✗ "Contraseña inválida"
- **MUST**: mostrar error cerca del campo (debajo o al lado), no en banner al final del form
- **AVOID**: "Oops!", "Uh-oh", culpar al usuario
- **AVOID**: "We're having trouble loading" → preferir "Unable to load content" (Apple lo dice explícito)
- **Screen**: Forms (Auth, Onboarding wizard, Runtime inputs)
- **Source**: Apple HIG / Foundations / Writing — Write clear error messages
- **Consequence**: usuario no sabe cómo resolver; abandona

### HIG-RULES-WRITE-04 · Empty states guían
- **MUST**: empty state explica QUÉ pasa + acción siguiente concreta
- **MUST**: incluir botón/link para acción cuando posible
- **AVOID**: "Aún no hay nada aquí" sin contexto ni next step
- **Screen**: Dashboard sin team, Report sin sessions, Admin queue vacío, Onboarding invite sin emails
- **Source**: Apple HIG / Foundations / Writing — Provide clear next steps on any blank screens
- **Consequence**: usuario confundido, no avanza

### HIG-RULES-WRITE-05 · Placeholder text útil
- **MUST**: placeholder muestra formato esperado ("nombre@empresa.com", "+52 55 1234 5678", "Acme LATAM")
- **AVOID**: placeholder genérico ("Email", "Teléfono") — usar label arriba mejor
- **MUST**: label arriba del input siempre, placeholder es hint adicional
- **Screen**: Auth signup, Onboarding wizard, todos los Forms
- **Source**: Apple HIG / Foundations / Writing — Show hints in text fields
- **Consequence**: usuario duda formato; submission errors

### HIG-RULES-WRITE-06 · Vocabulario consistente en flows
- **MUST**: en flows multi-step usar exactamente las mismas palabras:
  - Iniciar: "Empezar" (no "Empieza", no "Iniciar flow")
  - Avanzar: "Continuar" (no "Siguiente", no "Next")
  - Volver: "Atrás" (no "Volver", no "Regresar")
  - Cerrar: "Hecho" o "Cerrar" (no "Listo", no "OK")
- **Screen**: Onboarding wizard, Runtime, Auth, Modals
- **Source**: Apple HIG / Foundations / Writing — Give clear guidance in multi-step processes
- **Consequence**: copy inconsistente confunde keyboard users + screen readers

---

## 9. Buttons (BTN)

### HIG-RULES-BTN-01 · Hit region 44×44 mínimo
- **MUST**: botón clickeable mínimo 44×44 px en mobile, 32×32 px en desktop con cursor
- **MUST**: incluso si el button visible es más pequeño, expand hit area con padding invisible
- **Screen**: TODAS
- **Source**: Apple HIG / Components / Buttons — Make buttons easy to use
- **Consequence**: untappable en mobile

### HIG-RULES-BTN-02 · Press state obligatorio
- **MUST**: todo botón tiene press state visible
- **MUST**: `whileTap={{ scale: 0.98, opacity: 0.96 }}` con framer-motion, o CSS `:active` equivalente
- **MUST**: hover state distinct (no solo cursor change)
- **MUST**: focus state visible para keyboard nav (outline accent)
- **Screen**: TODAS
- **Source**: Apple HIG / Components / Buttons — Always include a press state
- **Consequence**: app feels unresponsive

### HIG-RULES-BTN-03 · 1-2 primary por view
- **MUST**: máximo 1 botón primary visible por viewport (idealmente)
- **SHOULD**: si hay 2, ambos pertenecen al mismo grupo de acción
- **AVOID**: múltiples primary buttons compitiendo por atención
- **Screen**: Landing (1 primary hero + 1 secondary), Dashboard (max 2 actions visibles), Forms (1 submit)
- **Source**: Apple HIG / Components / Buttons — Best practices (Keep prominent buttons to one or two per view)
- **Consequence**: usuario no sabe qué clickear (decision paralysis)

### HIG-RULES-BTN-04 · Roles semánticos
- **MUST**: cada button declara rol semántico:
  - **Primary**: variant principal (accent blue), acción más probable
  - **Cancel**: variant outline o ghost (neutro)
  - **Destructive**: rojo (color destructive)
  - **Normal**: outline default
- **MUST**: NO usar Primary en acciones destructivas (Apple lo prohíbe explícito)
- **Screen**: TODAS
- **Source**: Apple HIG / Components / Buttons — Role + Don't assign the primary role to destructive
- **Consequence**: usuario confirma destructive accidentalmente

### HIG-RULES-BTN-05 · Primary responde a Enter
- **MUST**: el primary button del view responde a tecla `Enter`
- **MUST**: en forms, primary = `type="submit"`
- **Screen**: Forms (Auth, Onboarding), Modals confirmación
- **Source**: Apple HIG / Components / Buttons — Assign the primary role
- **Consequence**: keyboard users no pueden submit con Enter

### HIG-RULES-BTN-06 · Verbo en label
- **MUST**: button label empieza con verbo cuando posible ("Agendar diagnóstico", "Continuar", "Eliminar")
- **AVOID**: button label es solo objeto ("Diagnóstico", "Cuenta") sin verbo
- **AVOID**: "Click aquí" / "Tap aquí" (Apple lo prohíbe explícito por accesibilidad screen readers)
- **Screen**: TODAS
- **Source**: Apple HIG / Foundations / Writing — Be action oriented
- **Consequence**: usuario no entiende qué hace el button

### HIG-RULES-BTN-07 · Ellipsis (…) cuando requiere más input
- **MUST**: button label con `…` cuando la acción abre otro view/modal que requiere input adicional
  - ✓ "Compartir…" (abre modal con opciones)
  - ✓ "Exportar…" (abre dialog formato)
  - ✗ "Guardar" (acción inmediata, sin elipsis)
- **Screen**: Report (Compartir…), Dashboard (Exportar…), Admin (Editar…)
- **Source**: Apple HIG / Components / Menus — Append an ellipsis to menu-item label
- **Consequence**: usuario no anticipa que abrirá modal/dialog

---

## 10. Forms / Entering Data (FORM)

### HIG-RULES-FORM-01 · Validación inline
- **MUST**: validar campos al blur o on-change (debounced 500ms)
- **MUST**: mostrar errores cerca del campo (debajo o al lado), no en banner al final
- **AVOID**: validar solo al submit final
- **Screen**: Auth signup, Onboarding wizard, Forms del Runtime
- **Source**: Apple HIG / Patterns / Entering data — Dynamically validate field values
- **Consequence**: usuario llega al final, falla, frustración

### HIG-RULES-FORM-02 · Defaults sensatos
- **MUST**: prefill cuando sabemos el valor (email del session, nombre de signup, región por IP)
- **MUST**: dropdown con opción más probable seleccionada por default
- **AVOID**: forzar al usuario a empezar de cero cada vez
- **Screen**: Onboarding wizard (org region, team type), Runtime steps subsequent
- **Source**: Apple HIG / Patterns / Entering data — Pre-fill / Be clear about data needed
- **Consequence**: friction innecesaria

### HIG-RULES-FORM-03 · Required fields claros
- **MUST**: campos requeridos marcados visualmente (`*` rojo después del label, o "(requerido)")
- **MUST**: button submit disabled hasta required completos
- **AVOID**: dejar al usuario adivinar qué falta
- **Screen**: Forms
- **Source**: Apple HIG / Patterns / Entering data — When data entry is necessary
- **Consequence**: submits fallidos, frustración

### HIG-RULES-FORM-04 · Tipos correctos de inputs
- **MUST**: `<input type="email">` para email, `type="tel"` para teléfono, `type="number"` para numéricos, `type="url"` para URLs
- **MUST**: `<textarea>` con `rows` apropiado para texto largo (Runtime open-ended steps ≥4 rows)
- **MUST**: `autocomplete` attributes correctos (`name`, `email`, `organization`, `tel`, etc.)
- **Screen**: Auth, Onboarding, Runtime
- **Source**: Apple HIG / Patterns / Entering data + web accessibility (HTML5)
- **Consequence**: mobile keyboard incorrecto, autocomplete roto, password managers fallan

### HIG-RULES-FORM-05 · Password fields seguros (N/A Itera)
- **MUST**: `<input type="password">` cuando aplica — nunca prepopular
- **AVOID**: mostrar password en plaintext salvo botón "show password" explícito
- **EXCEPCIÓN**: Itera usa magic links + Google OAuth (no passwords) — regla N/A actualmente
- **Screen**: Auth (no aplica)
- **Source**: Apple HIG / Patterns / Entering data — Never prepopulate a password field
- **Consequence**: leak credenciales (cuando aplique)

### HIG-RULES-FORM-06 · One task per screen (Typeform UX)
- **MUST**: en Runtime caso vivo, una pregunta principal por step
- **MUST**: textarea principal `rows={6}` mínimo + autofocus al entrar al step
- **MUST**: keyboard `Enter` (sin modifier) avanza al siguiente step si válido; `Cmd+Enter` para newline en textarea; `Esc` vuelve atrás
- **Screen**: Runtime (caso vivo 6 steps), Onboarding wizard
- **Source**: Apple HIG / Foundations / Accessibility — Cognitive (Break up multistep workflows) + Typeform UX adoption explícita Itera
- **Consequence**: usuario abrumado, lower completion rate

---

## 11. Feedback (FB)

### HIG-RULES-FB-01 · Feedback proporcional
- **MUST**: usar toast (auto-dismiss 4s) para success/info menores
- **MUST**: usar modal para confirmaciones destructivas
- **MUST**: usar alert inline para errores en forms
- **AVOID**: toast para errores críticos (puede perderse)
- **AVOID**: modal para info trivial (es interruptivo)
- **Screen**: TODAS
- **Source**: Apple HIG / Patterns / Feedback — Match significance + Choose the right delivery method
- **Consequence**: alertas spamean o errores se pierden

### HIG-RULES-FB-02 · Confirmar acciones destructivas
- **MUST**: confirm dialog antes de delete, archive, cancel subscription
- **MUST**: dialog texto explícito ("Eliminar reporte. Esta acción no se puede deshacer.")
- **MUST**: botón destructive en rojo + cancel en outline neutro
- **MUST**: el botón destructive NO es default (no responde a Enter — solo click explícito)
- **Screen**: Admin queue review, Dashboard remove member, Report delete share link
- **Source**: Apple HIG / Patterns / Feedback — Warn unexpected data loss
- **Consequence**: data loss accidental → support tickets

### HIG-RULES-FB-03 · Status integrado en UI
- **SHOULD**: mostrar status próximo al item que describe (badge inline), no banner separado
- **Ejemplo**: badge "review pendiente" junto al participante en Dashboard, no banner aparte
- **Screen**: Dashboard, Report, Runtime
- **Source**: Apple HIG / Patterns / Feedback — Integrate status feedback into your interface
- **Consequence**: usuario no asocia status con item

---

## 12. Loading (LOAD)

### HIG-RULES-LOAD-01 · Mostrar algo en 100ms
- **MUST**: cualquier screen muestra al menos placeholder, skeleton o spinner en <100ms
- **MUST**: si action toma >2s sin feedback, asume que falló (mostrar error)
- **Screen**: TODAS
- **Source**: Apple HIG / Patterns / Loading — Show something as soon as possible
- **Consequence**: usuario asume app rota

### HIG-RULES-LOAD-02 · Skeleton vs spinner
- **MUST**: skeleton screens para listas/cards conocidos (>2s estimado, ej: Dashboard members)
- **MUST**: spinners para acciones de usuario <2s (button loading)
- **AVOID**: spinner full-page para data que tarda >2s — usar skeleton matching layout
- **Screen**: Dashboard lista miembros, Report secciones, Runtime case load, Onboarding wizard
- **Source**: Apple HIG / Patterns / Loading + Web UX standards
- **Consequence**: spinners largos = friction percibida

### HIG-RULES-LOAD-03 · Progress determinate cuando posible
- **MUST**: progress bar con % cuando duración conocida (upload, evaluate judge)
- **MUST**: spinner indefinido solo cuando duración desconocida
- **SHOULD**: mostrar tiempo restante estimado cuando confianza >70%
- **Screen**: Report evaluating (judge LLM 15-30s), Onboarding billing checkout, Upload files
- **Source**: Apple HIG / Patterns / Loading — Determinate progress indicator
- **Consequence**: usuario no sabe cuánto falta = abandona

---

## 13. Onboarding (ONB)

### HIG-RULES-ONB-01 · Value-first
- **MUST**: mostrar valor antes de pedir trabajo (signup wall, customización)
- **MUST**: usuario completa primera interacción real en <60s desde landing
- **Screen**: Landing → Field-test (sin auth, demo público) → Onboarding wizard (después de signup paid)
- **Source**: Apple HIG / Patterns / Onboarding — Postpone nonessential setup flows
- **Consequence**: drop-off antes de probar value prop

### HIG-RULES-ONB-02 · Optional + skippable
- **MUST**: tours/tutorials son skippable
- **MUST**: defaults sensatos permiten saltar customization no esencial
- **AVOID**: bloquear progreso por preguntas no esenciales
- **Screen**: Onboarding wizard (algunas preguntas opcionales)
- **Source**: Apple HIG / Patterns / Onboarding — Make optional
- **Consequence**: usuario abandona el flow

### HIG-RULES-ONB-03 · Teach by interactivity, not text
- **MUST**: enseñar haciendo, no leyendo manuales
- **AVOID**: tooltips de bienvenida full-screen ("First, click here. Then click there.")
- **SHOULD**: context tips justo cuando aparece feature relevante (TipKit-style)
- **Screen**: Field-test (primer caso público), Runtime first session
- **Source**: Apple HIG / Patterns / Onboarding — Teach through interactivity
- **Consequence**: usuario no retiene info de tooltip largo

---

## 14. Components específicos — quick rules

### Text Fields (TF)
- **HIG-RULES-TF-01**: label visible arriba del input siempre (no solo placeholder)
- **HIG-RULES-TF-02**: error message debajo del input en color destructive
- **HIG-RULES-TF-03**: focus state con outline accent visible (no `outline: none` sin reemplazo)

### Sidebars (SIDE)
- **HIG-RULES-SIDE-01**: sidebar collapsible en desktop (toggle button visible), drawer en mobile
- **HIG-RULES-SIDE-02**: persistent navigation top-leading siempre
- **HIG-RULES-SIDE-03**: nav items con icon + label (no solo icons, salvo cuando colapsada)

### Tabs (TAB)
- **HIG-RULES-TAB-01**: máximo 5 tabs visibles (más → overflow "More")
- **HIG-RULES-TAB-02**: tab activa visualmente distinct (border-bottom accent + weight Semibold)
- **HIG-RULES-TAB-03**: scroll horizontal solo si más de 5 tabs + indicators visibles

### Sheets / Modals (SHEET)
- **HIG-RULES-SHEET-01**: modal solo para acción focused, no para info pasiva
- **HIG-RULES-SHEET-02**: cerrable con `Esc` + click fuera del modal + button explícito (X arriba o "Cancelar")
- **HIG-RULES-SHEET-03**: max-width modal 600px (no full-screen salvo onboarding flows)

### Progress Indicators (PROG)
- **HIG-RULES-PROG-01**: determinate (con %) cuando duración conocida, indeterminate cuando no
- **HIG-RULES-PROG-02**: color = accent (default) o status (success verde, error rojo)
- **HIG-RULES-PROG-03**: nunca full-page sin contexto — siempre con label "Cargando…" o "Evaluando…"

### Iconography (ICON)
- **HIG-RULES-ICON-01**: stroke width 1.5px consistente (`strokeWidth={1.5}` en la librería adoptada)
- **HIG-RULES-ICON-02**: una librería de iconos por proyecto (Tabler React es la canónica en el cleanroom del simulador; ver `DEC-001`)
- **HIG-RULES-ICON-03**: icon sin texto = aria-label obligatorio

### Iconos significados consistentes
- **HIG-RULES-ICON-04**:
  - Compartir: `<Share />` (no `<ExternalLink />`)
  - Descargar: `<Download />`
  - Más opciones: `<MoreHorizontal />` o `<MoreVertical />` (no `<Settings />`)
  - Cerrar: `<X />` (no `<Trash />` ni `<ChevronLeft />`)
  - Confirmar: `<Check />`
  - Error: `<AlertCircle />` (no `<XCircle />` rojo agresivo)
  - Info: `<Info />` (azul accent)

---

## 15. i18n LATAM (I18N)

### HIG-RULES-I18N-01 · Locale default y formatos
- **MUST**: default `es-MX`; detectar `accept-language` para `es-MX`, `es-CO`, `es-AR`, `pt-BR` cuando aplique.
- **MUST**: fechas y números usan helpers compartidos (`Intl.*`), no strings manuales en componentes.
- **Screen**: Landing pricing, onboarding billing, dashboard, reportes, admin.
- **Source**: Apple HIG / Writing + Localization; decisión Itera LATAM.
- **Consequence**: producto se siente importado/no local; reportes confunden fechas y montos.

### HIG-RULES-I18N-02 · USD siempre explícito
- **MUST**: pricing y billing muestran USD explícito. Ejemplo OK: `$4,000 USD`; ejemplo NO: `$4,000` sin moneda.
- **MUST**: helpers de moneda aceptan locale, pero currency fija `USD` hasta que Pablo decida multi-moneda.
- **Screen**: Landing, billing, receipts, reportes comerciales.
- **Source**: decisión Itera + claridad financiera B2B.
- **Consequence**: confusión fiscal/comercial en LATAM.

### HIG-RULES-I18N-03 · Legal por jurisdicción
- **MUST**: textos de privacidad/consentimiento contemplan MX (LFPDPPP + ARCO), CO (Ley 1581 + habeas data), BR (LGPD) y `other`.
- **SHOULD**: usar región declarada por buyer antes que IP si existe.
- **Screen**: signup, onboarding, field-test, privacy.
- **Source**: decisión Itera compliance LATAM.
- **Consequence**: riesgo legal y fricción enterprise.

---

## 16. Performance Budgets (PERF)

### HIG-RULES-PERF-01 · Budgets por surface
- **MUST**: LCP <2.5s, FCP <1.8s, CLS <0.1, TTI <3.5s en hardware normal.
- **MUST**: Lighthouse performance >=90 en rutas públicas y >=85 en rutas auth/admin con datos reales.
- **Screen**: TODAS; crítico Landing, Field-test, Runtime.
- **Source**: Core Web Vitals + Apple HIG responsiveness.
- **Consequence**: experiencia premium se rompe antes del contenido.

### HIG-RULES-PERF-02 · Payload y animación
- **MUST**: nuevas dependencias visuales requieren justificación; preferir HeroUI, Motion y componentes locales ya instalados.
- **SHOULD**: lazy-load surfaces pesadas y evitar animaciones permanentes en dashboards.
- **Screen**: Landing, Runtime, Dashboard, Report.
- **Source**: Apple HIG / Responsiveness; decisión Itera.
- **Consequence**: bundle crece, mobile se siente lento.

---

## 17. Responsive Breakpoints (RESP)

### HIG-RULES-RESP-01 · Breakpoints obligatorios
- **MUST**: cada surface crítica se verifica en 375, 768, 1024, 1280 y 1440 px.
- **MUST**: texto no se corta ni se encima; botones largos hacen wrap o cambian copy.
- **Screen**: TODAS.
- **Source**: Apple HIG / Adaptivity and Layout.
- **Consequence**: el producto falla en demo mobile/tablet.

### HIG-RULES-RESP-02 · Touch vs cursor
- **MUST**: mobile usa targets >=44px, inputs full-width y nav tipo drawer/sheet.
- **SHOULD**: desktop puede usar sidebars persistentes, hover states y tablas densas.
- **Screen**: PublicShell, OnboardingShell, EmployeeShell, ManagerShell, RuntimeShell, AdminShell.
- **Source**: Apple HIG / Inputs + Adaptivity.
- **Consequence**: UI se siente de escritorio pegada a mobile.

### HIG-RULES-RESP-03 · Menú público vs sidebar auth
- **MUST**: navbar global solo en shells públicos/auth; shells autenticados usan navegación contextual por rol.
- **MUST**: admin/manager/employee no comparten una navbar pública.
- **Screen**: PublicShell, AuthShell, ManagerShell, EmployeeShell, AdminShell.
- **Source**: decisión Itera + Apple HIG Navigation.
- **Consequence**: vuelve la confusión de producto anterior.

---

## 18. Cómo usar este doc en el día a día Itera

1. **Antes de implementar una surface nueva**: leer las secciones aplicables (Layout, Typography, Color, Motion mínimo)
2. **En cada commit que toca UI**: citar reglas aplicadas en el body — ej: `[HIG-RULES-BTN-01, BTN-02, MOTION-06]`
3. **En code review**: si encuentras violación, citar la regla específica + link a sección en `APPLE_HIG_REFERENCE.md` para matiz
4. **Cuando hay conflicto entre guías**: aplicar el orden de autoridad (Apple HIG → accesibilidad → contrato → Pablo → inspiración → gusto)
5. **Cuando no hay regla clara**: leer `APPLE_HIG_REFERENCE.md` para el contexto Apple original; si sigue ambiguo, escalar a Pablo
6. **Cuando hay decisión nueva no cubierta**: agregar al final de este doc bajo "Decisiones Itera (living section)" con fecha + razón + screen afectada
7. **Cuando Apple actualiza HIG**: re-scrape via scripts en `Apéndice B` del reference doc → identificar diffs → actualizar reglas si afectan
8. **Build verify**: cada commit pasa `bun run build` PASS antes de push
9. **Visual review**: cada surface tier 1 pasa screenshot diff vs baseline antes de merge
10. **Audit periódico**: claude o codex audita 1 surface por semana contra estas reglas + reporte de violations en `INBOX_CODEX.md`/`INBOX_CLAUDE.md`

---

## 19. Decisiones Itera (living section)

> Agregar aquí decisiones nuevas que extienden o matizan las reglas anteriores. Formato:
>
> ```
> ### DEC-{NN} · Título
> - Fecha: YYYY-MM-DD
> - Quién decidió: Pablo / claude / codex
> - Razón:
> - Pantalla:
> - Regla relacionada: HIG-RULES-XX-NN
> - Override: (si aplica, indicar qué regla se modifica/excepción)
> ```

### DEC-001 · Tabler React como iconografía canónica del cleanroom
- Fecha: 2026-05-20
- Quién decidió: codex, validado por claude
- Razón: el cleanroom ya usa `@tabler/icons-react`, permite stroke 1.5px consistente y mantiene el lenguaje de iconos sobrio que pide Apple HIG. Cambiar a Lucide ahora agregaría churn visual sin mejorar accesibilidad.
- Pantalla: todas las surfaces del simulador
- Regla relacionada: `HIG-RULES-ICON-01`, `HIG-RULES-ICON-02`, `HIG-RULES-WRITE-01`
- Override: donde el doc anterior decía "Lucide React canónica", queda reemplazado por "Tabler React canónica en el cleanroom". Si una futura surface necesita otra familia, debe abrir nueva `DEC-*` antes de implementarla.

### DEC-004 · Buttons usan `radius="sm"` (8px), NO pill
- Fecha: 2026-05-20
- Quién decidió: Pablo (CPO) + claude implementó
- Razón: investigación research-backed. Apple HIG distingue iOS native (pill) de web/macOS (rounded moderate 8-12px). Las referencias inspiracionales de Itera son web B2B SaaS (Linear, Vercel, Anthropic Console, Stripe Dashboard, Notion, Figma, GitHub) — TODAS usan rounded-md 6-8px, NUNCA pill. Pills se reservan para chips/badges/dots/avatares/progress bars. Buttons pill desalinean con la familia de containers radius-md/lg y rompen el ritmo visual del cleanroom.
- Pantalla: TODAS las surfaces con AppleButton
- Regla relacionada: `HIG-RULES-MAT-03` (border radius scale)
- Aplicación: refactor 28 usages de `radius="full"` → `radius="sm"` en Landing/Auth/Onboarding/Dashboard/Report. Exclusiones: `AppleProgress` (sí mantiene `radius="full"` — progress bars son pill correcto), `AppleBadge` pill cuando aplica, dots/avatares circulares.
- Override: donde un button específico requiera pill por razón documentada, abrir DEC nueva. Default es `radius="sm"`.
- Verificación: `grep -rn 'radius="full"' app/ components/simulador/LandingPage.tsx` → 0 matches después del refactor.

---

## Resumen ejecutivo

**90+ reglas accionables** organizadas en 17 categorías:

| Categoría | Reglas | Crítico para |
|---|---|---|
| Accessibility (A11Y) | 7 | TODAS las surfaces |
| Typography (TYPO) | 6 | TODAS |
| Color (COLOR) | 4 | TODAS |
| Dark Mode (DARK) | 3 | TODAS (modo oscuro) |
| Layout (LAYOUT) | 5 | TODAS |
| Materials (MAT) | 4 | navegación, modals, cards |
| Motion (MOTION) | 6 | TODAS las animaciones |
| Writing (WRITE) | 6 | copy + microcopy |
| Buttons (BTN) | 7 | TODAS las acciones |
| Forms (FORM) | 6 | Auth, Onboarding, Runtime |
| Feedback (FB) | 3 | toasts, modals, alerts |
| Loading (LOAD) | 3 | skeleton, spinners, progress |
| Onboarding (ONB) | 3 | wizard, field-test, first run |
| Quick rules específicos | 18 | TF, SIDE, TAB, SHEET, PROG, ICON |
| i18n LATAM (I18N) | 3 | pricing, legal, fechas |
| Performance (PERF) | 2 | rutas públicas, runtime |
| Responsive (RESP) | 3 | mobile, tablet, desktop |

**Total**: 90+ reglas (se agregaron i18n, performance y responsive como gates ejecutables).

— claude + codex · 2026-05-20 · APPLE_HIG_RULES_FOR_ITERA.md v1.1
