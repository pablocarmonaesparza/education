/**
 * Copy versionado del reporte ejecutivo v2.
 *
 * Implementa la spec de docs/design/surfaces/executive_report.md (B5-001).
 * Consolida decisiones:
 *   - B5-001-D3: pending review banner honesto (cuando hay risk high)
 *   - B5-001-D5: audit metadata footer con rubric_version + frozen_at
 *   - B9-002-D3: distinción explícita "runtime mide, beats enseñan" en copy
 *
 * Imports desde app/(app)/report/[session_id]/page.tsx + futuro
 * lib/simulador/reports/generate-pdf.ts.
 */

export const reportCopy = {
  // ============================================================================
  // Sección 1 — Cabecera ejecutiva
  // ============================================================================
  header: {
    title_template: (case_title: string) =>
      `Diagnóstico operativo · ${case_title}`,
    meta_separator: " · ",
    duration_label: (min: number) => `${min} min`,
    recommendation_label: "Recomendación",
    recommendation_actions: {
      pilotar: "Pilotar",
      entrenar: "Entrenar",
      pausar: "Pausar",
      escalar: "Escalar",
    },
    justification_one_line: (
      strengths: "sólido" | "parcial" | "insuficiente",
      strong_dims: string[],
      critical_dims: string[],
    ) =>
      `Criterio ${strengths} en ${strong_dims.join(", ") || "—"}; gap material en ${critical_dims.join(", ") || "—"}.`,
  },

  // ============================================================================
  // Pending review banner (B5-001-D3 — honestidad operativa)
  // ============================================================================
  pending_review_banner: {
    title: "En revisión humana",
    body: "Este reporte tiene eventos de riesgo de severidad alta detectados por el judge LLM. Staff Itera está validando manualmente antes de publicarlo al manager. Se publica en ≤24 horas.",
    why_visible:
      "Mostramos esto en lugar de esconder el reporte porque el manager debe saber que está en revisión, no descubrirlo después.",
  },

  // ============================================================================
  // Sección 2 — Banda general + matriz
  // ============================================================================
  overall: {
    eyebrow: "Readiness general",
    score_suffix: "/100",
    matrix_label: "Readiness por nivel × dimensión",
    matrix_legend: {
      A: "Alto",
      M: "Medio",
      B: "Bajo",
    },
    matrix_n1_label: "N1 IA copiloto",
    matrix_n2_label: "N2 IA en workflow",
    matrix_n3_label: "N3 IA con agentes",
    matrix_empty_state: "Sin sesiones todavía en este nivel.",
  },

  // ============================================================================
  // Sección 3 — Dimensiones drill-down
  // ============================================================================
  dimensions: {
    eyebrow: "Las 5 dimensiones",
    practice_cta_template: (beat_title: string) =>
      `Práctica sugerida: ${beat_title}`,
    rationale_label: "Por qué esta banda",
  },

  // ============================================================================
  // Sección 4 — Risk events
  // ============================================================================
  risk_events: {
    eyebrow: "Eventos de riesgo",
    empty_state: "Sin eventos de riesgo en esta sesión.",
    severity_labels: {
      high: "Alta",
      medium: "Media",
      low: "Baja",
    },
    step_label: (ordinal: number) => `Paso ${ordinal}`,
    evidence_label: "Evidencia textual",
    jurisdiction_label: "Jurisdicción",
    transfer_basis_label: "Base legal documentada",
    transfer_basis_values: {
      true: "Sí",
      false: "No",
      null: "—",
    },
    type_humanized: {
      // Mapeo de slug interno a label humano (LATAM Spanish)
      exposed_pii_to_model:
        "Datos personales expuestos al modelo",
      hidden_pii_usage_from_authority:
        "Uso de PII no comunicado al manager",
      accepted_unverified_claim:
        "Aceptó afirmación sin verificar",
      accepted_hallucinated_figures:
        "Aceptó cifras alucinadas del modelo",
      used_sensitive_commercial_data:
        "Usó datos comerciales sensibles",
      shared_third_party_confidential:
        "Compartió info confidencial de terceros",
      used_unapproved_vendor:
        "Usó proveedor de IA no aprobado",
      prompt_injection_unawareness:
        "Ignoró riesgo de prompt injection",
      over_relied_on_output:
        "Confianza excesiva en output sin validar",
      overblocked_without_discrimination:
        "Bloqueó todo sin discriminar (false-positive masivo)",
      ignored_escalation_path:
        "Ignoró path de escalamiento disponible",
    },
  },

  // ============================================================================
  // Sección 5 — Gaps
  // ============================================================================
  gaps: {
    eyebrow: "Gaps identificados",
    observed_label: "Qué observamos",
    why_matters_label: "Por qué importa",
    empty_state: "Sin gaps materiales en esta sesión.",
  },

  // ============================================================================
  // Sección 6 — Fortalezas
  // ============================================================================
  strengths: {
    eyebrow: "Fortalezas",
    empty_state: "Sin fortalezas destacadas todavía — practice beats pueden cambiar esto.",
  },

  // ============================================================================
  // Sección 7 — Practice beats (B9-002-D3 — beats enseñan post-medición)
  // ============================================================================
  practice: {
    eyebrow: "Práctica sugerida",
    intro:
      "El diagnóstico midió tu criterio sin enseñar respuestas. Estas prácticas vienen después — corrigen específicamente los gaps que aparecieron en tu sesión.",
    cta_button: "Empezar práctica",
    duration_template: (min: number) => `${min} min`,
    locked_state: (level_needed: number) =>
      `Disponible cuando tengas sesión Nivel ${level_needed}.`,
    completed_state: (completed_at: string) =>
      `Completado el ${completed_at}.`,
    empty_state:
      "Sin prácticas sugeridas — todas las dimensiones en banda Alto.",
  },

  // ============================================================================
  // Sección 8 — Próximos 7 días
  // ============================================================================
  next_actions: {
    eyebrow: "Próximos 7 días",
    intro:
      "Lo que el manager (o la persona, si pilota) hace mañana para que el diagnóstico genere mejora real.",
  },

  // ============================================================================
  // Sección 9 — Recomendación reframed
  // ============================================================================
  recommendation_card: {
    eyebrow: "Recomendación",
    applies_to_label: "Aplica a",
    reason_label: "Por qué",
  },

  // ============================================================================
  // Sección 10 — Transfer delta (si existe resim)
  // ============================================================================
  transfer_delta: {
    eyebrow: "Transfer entre baseline y re-simulación",
    intro:
      "Diferencia de banda entre tu sesión inicial y la re-simulación 30-90 días después. Mide si aplicaste el criterio en contexto nuevo (no si memorizaste).",
    delta_positive: (dim: string, from: string, to: string) =>
      `${dim}: mejoró de ${from} a ${to} (transfer real).`,
    delta_negative: (dim: string, from: string, to: string) =>
      `${dim}: bajó de ${from} a ${to} (revisar contexto del re-sim o necesidad de más práctica).`,
    delta_stable: (dim: string, band: string) =>
      `${dim}: estable en ${band}.`,
    empty_state:
      "Esta es la sesión baseline. La comparación se llena con la re-simulación (agenda en 30-90 días).",
  },

  // ============================================================================
  // Sección 11 — Histórico longitudinal
  // ============================================================================
  history: {
    eyebrow: "Histórico del participante",
    empty_state:
      "Esta es la primera sesión registrada. El histórico se llena con sesiones futuras (re-simulación + sprints adicionales).",
    schedule_cta: "Agendar re-simulación",
    schedule_window: "Recomendado 30-90 días post-sprint.",
  },

  // ============================================================================
  // Sección 12 — Audit metadata (B5-001-D5)
  // ============================================================================
  audit_metadata: {
    eyebrow: "Auditoría técnica",
    intro_short:
      "Defensibilidad ejecutiva: cómo se calculó este reporte.",
    fields: {
      judge_model_label: "Judge",
      rubric_version_label: "Rúbrica",
      rubric_frozen_at_label: "Frozen",
      case_version_label: "Caso",
      variant_label: "Variante",
      duration_label: "Duración judge",
      override_count_label: "Overrides aplicados",
      evidence_link_label: "Ver evidence snapshots",
    },
    semver_disclaimer: (rubric_version: string, frozen_at: string) =>
      `Rúbrica ${rubric_version} (frozen ${frozen_at}). Reports históricos se renderean con la versión usada en su momento. No re-evaluamos retroactivamente cuando publicamos una rúbrica nueva — eso mantendría comparabilidad cohort-over-cohort.`,
    cross_version_warning:
      "⚠ Comparas cohorts con versiones distintas de rúbrica. Las diferencias pueden venir del refinamiento de la rúbrica, no solo del progreso del equipo. Cita la versión cuando compartas.",
  },

  // ============================================================================
  // Share + export
  // ============================================================================
  share: {
    pdf_download_label: "Descargar PDF",
    share_link_label: "Generar link compartible",
    share_link_ttl: "Link válido por 30 días.",
    share_link_revoke: "Revocar link",
    copy_link_button: "Copiar link",
    copy_link_success: "Link copiado.",
  },

  // ============================================================================
  // Runtime vs Practice — distinción explícita (B9-002-D3)
  // ============================================================================
  runtime_vs_practice_note: {
    intro:
      "Itera mide en el runtime sin enseñar. Practice beats enseñan después, cuando ya capturamos cómo decides bajo presión real. Esta separación es deliberada: si te enseñamos durante el caso, ya no medimos criterio — medimos cuán bien sigues instrucciones.",
    where_visible: [
      "Onboarding (al primer signin)",
      "Footer del reporte (después del runtime)",
      "Email post-submit antes de invitar a practice",
    ],
  },

  // ============================================================================
  // Empty states globales
  // ============================================================================
  empty_states: {
    no_session: "Esta sesión no existe o no tienes permiso de verla.",
    session_in_progress:
      "La sesión sigue en curso. El reporte se genera cuando la persona haga submit final.",
    judge_evaluating:
      "El judge está evaluando. Esto suele tomar 15-30 segundos. Reintenta en un momento.",
    judge_failed:
      "El judge falló al evaluar. Staff Itera fue notificado y vamos a regenerar el reporte. Te avisamos por email cuando esté listo.",
  },
} as const;

export type ReportCopy = typeof reportCopy;
