/**
 * Copy versionado del manager dashboard.
 *
 * Cubre la superficie /(app)/dashboard cuando viewer_role ∈
 * {manager, admin, org_admin}. Para empleados (viewer_role=employee) el
 * mismo route renderiza `EmployeeDashboard` — sus strings viven aquí también
 * en la sección `employee_view`.
 *
 * Decisiones producto consolidadas:
 *   - B5-002 (en flight con codex): matriz 3×6 dimensiones × bandas como
 *     vista principal del manager. Los labels matriciales viven aquí para
 *     que codex los importe sin reinventar.
 *   - B9-002-D5 (blocked, deps B5-002): override matrix mantiene rama Escalar.
 *     Los 4 caminos del manager (pilotar/entrenar/pausar/escalar) son
 *     canónicos — repetidos también en config.MANAGER_ACTIONS para que el
 *     server pueda renderizarlos antes de hidratar.
 *   - B5-001 (done): el reporte individual lo abre el manager desde aquí.
 *     Los CTAs deben coincidir con report.ts (idioma uniforme).
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "criterio" — NO "skill", "habilidad", "competencia"
 *   - "banda" — NO "score", "puntuación", "nota"
 *   - "decidir/decisión" — NO "feedback", "evaluación-output"
 *   - "diagnóstico" — NO "assessment"
 *   - "caso vivo" — NO "test", "examen"
 *   - "manager" — NO "líder", "supervisor", "jefe"
 *
 * Voz: español neutro LATAM corporate. Lowercase en titulares y bodies
 * gramaticales salvo nombres propios. Cero AI slop.
 *
 * Importa desde app/(app)/dashboard/page.tsx (codex hace el cableado en
 * B5-002).
 */

export const managerCopy = {
  // ============================================================================
  // Surface chrome — eyebrow, header, micro-meta
  // ============================================================================
  surface: {
    eyebrow: "Dashboard del manager",
    eyebrow_employee: "Dashboard del empleado",
    sprint_meta: {
      seats_label: (n: number) =>
        n === 1 ? `${n} asiento` : `${n} asientos`,
      days_left_label: (n: number) =>
        n === 0
          ? "Último día del sprint"
          : n === 1
            ? "Queda 1 día"
            : `Quedan ${n} días`,
      date_range_separator: "→",
    },
  },

  // ============================================================================
  // Loading + error states
  // ============================================================================
  states: {
    loading_label: "Cargando dashboard…",
    error_eyebrow: "Error al cargar dashboard",
    error_retry_cta: "Reintentar",
    error_contact_staff:
      "Si el error persiste, avisa a Itera staff con el ID de tu sesión de navegador.",
    empty_no_sprint_headline: "Aún no hay sprint activo.",
    empty_no_sprint_body_admin:
      "Tu team existe pero no tiene un sprint creado. Inicia uno desde onboarding.",
    empty_no_sprint_body_no_team:
      "No estás asignado a ningún team todavía. Pide a tu admin que te invite.",
    empty_no_sprint_cta: "Iniciar onboarding →",
  },

  // ============================================================================
  // KPI hero strip — 3 cards
  // ============================================================================
  kpi: {
    progress: {
      eyebrow: "Progreso del sprint",
      detail_template: (completed: number, in_progress: number) =>
        `${completed} completados · ${in_progress} en curso`,
    },
    readiness: {
      eyebrow: "Banda promedio",
      scale_suffix: "/100",
      empty_label: "Sin sesiones completadas aún.",
      breakdown_template: (a: number, m: number, b: number) =>
        `${a} en banda alta · ${m} media · ${b} baja.`,
      help_text:
        "Promedio simple de las 6 dimensiones de los participantes con sesión completada.",
    },
    risk: {
      eyebrow: "Eventos de riesgo",
      empty_label: "Sin riesgos detectados en sesiones completadas.",
      detected_label: "Detectados en sesiones completadas.",
      help_text:
        "Cuenta total de risk events disparados por la rúbrica. Cada evento queda con evidencia textual en el reporte individual.",
    },
  },

  // ============================================================================
  // Team section — lista de participantes
  // ============================================================================
  team: {
    eyebrow: "Equipo",
    headline_template: (n: number) =>
      n === 1 ? `${n} miembro del sprint.` : `${n} miembros del sprint.`,
    empty_label: "Aún no hay miembros en el team.",
    member_status: {
      not_started: "No iniciado",
      in_progress: "En curso",
      paused: "Pausado",
      submitted: "Completado",
      evaluated: "Completado",
      completed: "Completado",
    },
    member_pending_review_chip: "review pendiente",
    member_duration_template: (min: number) => `${min} min`,
    band_chip_label: (band: "A" | "M" | "B") =>
      band === "A" ? "Alto" : band === "M" ? "Medio" : "Bajo",
    drill_down_cta: "Ver reporte de la persona",
  },

  // ============================================================================
  // Reports list section
  // ============================================================================
  reports: {
    eyebrow: "Reportes",
    headline: "Evidencia lista para revisar.",
    body:
      "Abre los reportes individuales ya generados. El reporte agregado del equipo se activa cuando existan suficientes sesiones completadas.",
    available_count_template: (n: number) =>
      n === 1 ? `${n} disponible` : `${n} disponibles`,
    empty_label:
      "Todavía no hay reportes para extraer. Aparecerán aquí cuando los participantes completen el caso y el reporte quede publicado.",
    status_pending_review: "review pendiente",
    status_published: "publicado",
    status_generated: "reporte generado",
    open_report_cta: "Abrir reporte",
  },

  // ============================================================================
  // Matriz 3×6 — bandas × dimensiones (B5-002)
  // Layout: filas = bandas (A/M/B), columnas = 6 dimensiones.
  // Cada celda muestra la cuenta de participantes que cayeron en esa
  // intersección. Click → drill-down con esa cohorte.
  // ============================================================================
  matrix: {
    eyebrow: "Resultado agregado",
    headline: "Dimensiones del equipo.",
    body:
      "Promedio de las 6 dimensiones que medimos en cada caso. Click en una celda para ver quiénes están en esa intersección.",
    row_labels: {
      A: "Banda alta",
      M: "Banda media",
      B: "Banda baja",
    },
    row_descriptions: {
      A: "Opera en flujo real con criterio. Pilotar o expandir scope.",
      M: "Criterio parcial. Necesita micro-práctica antes de autonomía.",
      B: "Aún no debe operar en flujos sensibles. Pausar y remediar gap.",
    },
    cell_empty_label: "—",
    cell_count_template: (n: number) =>
      n === 1 ? `${n} persona` : `${n} personas`,
    cell_drill_down_aria: (band: string, dimension: string) =>
      `Ver participantes con banda ${band} en ${dimension}`,
    legend_note:
      "Cifras son cuentas absolutas, no porcentajes. El total puede no sumar al equipo si hay sesiones in_progress.",
  },

  // ============================================================================
  // Sección "Dimensiones agregadas" (vista actual sin matriz — fallback v0)
  // Cuando B5-002 entre, esta sección se reemplaza por matrix de arriba.
  // ============================================================================
  dimensions_avg: {
    eyebrow: "Promedios por dimensión",
    headline: "Cómo decidió tu equipo, dimensión por dimensión.",
    body:
      "Promedio de las 6 dimensiones que medimos en cada caso. Click para ver qué participantes están abajo del promedio.",
    score_suffix: "/100",
    empty_label: "Sin promedios todavía.",
    below_average_cta: (dimensionLabel: string) =>
      `Ver quién está abajo del promedio en ${dimensionLabel}`,
  },

  // ============================================================================
  // Acciones recomendadas — override matrix (B9-002-D5)
  // El judge calcula 1 recomendación por persona. Aquí explicamos qué
  // significa cada rama al manager, sin spoilers de la rúbrica.
  // ============================================================================
  recommendations: {
    eyebrow: "Acciones recomendadas",
    headline: "Cuatro caminos por persona.",
    body:
      "Cada participante recibe una recomendación operativa. La elige la rúbrica, no tú — pero la ejecutas tú.",
    action_card_meta_template: (count: number, action: string) =>
      count === 1
        ? `${count} persona · ${action}`
        : `${count} personas · ${action}`,
    drill_down_cta: "Ver quiénes →",
    legend: {
      pilotar:
        "Puede operar en flujo real con supervisión semanal. Apto para uso autónomo en su scope típico.",
      entrenar:
        "Tiene criterio parcial. Necesita micro-práctica específica antes de autonomía. Supervisión cercana 4-6 semanas.",
      pausar:
        "No debe usar IA en flujos sensibles todavía. Re-evaluar después de remediar gap.",
      escalar:
        "El problema no es individual. Requiere proceso, legal, compliance, IT o policy antes de re-evaluar persona.",
    },
  },

  // ============================================================================
  // Alert tones — banner copy que aparece cuando algo merece atención
  // ============================================================================
  alerts: {
    high_risk_event_banner: {
      tone: "warning",
      headline: "Un participante disparó un evento de riesgo alto.",
      body:
        "El reporte queda en review humano antes de publicarse. Itera staff revisa en menos de 24h y te notifica cuando esté listo.",
      cta: "Ver detalle del evento",
    },
    review_pending_banner: {
      tone: "info",
      headline: "Reportes en review.",
      body_template: (n: number) =>
        n === 1
          ? "1 reporte está en revisión humana. Aparecerá publicado cuando staff confirme."
          : `${n} reportes están en revisión humana. Aparecerán publicados cuando staff confirme.`,
    },
    sprint_closing_soon_banner: {
      tone: "info",
      headline_template: (days: number) =>
        days === 0
          ? "El sprint cierra hoy."
          : days === 1
            ? "El sprint cierra mañana."
            : `Quedan ${days} días para cerrar el sprint.`,
      body:
        "Cuando cierre, los participantes pierden acceso al caso vivo. Los reportes publicados se mantienen accesibles.",
    },
    no_sessions_completed_banner: {
      tone: "info",
      headline: "Aún no hay sesiones completadas.",
      body:
        "Los promedios y la matriz se activan cuando al menos 1 participante termine el caso. Mientras tanto puedes ver progreso individual.",
    },
  },

  // ============================================================================
  // Drill-down — modal/page cuando manager hace click en celda o card
  // ============================================================================
  drill_down: {
    title_template: (cohort: string) => `Participantes — ${cohort}`,
    empty_label: "Nadie cayó en esta cohorte.",
    columns: {
      name: "Nombre",
      band: "Banda",
      duration: "Duración",
      status: "Estado",
      report: "Reporte",
    },
    open_report_cta: "Abrir →",
    back_to_dashboard: "← Volver al dashboard",
  },

  // ============================================================================
  // Employee view — cuando viewer_role=employee
  // ============================================================================
  employee_view: {
    eyebrow: "Dashboard del empleado",
    headline: "Casos disponibles.",
    body:
      "Entra a un caso, toma decisiones y recibe una lectura preliminar de tu criterio operativo.",
    empty_label: "Todavía no tienes casos asignados.",
    case_card: {
      eyebrow_template: (order: number, difficulty: string | null) =>
        difficulty
          ? `Caso ${String(order).padStart(2, "0")} · ${difficulty}`
          : `Caso ${String(order).padStart(2, "0")}`,
      duration_template: (min: number) =>
        `${min} minutos · Contexto, Datos, IA, Revisión, Decisión y Respuesta.`,
      start_cta: "Empezar caso",
      resume_cta: "Continuar caso",
      view_report_cta: "Ver reporte",
      status_locked: "Bloqueado",
      status_completed: "Completado",
    },
  },

  // ============================================================================
  // Footer microcopy — disclaimers y notas operativas
  // ============================================================================
  microcopy: {
    last_updated_template: (when: string) => `Datos actualizados ${when}`,
    refreshing_label: "Actualizando…",
    privacy_note:
      "Solo ves a las personas de tu team. Los reportes son confidenciales entre Itera, el participante y tú como manager autorizado.",
    rubric_version_template: (semver: string) => `Rúbrica vigente ${semver}`,
    rubric_freeze_note:
      "La rúbrica se congela al inicio del sprint. Si Itera publica una versión nueva, no cambia retroactivamente este sprint.",
    runtime_vs_practice_note:
      "El diagnóstico mide criterio en un caso vivo. La práctica recurrente vendrá en Fase 2.",
  },

  // ============================================================================
  // Manager handoff — exportar/imprimir/compartir reporte
  // ============================================================================
  handoff: {
    export_cta: "Exportar reporte",
    print_cta: "Imprimir",
    copy_link_cta: "Copiar enlace",
    copy_link_done: "Enlace copiado",
    copy_link_failed: "No pudimos copiar. Intenta seleccionar manualmente.",
    share_disclaimer:
      "Comparte el enlace solo con personas autorizadas dentro de tu organización. El reporte requiere login del participante o manager.",
  },
} as const;

export type ManagerCopy = typeof managerCopy;
