/**
 * Copy versionado de error states cross-surface.
 *
 * Cubre los error states que aparecen en múltiples surfaces:
 *   - 404 not_found (página, recurso, sesión)
 *   - 500 server_error (algo nuestro)
 *   - 403 forbidden (RLS leak / acceso denegado)
 *   - 429 rate_limited (demasiados requests)
 *   - 408 timeout (judge, evaluate, llamadas externas)
 *   - network_offline (sin conexión)
 *   - maintenance (modo mantenimiento planeado)
 *   - session_expired (re-auth requerida)
 *   - subscription_expired (org sin plan activo)
 *   - feature_disabled (toggle off o tier no incluido)
 *   - quota_exceeded (seats/sessions/judge calls)
 *
 * Las strings de error específicas de cada surface viven dentro de la
 * copy de ese surface (runtime.errors, auth.errors, manager.alerts,
 * onboarding.states, etc.). errors.ts cubre estados genéricos que
 * cualquier surface puede mostrar.
 *
 * Decisiones producto consolidadas:
 *   - B5-001-D3 (done): pending_review honesto. Cuando algo está en
 *     review humano, NO mostramos error — mostramos estado explícito.
 *     Pero si el judge crashea sin pasar a review, sí es error.
 *   - B9-003-D5 (done): legal conservador v1. Los mensajes de RLS leak
 *     NO admiten "tienes permiso pero" — son binarios: tienes acceso o
 *     no. Sin culpabilizar al usuario.
 *   - Pablo regla operativa: errores son específicos y accionables, NO
 *     genéricos. Cada error tiene retry_cta o escalation cta cuando
 *     aplica.
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "reintentar" — NO "retry", "intentar nuevamente"
 *   - "sesión" — usar para auth session O simulation session según
 *     contexto. Cuando es ambiguo, especificar "sesión de diagnóstico".
 *   - "plan" — NO "subscription" en UI public-facing (Stripe lo llama
 *     subscription internamente pero el user ve "plan").
 *   - "soporte" — NO "support", "help center"
 *
 * Voz: español neutro LATAM corporate. Empático sin ser zalamero.
 * Cuando es nuestro error, lo asumimos. Cuando es del usuario, no lo
 * culpabilizamos. Cuando es third-party (Stripe/Supabase/Anthropic),
 * lo nombramos.
 *
 * Importa desde:
 *   - app/error.tsx (root error boundary)
 *   - app/not-found.tsx (404 global)
 *   - app/(app)/error.tsx (app-scoped error)
 *   - app/maintenance/page.tsx (cuando esté en mantenimiento)
 *   - lib/api-errors.ts (toast errors cross-API)
 *   - components/simulador/ErrorBoundary.tsx (suspense fallback)
 */

export const errorsCopy = {
  // ============================================================================
  // 404 — recurso no encontrado
  // ============================================================================
  not_found: {
    page: {
      eyebrow: "404",
      headline: "Esto no existe (o ya no existe).",
      body:
        "El link que seguiste apunta a una página que no encontramos. Puede que se moviera o que el link esté incompleto.",
      back_home_cta: "Ir al inicio",
      back_home_href: "/",
      back_dashboard_cta: "Ir al dashboard",
      back_dashboard_href: "/dashboard",
    },
    case: {
      eyebrow: "Caso no encontrado",
      headline: "Este caso no existe o no está activo.",
      body:
        "El caso que intentaste abrir no está disponible. Verifica el link o vuelve a la lista de casos del sprint.",
      back_cta: "Ver casos disponibles",
      back_href: "/dashboard",
    },
    session: {
      eyebrow: "Sesión no encontrada",
      headline: "No encontramos esta sesión.",
      body:
        "El ID de sesión no es válido o ya no tienes permiso para verla. Si crees que es un error, escríbenos.",
      contact_cta: "Escribir a soporte",
      contact_email: "soporte@itera.la",
    },
    report: {
      eyebrow: "Reporte no encontrado",
      headline: "No hay reporte para esta sesión todavía.",
      body:
        "Puede que la sesión no esté completa, esté en review humano o aún esté siendo evaluada. Vuelve en unos minutos.",
      check_status_cta: "Ver estado de la sesión",
      back_dashboard_cta: "Volver al dashboard",
    },
    organization: {
      eyebrow: "Organización no encontrada",
      headline: "Esta organización no existe o no tienes acceso.",
      body:
        "Si es tu primer login y crees que deberías estar en una org, pide al admin que verifique tu invitación.",
      contact_admin_cta: "Avisar al admin",
    },
  },

  // ============================================================================
  // 500 / unknown server error
  // ============================================================================
  server_error: {
    page: {
      eyebrow: "Error del servidor",
      headline: "Algo nos falló de nuestro lado.",
      body:
        "Nuestros servidores tuvieron un problema. Ya quedó registrado del lado nuestro — estamos viendo qué pasó. Reintenta en unos segundos.",
      retry_cta: "Reintentar",
      back_home_cta: "Ir al inicio",
      report_id_eyebrow: "ID del error",
      report_id_help:
        "Cópialo si escribes a soporte — nos ayuda a ubicar tu caso.",
    },
    inline: {
      label: "Error inesperado.",
      retry_cta: "Reintentar",
      contact_cta: "Escribir a soporte",
    },
    judge_failed: {
      headline: "El judge LLM falló al evaluar.",
      body:
        "Staff Itera fue notificado y vamos a regenerar el reporte. Te avisamos por email cuando esté listo. Tu sesión no se pierde.",
      ack_cta: "Entendido",
    },
    persistence_failed: {
      label: "No pudimos guardar tu respuesta.",
      help:
        "Reintenta en unos segundos. Si persiste, verifica tu conexión.",
      retry_cta: "Reintentar guardar",
    },
  },

  // ============================================================================
  // 403 — forbidden / acceso denegado
  // ============================================================================
  forbidden: {
    page: {
      eyebrow: "Acceso denegado",
      headline: "No tienes acceso a este recurso.",
      body:
        "Tu cuenta no tiene permiso para ver esta página. Si crees que es un error, verifica que estés logueado con la cuenta correcta o pide al admin de tu organización.",
      switch_account_cta: "Cambiar de cuenta",
      back_dashboard_cta: "Ir a mi dashboard",
    },
    rls_blocked: {
      label: "Este recurso pertenece a otra organización.",
      help:
        "El sistema bloqueó el acceso porque pertenece a una org distinta a la tuya. Confirma que estés en la cuenta correcta.",
    },
    wrong_role: {
      label_template: (requiredRole: string) =>
        `Necesitas rol ${requiredRole} para esta acción.`,
      help:
        "Pide al admin de tu organización que actualice tu rol o ejecute la acción.",
    },
    contact_admin_cta: "Avisar al admin",
  },

  // ============================================================================
  // 429 — rate limited
  // ============================================================================
  rate_limited: {
    page: {
      eyebrow: "Demasiados intentos",
      headline: "Espera un momento antes de reintentar.",
      body_template: (seconds: number) =>
        seconds <= 60
          ? `Hubo demasiados requests en poco tiempo. Reintenta en ${seconds} segundos.`
          : `Hubo demasiados requests en poco tiempo. Reintenta en ${Math.ceil(seconds / 60)} minutos.`,
      countdown_label: "Reintentando en",
      retry_cta: "Reintentar ahora",
    },
    inline: {
      label: "Demasiados intentos seguidos.",
      help_template: (seconds: number) =>
        `Espera ${seconds}s antes de reintentar.`,
    },
    judge_quota: {
      label: "Alcanzaste el límite de evaluaciones del día.",
      help:
        "El judge LLM tiene cuota por seguridad de costos. Mañana se reinicia. Si necesitas evaluar antes, escríbenos a soporte.",
      contact_cta: "Pedir excepción",
    },
  },

  // ============================================================================
  // 408 — timeout
  // ============================================================================
  timeout: {
    judge: {
      headline: "La evaluación está tardando más de lo normal.",
      body:
        "Normalmente el judge LLM toma 15-30 segundos. Si lleva más de 2 minutos, algo está pasando del lado del proveedor. Reintenta en unos minutos.",
      retry_cta: "Reintentar evaluación",
      check_back_cta: "Volver al dashboard (te avisamos por email)",
    },
    api_call: {
      label: "El servidor tardó en responder.",
      help: "Reintenta o verifica tu conexión.",
      retry_cta: "Reintentar",
    },
    voice_transcription: {
      label: "La transcripción está tardando.",
      help: "Espera unos segundos o escribe tu respuesta.",
    },
  },

  // ============================================================================
  // Network — offline o intermitente
  // ============================================================================
  network: {
    offline_banner: {
      label: "Sin conexión a internet.",
      help: "Tus respuestas se guardan localmente y se sincronizan cuando vuelva.",
    },
    offline_page: {
      eyebrow: "Sin conexión",
      headline: "Necesitas internet para continuar.",
      body:
        "Verifica tu Wi-Fi o datos móviles. Recargamos automáticamente cuando vuelva la conexión.",
      retry_cta: "Reintentar",
    },
    intermittent_warning:
      "Conexión inestable. Algunas respuestas pueden tardar en guardarse.",
    api_unreachable: {
      label: "No pudimos contactar nuestro servidor.",
      help: "Verifica tu conexión y reintenta. Si persiste, escríbenos.",
    },
  },

  // ============================================================================
  // Maintenance — modo mantenimiento planeado
  // ============================================================================
  maintenance: {
    page: {
      eyebrow: "Mantenimiento",
      headline: "Estamos haciendo ajustes.",
      body:
        "El Simulador está en mantenimiento planeado. Volvemos en breve. Tus sesiones en progreso quedan guardadas — las retomas cuando volvamos.",
      eta_template: (eta: string) => `ETA: ${eta}`,
      status_link_label: "Ver estado en tiempo real",
      status_link_href: "https://status.itera.la",
      contact_cta: "Suscribirse al estado",
    },
    banner_active: {
      label: "Mantenimiento programado en menos de 1 hora.",
      help:
        "Te recomendamos terminar lo que estás haciendo o pausar. Volvemos en unos minutos.",
    },
    banner_resolved: {
      label: "Volvimos.",
      help: "Mantenimiento completado. Sigue donde lo dejaste.",
    },
  },

  // ============================================================================
  // Session expired (auth o simulation)
  // ============================================================================
  session_expired: {
    auth: {
      headline: "Tu sesión expiró.",
      body:
        "Por seguridad, te pedimos iniciar sesión otra vez. Tus respuestas quedan guardadas — las retomas en cuanto entres.",
      login_cta: "Iniciar sesión",
      login_href: "/auth/login",
    },
    simulation: {
      headline: "Esta sesión de diagnóstico está inactiva.",
      body:
        "El caso quedó pausado hace mucho. Puedes retomarlo donde lo dejaste o empezar uno nuevo.",
      resume_cta: "Retomar caso",
      new_cta: "Ver casos disponibles",
    },
  },

  // ============================================================================
  // Subscription / plan — org sin plan activo o expirado
  // ============================================================================
  subscription_expired: {
    page: {
      eyebrow: "Plan inactivo",
      headline: "Tu plan venció o aún no se activa.",
      body:
        "Para usar el Simulador necesitas un plan activo. Si ya pagaste, puede tomar 1-2 minutos sincronizar — recarga en breve.",
      manage_billing_cta: "Ver mi plan",
      manage_billing_href: "/billing",
      contact_sales_cta: "Hablar con ventas",
      contact_sales_email: "ventas@itera.la",
    },
    banner_expiring_soon: {
      label_template: (days: number) =>
        days === 0
          ? "Tu plan vence hoy."
          : days === 1
            ? "Tu plan vence mañana."
            : `Tu plan vence en ${days} días.`,
      help:
        "Cuando venza, los participantes pierden acceso al caso vivo. Los reportes ya publicados se mantienen.",
      renew_cta: "Renovar plan",
    },
    banner_payment_pending: {
      label: "Pago pendiente.",
      help:
        "Stripe está procesando tu pago. Esto suele tomar menos de 1 minuto.",
    },
  },

  // ============================================================================
  // Feature disabled / not in tier
  // ============================================================================
  feature_disabled: {
    label_template: (featureName: string) =>
      `${featureName} no está activo en tu plan.`,
    help_template: (requiredTier: string) =>
      `Esta función está incluida en ${requiredTier}. Puedes activarla actualizando tu plan.`,
    upgrade_cta: "Ver planes",
    upgrade_href: "/pricing",
    dismiss_cta: "Más tarde",
    contact_sales_cta: "Hablar con ventas",
  },

  // ============================================================================
  // Quota exceeded — seats / sessions / judge calls
  // ============================================================================
  quota_exceeded: {
    seats: {
      label_template: (used: number, max: number) =>
        `Llegaste al máximo de asientos (${used}/${max}).`,
      help:
        "Agrega asientos a tu plan o libera asientos de participantes que ya no estarán en el sprint.",
      add_seats_cta: "Agregar asientos",
      manage_seats_cta: "Gestionar asientos",
    },
    sessions: {
      label: "Llegaste al máximo de sesiones del sprint.",
      help:
        "Cada participante tiene 1 sesión por caso por sprint. Si necesitas re-evaluar, escríbenos.",
      contact_cta: "Pedir excepción",
    },
    judge_daily: {
      label: "Llegaste al límite diario de evaluaciones automáticas.",
      help:
        "El judge tiene cuota por costos. Mañana se reinicia. Para evaluaciones urgentes, escríbenos.",
      contact_cta: "Pedir excepción",
    },
  },

  // ============================================================================
  // Generic helpers para componer mensajes inline
  // ============================================================================
  generic: {
    something_went_wrong: "Algo salió mal. Reintenta.",
    please_wait: "Espera un momento…",
    please_try_again: "Por favor reintenta.",
    contact_us_if_persists:
      "Si el error persiste, escríbenos a soporte@itera.la con el ID del error.",
    contact_support_cta: "Escribir a soporte",
    contact_support_email: "soporte@itera.la",
    retry_cta: "Reintentar",
    reload_page_cta: "Recargar página",
    go_back_cta: "← Volver",
    go_home_cta: "Ir al inicio",
  },

  // ============================================================================
  // Mapping de códigos HTTP a copy bucket
  // (Para que api-errors.ts elija mensaje correcto sin hardcoded)
  // ============================================================================
  http_map: {
    400: "Solicitud inválida. Verifica los datos enviados.",
    401: "Necesitas iniciar sesión para continuar.",
    403: "No tienes permiso para esta acción.",
    404: "Recurso no encontrado.",
    408: "El servidor tardó en responder. Reintenta.",
    409: "Conflicto con otra acción en progreso. Reintenta.",
    410: "Este recurso ya no existe.",
    422: "Datos enviados no son válidos.",
    429: "Demasiados intentos. Espera un momento.",
    500: "Error interno del servidor. Reintenta en unos segundos.",
    502: "Servidor no disponible temporalmente.",
    503: "Servicio en mantenimiento. Reintenta más tarde.",
    504: "El servidor tardó demasiado en responder.",
  } as Record<number, string>,
} as const;

export type ErrorsCopy = typeof errorsCopy;
