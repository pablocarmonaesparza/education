/**
 * Copy versionado del field-test público.
 *
 * El field-test es la versión sin auth del runtime: cualquier visitante de
 * la landing puede hacer 1 caso de muestra (marketing_urgent_campaign_pii)
 * y recibe un mini-reporte preliminar. Cierra el CTA secundario del hero
 * ("Probar 1 caso de muestra"). Captura lead post-reporte para que ventas
 * dé seguimiento.
 *
 * Surface en producción:
 *   - /field-test/[case_slug]/page.tsx                (entry)
 *   - components/simulador/RuntimeExperience mode="field_test"
 *   - components/simulador/RuntimeExperience FieldTestReportInline
 *   - /admin/leads (codex cerró en B6-001 — staff opera leads_inbox)
 *   - funnel events (codex cerró en B6-002 — 30d funnel live)
 *
 * Decisiones producto consolidadas:
 *   - B6-001 (done): field-test público live + admin/leads + lead_captured
 *     event en supabase. Status quo: 1 caso disponible.
 *   - B6-002 (done): funnel 30d con eventos {viewed, started, completed,
 *     report_shown, lead_captured} live en /admin/funnel.
 *   - B9-001-D1 (done): heredera narrativa Wharton — field-test usa
 *     framing "muestra de la evidencia que Itera genera", NO certificación
 *     ni benchmark.
 *   - B5-001-D3 (done): pending_review honesto. El field-test no pasa por
 *     review humano (no risk events high pegan en muestra pública), pero
 *     el banner de mini-reporte debe ser explícito en que es "preliminar".
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "preliminar" / "muestra" — NO "certificación", "benchmark"
 *   - "reporte ejecutivo" — solo cuando referenciamos el full report,
 *     NO para el mini del field-test (es "lectura preliminar")
 *   - "criterio observado" — NO "skill", "competencia"
 *   - "evidencia" — NO "results"
 *   - "decidir/decisión" — NO "feedback"
 *   - "caso de muestra" — NO "demo case", "trial"
 *
 * Voz: español neutro LATAM corporate. Lowercase. Cero AI slop. Datos con
 * fuente citada cuando aplique.
 *
 * Importa desde components/simulador/RuntimeExperience.tsx y
 * app/field-test/[slug]/page.tsx via
 * `import { fieldTestCopy } from "@/lib/simulador/copy/field-test";`.
 */

export const fieldTestCopy = {
  // ============================================================================
  // Entry / pre-roll del caso
  // ============================================================================
  entry: {
    eyebrow: "Caso de muestra · sin login",
    headline: "Prueba 1 caso del Simulador.",
    body:
      "Es la misma mecánica que opera con equipos pagos. Aquí lo haces tú sin login. Al terminar recibes una lectura preliminar de tu criterio.",
    duration_note: "~18-22 minutos. Puedes pausar y retomar mientras esté abierta esta pestaña.",
    privacy_note:
      "No guardamos tu PII. Solo lo que respondes en el caso. Si decides dejar tus datos al final, es opt-in explícito.",
    expectations_eyebrow: "Qué esperar",
    expectations: [
      "Te llega un brief de un manager con presión real.",
      "Decides qué datos mandar al modelo, qué pedirle, qué validar y qué entregar.",
      "Al final ves una lectura por dimensión de tu criterio operativo.",
    ],
    differentiator_note:
      "Esto NO es un quiz ni un benchmark. Es decisión bajo presión sobre un caso aplicado.",
    start_cta: "Empezar caso de muestra",
    back_to_landing_cta: "← Volver",
  },

  // ============================================================================
  // Anti-fraud + abandon detection (banners inline durante el runtime)
  // ============================================================================
  anti_fraud: {
    multiple_tabs_warning:
      "Detectamos esta sesión abierta en otra pestaña. Cierra las pestañas extra para que tu sesión quede limpia.",
    paste_detected_warning:
      "Detectamos un pegado largo. El field-test mide tu criterio — copiar-pegar respuestas de IA externa rompe la medición.",
    inactivity_warning:
      "Llevas varios minutos sin actividad. Si cierras la pestaña, perdemos tu progreso. Continúa o salimos.",
    inactivity_continue_cta: "Seguir aquí",
    inactivity_exit_cta: "Salir y descartar",
  },

  // ============================================================================
  // Mini-reporte preliminar (FieldTestReportInline)
  // ============================================================================
  report: {
    eyebrow: "Reporte preliminar",
    headline: "Tu lectura del caso.",
    body:
      "Esto no es un benchmark ni una certificación. Es una muestra de la evidencia que Itera genera para decidir si un equipo puede usar IA en flujos reales.",
    confidence_disclaimer:
      "La lectura es preliminar — sin re-simulación ni práctica recurrente, no es defendible para una decisión de promoción/permiso. Sirve para entender la calidad de la medición.",
    dimensions_section: {
      headline: "Bandas por criterio observado",
      band_label_template: (band: "A" | "M" | "B") =>
        band === "A" ? "Banda alta" : band === "M" ? "Banda media" : "Banda baja",
    },
    recommendation_section: {
      headline: "Recomendación",
      next_actions_eyebrow: "Próximos pasos sugeridos",
      action_labels: {
        pilotar: "Pilotar",
        entrenar: "Entrenar",
        pausar: "Pausar",
        escalar: "Escalar",
      },
    },
    risk_events_section: {
      headline: "Eventos de riesgo observados",
      empty_label: "No se detectaron eventos materiales en esta corrida.",
      severity_labels: {
        low: "Severidad baja",
        medium: "Severidad media",
        high: "Severidad alta",
      },
      evidence_eyebrow: "Evidencia textual",
    },
    runtime_vs_practice_note:
      "Este caso mide criterio en un caso vivo. La práctica recurrente (gym de IA) viene en Fase 2 del producto pago.",
    fairness_note:
      "Si tu lectura no refleja tu criterio real, escríbenos a soporte@itera.la y revisamos la sesión. El reporte de equipos pagos pasa por hybrid review (LLM + revisión humana) — el field-test no.",
  },

  // ============================================================================
  // Lead capture form (post-reporte)
  // ============================================================================
  lead_capture: {
    eyebrow: "Llévatelo a tu equipo",
    headline: "¿Quieres verlo con tu equipo?",
    body:
      "Déjanos tus datos y te mandamos el reporte completo del caso de muestra con la forma de correrlo en un equipo real.",
    fields: {
      name_label: "Nombre",
      name_placeholder: "Tu nombre completo",
      name_required: true,
      email_label: "Email",
      email_placeholder: "tu@empresa.com",
      email_required: true,
      company_label: "Empresa",
      company_placeholder: "Nombre de tu organización",
      company_required: true,
      role_label: "Rol",
      role_placeholder: "Head of Marketing, VP Growth, etc.",
      role_required: false,
      team_size_label: "Tamaño del equipo",
      team_size_placeholder: "10, 50, 200…",
      team_size_required: false,
    },
    consent_inline:
      "Al enviar aceptas que Itera te contacte por email para dar seguimiento. Puedes pedir baja en cualquier momento.",
    submit_cta_idle: "Enviar reporte completo",
    submit_cta_submitting: "Enviando…",
    submit_cta_sent: "Recibido",
    submit_error: "No se pudo enviar. Intenta otra vez.",
    after_sent_headline: "Listo, te contactamos esta semana.",
    after_sent_body:
      "Si quieres acelerar, escríbenos a ventas@itera.la con tu agenda y armamos un demo del producto pago.",
    sales_contact_cta: "Escribir a ventas →",
    sales_email: "ventas@itera.la",
  },

  // ============================================================================
  // Loading + error states
  // ============================================================================
  states: {
    loading_session: "Preparando tu caso de muestra…",
    loading_judge: "Evaluando tu sesión…",
    loading_judge_sub:
      "La rúbrica revisa tus decisiones. Toma 15-30 segundos.",
    error_session_create:
      "No pudimos iniciar el caso. Recarga la página o reintenta en unos segundos.",
    error_judge_failed:
      "No pudimos evaluar la sesión. Intenta otra vez o avísanos a soporte@itera.la.",
    error_lead_save: "No pudimos guardar tus datos. Reintenta.",
    network_offline:
      "Sin conexión. Tus respuestas se guardan localmente y se sincronizan cuando vuelva.",
  },

  // ============================================================================
  // Empty / exit / abandonment states
  // ============================================================================
  abandonment: {
    exit_confirm_title: "¿Salir del caso?",
    exit_confirm_body:
      "Si sales antes de completar, perderás el progreso. El field-test no se puede retomar después.",
    exit_confirm_yes: "Salir y descartar",
    exit_confirm_no: "Seguir aquí",
    already_completed_headline: "Este field-test ya fue completado en esta sesión.",
    already_completed_body:
      "Vuelve a la landing para conocer el producto pago o escríbenos directo si quieres un demo.",
    expired_headline: "Tu sesión expiró.",
    expired_body:
      "El field-test queda en memoria solo mientras la pestaña esté abierta. Empieza una nueva sesión cuando puedas dedicar 20 minutos.",
    expired_cta: "Empezar de nuevo",
  },

  // ============================================================================
  // Hand-off al producto pago (cross-link en el reporte)
  // ============================================================================
  paid_handoff: {
    eyebrow: "Producto pago",
    headline: "¿Cómo se ve con un equipo de verdad?",
    bullets: [
      "10-50 participantes hacen el mismo tipo de caso en su carrera.",
      "Manager recibe matriz agregada + recomendación por persona.",
      "Reporte ejecutivo con bandas + evidencia + acciones de próxima semana.",
      "Hybrid review humano cuando hay risk events altos.",
    ],
    pricing_anchor_template: (low_usd: number, high_usd: number) =>
      `Fase 1 diagnóstico: USD ${low_usd.toLocaleString("en-US")}–${high_usd.toLocaleString("en-US")} (5–50 asientos).`,
    cta_book_demo: "Agendar demo con tu equipo →",
    cta_pricing_details: "Ver precios y plan",
    cta_pricing_href: "/pricing",
  },

  // ============================================================================
  // Microcopy + footer del field-test
  // ============================================================================
  microcopy: {
    powered_by_label: "Itera Simulador",
    case_slug_disclaimer:
      "El caso vivo y la rúbrica son los mismos que usan equipos pagos. Solo cambia el modo de evaluación (preliminar vs hybrid review).",
    privacy_link_label: "Privacidad",
    privacy_link_href: "/privacy",
    terms_link_label: "Términos",
    terms_link_href: "/terms",
    contact_link_label: "Contacto",
    contact_link_href: "/contact",
    powered_disclaimer:
      "Itera no es asesor legal ni provee diagnóstico clínico ni psicométrico. El diagnóstico es operativo y aplica a uso de IA en flujos de trabajo.",
  },
} as const;

export type FieldTestCopy = typeof fieldTestCopy;
