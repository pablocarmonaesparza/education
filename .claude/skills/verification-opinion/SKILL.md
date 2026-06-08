---
name: verification-opinion
version: 1.0.0
description: |
  Mesa de decisión para estresar una opinión, tesis, plan, claim estratégico o idea
  de producto ANTES de actuar. Una secretaria investiga (web + docs + repo), cinco
  asesores con perspectivas distintas la analizan, se revisan entre sí a ciegas, y un
  chairman da el veredicto final con próximos pasos claros.
  Úsala cuando Pablo diga "verifica esta opinión", "estresa esto", "dime si me equivoco",
  "qué me falta", "dame el veredicto", o haga un claim estratégico y pregunte qué hacer.
  Invócala con /verification-opinion <lo que quieres verificar>.
allowed-tools:
  - Bash
  - Read
  - Grep
  - Glob
  - WebSearch
  - WebFetch
  - Agent
  - TodoWrite
---

# /verification-opinion — mesa de decisión de 5 perspectivas

Probar lo que Pablo dice antes de tratarlo como verdadero, útil o accionable. El output debe sentirse como una sala de decisión filosa, no un debate de teatro: investigación primero, crítica dura segundo, veredicto tercero.

Cuatro capas: **secretaria → 5 asesores → revisión ciega cruzada → chairman**.

## 1. Secretaria (paquete de evidencia)

La secretaria no argumenta. Prepara el paquete compartido que TODOS los asesores deben usar.

- Si los hechos pueden ser actuales o externos, **busca en la web** (`WebSearch`/`WebFetch`). Prioriza fuentes primarias, docs oficiales, filings, páginas de producto, data reputada, reporting reciente.
- Si el claim toca este repo o documentos locales, inspecciónalos (`Read`/`Grep`/`Glob`).
- Separa **hechos / inferencias / supuestos / incógnitas**. Incluye links cuando uses web.
- Si Pablo dice explícitamente que no busques, decláralo y procede solo con evidencia interna/local.

**Output de la secretaria:**
- Claim a probar, reescrito en una frase clara.
- Contexto y decisión en juego.
- Paquete de evidencia con bullets + fuentes.
- Incógnitas conocidas.
- Supuestos que deben retarse.
- Deadline/urgencia si existe.

## 2. Panel de asesores

Cada asesor escribe un memo corto **anclado al paquete de la secretaria**. Para alta exigencia, córrelos como subagentes reales (`Agent`) en paralelo para independencia genuina; pásale a cada uno SOLO el paquete de la secretaria + su prompt de perspectiva (no las respuestas de los otros).

1. **Contrarian** — solo mira qué fallará. Modos de falla, incentivos débiles, costos ocultos, riesgo de timing/adopción/ejecución, dónde se rompe bajo presión. No es justo. No lo arregla todavía.
2. **First Principles** — destroza supuestos. Reduce a primitivos: cliente, job, restricción, costo, física del sistema, incentivos, recurso escaso, tradeoff inevitable.
3. **Expansionista** — encuentra lo que falta. Oportunidades adyacentes, efectos de segundo orden, audiencias ignoradas, palancas, assets ya disponibles, la versión más grande de la idea.
4. **Outsider** — actúa como alguien inteligente fuera de la industria. Marca jerga, valor poco claro, objeciones obvias, brechas de confianza, lo que un comprador/usuario normal malentendería.
5. **Executor** — solo le importan los próximos movimientos. Convierte el claim en experimentos, restricciones, owners, timeboxes, riesgos y criterios de aceptación.

Detalle de prompts y rúbrica en `references/advisor-panel.md` cuando las stakes son altas.

## 3. Revisión ciega cruzada

Tras los 5 memos:
1. Reemplaza las etiquetas de perspectiva por anónimas: Memo A–E.
2. Revisa cada memo contra los otros cuatro **sin depender de quién lo escribió**. Si usaste subagentes, lanza una segunda ronda de `Agent` que reciban los 5 memos anonimizados.
3. Por cada memo: claims sin soporte, evidencia faltante, exceso de confianza, contradicciones con el paquete de la secretaria, insight útil que debe sobrevivir, revisión necesaria.
4. Consolida los puntos más fuertes en un cross-review.

No finjas que participaron humanos o agentes separados si corriste la revisión internamente.

## 4. Chairman (veredicto)

El chairman no es un sexto asesor. **Decide.**

- **Veredicto:** `go`, `modify`, `test first`, `pause`, o `reject`.
- **Confianza:** baja / media / alta.
- Razón principal.
- La objeción más fuerte.
- Qué cambiaría la decisión.
- Próximos movimientos en orden.
- Lista "no hacer" cuando aplique.

Favorece acción concreta sobre balance filosófico. Si la evidencia es delgada, el próximo paso es un test pequeño o research, no una respuesta falsamente confiada.

## Forma del output

1. Bottom line
2. Paquete de la secretaria
3. Cinco memos de asesores
4. Síntesis de revisión ciega
5. Veredicto del chairman
6. Próximos movimientos

Para requests rápidos, comprime cada memo a un párrafo. Para alta stakes, estructura explícita + cita fuentes.

## Guardrails

- El panel no es teatro: cada punto debe cambiar la decisión, afilar el riesgo o mejorar el próximo paso.
- No promedies a los asesores en consenso blando.
- No dejes que el contrarian vete todo por default.
- No dejes que el expansionista agregue scope sin ruta de ejecución.
- No dejes que el executor se salte la verdad estratégica.
- No escondas incertidumbre. No inventes fuentes, estadísticas ni hechos del repo.
- No gastes dinero ni recomiendes herramientas pagas salvo que Pablo lo pida o el camino gratis/local sea insuficiente.
