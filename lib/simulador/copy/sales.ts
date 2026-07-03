/**
 * Copy versionado de materiales de venta (sales decks, propuestas, outreach).
 *
 * Consolida decisiones del board:
 *   - B9-002-D1: mapeo Itera ↔ Kirkpatrick L1-L4 explícito en decks
 *   - B9-001-D7: 3 frases canónicas de diferenciación vs competidores
 *   - B9-003-D1: anchor en 88% / 95% / 50% research-grade
 *   - B9-003-D6: 6% high performers como wedge "proceso, no prompts"
 *
 * Uso: imports desde decks comerciales (Marp/Slidev/Reveal o el que use sales),
 * desde plantillas de propuestas (lib/proposals/), y desde scripts de
 * outreach (lib/outreach/templates/).
 */

export const salesCopy = {
  // ============================================================================
  // PITCH CORE (3 versiones del posicionamiento — del contrato producto)
  // ============================================================================
  positioning: {
    short:
      "Itera mide si tu equipo puede usar IA con criterio en situaciones reales antes de hacerlo con clientes, datos sensibles o campañas activas.",
    manager:
      "En 20 minutos por persona, Itera simula un caso real de trabajo, detecta gaps de criterio y entrega evidencia para decidir quién puede pilotar IA, quién necesita entrenamiento, qué flujos deben pausarse y cuándo escalar.",
    strategic:
      "No medimos conocimiento de IA. Medimos criterio operativo: qué datos usa, qué le pide al modelo, qué valida, qué riesgo detecta y qué decisión toma bajo presión.",
  },

  // ============================================================================
  // KIRKPATRICK MAPPING (B9-002-D1)
  // ============================================================================
  kirkpatrick: {
    headline: "Qué mide Itera vs qué mide tu organización",
    intro:
      "El framework Kirkpatrick (1959, refinado 2016) sigue siendo el estándar B2B de evaluación de programas de aprendizaje. Itera cubre los niveles L1-L3 directamente. L4 (impacto P&L) lo mide tu organización con métricas existentes — Itera no promete ROI directo, entrega la evidencia para que tu manager tome decisiones operativas.",
    levels: [
      {
        level: "L1",
        name: "Reacción",
        what_itera: "Survey post-sesión (NPS + 1 abierta + relevance score) capturado en analytics_events_catalog.",
        when: "Inmediato post-submit.",
        kpi_visible: "Engagement + perceived relevance scores.",
      },
      {
        level: "L2",
        name: "Aprendizaje",
        what_itera:
          "Bandas A/M/B por dimensión (contexto, datos, ejecución con IA, validación, juicio, impacto). Override matrix determinístico. Risk events extractivos con cita textual.",
        when: "Post-evaluación judge LLM (~15-30s post-submit).",
        kpi_visible: "Readiness por dimensión + risk events + recomendación.",
      },
      {
        level: "L3",
        name: "Comportamiento",
        what_itera:
          "Transfer delta entre baseline y resim variant del mismo caso (mismo arquetipo, dataset/personajes/datos diferentes). Mide si el participante aplica criterio en contexto nuevo, no si memorizó.",
        when: "30-90 días post-sprint (re-sim agendado).",
        kpi_visible: "Delta de banda por dimensión entre primary y resim.",
      },
      {
        level: "L4",
        name: "Resultados",
        what_itera:
          "NO mide directo en v1. Tu organización captura el cambio en KPIs propios (campañas con menos rework, menos incidentes de PII, mejor velocidad de approval chain, etc.). Itera te da la evidencia de criterio; tú correlacionas con tus métricas.",
        when: "3-6 meses post-sprint, con tu equipo de analytics.",
        kpi_visible: "Cualitativo manager + métricas propias del cliente.",
      },
    ],
    why_no_l4:
      "Vendemos diagnóstico, no ROI duro. MIT NANDA 2025 reporta que el 95% de pilotos enterprise NO muestran impacto medible en P&L — el problema es integración/workflow, no modelos. Itera reduce esa incertidumbre antes de invertir en transformación.",
  },

  // ============================================================================
  // DIFERENCIACIÓN (B9-001-D7)
  // ============================================================================
  differentiation: {
    headline: "Cómo nos comparamos",
    intro:
      "Tres anchors mentales para cuando un prospect mencione un competidor. Usa la frase que aplique al stakeholder.",
    frames: [
      {
        vs: "Wharton Interactive",
        anchor:
          "Lo que Wharton Interactive fue para business school clásica, Itera lo es para la era IA — simulaciones serias en español, hechas para entrenar criterio en situaciones reales de trabajo.",
        context:
          "Wharton cerró marketplace 30-abr-2025. Sólo 3 sims migraron a Harvard Business Publishing (OPEQ, Startup Game, Customer Centricity); A/B testing sim aún en transición. La categoría está vacante 12+ meses.",
      },
      {
        vs: "Section AI",
        anchor:
          "Section AI te da cursos + coaching + dashboard. Itera te da simulaciones + evaluador AI + evidencia de criterio. Ambos miden readiness; nosotros la entrenamos donde los empleados realmente se equivocan.",
        context:
          "Section AI: $62.50/mes individuos premium ($750/seat teams). English only. Sweet spot enterprise US/UK >100 ppl. Su política excluye SMB <100 explícitamente.",
      },
      {
        vs: "Forage",
        anchor:
          "Forage usa simulaciones para descubrir talento que aún no contrataste; Itera usa simulaciones para entrenar y medir el criterio del talento que ya tienes.",
        context:
          "Forage: 10M+ engagements (adquirida por EAB abril 2024). Modelo employer-funded para early talent / career discovery. Diferente etapa del funnel — no compite con post-hire upskilling.",
      },
      {
        vs: "Attensi / Mursion / Whatfix Mirror",
        anchor:
          "Attensi entrena scripts de servicio frontline. Mursion practica conversaciones interpersonales. Whatfix Mirror entrena adopción de herramientas legacy. Itera mide criterio en uso de IA específicamente — categoría discreta sin incumbente.",
        context:
          "Los tres son enterprise B2B sin LATAM/Spanish. AI roleplay como feature táctica, no como tesis principal. Vigilancia trimestral porque internacionalizarse a español es la amenaza más realista a 18-24 meses (B9-001-D4).",
      },
    ],
  },

  // ============================================================================
  // ANCHOR STATS PARA PROPUESTAS (B9-003-D1 + B9-003-D6)
  // ============================================================================
  research_anchors: {
    headline: "Por qué este diagnóstico ahora",
    intro:
      "Cifras research-grade que justifican la categoría. Cita siempre la fuente — no invented stats.",
    anchors: [
      {
        figure: "88%",
        body: "De organizaciones adopta IA en al menos una función de negocio.",
        source: "Stanford AI Index · 2026",
        implication: "Tu equipo también usa IA. La pregunta no es si — es con qué criterio.",
      },
      {
        figure: "95%",
        body: "De pilotos enterprise no muestran impacto medible en P&L.",
        source: "MIT NANDA GenAI Divide · 2025",
        implication: "El problema es integración/workflow, no modelos. Diagnostica antes de invertir en transformación.",
      },
      {
        figure: "50%",
        body: "De empleados ya usa IA en su trabajo; 28% varias veces por semana.",
        source: "Gallup AI Indicator · 2026",
        implication: "La adopción individual ya pasó. Lo que falta es visibilidad y control organizacional.",
      },
      {
        figure: "48%",
        body: "De empleados pide entrenamiento formal de IA.",
        source: "McKinsey Superagency · 2025",
        implication: "Hay demanda interna; el entrenamiento actual no la cierra.",
      },
      {
        figure: "45%",
        body: "Pide integración de IA en sus workflows reales.",
        source: "McKinsey Superagency · 2025",
        implication: "Skill aislado no resuelve; criterio operativo en flujo sí.",
      },
      {
        figure: "36%",
        body: "Está satisfecho con el entrenamiento de IA que recibió.",
        source: "BCG AI at Work · 2025",
        implication: "Los programas existentes son percibidos como insuficientes.",
      },
      {
        figure: "6%",
        body: "De empresas son high performers de IA. La diferencia no es conocimiento técnico — es proceso de validación humana y rediseño de workflows.",
        source: "McKinsey State of AI · 2025",
        implication:
          "Itera mide exactamente lo que diferencia al 6%: criterio operativo en proceso, no prompts memorizados. Si tu equipo no tiene el proceso, no llega al 6%.",
      },
      // ----------------------------------------------------------------
      // LATAM proof points (M9-3-D12) — usar cuando el comprador es LATAM
      // y necesita anclaje local antes de aceptar el frame global.
      // ----------------------------------------------------------------
      {
        figure: "72%",
        body: "De organizaciones en México adoptaron IA en algún proceso de negocio.",
        source: "KPMG México Pulso CFO · 2024",
        implication:
          "El frame global de Stanford 88% se replica en LATAM con misma dirección. MX está cerca del baseline US; CO 65%; BR 74%.",
      },
      {
        figure: "44%",
        body: "De empleados LATAM (MX/CO/BR avg) usa IA al menos una vez por semana.",
        source: "Capterra LATAM · 2024",
        implication:
          "Adopción individual ya está en LATAM, 6 puntos abajo del 50% Gallup US. El gap se cierra rápido — y sin medición de criterio, el riesgo operativo escala con el uso.",
      },
    ],
  },

  // ============================================================================
  // STATS PLAYBOOK — cuál de los 9 anchors usar según el comprador (M9-3-D12)
  // Tabla de routing para sales: contexto del comprador → 1-3 anchors óptimos.
  // ============================================================================
  stats_playbook: {
    headline: "Playbook de anchors según comprador",
    intro:
      "Los 9 anchors arriba no se citan todos en cada discovery. Elige 1-3 que aterricen con el contexto del comprador. Regla: empieza con global (autoridad), aterriza con local (relevancia), cierra con wedge (diferenciación).",
    routes: [
      {
        buyer: "CFO MX o CFO LATAM (decisión basada en evidencia local)",
        recommended_anchors: ["72% (KPMG MX)", "95% (MIT NANDA)", "6% (McKinsey high performers)"],
        opening_line:
          "KPMG México reporta que 72% de organizaciones MX ya adoptó IA. Pero MIT NANDA dice 95% sin impacto en P&L — el problema no es el modelo, es el criterio operativo. Solo 6% son high performers — la diferencia es proceso, no prompts.",
      },
      {
        buyer: "CMO / VP Growth LATAM (acción y resultados de campaña)",
        recommended_anchors: ["44% (Capterra LATAM)", "88% (Stanford)", "45% (McKinsey workflow demand)"],
        opening_line:
          "Stanford 88% adopción y Capterra confirma 44% empleados LATAM ya usan IA semanalmente. McKinsey: 45% de empleados pide integración en workflows reales. Tu equipo ya lo usa; lo que falta es visibilidad de cómo deciden.",
      },
      {
        buyer: "Head of Operations / COO (riesgo + cumplimiento)",
        recommended_anchors: ["50% (Gallup)", "36% (BCG satisfaction)", "95% (MIT NANDA)"],
        opening_line:
          "Gallup: 50% de empleados ya usa IA en el trabajo. BCG: solo 36% está satisfecho con el training de IA. MIT NANDA: 95% de pilotos sin impacto. El riesgo operativo crece sin lectura de criterio — y sin lectura, no hay defensa cuando algo sale mal.",
      },
      {
        buyer: "Head of People / L&D (training programs internos existentes)",
        recommended_anchors: ["36% (BCG satisfaction)", "48% (McKinsey demand)", "6% (McKinsey high performers)"],
        opening_line:
          "BCG: solo 36% satisfecho con el training de IA recibido. McKinsey: 48% pide entrenamiento formal — la demanda interna existe pero no se cierra. El gap entre training y resultados es lo que Itera mide. Tu programa de L&D necesita evidencia, no más cursos.",
      },
      {
        buyer: "VP Engineering / CTO (skepticism de medición LLM)",
        recommended_anchors: ["6% (McKinsey high performers)", "95% (MIT NANDA)"],
        opening_line:
          "McKinsey: 6% de empresas son high performers de IA. La diferencia no es conocimiento técnico — es proceso de validación humana + rediseño de workflows. MIT NANDA confirma: 95% de pilotos enterprise sin impacto. La medición correcta es de criterio operativo, no de skill técnico.",
      },
      {
        buyer: "Buyer global (HQ en US, equipos LATAM)",
        recommended_anchors: ["88% (Stanford)", "95% (MIT NANDA)", "72% (KPMG MX)"],
        opening_line:
          "Los anchors globales (Stanford 88%, MIT NANDA 95%) aplican a tu HQ. Y KPMG México confirma 72% en LATAM — tu equipo LATAM está en la misma curva. Itera mide en español neutro con calibration local sin renunciar al rigor de los anchors anglos.",
      },
    ],
    do_not_use: [
      "No mezcles >3 anchors en una sola conversación — saturas el frame.",
      "No cites figuras sin source (invented stats rompen credibilidad — los 9 son verificables).",
      "No uses anchors anglo solos con comprador LATAM joven — agrega el LATAM como aterrizaje.",
      "No uses LATAM solos con comprador global o IPO-ready — usa anglo como anchor de autoridad.",
    ],
  },

  // ============================================================================
  // OBJECTION HANDLING — preparado para discovery calls
  // ============================================================================
  objections: {
    "Ya damos training de IA internamente": {
      response:
        "Perfecto — Itera no es training. Es la evidencia de si tu training funciona. Sin diagnóstico, no sabes si tu equipo aplica el criterio que les enseñaste o si solo memorizó. El BCG 2025 reporta que solo 36% de empleados está satisfecho con el training de IA que recibió.",
    },
    "Esto es lo mismo que un assessment de skills": {
      response:
        "No. Assessments miden conocimiento estático (¿sabes qué es un prompt?). Itera mide criterio operativo dinámico bajo presión: dataset con PII + deadline + autoridad pidiendo velocidad. La diferencia entre Workera y Itera es la misma que entre un examen de manejo escrito y uno práctico.",
    },
    "¿Por qué $4,000-8,000? Es caro para v1": {
      response:
        "Cohorte de 5-50 personas, 30 días, reporte ejecutivo por persona + dashboard manager. Section AI cobra $750/seat/año en teams chicos — 50 personas ahí serían $37,500. Itera Fase 1 para 50 personas está en $8,000 — 4.6x más eficiente, en español, con simulación real (no cursos). Precio premium accesible, no premium oneroso.",
    },
    "Necesito el ROI claro antes de pagar": {
      response:
        "Razonable. Pero MIT NANDA 2025: 95% de pilotos enterprise NO muestran impacto medible en P&L. Si esperás ROI claro pre-piloto, esperás indefinidamente. Itera reduce la incertidumbre operativa ANTES de la inversión grande — es el paso entre 'estoy considerando IA' y 'voy a invertir $200K en transformación digital con IA'.",
    },
    "¿Y si mis empleados dan respuestas falsas para verse bien?": {
      response:
        "El judge LLM extrae evidencia textual del transcript completo (todas las decisiones step-by-step), no solo respuestas finales. Risk events son extractivos con cita literal. Si alguien intenta 'ganar el examen', el transcript lo expone. Plus override matrix determinístico + human review queue para risk high asegura defensibilidad.",
    },
    "¿Disponible en inglés?": {
      response:
        "v1 es español neutro LATAM (MX/CO/AR/CL). Inglés está en roadmap v2. Nuestro wedge intencional es LATAM donde Workera/Section/Attensi/Mursion no operan en español.",
    },
  },

  // ============================================================================
  // CIERRE — qué pasa después del diagnóstico
  // ============================================================================
  next_steps: {
    headline: "Qué pasa después del diagnóstico",
    items: [
      "El manager recibe reporte ejecutivo por persona (PDF + dashboard web) con bandas + risk events + recomendación accionable.",
      "Cada empleado con banda B/M recibe practice beats remediativos por dimensión específica (2-3 min cada uno, post-evaluación).",
      "30-90 días después: re-sim variant del mismo caso (arquetipo igual, dataset distinto) mide transfer delta — Kirkpatrick L3 Comportamiento.",
      "Manager decide: pilotar (autonomía) / entrenar (Fase 2) / pausar (no IA en flujos sensibles) / escalar (problema de proceso, convoca legal/IT).",
      "Itera entrega evidencia auditable; la decisión y la inversión grande las toma tu organización con tus métricas.",
    ],
  },
} as const;

export type SalesCopy = typeof salesCopy;
