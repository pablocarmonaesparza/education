/**
 * Email templates transaccionales — 8 templates para v1.
 *
 * Implementa B7-002 (claude entrega 8 templates; codex integra con SendGrid).
 *
 * Voz: español neutro LATAM corporate. Lowercase en subjects y bodies salvo
 * nombres propios y comienzo de frase. Cero AI slop. Cita siempre fuente
 * para datos. Cero "Hola {first_name}!" con exclamación — frío profesional
 * sin ser corporativo aburrido.
 *
 * Cada template tiene:
 *   - subject (≤60 chars)
 *   - preheader (preview text, ≤120 chars)
 *   - body_text (plain text fallback)
 *   - body_html (estructura simple, codex le pone wrapper SendGrid)
 *
 * Variables con {placeholder} — codex resuelve al render.
 */

export const emailTemplates = {
  // ============================================================================
  // 1. SIGNUP WELCOME — primer signin post-signup
  // ============================================================================
  signup_welcome: {
    subject: "Empezaste tu cuenta en Itera",
    preheader: "Próximo paso: configura tu organización en 30 segundos.",
    body_text: `Hola {full_name},

Listo, tu cuenta en Itera está activa.

El siguiente paso es configurar tu organización: nombre, equipo y los emails de las personas a quienes vas a invitar al diagnóstico.

Empezar onboarding: {onboarding_url}

Si tienes preguntas, responde este email — llega directo al equipo.

— Itera`,
    body_html: `<p>Hola <strong>{full_name}</strong>,</p>
<p>Listo, tu cuenta en Itera está activa.</p>
<p>El siguiente paso es configurar tu organización: nombre, equipo y los emails de las personas a quienes vas a invitar al diagnóstico.</p>
<p><a href="{onboarding_url}" class="cta">Empezar onboarding</a></p>
<p style="color:#777">Si tienes preguntas, responde este email — llega directo al equipo.</p>`,
  },

  // ============================================================================
  // 2. INVITATION — buyer invita a empleado/colega
  // ============================================================================
  invitation: {
    subject: "{inviter_name} te invitó al diagnóstico de IA de {org_name}",
    preheader:
      "Una sesión de ~20 minutos. Mide tu criterio operativo al usar IA en trabajo real.",
    body_text: `Hola,

{inviter_name} ({inviter_role}) te invitó al diagnóstico operativo de Itera para el equipo de {team_name} en {org_name}.

Qué es: una sesión de ~20 minutos donde enfrentas un caso real de trabajo y demuestras cómo decides cuando usas IA bajo presión.

Qué NO es: un examen de conocimiento. No medimos si "sabes IA". Medimos qué hace tu equipo cuando importa.

Aceptar invitación: {accept_url}

Tu sesión es individual y confidencial — el reporte va a tu manager, pero las decisiones específicas que tomes solo las ves tú y el sistema de evaluación de Itera.

Cualquier duda, responde este email.

— Itera`,
    body_html: `<p>Hola,</p>
<p><strong>{inviter_name}</strong> ({inviter_role}) te invitó al diagnóstico operativo de Itera para el equipo de <strong>{team_name}</strong> en <strong>{org_name}</strong>.</p>
<p><strong>Qué es:</strong> una sesión de ~20 minutos donde enfrentas un caso real de trabajo y demuestras cómo decides cuando usas IA bajo presión.</p>
<p><strong>Qué NO es:</strong> un examen de conocimiento. No medimos si "sabes IA". Medimos qué hace tu equipo cuando importa.</p>
<p><a href="{accept_url}" class="cta">Aceptar invitación</a></p>
<p style="color:#777">Tu sesión es individual y confidencial — el reporte va a tu manager, pero las decisiones específicas que tomes solo las ves tú y el sistema de evaluación de Itera.</p>
<p style="color:#777">Cualquier duda, responde este email.</p>`,
  },

  // ============================================================================
  // 3. INVITATION ACCEPTED — al inviter cuando alguien acepta
  // ============================================================================
  invitation_accepted: {
    subject: "{invitee_name} aceptó tu invitación a Itera",
    preheader: "{accepted_count}/{total_invited} aceptaron. Te avisamos cuando completen.",
    body_text: `Hola {inviter_name},

{invitee_name} ({invitee_email}) aceptó la invitación al diagnóstico de Itera.

Progreso del cohorte:
- Invitados: {total_invited}
- Aceptados: {accepted_count}
- Pendientes: {pending_count}

Cuando completen sus sesiones, recibirás un email por persona con su reporte ejecutivo. El dashboard agregado del equipo está disponible aquí: {dashboard_url}

— Itera`,
    body_html: `<p>Hola <strong>{inviter_name}</strong>,</p>
<p><strong>{invitee_name}</strong> ({invitee_email}) aceptó la invitación al diagnóstico de Itera.</p>
<p><strong>Progreso del cohorte:</strong></p>
<ul>
  <li>Invitados: {total_invited}</li>
  <li>Aceptados: {accepted_count}</li>
  <li>Pendientes: {pending_count}</li>
</ul>
<p>Cuando completen sus sesiones, recibirás un email por persona con su reporte ejecutivo.</p>
<p><a href="{dashboard_url}" class="cta">Ver dashboard del equipo</a></p>`,
  },

  // ============================================================================
  // 4. CASE ASSIGNED — empleado recibe asignación nueva
  // ============================================================================
  case_assigned: {
    subject: "Tienes un caso asignado en Itera — {case_title}",
    preheader: "~{duration_min} minutos. Cuando tengas un bloque tranquilo.",
    body_text: `Hola {full_name},

{manager_name} te asignó un caso para el diagnóstico de IA del equipo:

Caso: {case_title}
Duración estimada: ~{duration_min} minutos
Sin interrupciones recomendado

Recomendamos hacerlo cuando tengas un bloque tranquilo. Una vez empezado, lo ideal es completarlo sin pausas largas — el sistema mide cómo decides bajo presión real, así que las interrupciones distorsionan.

Empezar caso: {case_url}

Si necesitas más tiempo o tienes preguntas, responde a {manager_email}.

— Itera`,
    body_html: `<p>Hola <strong>{full_name}</strong>,</p>
<p><strong>{manager_name}</strong> te asignó un caso para el diagnóstico de IA del equipo:</p>
<ul>
  <li><strong>Caso:</strong> {case_title}</li>
  <li><strong>Duración estimada:</strong> ~{duration_min} minutos</li>
  <li>Sin interrupciones recomendado</li>
</ul>
<p>Recomendamos hacerlo cuando tengas un bloque tranquilo. Una vez empezado, lo ideal es completarlo sin pausas largas — el sistema mide cómo decides bajo presión real, así que las interrupciones distorsionan.</p>
<p><a href="{case_url}" class="cta">Empezar caso</a></p>
<p style="color:#777">Si necesitas más tiempo o tienes preguntas, responde a {manager_email}.</p>`,
  },

  // ============================================================================
  // 5. REPORT READY EMPLOYEE — tu reporte está listo
  // ============================================================================
  report_ready_employee: {
    subject: "Tu reporte de Itera está listo",
    preheader:
      "Banda {overall_band}. Práctica sugerida según los gaps identificados.",
    body_text: `Hola {full_name},

Listo el reporte de tu sesión en Itera.

Itera midió tu criterio operativo al usar IA (no tu conocimiento de IA). El reporte traduce esa medición a bandas por dimensión + recomendación accionable para tu manager.

Resumen ejecutivo:
- Banda general: {overall_band}
- Dimensiones evaluadas: contexto, privacidad, validación, juicio, decisión
- Recomendación: {recommendation_action}

Importante: el diagnóstico midió tu criterio sin enseñar respuestas. Lo que sigue son las prácticas correctivas (practice beats) — vienen después, no durante. Cada práctica toma ~2 minutos y corrige un gap específico.

Ver reporte completo: {report_url}
Empezar práctica sugerida: {practice_url}

Tu reporte es confidencial entre tú y tu manager autorizado.

— Itera`,
    body_html: `<p>Hola <strong>{full_name}</strong>,</p>
<p>Listo el reporte de tu sesión en Itera.</p>
<p>Itera midió tu <strong>criterio operativo</strong> al usar IA (no tu conocimiento de IA). El reporte traduce esa medición a bandas por dimensión + recomendación accionable para tu manager.</p>
<p><strong>Resumen ejecutivo:</strong></p>
<ul>
  <li><strong>Banda general:</strong> {overall_band}</li>
  <li><strong>Dimensiones evaluadas:</strong> contexto, privacidad, validación, juicio, decisión</li>
  <li><strong>Recomendación:</strong> {recommendation_action}</li>
</ul>
<p><strong>Importante:</strong> el diagnóstico midió tu criterio sin enseñar respuestas. Lo que sigue son las prácticas correctivas (practice beats) — vienen después, no durante. Cada práctica toma ~2 minutos y corrige un gap específico.</p>
<p><a href="{report_url}" class="cta">Ver reporte completo</a></p>
<p><a href="{practice_url}" class="cta-secondary">Empezar práctica sugerida</a></p>
<p style="color:#777">Tu reporte es confidencial entre tú y tu manager autorizado.</p>`,
  },

  // ============================================================================
  // 6. REPORT READY MANAGER — reporte de un empleado listo
  // ============================================================================
  report_ready_manager: {
    subject: "Reporte de {employee_name} listo — recomienda: {recommendation_action}",
    preheader: "Banda {overall_band}. Acción sugerida para los próximos 7 días.",
    body_text: `Hola {manager_name},

{employee_name} completó su sesión del caso "{case_title}" en {duration_min} minutos.

Resumen ejecutivo:
- Banda general: {overall_band}
- Risk events detectados: {risk_event_count} ({risk_high_count} de alta severidad)
- Recomendación: {recommendation_action}

{pending_review_disclaimer_if_high}

Próximos pasos sugeridos por el judge (visibles en el reporte completo):
{next_actions_preview}

Ver reporte completo: {report_url}
Dashboard del equipo: {dashboard_url}

El reporte tiene PDF descargable + link compartible (TTL 30 días) si necesitas compartir internamente con CEO/CHRO.

— Itera`,
    body_html: `<p>Hola <strong>{manager_name}</strong>,</p>
<p><strong>{employee_name}</strong> completó su sesión del caso "<em>{case_title}</em>" en {duration_min} minutos.</p>
<p><strong>Resumen ejecutivo:</strong></p>
<ul>
  <li><strong>Banda general:</strong> {overall_band}</li>
  <li><strong>Risk events:</strong> {risk_event_count} ({risk_high_count} de alta severidad)</li>
  <li><strong>Recomendación:</strong> {recommendation_action}</li>
</ul>
<p>{pending_review_disclaimer_if_high}</p>
<p><strong>Próximos pasos sugeridos por el judge:</strong></p>
<p>{next_actions_preview}</p>
<p><a href="{report_url}" class="cta">Ver reporte completo</a></p>
<p><a href="{dashboard_url}" class="cta-secondary">Dashboard del equipo</a></p>
<p style="color:#777">El reporte tiene PDF descargable + link compartible (TTL 30 días) si necesitas compartir internamente con CEO/CHRO.</p>`,
  },

  // ============================================================================
  // 7. SPRINT CLOSING — el sprint termina en X días
  // ============================================================================
  sprint_closing: {
    subject: "Sprint de Itera cierra en {days_left} días",
    preheader: "{completed_count}/{total_count} completaron. {pending_count} pendientes.",
    body_text: `Hola {manager_name},

El sprint de diagnóstico de {team_name} termina en {days_left} días ({end_date}).

Estado actual:
- Completados: {completed_count}/{total_count}
- En curso: {in_progress_count}
- Pendientes: {pending_count}

{pending_employees_list_if_any}

Una vez cerrado el sprint, recibirás:
1. Dashboard agregado del equipo
2. Recomendaciones específicas por persona (pilotar / entrenar / pausar / escalar)
3. Plan de Sprint Fase 2 si decides continuar con práctica + re-simulación

Dashboard actual: {dashboard_url}

Si necesitas extender el sprint o tienes preguntas, responde este email.

— Itera`,
    body_html: `<p>Hola <strong>{manager_name}</strong>,</p>
<p>El sprint de diagnóstico de <strong>{team_name}</strong> termina en <strong>{days_left} días</strong> ({end_date}).</p>
<p><strong>Estado actual:</strong></p>
<ul>
  <li>Completados: {completed_count}/{total_count}</li>
  <li>En curso: {in_progress_count}</li>
  <li>Pendientes: {pending_count}</li>
</ul>
<p>{pending_employees_list_if_any}</p>
<p><strong>Una vez cerrado el sprint, recibirás:</strong></p>
<ol>
  <li>Dashboard agregado del equipo</li>
  <li>Recomendaciones específicas por persona (pilotar / entrenar / pausar / escalar)</li>
  <li>Plan de Sprint Fase 2 si decides continuar con práctica + re-simulación</li>
</ol>
<p><a href="{dashboard_url}" class="cta">Dashboard actual</a></p>`,
  },

  // ============================================================================
  // 8. PASSWORD RESET — flujo standard Supabase
  // ============================================================================
  password_reset: {
    subject: "Restablece tu contraseña de Itera",
    preheader: "Link válido por 1 hora. Si no fuiste tú, ignora este email.",
    body_text: `Hola,

Recibimos una solicitud para restablecer la contraseña de tu cuenta de Itera ({email}).

Si fuiste tú, restablece aquí: {reset_url}

El link es válido por 1 hora. Si no fuiste tú, ignora este email — tu contraseña sigue siendo la misma.

— Itera`,
    body_html: `<p>Hola,</p>
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de Itera (<strong>{email}</strong>).</p>
<p>Si fuiste tú, restablece aquí:</p>
<p><a href="{reset_url}" class="cta">Restablecer contraseña</a></p>
<p style="color:#777">El link es válido por <strong>1 hora</strong>. Si no fuiste tú, ignora este email — tu contraseña sigue siendo la misma.</p>`,
  },
} as const;

export type EmailTemplate = keyof typeof emailTemplates;
export type EmailTemplates = typeof emailTemplates;

// ============================================================================
// Variables esperadas por template (codex valida al render)
// ============================================================================
export const emailTemplateVars = {
  signup_welcome: ["full_name", "onboarding_url"],
  invitation: ["inviter_name", "inviter_role", "team_name", "org_name", "accept_url"],
  invitation_accepted: [
    "inviter_name",
    "invitee_name",
    "invitee_email",
    "total_invited",
    "accepted_count",
    "pending_count",
    "dashboard_url",
  ],
  case_assigned: [
    "full_name",
    "manager_name",
    "manager_email",
    "case_title",
    "duration_min",
    "case_url",
  ],
  report_ready_employee: [
    "full_name",
    "overall_band",
    "recommendation_action",
    "report_url",
    "practice_url",
  ],
  report_ready_manager: [
    "manager_name",
    "employee_name",
    "case_title",
    "duration_min",
    "overall_band",
    "risk_event_count",
    "risk_high_count",
    "recommendation_action",
    "pending_review_disclaimer_if_high",
    "next_actions_preview",
    "report_url",
    "dashboard_url",
  ],
  sprint_closing: [
    "manager_name",
    "team_name",
    "days_left",
    "end_date",
    "completed_count",
    "total_count",
    "in_progress_count",
    "pending_count",
    "pending_employees_list_if_any",
    "dashboard_url",
  ],
  password_reset: ["email", "reset_url"],
} as const;

// ============================================================================
// Footer común a todos los emails
// ============================================================================
export const emailCommonFooter = {
  signature: "Itera · El Simulador",
  contact_line: "soporte@itera.la · privacidad@itera.la",
  jurisdiction_disclaimer:
    "Recibiste este email porque tu organización contrató un Sprint con Itera o porque te suscribiste al field-test público. No enviamos marketing third-party. Gestionar preferencias: {preferences_url}",
  legal_link_label: "Política de privacidad",
  unsubscribe_label: "Darte de baja (solo emails no transaccionales)",
};
