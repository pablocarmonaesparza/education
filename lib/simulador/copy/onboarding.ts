/**
 * Copy versionado del onboarding buyer B2B.
 *
 * Cubre el flow /(onboarding)/onboarding/{org,team,invite,billing,done}.
 *
 * Hoy en producción están org/team/invite (codex cerró en B7-002 + B1-004
 * cuando aplicó migraciones premium). billing/done quedan pendientes —
 * Codex los ata en B7-001 cuando llegue. La copy aquí está lista para
 * importarse sin esperar el cableado.
 *
 * Decisiones producto consolidadas:
 *   - B7-001 (en flight): flow buyer end-to-end org → team → invite →
 *     billing → done. Stripe Checkout B2B con seats configurables.
 *   - B9-001-D3 (done): pricing Fase 1 $4-8K (5-50 ppl), Fase 2 $8-15K,
 *     bundle 10% off. Per-seat derivado.
 *   - B9-003-D2 (done): v1 launch geos = MX + CO. AR/CL/PE permitidos en
 *     dropdown pero con disclaimer "fuera de scope v1".
 *   - B9-003-D5 (done): postura legal conservadora v1. El flow recolecta
 *     industria/región para data residency hints pero NO promete
 *     compliance-grade hasta primer DPA enterprise.
 *
 * Vocabulario canónico estricto (contrato §7):
 *   - "organización" / "team" — NO "empresa" / "equipo" inconsistente
 *   - "diagnóstico" — NO "assessment"
 *   - "participante" — NO "estudiante", "alumno", "user"
 *   - "manager" — NO "líder", "jefe"
 *   - "caso vivo" — NO "test", "examen"
 *
 * Voz: español neutro LATAM corporate. Lowercase en titulares y bodies
 * gramaticales salvo nombres propios y comienzo de frase. Cero AI slop.
 *
 * Importa desde app/(onboarding)/onboarding/{paso}/page.tsx via
 * `import { onboardingCopy } from "@/lib/simulador/copy/onboarding";`.
 */

export const onboardingCopy = {
  // ============================================================================
  // Surface chrome compartido — wizard header con paso N de M
  // ============================================================================
  wizard: {
    eyebrow_template: (step: number, total: number, context: string) =>
      `Paso ${step} de ${total} · ${context}`,
    back_cta: "← Atrás",
    continue_cta: "Continuar →",
    skip_cta: "Saltar este paso",
    cancel_cta: "Cancelar onboarding",
    cancel_confirm_title: "¿Salir del onboarding?",
    cancel_confirm_body:
      "Lo que ya guardaste (organización, team) se mantiene. Puedes retomar el flow desde el dashboard.",
    cancel_confirm_yes: "Sí, salir",
    cancel_confirm_no: "Seguir aquí",
  },

  // ============================================================================
  // Paso 1 — /onboarding/org
  // Captura: nombre, industria, región, tamaño
  // ============================================================================
  step1_org: {
    eyebrow_context: "Tu organización",
    headline: "Cuéntanos sobre tu equipo.",
    body:
      "Usamos esto para calibrar el diagnóstico al contexto de tu organización. Puedes ajustarlo después.",
    fields: {
      name_label: "Nombre de la organización",
      name_placeholder: "Acme LATAM",
      industry_label: "Industria",
      region_label: "Región principal",
      size_label: "Tamaño del equipo",
    },
    industry_options: [
      { key: "saas_b2b", label: "SaaS B2B" },
      { key: "ecommerce", label: "Ecommerce" },
      { key: "servicios_profesionales", label: "Servicios profesionales" },
      { key: "fintech", label: "Fintech" },
      { key: "retail", label: "Retail" },
      { key: "manufactura", label: "Manufactura" },
      { key: "salud", label: "Salud" },
      { key: "educacion", label: "Educación" },
      { key: "otro", label: "Otro" },
    ],
    region_options: [
      { key: "MX", label: "México" },
      { key: "CO", label: "Colombia" },
      { key: "AR", label: "Argentina" },
      { key: "CL", label: "Chile" },
      { key: "PE", label: "Perú" },
      { key: "BR", label: "Brasil" },
      { key: "other_latam", label: "Otro LATAM" },
      { key: "us", label: "EE.UU." },
    ],
    region_disclaimer_v1_geos:
      "Lanzamiento v1: MX + CO. Para otras regiones LATAM, el diagnóstico funciona pero las plantillas legales (privacy, consent) aún están en preparación.",
    region_disclaimer_br:
      "Brasil entra en v2 (LGPD requiere plantillas dedicadas). Te avisamos cuando esté listo — escríbenos para ir a la waitlist.",
    size_options: [
      { key: "1-10", label: "1–10 empleados" },
      { key: "11-50", label: "11–50 empleados" },
      { key: "51-100", label: "51–100 empleados" },
      { key: "101-300", label: "101–300 empleados" },
      { key: "301-500", label: "301–500 empleados" },
      { key: "501+", label: "501+ empleados" },
    ],
    size_help:
      "El diagnóstico opera con hasta 50 asientos por org. Para organizaciones más grandes lo cotizamos en escalones — escríbenos.",
    submit_cta: "Continuar →",
    error_create: "Error al crear organización. Reintenta.",
    error_duplicate:
      "Ya existe una organización con ese nombre dentro de tu cuenta. Cambia el nombre o continúa con la existente desde el dashboard.",
  },

  // ============================================================================
  // Paso 2 — /onboarding/team
  // Captura: nombre del team, departamento/función
  // ============================================================================
  step2_team: {
    eyebrow_template: (orgName: string) =>
      `Equipo dentro de ${orgName || "tu organización"}`,
    headline: "¿Qué equipo vas a diagnosticar primero?",
    body:
      "El caso 1 está calibrado para Marketing / Growth. Si tu equipo es otro, sigamos — vamos a abrir más carreras pronto.",
    fields: {
      name_label: "Nombre del equipo",
      name_placeholder: "Marketing",
      department_label: "Función",
    },
    department_options: [
      { key: "marketing", label: "Marketing / Growth" },
      { key: "sales", label: "Sales" },
      { key: "customer_success", label: "Customer Success" },
      { key: "operations", label: "Operations" },
      { key: "finance", label: "Finance" },
      { key: "legal", label: "Legal" },
      { key: "people_hr", label: "People / HR" },
      { key: "product", label: "Product" },
      { key: "engineering", label: "Engineering" },
      { key: "otro", label: "Otro" },
    ],
    department_help_marketing:
      "Sprint v1 está calibrado para Marketing/Growth. Otras carreras llegan en próximas releases — el diagnóstico funciona, pero los casos pueden no reflejar tu flujo exacto todavía.",
    department_help_other:
      "Esta carrera aún no tiene casos calibrados v1. Puedes hacer el diagnóstico con el caso Marketing como muestra — la rúbrica de criterio aplica cross-carrera. Te avisamos cuando tu carrera tenga sprint dedicado.",
    submit_cta: "Continuar →",
    error_create: "Error al crear equipo. Reintenta.",
  },

  // ============================================================================
  // Paso 3 — /onboarding/invite
  // Captura: bulk emails de participantes
  // ============================================================================
  step3_invite: {
    eyebrow_context: "Invita a tu equipo",
    headline: "¿Quiénes van a hacer el diagnóstico?",
    body_template: (teamName: string) =>
      `Cada participante recibe un email con su link único. El caso toma ~20 minutos y se puede hacer cuando quieran — sin coordinación síncrona. Equipo: ${teamName}.`,
    fields: {
      emails_label: "Emails de los participantes",
      emails_placeholder:
        "ana@empresa.com\njuan@empresa.com\nmaria@empresa.com",
      emails_description_template: (n: number) =>
        n === 1
          ? "Separa por comas, espacios o saltos de línea. 1 email válido detectado."
          : `Separa por comas, espacios o saltos de línea. ${n} emails válidos detectados.`,
    },
    submit_cta_template: (n: number) =>
      n === 0
        ? "Enviar invitaciones"
        : n === 1
          ? "Enviar 1 invitación"
          : `Enviar ${n} invitaciones`,
    over_seats_warning_template: (n: number, max: number) =>
      `Estás invitando ${n} participantes pero tu plan tiene ${max} asientos. Los excedentes quedan en lista de espera hasta que liberes asientos o amplíes el plan.`,
    domain_mismatch_warning:
      "Detectamos emails con dominios distintos al tuyo. Confirma que son del mismo equipo antes de continuar.",
    sent_headline_template: (n: number) =>
      n === 1
        ? "1 invitación enviada"
        : `${n} invitaciones enviadas`,
    sent_body:
      "Cada participante recibirá un email con su link único. El diagnóstico aparecerá en tu dashboard cuando completen el caso.",
    skipped_eyebrow: "No enviadas",
    skipped_reasons: {
      invalid_email: "formato de email inválido",
      duplicate: "ya invitada previamente",
      already_member: "ya es miembro de la organización",
      no_seats: "no quedan asientos disponibles",
      rate_limited: "demasiados envíos seguidos — reintenta en unos minutos",
      unknown: "error al enviar",
    },
    invite_more_cta: "Invitar más",
    finish_cta: "Ir al dashboard →",
    error_send: "Error al enviar invitaciones. Reintenta.",
  },

  // ============================================================================
  // Paso 5 — /onboarding/billing
  // Stripe Checkout B2B con seats configurables
  // ============================================================================
  step4_billing: {
    headline: "¿Cuántas personas van a participar?",
    tier_label_template: (label: string, range: string) =>
      `Tier ${label} · ${range}`,
    pricing_breakdown_template: (perSeat: number, seats: number, total: number) =>
      `USD ${perSeat} × ${seats} ${seats === 1 ? "persona" : "personas"} = USD ${total.toLocaleString("en-US")}`,
    enterprise_headline: "Más de 99 personas",
    enterprise_body:
      "Para equipos grandes el precio se negocia por volumen y término. Cuéntanos cuántas personas son y armamos una propuesta.",
    submit_cta: "Continuar a Stripe",
    submit_enterprise_cta: "Hablar con ventas",
    terms_required:
      "Al continuar aceptas los Términos y la Política de privacidad. Pago seguro con Stripe.",
    error_create_session: "Error al crear sesión de pago. Reintenta.",
    error_stripe_redirect:
      "No pudimos abrir Stripe. Reintenta o escríbenos a ventas@itera.la.",
  },

  // ============================================================================
  // Paso 6 — /onboarding/done
  // Confirmación post-pago + handoff al dashboard
  // ============================================================================
  step5_done: {
    eyebrow_context: "Listo",
    headline: "Sprint activado.",
    body:
      "Los participantes ya reciben su link por email para empezar el diagnóstico. En paralelo, estamos creando los ejercicios a la medida de tu equipo con tu sitio y los archivos que compartiste. Verás cada sesión completada en tu dashboard.",
    next_steps_eyebrow: "Qué sigue",
    next_steps: [
      "Avisa a tu equipo que llega un email de Itera con su link único.",
      "Cada persona hace el caso cuando pueda (~20 minutos). No requiere coordinación síncrona.",
      "Cuando 1 sesión se completa, su reporte ejecutivo se publica en tu dashboard.",
      "Cuando todas se completan, generamos la matriz agregada del equipo + recomendaciones por persona.",
    ],
    timing_eyebrow: "Tiempos típicos",
    timing_body:
      "Equipos de 10 personas completan el diagnóstico en 3-7 días desde la invitación. El reporte agregado se activa al cierre del sprint.",
    receipt_cta: "Ver recibo de Stripe",
    receipt_note:
      "El recibo llegó al email del comprador. Si tu organización pide factura fiscal, contesta a ese correo y la emitimos.",
    dashboard_cta: "Ir al dashboard →",
    contact_help_eyebrow: "¿Necesitas ayuda?",
    contact_help_body:
      "Escríbenos a soporte@itera.la y respondemos en horario LATAM business hours.",
  },

  // ============================================================================
  // Paso 4 — /onboarding/context
  // Perfil de empresa antes de elegir plan/pagar. Captura señales mínimas para
  // orientar el sprint sin convertir el onboarding en un cuestionario pesado.
  // ============================================================================
  step_context: {
    headline: "Configura el perfil de tu empresa",
    body:
      "Ingresa tu sitio web y archivos PDF. Esto nos ayudará a investigar, entender y crear los ejercicios correspondientes para tu equipo. Esto puede modificarse más adelante.",
    fields: {
      website_label: "Sitio web de la empresa",
      website_placeholder: "Sitio web",
      files_placeholder: "Adjuntar archivos (PDF)",
      files_add_more: "Adjuntar más archivos (PDF)",
    },
    submit_cta: "Continuar a plan →",
    errors: {
      website_required: "Agrega un sitio web válido para continuar.",
    },
  },

  // ============================================================================
  // Estado intermedio — Stripe checkout return URL
  // (Pre-confirmación pago, antes de marcar org.subscribed)
  // ============================================================================
  return_from_stripe: {
    success_eyebrow: "Pago recibido",
    success_headline: "Procesando tu sprint…",
    success_body:
      "Stripe nos confirmó el pago. Estamos activando tu sprint y los asientos. Esto suele tomar menos de 1 minuto.",
    success_polling_note: "No cierres esta pestaña.",
    success_continue_cta: "Continuar al dashboard",
    failed_eyebrow: "Pago no completado",
    failed_headline: "El pago no se procesó.",
    failed_body:
      "Stripe canceló o rechazó el cobro. No se generó ningún cargo. Puedes reintentar con otro método.",
    failed_retry_cta: "Reintentar pago",
    failed_contact_cta: "Escribir a ventas →",
  },

  // ============================================================================
  // Empty/error states genéricos del flow
  // ============================================================================
  states: {
    loading_label: "Cargando…",
    redirecting_label: "Redirigiendo…",
    no_org_yet_redirect_note:
      "Necesitas crear tu organización primero. Te redirigimos.",
    no_team_yet_redirect_note:
      "Necesitas crear un equipo antes de invitar. Te redirigimos.",
    session_expired_headline: "Tu sesión expiró.",
    session_expired_body:
      "Re-loguéate para retomar el onboarding. Lo que ya guardaste se mantiene.",
    session_expired_cta: "Iniciar sesión",
  },

  // ============================================================================
  // Microcopy y disclaimers de pie
  // ============================================================================
  microcopy: {
    progress_template: (current: number, total: number) =>
      `Paso ${current} de ${total}`,
    privacy_footer:
      "Tus datos quedan en la organización que estás creando. No vendemos datos a terceros.",
    support_footer: "¿Atorado? Escríbenos a soporte@itera.la.",
    help_link_label: "¿Cómo funciona el diagnóstico?",
    help_link_href: "/como-funciona",
  },
} as const;

export type OnboardingCopy = typeof onboardingCopy;
