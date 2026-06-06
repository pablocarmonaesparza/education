---
type: metodologia
title: el design system es el espejo de todo — promover, no duplicar
date: 2026-06-06
tags: [design-system, componentes, arquitectura, consistencia]
dept: [producto]
---

Flujo canónico para UI nueva: (1) se diseña/prototipa primero donde vive la feature (típicamente el exercise-lab o el runtime de casos); (2) se PROMUEVE al design system (`components/simulador/apple/` + se exhibe en `/design/components`) como componente único; (3) el lugar original PASA A APUNTAR al componente del design system (lo consume), no se queda con una copia. La regla en palabras de Pablo: "diseñas primero allá, en lugar de reemplazarlos hay que traerlos acá y entonces sí replicarlos allá".

**Por qué:** Pablo construyó decenas de recursos en el exercise-lab / case system (bloques de ejercicio, shells de slide, metric cards, message/email, timeline, chips, tablas, el chrome del player, la barra de progreso) y NINGUNO está en `/design/components`. Eso es lo que hace que "estos nuevos recursos que llevamos creando desde semanas tampoco se usen correctamente": al no estar centralizados, cada pantalla los reinventa y divergen (pasó con la barra de progreso — había 5 implementaciones distintas). El design system debe ser el espejo de TODO lo reutilizable, no solo de los primitivos Apple.

**Cuándo aplicar:** siempre. Antes de construir UI nueva, revisar si ya existe en `/design/components`. Si construyo o encuentro UI reutilizable en exercise-lab / case-demo / case-template / runtime que no esté en el design system, promoverla (extraer al design system + showcase) y hacer que el origen apunte ahí. Nunca dejar dos copias. El gallery `/design/components` es el índice canónico; todo apunta ahí.

### Actualización 2026-06-06 — primera tanda de promoción

Promovidos al design system y showcaseados en `/design/components`: `AppleStepBar` (barra segmentada de pasos) y `AppleSlideButton` (el CTA "Continuar →" estilo Typeform de los casos: acento, `px-7 py-3`, `ts-callout`, hint Enter opcional, disabled gris, loading con spinner, `href` opcional). Ambos son fuente única — los consumen case-demo, case-template, exercise-lab Y el onboarding (org/team/invite/context adoptaron el botón Typeform; org/team/invite/billing/done tienen la barra). Los 17 bloques de ejercicio quedaron catalogados en `/design/components` (cada card apunta al lab donde se renderean vivos). Regla de conflicto aplicada: el diseño de los casos GANA — el onboarding adoptó el botón de los casos, no al revés; nada del diseño de Pablo se perdió (verificado por review adversarial). Gate: componente-hig PASS (tap 45px, radius ratio 0.27, foco con offset 2px). Nota system-wide: el acento de marca `#1472ff` da 4.34:1 con texto blanco — marginal bajo AA 4.5 para texto normal; afecta TODOS los botones primarios, es decisión de marca de Pablo, no se tocó. Pendiente/opcional: extraer el chrome del player (X/‹/›/feedback, hoy 1 sola copia en case-demo — no es duplicado, baja urgencia) y la Fase 3 (reubicar `app/exercise-lab/blocks/*` → `components/simulador/`, que toca el grafo del runtime productivo = dominio de Codex).
