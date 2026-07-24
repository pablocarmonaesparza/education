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

// Capa de display: el parámetro `strengths` conserva su union type en español
// (contrato del tipo); solo el texto renderizado se localiza.
const JUDGMENT_STRENGTH_LABEL = {
  sólido: "Solid",
  parcial: "Partial",
  insuficiente: "Insufficient",
} as const;

export const reportCopy = {
  // ============================================================================
  // Sección 1 — Cabecera ejecutiva
  // ============================================================================
  header: {
    title_template: (case_title: string) =>
      `Assessment · ${case_title}`,
    meta_separator: " · ",
    duration_label: (min: number) => `${min} min`,
    recommendation_label: "Recommendation",
    // Espejo de MANAGER_ACTIONS.label (config.ts). Los keys son valores de BD.
    recommendation_actions: {
      pilotar: "Pilot",
      entrenar: "Coach",
      pausar: "Pause",
      escalar: "Escalate",
    },
    justification_one_line: (
      strengths: "sólido" | "parcial" | "insuficiente",
      strong_dims: string[],
      critical_dims: string[],
    ) =>
      `${JUDGMENT_STRENGTH_LABEL[strengths]} judgment in ${strong_dims.join(", ") || "—"}; material gap in ${critical_dims.join(", ") || "—"}.`,
  },

  // ============================================================================
  // Pending review banner (B5-001-D3 — honestidad operativa)
  // ============================================================================
  pending_review_banner: {
    title: "Under human review",
    body: "This report has high severity risk events flagged by the LLM judge. The Itera team is reviewing it manually before it goes to the manager. It publishes within 24 hours.",
    why_visible:
      "We show this instead of hiding the report because the manager should know it is under review, not find out later.",
  },

  // ============================================================================
  // Sección 2 — Banda general + matriz
  // ============================================================================
  overall: {
    eyebrow: "Overall readiness",
    score_suffix: "/100",
    matrix_label: "Readiness by level × dimension",
    // Espejo de BAND_DISPLAY (reports/model.ts). Los keys son valores de BD.
    matrix_legend: {
      A: "High",
      M: "Medium",
      B: "Low",
    },
    matrix_n1_label: "N1 AI as copilot",
    matrix_n2_label: "N2 AI in the workflow",
    matrix_n3_label: "N3 AI with agents",
    matrix_empty_state: "No sessions at this level yet.",
  },

  // ============================================================================
  // Sección 3 — Dimensiones drill-down
  // ============================================================================
  dimensions: {
    eyebrow: "The 6 dimensions",
    practice_cta_template: (beat_title: string) =>
      `Suggested practice: ${beat_title}`,
    rationale_label: "Why this band",
  },

  // ============================================================================
  // Sección 4 — Risk events
  // ============================================================================
  risk_events: {
    eyebrow: "Risk events",
    empty_state: "No risk events in this session.",
    severity_labels: {
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    step_label: (ordinal: number) => `Step ${ordinal}`,
    evidence_label: "Evidence",
    jurisdiction_label: "Jurisdiction",
    transfer_basis_label: "Documented legal basis",
    transfer_basis_values: {
      true: "Yes",
      false: "No",
      null: "—",
    },
    type_humanized: {
      // Mapeo de slug interno a label humano (US English)
      exposed_pii_to_model:
        "Personal data sent to the model",
      hidden_pii_usage_from_authority:
        "PII use not disclosed to the manager",
      accepted_unverified_claim:
        "Accepted a claim without verifying it",
      accepted_hallucinated_figures:
        "Accepted made-up numbers from the model",
      used_sensitive_commercial_data:
        "Used sensitive commercial data",
      shared_third_party_confidential:
        "Shared third-party confidential information",
      used_unapproved_vendor:
        "Used an unapproved AI vendor",
      prompt_injection_unawareness:
        "Missed the prompt injection risk",
      over_relied_on_output:
        "Over-relied on unverified output",
      overblocked_without_discrimination:
        "Blocked everything without discriminating (mass false positives)",
      ignored_escalation_path:
        "Ignored an available escalation path",
    },
  },

  // ============================================================================
  // Sección 5 — Gaps
  // ============================================================================
  gaps: {
    eyebrow: "Gaps found",
    observed_label: "What we saw",
    why_matters_label: "Why it matters",
    empty_state: "No material gaps in this session.",
  },

  // ============================================================================
  // Sección 6 — Fortalezas
  // ============================================================================
  strengths: {
    eyebrow: "Strengths",
    empty_state: "No standout strengths yet. Practice can change this.",
  },

  // ============================================================================
  // Sección 7 — Practice beats (B9-002-D3 — beats enseñan post-medición)
  // ============================================================================
  practice: {
    eyebrow: "Suggested practice",
    intro:
      "The assessment measured your judgment without teaching answers. Practice comes after, and it targets the exact gaps that showed up in your session.",
    cta_button: "Start practice",
    duration_template: (min: number) => `${min} min`,
    locked_state: (level_needed: number) =>
      `Available once you have a Level ${level_needed} session.`,
    completed_state: (completed_at: string) =>
      `Completed on ${completed_at}.`,
    empty_state:
      "No suggested practice. Every dimension is in the High band.",
  },

  // ============================================================================
  // Sección 8 — Próximos 7 días
  // ============================================================================
  next_actions: {
    eyebrow: "Next 7 days",
    intro:
      "What the manager (or the person, if they pilot) does tomorrow so the assessment turns into real improvement.",
  },

  // ============================================================================
  // Sección 9 — Recomendación reframed
  // ============================================================================
  recommendation_card: {
    eyebrow: "Recommendation",
    applies_to_label: "Applies to",
    reason_label: "Why",
  },

  // ============================================================================
  // Sección 10 — Transfer delta (si existe resim)
  // ============================================================================
  transfer_delta: {
    eyebrow: "Transfer between baseline and re-assessment",
    intro:
      "Band difference between your first session and the re-assessment 30 to 90 days later. It measures whether you applied the judgment in a new context, not whether you memorized it.",
    delta_positive: (dim: string, from: string, to: string) =>
      `${dim}: improved from ${from} to ${to} (real transfer).`,
    delta_negative: (dim: string, from: string, to: string) =>
      `${dim}: dropped from ${from} to ${to} (review the re-assessment context, or more practice may be needed).`,
    delta_stable: (dim: string, band: string) =>
      `${dim}: steady at ${band}.`,
    empty_state:
      "This is the baseline session. The comparison fills in with the re-assessment (schedule it in 30 to 90 days).",
  },

  // ============================================================================
  // Sección 11 — Histórico longitudinal
  // ============================================================================
  history: {
    eyebrow: "Participant history",
    empty_state:
      "This is the first session on record. History fills in with future sessions (re-assessment plus additional sprints).",
    schedule_cta: "Schedule re-assessment",
    schedule_window: "Recommended 30 to 90 days after the sprint.",
  },

  // ============================================================================
  // Sección 12 — Audit metadata (B5-001-D5)
  // ============================================================================
  audit_metadata: {
    eyebrow: "Technical audit",
    intro_short:
      "How this report was calculated, so you can defend it.",
    fields: {
      judge_model_label: "Judge",
      rubric_version_label: "Rubric",
      rubric_frozen_at_label: "Frozen",
      case_version_label: "Case",
      variant_label: "Variant",
      duration_label: "Judge runtime",
      override_count_label: "Overrides applied",
      evidence_link_label: "View evidence snapshots",
    },
    semver_disclaimer: (rubric_version: string, frozen_at: string) =>
      `Rubric ${rubric_version} (frozen ${frozen_at}). Past reports render with the version used at the time. We do not re-score retroactively when a new rubric ships, which keeps cohort-over-cohort comparisons valid.`,
    cross_version_warning:
      "⚠ You are comparing cohorts scored with different rubric versions. Differences may come from rubric refinement, not only from team progress. Cite the version when you share this.",
  },

  // ============================================================================
  // Share + export
  // ============================================================================
  share: {
    pdf_download_label: "Download PDF",
    share_link_label: "Create share link",
    share_link_ttl: "Link works for 30 days.",
    share_link_revoke: "Revoke link",
    copy_link_button: "Copy link",
    copy_link_success: "Link copied.",
  },

  // ============================================================================
  // Runtime vs Practice — distinción explícita (B9-002-D3)
  // ============================================================================
  runtime_vs_practice_note: {
    intro:
      "Itera measures during the case without teaching. Practice teaches afterward, once we have captured how you decide under real pressure. The separation is deliberate: if we taught you during the case, we would no longer measure judgment. We would measure how well you follow instructions.",
    where_visible: [
      "Onboarding (at first sign-in)",
      "Report footer (after the case)",
      "Post-submit email, before the invitation to practice",
    ],
  },

  // ============================================================================
  // Empty states globales
  // ============================================================================
  empty_states: {
    no_session: "This session does not exist, or you do not have access to it.",
    session_in_progress:
      "The session is still in progress. The report is generated when the participant submits.",
    judge_evaluating:
      "The judge is scoring. This usually takes 15 to 30 seconds. Try again in a moment.",
    judge_failed:
      "The judge failed to score this session. The Itera team has been notified and we will regenerate the report. We will email you when it is ready.",
  },
} as const;

export type ReportCopy = typeof reportCopy;
