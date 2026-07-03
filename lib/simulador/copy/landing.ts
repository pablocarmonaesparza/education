/**
 * Copy versionado de la landing pública (/).
 *
 * Consolida 5 decisiones producto del board:
 *   - B9-001-D1: heredera narrativa de Wharton Interactive
 *   - B9-001-D7: 3 frases de diferenciación vs Wharton/Section/Forage
 *   - B9-003-D1: pitch anclado en 88% adopción / 95% sin impacto P&L / 50% empleados usan IA
 *   - B9-003-D6: cifra 6% high performers (McKinsey) como wedge "proceso, no prompts"
 *   - B3-002-D3: Sprint v1 = Nivel 1+2 pitch honesto (Nivel 3 como add-on)
 *
 * Voz: español neutro LATAM corporate. Lowercase en titulares y bodies
 * salvo nombres propios y comienzo de frase. Cero AI slop, cero jerga
 * corporate-startup. Datos con fuente citada.
 *
 * Imports desde app/(public)/page.tsx via `import { landingCopy } from
 * "@/lib/simulador/copy/landing";`.
 */

export const landingCopy = {
  // ============================================================================
  // NAV / SURFACE GENERAL
  // ============================================================================
  nav: {
    eyebrow_brand: "El Simulador · Itera",
    cta_secondary: "Probar 1 caso de muestra",
    cta_primary: "Agendar diagnóstico para mi equipo",
  },

  // ============================================================================
  // HERO — anclar en research-grade, no en promesas
  // ============================================================================
  hero: {
    eyebrow: "Para Head/VP de Marketing, Growth y Operations · LATAM",
    headline_lines: ["¿tu equipo usa IA", "con criterio?"],
    accent_word: "criterio",
    subheadline:
      "Mide y mejora cómo tu equipo decide cuando usa IA en flujos reales. Diagnóstico operativo de 30 días. Reporte ejecutivo por persona.",
    industry_tag: "SaaS B2B mid-market · servicios profesionales · ecommerce · LATAM",
    cta_primary_label: "Agendar diagnóstico para mi equipo",
    cta_secondary_label: "Probar 1 caso de muestra →",
  },

  // ============================================================================
  // STATS — research-grade only (B9-003-D1)
  // ============================================================================
  stats: {
    eyebrow: "Por qué importa medir",
    items: [
      {
        figure: "88%",
        body: "De organizaciones usa IA en al menos una función de negocio.",
        source: "Stanford AI Index · 2026",
      },
      {
        figure: "95%",
        body: "De pilotos enterprise no muestran impacto medible en P&L. No falla el modelo — falla el criterio.",
        source: "MIT NANDA GenAI Divide · 2025",
      },
      {
        figure: "50%",
        body: "De empleados ya usa IA en su trabajo. Tu equipo también, sepas o no con qué criterio.",
        source: "Gallup AI Indicator · 2026",
      },
    ],
    // ------------------------------------------------------------------
    // LATAM evidence sub-sección (cierra M9-3-D11)
    // Datos locales que confirman la dirección de los 3 anchors US arriba.
    // Tratamiento visual más pequeño que el hero — ver app/(public)/page.tsx.
    // ------------------------------------------------------------------
    latam_evidence: {
      eyebrow: "Y en LATAM",
      body:
        "Los anchors anglo se replican en datos locales. La dirección es la misma: adopción alta sin lectura defendible del criterio operativo.",
      items: [
        {
          figure: "72%",
          body: "Organizaciones en México adoptaron IA en algún proceso de negocio.",
          source: "KPMG México · Pulso CFO 2024",
        },
        {
          figure: "44%",
          body: "Empleados LATAM usan IA al menos una vez por semana.",
          source: "Capterra LATAM · 2024 (promedio MX/CO/BR)",
        },
      ],
    },
  },

  // ============================================================================
  // CATEGORÍA / HEREDERA WHARTON (B9-001-D1)
  // ============================================================================
  category: {
    eyebrow: "Categoría",
    headline: "Diagnóstico operativo de criterio en uso de IA.",
    body:
      "Lo que Wharton Interactive fue para business school clásica, Itera lo es para la era IA. Simulaciones serias en español, hechas para entrenar criterio en situaciones reales de trabajo. No medimos prompts bonitos. Medimos qué hace tu equipo cuando importa.",
    citation:
      "Wharton Interactive cerró su marketplace el 30 de abril de 2025. El espacio de simulación seria para criterio empresarial sigue vacante en LATAM.",
  },

  // ============================================================================
  // CÓMO FUNCIONA — 4 pasos del loop (B9-002-D3 distinción runtime/practice)
  // ============================================================================
  how_it_works: {
    eyebrow: "Cómo funciona",
    headline: "Caso vivo → evaluación → evidencia → decisión.",
    steps: [
      {
        ordinal: "01",
        title: "Caso vivo · 18-22 min por persona",
        body: "Cada persona del equipo enfrenta un escenario real: dataset con feedback de clientes, deadline de campaña, presión de autoridad. Trabaja con un modelo bajo restricciones informales de gobernanza.",
      },
      {
        ordinal: "02",
        title: "Evaluación · 6 dimensiones",
        body: "Contexto, datos, ejecución con IA, validación, juicio e impacto. Bandas Alto/Medio/Bajo por dimensión. Sin score público — la banda es la unidad narrativa.",
      },
      {
        ordinal: "03",
        title: "Evidencia · risk events extractivos",
        body: "Cada decisión queda con cita textual: qué dato usó, qué pidió al modelo, qué validó, qué riesgo detectó. Defendible ante CHRO/CEO.",
      },
      {
        ordinal: "04",
        title: "Decisión · pilotar / entrenar / pausar / escalar",
        body: "El manager recibe recomendación accionable + próximos 7 días por persona. No es informe — es siguiente paso.",
      },
    ],
    footnote:
      "El runtime mide criterio sin enseñar respuestas. Las prácticas correctivas vienen DESPUÉS del diagnóstico, no durante.",
  },

  // ============================================================================
  // DIMENSIONES (6)
  // ============================================================================
  dimensions: {
    eyebrow: "Qué medimos",
    headline: "Criterio operativo, no conocimiento.",
    subheadline:
      "No medimos qué tan bien sabes prompting. Medimos qué hace tu equipo cuando importa.",
    items: [
      {
        id: "contexto",
        label: "Contexto",
        body: "Encuadre de situación, audiencia, tono y restricciones.",
      },
      {
        id: "datos",
        label: "Datos",
        body: "Información suficiente, minimizada, con permisos y calidad.",
      },
      {
        id: "ejecucion_ia",
        label: "Ejecución con IA",
        body: "Prompt, workflow o agente configurado según el nivel del trabajo.",
      },
      {
        id: "validacion",
        label: "Validación",
        body: "Verificación del output antes de usarlo.",
      },
      {
        id: "juicio",
        label: "Juicio",
        body: "Lectura de riesgo, autoridad y consecuencias.",
      },
      {
        id: "impacto",
        label: "Impacto",
        body: "Traducción del trabajo con IA a acción, ahorro o resultado visible.",
      },
    ],
    footnote: "NIST AI 600-1 · Harvard Case Method · ISO/IEC 42001",
  },

  // ============================================================================
  // WEDGE — el 6% que tiene el proceso (B9-003-D6)
  // ============================================================================
  wedge_high_performers: {
    eyebrow: "Lo que diferencia al 6%",
    headline: "El criterio no es prompts. Es proceso.",
    body:
      "McKinsey identifica que solo el 6% de empresas son high performers de IA. La diferencia no está en conocimiento técnico — está en sus procesos de validación humana y rediseño de workflows. Itera mide exactamente eso: cómo decide tu equipo, no qué memoriza.",
    source: "McKinsey State of AI · 2025",
  },

  // ============================================================================
  // CASOS DEL SPRINT — 8 con tensión real
  // ============================================================================
  cases: {
    eyebrow: "Contenido del sprint",
    headline: "8 casos. 8 tensiones reales.",
    subheadline:
      "Cada caso es un escenario que pasa hoy en cualquier equipo de marketing/growth/ops. Deadline + dataset con PII + presión de autoridad. Capturamos la decisión.",
    items: [
      { order: 1, title: "Campaña urgente con feedback de clientes", tension: "Velocidad vs privacidad" },
      { order: 2, title: "Redacción de copy con voz de marca", tension: "Velocidad vs voz de marca" },
      { order: 3, title: "Segmentación con datos sensibles del CRM", tension: "Bias predictivo + privacidad behavioral" },
      { order: 4, title: "Brief a agencia externa con IA", tension: "Leak de estrategia a vendor" },
      { order: 5, title: "Research competitivo + ad creative", tension: "Plagio inadvertido" },
      { order: 6, title: "Attribution reporting al CMO", tension: "Datos parcialmente alucinados" },
      { order: 7, title: "Calendario de contenido 30 días", tension: "Velocidad vs curaduría" },
      { order: 8, title: "Respuesta a crisis pública con IA", tension: "Velocidad vs approval chain" },
    ],
  },

  // ============================================================================
  // OUTCOMES PARA EL MANAGER
  // ============================================================================
  manager_outcomes: {
    eyebrow: "Resultado para el manager",
    headline: "Cuatro caminos por persona.",
    subheadline: "Por persona y por equipo. Salida ejecutiva, no dashboard ornamental.",
    items: [
      {
        id: "pilotar",
        label: "Pilotar",
        body: "El equipo puede operar con IA en flujos productivos con supervisión semanal.",
      },
      {
        id: "entrenar",
        label: "Entrenar",
        body: "Criterio en formación. Un segundo sprint consolida la mejora.",
      },
      {
        id: "pausar",
        label: "Pausar",
        body: "No autónomo aún. Bloquear uso de IA en flujos sensibles hasta nuevo sprint.",
      },
      {
        id: "escalar",
        label: "Escalar",
        body: "Problema de proceso, no individual. Convoca a legal/compliance antes de habilitar.",
      },
    ],
  },

  // ============================================================================
  // CÓMO NOS COMPARAMOS (B9-001-D7)
  // ============================================================================
  how_we_compare: {
    eyebrow: "Cómo nos comparamos",
    headline: "Tres formas distintas de medir IA en empresa.",
    comparisons: [
      {
        vs: "Wharton Interactive",
        frame:
          "Lo que Wharton Interactive fue para business school clásica, Itera lo es para la era IA — simulaciones serias en español, hechas para entrenar criterio en situaciones reales de trabajo.",
      },
      {
        vs: "Section AI",
        frame:
          "Section AI te da cursos + coaching + dashboard. Itera te da simulaciones + evaluador AI + evidencia de criterio. Ambos miden readiness; nosotros la entrenamos donde los empleados realmente se equivocan.",
      },
      {
        vs: "Forage",
        frame:
          "Forage usa simulaciones para descubrir talento que aún no contrataste; Itera usa simulaciones para entrenar y medir el criterio del talento que ya tienes.",
      },
    ],
    footnote:
      "Cuadrante AI-native simulation × criterio IA medible × LATAM español — vacante en mid-market.",
  },

  // ============================================================================
  // PRICING — Sprint Nivel 1+2 honesto (B3-002-D3)
  // ============================================================================
  pricing: {
    eyebrow: "Precio",
    headline_prefix: "Desde",
    headline_amount: "$4,000",
    headline_suffix: "por sprint.",
    subheadline:
      "Fase 1 — diagnóstico operativo: $4,000-$8,000 para cohortes de 5-50 personas. USD vía Stripe. Fase 2 — práctica + re-diagnóstico: $8,000-$15,000.",
    level_disclosure:
      "Sprint v1 cubre Nivel 1 (IA como copiloto) + Nivel 2 (IA en workflow). Para equipos que ya usan IA agentic, el módulo Nivel 3 (variantes advanced) se agrega como add-on. Pricing transparente; nada de sorpresas en factura.",
    fine_print: "Cotización por equipo. No hay self-serve checkout.",
    cta_primary_label: "Agendar diagnóstico →",
    cta_secondary_label: "Probar 1 caso",
  },

  // ============================================================================
  // FOOTER
  // ============================================================================
  footer: {
    line1: "© 2026 Itera · El Simulador",
    line2_descriptor: "Diagnóstico operativo",
    geos: ["MX", "CO", "AR", "CL"],
    links: [
      { label: "Términos", href: "/terms" },
      { label: "Privacidad", href: "/privacy" },
    ],
    sources_disclaimer:
      "Datos vía Stanford AI Index 2026, McKinsey State of AI 2025, MIT NANDA GenAI Divide 2025, Gallup AI Indicator 2026, BCG AI at Work 2025.",
  },
} as const;

export type LandingCopy = typeof landingCopy;
