# Itera Design Source Map

Usa este mapa para cargar solo el material de diseño que la tarea de UI necesita.

## Autoridad

- `docs/simulador/front/APPLE_HIG_RULES_FOR_ITERA.md`: autoridad de diseño top. Define categorías HIG, accesibilidad, jerarquía, tokens, motion, feedback, navegación, forms, loading y requisitos de review.
- `docs/simulador/front/HIG_SURFACE_REVIEW_FORM.md`: formulario de review requerido. Usa P00–P15 como checklist final antes de aprobar.
- `docs/simulador/front/PRODUCT_VISION_ONE_PAGER.md`: feeling de producto. Itera debe sentirse premium, serio, preciso, B2B y enfocado.
- `docs/simulador/front/FRONT_CONTRACT.md`: contrato activo de rutas y roles. No expongas rutas extra sin actualizar este contrato.
- `docs/memory/metodologia_design_system_fuente_unica.md`: método de design system de fuente única. Promueve UI reusable a `components/simulador/apple/*` y muéstrala en `/design/components`.
- `docs/memory/metodologia_verificar_opiniones_diseno_con_hig.md`: cómo aterrizar y medir las opiniones de diseño de Pablo contra el HIG antes de aplicarlas.

## Fuentes vivas

- `/design`: editor de tokens y fuente visual de verdad para tipografía, superficies, color, radios, sombras, motion y bands.
- `/design/components`: catálogo central de componentes. Todo componente reusable nuevo debe aparecer aquí.

## Fuentes de código

- `components/simulador/apple/index.ts`: inventario de componentes exportados.
- `components/simulador/apple/*`: UI central reusable.
- `app/design/page.tsx`: implementación de la página `/design`.
- `app/design/components/page.tsx`: implementación del catálogo `/design/components`.
- `lib/simulador/design-tokens.ts`: definiciones de tokens usadas por `/design`.
- `app/(app)/simulador.css`: variables de diseño del runtime del simulador.
- `components/simulador/DesignOverridesInjector.tsx`: aplica overrides de tokens locales desde `/design`.

## Preferencias de producto conocidas

- Usa componentes del design system existentes primero.
- Mantén la UI reusable centralizada para que ediciones futuras de diseño propaguen.
- Prefiere contención premium, jerarquía clara, whitespace y flujos enfocados.
- Evita dashboards SaaS genéricos, metáforas LMS/curso, gradientes decorativos, copy hype y filtración de rúbrica interna.
- Si una regla de form-label choca con el patrón central actual, preserva el comportamiento del componente central localmente y marca el conflicto en vez de inventar un input one-off.
