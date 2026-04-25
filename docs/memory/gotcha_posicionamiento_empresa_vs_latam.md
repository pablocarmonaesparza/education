---
type: gotcha
title: posicionamiento real vs context_md (empresa vs latam universal)
date: 2026-04-22
tags: [posicionamiento, audiencia, b2b, context_md]
dept: [cmo, cpo]
---

`docs/CONTEXT.md` posiciona la audiencia como "LATAM no-técnico, 25-55 años, test: ¿lo entendería alguien de 55 años que jamás programó?". Pero Pablo aclaró el 22 abril 2026 que la pelea real actual es más "aprender AI para tu empresa/trabajo" — posicionamiento más profesional/B2B que universal. `CONTEXT.md` podría estar stale en este punto.

**Por qué:** literal de Pablo: *"el Hero me encanta, pero no creo que comunique lo de ahorita que es no tanto la ventaja del curso modular si el aprender para tu empresa"*. Pivote implícito del ICP sin actualizar `CONTEXT.md`. Pablo NO pidió actualizar `CONTEXT.md` en esa sesión.

**Cuándo aplicar:** al escribir copy de hero, catálogo, pricing o ads. Antes de generar personas o targeting para `/market-intel`. Al proponer rediseños de landing o onboarding. Cuando haya duda entre tono universal-casero vs tono profesional-empresa, **va profesional-empresa** hasta nuevo aviso. Si se toca pricing B2B (punto abierto #3 en `CONTEXT.md` sección 10 — "Tier B2B real"), esta memoria es contexto obligatorio. Si en una sesión futura Pablo actualiza `CONTEXT.md`, marcar esta memoria para revisión.

### Actualización 2026-04-22 — implicaciones para gamification

Pablo aclaró que **Itera es B2B** (no B2C) al revisar el plan de gamification del dashboard. Consecuencias concretas:

- **No sistema de hearts/vidas limitadas.** El flag `HAS_UNLIMITED_LIVES = true` en `ExperimentLesson.tsx` se queda así; lo que hay que quitar de la UI es la promesa visual (pill `∞ vidas` en `TutorChatButton`), no implementar vidas reales. Vidas limitadas es mecánica B2C de engagement adictivo.
- **No email reminders para no perder racha.** Un cronjob que mande email al empleado para que no pierda su racha es noise — la retención en B2B viene del contrato con la empresa, no de hooks virales al individuo.
- **No leaderboards globales ni competencia entre usuarios.** No aplica al empleado corporativo.
- **Sí funciona:** progreso visible (barra, XP total persistido, racha acumulada real, nivel), completion-oriented badges, celebraciones por milestone. Lo que ayuda a ver avance, no lo que genera ansiedad.

**Literal de Pablo:** *"unlimited hearst es más enfocado a b2c... no te me salgas por mail"*.
