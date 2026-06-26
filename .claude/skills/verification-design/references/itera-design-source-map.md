# Itera Design Source Map

Usa este mapa para cargar solo el material de diseño que la tarea de UI necesita.

## Invariantes vivos del sistema (estado actual — verifícalos, no los rompas)

- **Cero hardcode.** El repo está en **0 `text-[Npx]`**. Toda tipografía usa clases `ts-*` (que mapean a `--text-*`). Color/radio/sombra/motion = `var(--…)`. Spacing macro = `var(--space-section)`/`--space-section-sm`/`--reading-max`; micro = escala Tailwind. (Régimen post-migración 2026-06-26. Gate + tabla de snapping en `component-measurement-gates.md`.)
- **`prop-[var(--token)]` es el patrón correcto** (1500+ usos). El hardcode es el valor crudo dentro del corchete (`#hex`, `Npx`, `var(--x,#hex)`), no la sintaxis `[]`.
- **Un cambio en la fuente propaga a todo:** editas un token en `/design` (el `DesignOverridesInjector` lo aplica a `.simulador-root` en vivo; permanente con "Copy CSS" → `simulador.css`); editas un componente en `apple/*` y se refleja en `/design/components` + en todo consumidor. Por eso una página nueva debe CONSUMIR la fuente, nunca duplicarla.

## Autoridad

- `docs/simulador/front/APPLE_HIG_RULES_FOR_ITERA.md`: autoridad de diseño top. Categorías HIG, accesibilidad, jerarquía, tokens, motion, feedback, navegación, forms, loading, review. Decisiones vivas (overrides) en §19 «Decisiones Itera» como `DEC-*` — léelas siempre (DEC-005 radius universal, DEC-008 bandas, DEC-009 accent-strong).
- `docs/simulador/front/HIG_SURFACE_REVIEW_FORM.md`: formulario de review (P00–P15) — checklist final antes de aprobar.
- `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md`: feeling — premium, serio, preciso, B2B, enfocado.
- `docs/simulador/front/FRONT_CONTRACT.md`: contrato activo de rutas y roles. No expongas rutas sin actualizarlo.
- `docs/simulador/front/SHELL_SPEC.md`: estructura/jerarquía/copy por surface (secciones, orden, microcopy, CTAs). Cárgalo al construir una página. Lo estético se subordina al HIG.
- `docs/simulador/front/copy/`: copy real por surface (voz, microcopy, estados). Las reglas de voz viven en el HIG (WRITE-*).
- `docs/memory/metodologia_design_system_fuente_unica.md`: método de fuente única (promover a `apple/*` + mostrar en `/design/components`).
- `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`: cómo aterrizar y medir las opiniones de Pablo contra el HIG antes de aplicarlas.

## Fuentes vivas (rutas en la app)

- `/design`: editor de tokens y fuente visual de verdad (tipografía `ts-*`, surfaces, color, radios, sombras, motion, bands, **spacing**). Edita aquí → propaga a todo.
- `/design/components`: catálogo/espejo central. Renderiza TODOS los exports de `apple/index.ts`. Todo componente reusable nuevo DEBE aparecer aquí (registrado con un `<Section>` que muestre sus variantes/estados).

## Fuentes de código

- `components/simulador/apple/index.ts`: **inventario** de componentes exportados (~42 y creciendo — léelo entero antes de construir; no recites la lista de memoria). Incluye los ricos: `AppleKpiCard`, `AppleDataTable`, `AppleEmptyState`, `AppleErrorState`, `AppleTimeline`, `AppleMessageCard`, `AppleAttachmentCard`, `AppleActionChip`, `AppleCaseHeader`, `AppleStepBar/StepDots`, `AppleSortableList`, `AppleBadge`, `AppleSidebar`, `AppleSkeleton`, etc.
- `components/simulador/apple/*`: UI central reusable. **`AppleButton` tiene `size="sm|md|lg|inline"`** — `inline` es el link/acción de texto sin chrome (hereda font-size); úsalo en vez de un `<a>`/`<button>` estilizado a mano.
- `app/design/page.tsx`: implementación de `/design` (editor de tokens). `kind: "space"` para spacing.
- `app/design/components/page.tsx`: implementación del catálogo. Patrón `<Section>`/`<Spec>` + demos controlados.
- `lib/simulador/design-tokens.ts`: catálogo de tokens editables (6 familias: color, tipografía, radius, shadow, motion, **spacing**). Refleja 1:1 a `simulador.css`.
- `app/(app)/simulador.css`: variables de diseño + clases `ts-*` (con responsive `sm:/md:/lg:`) + helpers (`.section-pad`, `.reading-col`, `.card-apple`, `.eyebrow`).
- `components/simulador/DesignOverridesInjector.tsx`: aplica overrides de tokens desde `/design`.

## Preferencias de producto conocidas

- Usa componentes del design system existentes PRIMERO; si falta uno reusable, promuévelo (no lo dejes local).
- Mantén la UI reusable centralizada para que ediciones futuras propaguen.
- Prefiere contención premium, jerarquía clara, whitespace y flujos enfocados.
- Evita dashboards SaaS genéricos, metáforas LMS/curso, gradientes decorativos, copy hype y filtración de rúbrica interna.
- Controles bespoke legítimos (toggle icon-only, `<select>` nativo donde HeroUI estorba, card-como-radio) son válidos solo si NO reimplementan el chrome de un primitivo (radius/tipografía/estados salen de tokens). Si una regla de form-label choca con el patrón central, preserva el componente central y marca el conflicto en vez de inventar un input one-off.
