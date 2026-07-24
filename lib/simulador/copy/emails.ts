/**
 * Email templates transaccionales — 9 templates para v1.
 *
 * Implementa B7-002 (claude entrega 8 templates; codex integra con SendGrid).
 *
 * Voz: inglés de negocios de EEUU (glosario 00_EN_GLOSSARY.md). Sentence case
 * en subjects y CTAs. Sin em-dash en body. Cero AI slop. Cita siempre fuente
 * para datos. Cero "Hi {first_name}!" con exclamación — frío profesional
 * sin ser corporativo aburrido.
 *
 * Vocabulario canónico: assessment (no "diagnostic"), judgment (no "criteria"),
 * participant (no "student"), practice (no "lesson"/"course"). Los valores de
 * BD (pilotar/entrenar/pausar/escalar, A/M/B) se muestran vía capa de display:
 * Pilot / Coach / Pause / Escalate · High / Medium / Low.
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
    subject: "Your Itera account is active",
    preheader: "Next step: set up your organization in 30 seconds.",
    body_text: `Hi {full_name},

Your Itera account is active.

Next, set up your organization: the name, the team, and the email addresses of the people you want to invite to the assessment.

Start onboarding: {onboarding_url}

If you have questions, reply to this email. It goes straight to the team.

— Itera`,
    body_html: `<p>Hi <strong>{full_name}</strong>,</p>
<p>Your Itera account is active.</p>
<p>Next, set up your organization: the name, the team, and the email addresses of the people you want to invite to the assessment.</p>
<p><a href="{onboarding_url}" class="cta">Start onboarding</a></p>
<p style="color:#777">If you have questions, reply to this email. It goes straight to the team.</p>`,
  },

  // ============================================================================
  // 2. INVITATION — buyer invita a empleado/colega
  // ============================================================================
  invitation: {
    subject: "{inviter_name} invited you to the {org_name} AI assessment",
    preheader:
      "A 20 minute session. It measures your judgment when you use AI on real work.",
    body_text: `Hi,

{inviter_name} ({inviter_role}) invited you to the Itera assessment for the {team_name} team at {org_name}.

What it is: a 20 minute session where you work a real case and show how you decide when you use AI under pressure.

What it is not: a knowledge test. We do not measure whether you "know AI". We measure what your team does when it counts.

Accept invitation: {accept_url}

Your session is individual and confidential. The report goes to your manager, but the specific decisions you make are seen only by you and the Itera assessment system.

If you have questions, reply to this email.

— Itera`,
    body_html: `<p>Hi,</p>
<p><strong>{inviter_name}</strong> ({inviter_role}) invited you to the Itera assessment for the <strong>{team_name}</strong> team at <strong>{org_name}</strong>.</p>
<p><strong>What it is:</strong> a 20 minute session where you work a real case and show how you decide when you use AI under pressure.</p>
<p><strong>What it is not:</strong> a knowledge test. We do not measure whether you "know AI". We measure what your team does when it counts.</p>
<p><a href="{accept_url}" class="cta">Accept invitation</a></p>
<p style="color:#777">Your session is individual and confidential. The report goes to your manager, but the specific decisions you make are seen only by you and the Itera assessment system.</p>
<p style="color:#777">If you have questions, reply to this email.</p>`,
  },

  // ============================================================================
  // 3. INVITATION ACCEPTED — al inviter cuando alguien acepta
  // ============================================================================
  invitation_accepted: {
    subject: "{invitee_name} accepted your Itera invitation",
    preheader: "{accepted_count}/{total_invited} accepted. We'll tell you when they finish.",
    body_text: `Hi {inviter_name},

{invitee_name} ({invitee_email}) accepted the invitation to the Itera assessment.

Cohort progress:
- Invited: {total_invited}
- Accepted: {accepted_count}
- Pending: {pending_count}

When they finish their sessions, you'll get one email per person with their executive report. The team dashboard is here: {dashboard_url}

— Itera`,
    body_html: `<p>Hi <strong>{inviter_name}</strong>,</p>
<p><strong>{invitee_name}</strong> ({invitee_email}) accepted the invitation to the Itera assessment.</p>
<p><strong>Cohort progress:</strong></p>
<ul>
  <li>Invited: {total_invited}</li>
  <li>Accepted: {accepted_count}</li>
  <li>Pending: {pending_count}</li>
</ul>
<p>When they finish their sessions, you'll get one email per person with their executive report.</p>
<p><a href="{dashboard_url}" class="cta">View team dashboard</a></p>`,
  },

  // ============================================================================
  // 4. CASE ASSIGNED — empleado recibe asignación nueva
  // ============================================================================
  case_assigned: {
    // Subject corto a propósito: {case_title} puede ser largo y el límite es 60.
    subject: "Your Itera case: {case_title}",
    preheader: "About {duration_min} minutes. Do it when you have a quiet block.",
    body_text: `Hi {full_name},

{manager_name} assigned you a case for the team's AI assessment:

Case: {case_title}
Estimated time: about {duration_min} minutes
Best done without interruptions

Do it when you have a quiet block. Once you start, finish it without long breaks. The system measures how you decide under real pressure, so interruptions distort the result.

Start case: {case_url}

If you need more time or have questions, reply to {manager_email}.

— Itera`,
    body_html: `<p>Hi <strong>{full_name}</strong>,</p>
<p><strong>{manager_name}</strong> assigned you a case for the team's AI assessment:</p>
<ul>
  <li><strong>Case:</strong> {case_title}</li>
  <li><strong>Estimated time:</strong> about {duration_min} minutes</li>
  <li>Best done without interruptions</li>
</ul>
<p>Do it when you have a quiet block. Once you start, finish it without long breaks. The system measures how you decide under real pressure, so interruptions distort the result.</p>
<p><a href="{case_url}" class="cta">Start case</a></p>
<p style="color:#777">If you need more time or have questions, reply to {manager_email}.</p>`,
  },

  // ============================================================================
  // 5. REPORT READY EMPLOYEE — tu reporte está listo
  // ============================================================================
  report_ready_employee: {
    subject: "Your Itera report is ready",
    preheader:
      "Overall band {overall_band}. Suggested practice based on the gaps we found.",
    body_text: `Hi {full_name},

Your Itera session report is ready.

Itera measured your judgment when you use AI, not your knowledge of AI. The report turns that measurement into a band per dimension plus a recommendation your manager can act on.

Executive summary:
- Overall band: {overall_band}
- Dimensions assessed: context, data handling, AI execution, verification, judgment, impact
- Recommendation: {recommendation_action}

One thing worth knowing: the assessment measured your judgment without teaching you the answers. The targeted practice comes after, not during. Each practice takes about 2 minutes and closes one specific gap.

View full report: {report_url}
Start suggested practice: {practice_url}

Your report is confidential between you and your authorized manager.

— Itera`,
    body_html: `<p>Hi <strong>{full_name}</strong>,</p>
<p>Your Itera session report is ready.</p>
<p>Itera measured your <strong>judgment</strong> when you use AI, not your knowledge of AI. The report turns that measurement into a band per dimension plus a recommendation your manager can act on.</p>
<p><strong>Executive summary:</strong></p>
<ul>
  <li><strong>Overall band:</strong> {overall_band}</li>
  <li><strong>Dimensions assessed:</strong> context, data handling, AI execution, verification, judgment, impact</li>
  <li><strong>Recommendation:</strong> {recommendation_action}</li>
</ul>
<p><strong>One thing worth knowing:</strong> the assessment measured your judgment without teaching you the answers. The targeted practice comes after, not during. Each practice takes about 2 minutes and closes one specific gap.</p>
<p><a href="{report_url}" class="cta">View full report</a></p>
<p><a href="{practice_url}" class="cta-secondary">Start suggested practice</a></p>
<p style="color:#777">Your report is confidential between you and your authorized manager.</p>`,
  },

  // ============================================================================
  // 6. REPORT READY MANAGER — reporte de un empleado listo
  // ============================================================================
  report_ready_manager: {
    subject: "{employee_name}'s report is ready: {recommendation_action}",
    preheader: "Overall band {overall_band}. Suggested action for the next 7 days.",
    body_text: `Hi {manager_name},

{employee_name} finished the "{case_title}" case in {duration_min} minutes.

Executive summary:
- Overall band: {overall_band}
- Risk events: {risk_event_count} ({risk_high_count} high severity)
- Recommendation: {recommendation_action}

{pending_review_disclaimer_if_high}

Next steps suggested by the judge (visible in the full report):
{next_actions_preview}

View full report: {report_url}
Team dashboard: {dashboard_url}

The report includes a downloadable PDF and a shareable link (valid 30 days) if you need to share it internally with your CEO or CHRO.

— Itera`,
    body_html: `<p>Hi <strong>{manager_name}</strong>,</p>
<p><strong>{employee_name}</strong> finished the "<em>{case_title}</em>" case in {duration_min} minutes.</p>
<p><strong>Executive summary:</strong></p>
<ul>
  <li><strong>Overall band:</strong> {overall_band}</li>
  <li><strong>Risk events:</strong> {risk_event_count} ({risk_high_count} high severity)</li>
  <li><strong>Recommendation:</strong> {recommendation_action}</li>
</ul>
<p>{pending_review_disclaimer_if_high}</p>
<p><strong>Next steps suggested by the judge:</strong></p>
<p>{next_actions_preview}</p>
<p><a href="{report_url}" class="cta">View full report</a></p>
<p><a href="{dashboard_url}" class="cta-secondary">Team dashboard</a></p>
<p style="color:#777">The report includes a downloadable PDF and a shareable link (valid 30 days) if you need to share it internally with your CEO or CHRO.</p>`,
  },

  // ============================================================================
  // 7. SPRINT CLOSING — el sprint termina en X días
  // ============================================================================
  sprint_closing: {
    subject: "Your Itera sprint closes in {days_left} days",
    preheader: "{completed_count}/{total_count} finished. {pending_count} still pending.",
    body_text: `Hi {manager_name},

The {team_name} assessment sprint ends in {days_left} days ({end_date}).

Current status:
- Completed: {completed_count}/{total_count}
- In progress: {in_progress_count}
- Pending: {pending_count}

{pending_employees_list_if_any}

Once the sprint closes, you'll get:
1. The team dashboard
2. A specific recommendation per person (Pilot / Coach / Pause / Escalate)
3. A Phase 2 sprint plan if you decide to continue with practice and re-simulation

Current dashboard: {dashboard_url}

If you need to extend the sprint or have questions, reply to this email.

— Itera`,
    body_html: `<p>Hi <strong>{manager_name}</strong>,</p>
<p>The <strong>{team_name}</strong> assessment sprint ends in <strong>{days_left} days</strong> ({end_date}).</p>
<p><strong>Current status:</strong></p>
<ul>
  <li>Completed: {completed_count}/{total_count}</li>
  <li>In progress: {in_progress_count}</li>
  <li>Pending: {pending_count}</li>
</ul>
<p>{pending_employees_list_if_any}</p>
<p><strong>Once the sprint closes, you'll get:</strong></p>
<ol>
  <li>The team dashboard</li>
  <li>A specific recommendation per person (Pilot / Coach / Pause / Escalate)</li>
  <li>A Phase 2 sprint plan if you decide to continue with practice and re-simulation</li>
</ol>
<p><a href="{dashboard_url}" class="cta">Current dashboard</a></p>`,
  },

  // ============================================================================
  // 8. ASSESSMENT REMINDER — el manager empuja a quien no ha empezado o está
  // estancado (botón "Remind" del dashboard /staff → POST /api/notifications/remind)
  // ============================================================================
  assessment_reminder: {
    subject: "Your Itera assessment is waiting",
    preheader:
      "{manager_name} asked for an update. The session takes about 20 minutes.",
    body_text: `Hi {full_name},

Quick reminder: your Itera assessment for the {team_name} team is still waiting.

{manager_name} is tracking completion and your session is one of the missing ones.

What it is: a 20 minute session where you work a real case and show how you decide when you use AI under pressure. Do it when you have a quiet block. Once you start, finish it without long breaks.

Start your assessment: {dashboard_url}

If something is blocking you, reply to this email.

— Itera`,
    body_html: `<p>Hi <strong>{full_name}</strong>,</p>
<p>Quick reminder: your Itera assessment for the <strong>{team_name}</strong> team is still waiting.</p>
<p><strong>{manager_name}</strong> is tracking completion and your session is one of the missing ones.</p>
<p><strong>What it is:</strong> a 20 minute session where you work a real case and show how you decide when you use AI under pressure. Do it when you have a quiet block. Once you start, finish it without long breaks.</p>
<p><a href="{dashboard_url}" class="cta">Start your assessment</a></p>
<p style="color:#777">If something is blocking you, reply to this email.</p>`,
  },

  // ============================================================================
  // 9. PASSWORD RESET — flujo standard Supabase
  // ============================================================================
  password_reset: {
    subject: "Reset your Itera password",
    preheader: "The link is valid for 1 hour. If this wasn't you, ignore this email.",
    body_text: `Hi,

We received a request to reset the password for your Itera account ({email}).

If this was you, reset it here: {reset_url}

The link is valid for 1 hour. If this wasn't you, ignore this email. Your password stays the same.

— Itera`,
    body_html: `<p>Hi,</p>
<p>We received a request to reset the password for your Itera account (<strong>{email}</strong>).</p>
<p>If this was you, reset it here:</p>
<p><a href="{reset_url}" class="cta">Reset password</a></p>
<p style="color:#777">The link is valid for <strong>1 hour</strong>. If this wasn't you, ignore this email. Your password stays the same.</p>`,
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
  assessment_reminder: [
    "full_name",
    "manager_name",
    "team_name",
    "dashboard_url",
  ],
  password_reset: ["email", "reset_url"],
} as const;

// ============================================================================
// Footer común a todos los emails
// ============================================================================
// Las direcciones @itera.la son buzones reales: no renombrar a support@/privacy@
// sin confirmar que existen. Migración de buzones = decisión de infra.
export const emailCommonFooter = {
  signature: "Itera · The Simulator",
  contact_line: "soporte@itera.la · privacidad@itera.la",
  jurisdiction_disclaimer:
    "You received this email because your organization purchased a Sprint with Itera or because you signed up for the public field test. We don't send third-party marketing. Manage preferences: {preferences_url}",
  legal_link_label: "Privacy policy",
  unsubscribe_label: "Unsubscribe (non-transactional emails only)",
};
