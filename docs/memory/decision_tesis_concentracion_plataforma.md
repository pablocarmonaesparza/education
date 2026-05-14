---
type: decision
title: tesis core itera — vendemos concentración + operación, no información
date: 2026-05-12
tags: [tesis, posicionamiento, producto, moat, stickiness, simulador, readiness, loop]
dept: [producto, orquestador]
---

La tesis central de Itera, articulada por Pablo el 2026-04-27 en sesión de producto:

> **"La gente NO nos paga por la información de AI — eso lo encuentra en cualquier lado. La gente nos paga por una plataforma donde puedan concentrarse para aprender AI."**

El contenido (lecciones, slides, ejercicios) es commodity. La diferenciación es el **lugar** + el **ritmo** + el **hábito** + (próximamente) la **fase operación**.

**Tres pilares del producto:**
1. **Concentración** — diseño anti-distracción, sesiones cortas, feedback inmediato. Hoy.
2. **Stickiness** — loops Hooked-style, racha, microcommits, hábito diario. En construcción (gamification P2 cerrado, faltan loops).
3. **Operación** — conectar cuenta de Claude/ChatGPT/etc. del usuario, hacer los ejercicios contra LLMs reales, construir output personalizado dentro de la plataforma. **Roadmap futuro, es el moat real.**

**Por qué:** Pablo explicó que la gente paga por una plataforma donde pueda concentrarse para aprender IA, y que Itera debe impulsar también la parte de operación, no solo estudio: conectar cuentas de ChatGPT/Anthropic, hacer ejercicios y empezar a construir dentro de la plataforma.

**Cuándo aplicar:**
- Toda decisión de producto se evalúa contra estos 3 pilares.
- Copy de landing/marketing nunca debe vender "información" de AI — debe vender "el lugar para aprender" y "el lugar para operar".
- Features que añaden contenido sin reforzar concentración/stickiness/operación son sospechosas.
- La fase operación es prioridad estratégica antes de que un competidor (especialmente Duolingo) entre a AI con ventaja.

### Actualización 2026-05-08 — de curso a simulador de criterio IA

Pablo y Codex revisaron el problema de fondo: Itera se estaba acercando demasiado a "curso de IA" y no lo suficiente a práctica empresarial con evidencia. La corrección estratégica NO es volverse una herramienta de automatización tipo n8n/Make/Zapier, ni competir con ChatGPT, Claude, Gemini, Codex, Veo o Nano Banana.

La hipótesis refinada:

> **Itera es un simulador empresarial para practicar criterio IA en situaciones reales de trabajo.**

Esto ajusta los tres pilares:

1. **Concentración** — el entorno seguro donde la persona practica sin ruido ni presión de producción.
2. **Stickiness** — repetición de escenarios realistas, no loops B2C de ansiedad.
3. **Operación** — no significa ejecutar workflows por la empresa; significa entrenar criterio para operar mejor con herramientas existentes.

La unidad de valor empieza a moverse de "lección" hacia "simulación". Una simulación puede incluir teoría, pero solo la necesaria para resolver una situación laboral: elegir herramienta, dar contexto, redactar instrucciones, evaluar respuesta, detectar riesgo, proteger datos y justificar una decisión.

La evidencia para empresas no debe prometer ROI duro inmediato ni automatizaciones en producción. Debe mostrar readiness: calidad de criterio, errores comunes, mejora en decisiones, privacidad, manejo de riesgo, capacidad de usar IA con supervisión razonable y gaps por persona/equipo.

**No competir contra:**
- Motores generativos: ChatGPT, Claude, Gemini, Codex, Veo, Nano Banana.
- Automatización: n8n, Zapier, Make, CRMs, chatbots o plataformas operativas.
- LMS genéricos cuyo valor principal es catálogo, video, rutas y certificados.

**Intersección buscada:**

```
herramientas IA -> situación laboral -> práctica guiada -> criterio -> evidencia para empresa
```

**Comparables para research antes de implementar:**
- Wharton Interactive: simulaciones de negocio para practicar criterio en entornos seguros.
- Forage: job simulations con tareas que replican trabajo real.
- Attensi / Mursion / Whatfix Mirror: simulación, roleplay, readiness y performance medible.
- Section AI / DataCamp / Coursera / Udemy Business: adopción y upskilling IA para empresas.
- Platzi Business / Crehana / Coderhouse: training corporativo LATAM y brecha local.

**Estado:** dirección estratégica para investigación, no instrucción de build. Antes de pivotear producto/copy/landing/onboarding, hacer benchmark de competencia y categoría.

### Actualización 2026-05-09 — pausar build y separar exploración de producto

Pablo pidió dar un paso atrás después de ver un primer prototipo visual en código (`/simulator-system`). Esa pantalla sirve solo como **ejemplo conversacional** para imaginar el simulador; no es especificación aprobada, no reemplaza onboarding/dashboard y no autoriza cambios de producto.

La memoria debe tratar esta conversación así:

1. **Problema vigente:** Itera necesita escapar del curso teórico y demostrar valor empresarial más tangible.
2. **Hipótesis vigente:** el puente más prometedor es "simulador de criterio IA" / "AI readiness medible", no una herramienta tipo n8n ni un LMS genérico.
3. **Estado vigente:** exploración estratégica. Todavía no hay PRD, IA flow definitivo, schema, métricas cerradas, pricing impact o plan de migración.
4. **Siguiente trabajo correcto:** entender el problema, categoría, comprador, evidencia esperada y competencia antes de mover producto real.

Regla operativa: cualquier prototipo visual creado en código durante esta fase se considera **artefacto desechable de conversación** hasta que Pablo diga explícitamente que se convierte en producto. Si una futura sesión encuentra `/simulator-system`, no debe asumir que es roadmap ni fuente de verdad.

### Actualización 2026-05-11 — perfil de producto v0: AI readiness simulator

Después de investigar mercado, competencia y técnicas de simulación, Pablo y Codex aterrizaron el producto de trabajo como:

> **Itera AI Readiness Simulator: una plataforma B2B donde equipos practican casos reales de trabajo con IA y la empresa recibe evidencia de qué tan listos están para usar IA con criterio, seguridad y valor.**

Esto todavía **no autoriza build de plataforma completa**, pero sí define la unidad de producto y el primer loop vendible.

**No es:** curso, LMS, biblioteca de prompts, automatizador tipo n8n, wrapper de ChatGPT/Claude/Gemini ni dashboard de completion.

**Cliente comprador probable:** RH/L&D, transformación digital, innovación, dirección general, operaciones.
**Usuario final:** equipos no técnicos en ventas, marketing, soporte, operaciones, finanzas, legal y liderazgo.
**Unidad principal:** un **caso vivo**: situación laboral realista donde el usuario decide qué datos usar, qué herramienta elegir, cómo pedir ayuda a la IA, cómo validar la respuesta, qué riesgos reportar y qué recomendación final dar.

**Producto vendible inicial:** **AI Readiness Sprint** — 30 días, 10 simulaciones, 1 dashboard, 1 reporte ejecutivo.

**Loop mínimo completo:**
1. onboarding post-signup captura rol, tipo de trabajo, nivel de uso, sensibilidad de datos y objetivo de negocio.
2. mini diagnóstico inicial mide criterio real, no solo autopercepción.
3. el usuario resuelve casos vivos por rol/departamento.
4. Itera genera readiness score por persona/equipo.
5. la empresa ve riesgos repetidos, brechas, progreso y recomendación de pilotos.
6. cada mes entran nuevos casos vivos basados en cambios reales de modelos, herramientas, regulación, benchmarks, fallos públicos y prácticas del mercado.

**Killer features priorizadas:**
- **casos vivos mensuales** — justifican suscripción porque la IA cambia constantemente.
- **AI readiness score** — mide criterio, datos, riesgo, validación, herramienta, decisión e impacto.
- **risk heatmap por departamento** — muestra dónde se usa IA peligrosamente.
- **decision replay** — permite ver cómo decidió el usuario paso a paso.
- **simulador por rol** — ventas, marketing, soporte, legal, finanzas, operaciones, liderazgo.
- **reporte ejecutivo automático** — "este equipo está listo para pilotear X, pero no Y".
- **recomendador de pilotos** — sugiere workflows aptos para piloto, supervisión o pausa.

**Scoring base:** selección de herramienta, manejo de datos sensibles, calidad de contexto, validación del output, riesgo operativo/legal, claridad de decisión final e impacto potencial.

**Onboarding derivado:** para empezar no debe ser formulario largo ni dashboard denso. Debe sentirse como setup guiado: una decisión por pantalla, opción múltiple, modo claro, mucho aire, mini diagnóstico inicial y dashboard como resultado, no como menú vacío. Los prototipos de `/onboarding-system` siguen siendo exploratorios y deben tratarse como **hoja en blanco visual**, no como diseño final ni uso obligatorio del design system.

**Regla para Claude Producto:** si una futura sesión trabaja producto, onboarding, dashboard, pricing o landing desde esta tesis, debe cargar esta memoria y partir del loop `caso vivo → decisión → score → evidencia → reporte`, no de "curso de IA" ni de automatización tipo workflow.

### Actualización 2026-05-12 — el producto es un loop, no un curso lineal

Pablo y Codex refinan la tesis: Itera debe salir del marco "curso → terminado". El producto central es un loop de entrenamiento profesional:

```
simulación → diagnóstico → práctica → re-simulación → evidencia → siguiente caso
```

La simulación es la puerta de entrada y la educación aparece solo como tratamiento cuando el diagnóstico detecta un gap. Esto evita que Itera se sienta como LMS o encuesta y lo acerca a entrenamiento serio: el usuario enfrenta un caso real, falla o demuestra criterio, recibe una práctica corta y vuelve a probar una variante.

**Implicación de producto:** si un equipo no está listo, Itera no lo "reprueba" ni lo manda a un curso completo. Lo clasifica por estado y activa el siguiente paso:

- **Listo:** avanza a casos más difíciles o recibe badge/certificación interna.
- **Casi listo:** recibe micro-prácticas específicas sobre el gap detectado.
- **No listo:** entra a una ruta corta de recuperación.
- **Riesgo alto:** se bloquean o posponen ciertos casos y se entrena primero seguridad, datos, validación y criterio.

**Por qué:** el mercado no necesita más información sobre IA; necesita saber si los equipos pueden usar IA en trabajo real sin equivocarse caro. El loop da evidencia antes/después, sostiene suscripción con casos vivos y convierte educación en remedio adaptativo, no en inventario de contenido.

**Cuándo aplicar:** toda conversación futura sobre onboarding, dashboard, simulador, rutas, lecciones, pricing o venta B2B debe partir de este loop. La pregunta guía es: *"¿esto mejora simulación, diagnóstico, práctica, re-simulación o evidencia?"* Si no mejora alguna parte del loop, probablemente es accesorio.
