---
type: decision
title: indicador de pasos = AppleStepBar segmentada, no texto "Paso N de 5"
date: 2026-06-06
tags: [diseno, componentes, onboarding, consistencia]
dept: [producto]
---

El indicador de progreso por pasos del sistema es la barra segmentada `AppleStepBar` (segmentos finos de 3px: acento=actual, gris=completado, claro=pendiente), la misma que usa la página de ejercicio (exercise-lab). NUNCA el texto tipo eyebrow "Paso N de 5". El componente vive en `components/simulador/apple/AppleStepBar.tsx` y es fuente única: el onboarding lo usa estático y el runtime de ejercicios lo usa navegable (`onSelect`).

**Por qué:** Pablo pidió quitar los eyebrows de texto "Paso N de 5" y usar un indicador consistente con la página de ejercicio que él construyó. Ya lo había pedido y no se había hecho en todos lados: "Ya te había pedido que me quitara estas pestañas de todos lados; no estoy en contra del indicador de páginas, pero me gustaría una consistencia con la página de ejercicio que ya construí usando sus elementos". No está en contra del indicador — está en contra de la inconsistencia (texto vs barra).

**Cuándo aplicar:** al construir o migrar cualquier pantalla con progreso por pasos (onboarding, flujos multi-paso, runtime). Usar `AppleStepBar`, no texto. Regla general derivada: si una pieza de UI compartida se repite en dos lugares, extraerla a un componente del sistema (single source) y registrarla en `/design/components`; no duplicar markup.

### Actualización 2026-06-06

El tratamiento canónico de la barra es el del **runtime de casos** (case-demo / case-template), NO el del exercise-lab: segmentos `h-[3px] flex-1 rounded-full`, el actual en acento con `animate-pulse`, completados en `text-secondary`, pendientes en `surface-3`. Pablo lo señaló mostrando el runtime ("como vas a poner la barra así, si en los casos se ve así") — había 5 implementaciones divergentes (exercise-lab, case-demo, case-template, RuntimeExperience v1, RuntimeExperienceV2). Se unificó `AppleStepBar` a ese visual y ahora es fuente única real: case-demo, case-template, exercise-lab y el onboarding (org/team/invite/billing + done) leen del mismo componente. El ancho no se fija en el componente: el caller pasa `w-full` (bloque) o `flex-1` (dentro de una fila flex, como el chrome del caso). Decisión abierta de Pablo: si el onboarding adopta además el chrome completo del caso (botones cuadrados X / ‹ / › / "Mandar sugerencia" que flanquean la barra) o se queda solo con la barra + su nav de logo.
