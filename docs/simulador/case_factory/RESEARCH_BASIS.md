# Research basis — Case Factory v1

## Fuentes usadas

- Harvard Business School Christensen Center — case method como manejo de incertidumbre y aprendizaje centrado en participantes.
- Harvard Kennedy School Case Program — casos empiezan con una meta de aprendizaje generalizable, dan informacion suficiente para entrar al problema y requieren rigor/document research.
- MIT Sloan Action Learning — aplicar marcos a retos reales, estructurar problemas, colaborar, liderar en ambiguedad y reflexionar.
- Harvard Bok Center — los casos deben confrontar problemas reales con stakeholders y prioridades en conflicto; el riesgo es saltar a una solucion sin diagnosticar la decision real.
- NIST AI RMF — gestionar riesgos de IA para individuos, organizaciones y sociedad; incorporar confianza en diseno, uso y evaluacion.
- OECD AI Principles 2024 — robustez, seguridad, trazabilidad y accountability durante el ciclo de vida.
- DigComp 3.0 — competencia digital combina conocimiento, habilidades y actitudes; incluye datos, evaluacion critica, colaboracion, creacion, seguridad y resolucion de problemas.
- Stanford AI Index 2026 — la adopcion organizacional de IA llego a 88%.
- McKinsey State of AI 2025 — 88% reporta uso regular de IA en al menos una funcion; agentes ya se experimentan o escalan, pero escalar sigue siendo dificil.
- WEF Future of Jobs 2025 — AI/big data, pensamiento analitico, creatividad, resiliencia y alfabetizacion tecnologica crecen como skills criticas.
- PwC AI Jobs Barometer 2025 — puestos con skills de IA muestran prima salarial promedio de 56%, arriba de 25% el ano anterior.
- Carnegie Mellon Eberly Center — retrieval practice mejora con feedback; la practica temprana y frecuente ayuda a consolidar aprendizaje.
- Claude CLI adversarial review 2026-05-20 — objeciones: 70% vigente crea deuda de mantenimiento, la rubrica requiere pesos por nivel, los tags no sustituyen outcomes manager, cada caso necesita `judge_prompt`, `output_spec`, `failure_modes`, `decay_signal` y calibracion humana inicial.

## Decisiones de producto

```yaml
decisions:
  - id: CFACT-001
    decision: "Crear Case Factory antes de escribir 50 casos."
    change_type: process
    owner: codex
  - id: CFACT-002
    decision: "Usar tres niveles: N1 fundamentos/prompt, N2 workflow/automatizacion, N3 agentes/produccion."
    change_type: taxonomy
    owner: codex
  - id: CFACT-003
    decision: "Mantener 30% evergreen y 70% current, pero con `freshness_type`, `decay_signal`, `last_verified_at` y `refresh_due_at`."
    change_type: schema
    owner: codex
  - id: CFACT-004
    decision: "Migrar de 5 criterios a 6 criterios para cubrir ejecucion e impacto: contexto, datos, ejecucion_ia, validacion, juicio, impacto."
    change_type: rubric
    owner: codex
  - id: CFACT-005
    decision: "Cada caso debe mapear a resultados manager, no solo a tags."
    change_type: report
    owner: codex
  - id: CFACT-006
    decision: "La pagina `/case-lab` es laboratorio no-indexado, no una surface publica de marketing."
    change_type: runtime
    owner: codex
```

## Implicacion para Itera

El caso Itera no es una leccion ni un quiz. Es una situacion de trabajo donde
la persona debe decidir con informacion incompleta, presion real, herramientas
actuales y consecuencias observables. El manager compra evidencia de aplicacion,
no consumo de contenido.

