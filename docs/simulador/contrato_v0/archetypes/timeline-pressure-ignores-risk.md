---
type: archetype
slug: timeline-pressure-ignores-risk
version: 1.0.0-draft
tension: Presión de deadline vs evidencia técnica
inspiration_structural: Challenger O-ring escalation (1986)
date: 2026-05-19
authors: [claude]
---

# Arquetipo: timeline-pressure-ignores-risk

## Tensión arquetípica
Presión de deadline vs evidencia técnica

## Inspiración estructural (NO IP, solo estructura narrativa)
Challenger O-ring escalation (1986)

## Adaptación a contexto IA
Equipo detecta risk en IA pipeline pre-launch. Manager presiona por shipping. ¿Cómo se documenta el riesgo y se escala sin paralizar?

## Decision point típico
- Tres caminos legítimos con trade-offs reales (no jerarquía obvia)
- Withheld resolution: el caso no revela cuál es "correcto" — el judge mide criterio del decisor
- Stakeholders en conflicto: operador (participante), autoridad (manager/VP), pares, legal/compliance externo

## Dimensiones evaluables
- contexto: ¿el participante encuadra situación, audiencia, restricciones?
- privacidad: ¿protege datos sensibles en cada paso?
- validación: ¿verifica outputs antes de actuar?
- juicio: ¿lee riesgo, autoridad, escalamiento necesario?
- decisión: ¿comunica acción clara + justificación + próximos pasos al manager?

## Niveles aplicables
Ver INDEX.md columna N1/N2/N3 para este arquetipo. Algunos arquetipos solo tienen sentido en cierto nivel; no se fuerza N1+N2+N3 si la tensión solo emerge en operación con agentes.

## Carreras donde resuena más
Ver INDEX.md sección "Mapeo a carreras".

## Risk events comunes en este arquetipo
- accepted_unverified_claim (si el participante toma output de IA sin validar)
- ignored_escalation_path (si el participante NO escala cuando debería)
- exposed_pii_to_model (si la tensión incluye datos sensibles)
- over_relied_on_output (si confía en IA sin context check)
- prompt_injection_unawareness (si interactúa con sistema agentic sin verificar input source)

## Plantilla narrativa para escribir un caso desde este arquetipo

1. **Setting (≤200 chars)**: el participante en su rol específico, hora del día, presión de calendario.
2. **Brief de autoridad (≤250 chars)**: una persona con autoridad explícita pide algo bajo restricciones.
3. **Información disponible**: dataset/artefacto + contexto + restricciones informales de gobernanza.
4. **Tres rutas posibles** (no jerarquía explícita):
   - Ruta A: la "fácil" que ignora la tensión.
   - Ruta B: la "responsable" que escala/valida.
   - Ruta C: la "intermedia" con trade-off explícito.
5. **Decision point**: ¿qué hace? ¿cómo lo comunica?
6. **Respuesta de autoridad post-decisión**: feedback que prueba si el criterio se sostiene bajo presión adicional.

## Versionado

timeline-pressure-ignores-risk@1.0.0-draft. Patch cuando refinas copy. Minor cuando agregas dimensiones evaluables. Major cuando cambia la tensión central.
