import {
  getAgentMail,
  getDefaultInboxId,
  getReplyToAddress,
} from "@/lib/email/agentmail";
import {
  emailCommonFooter,
  emailTemplateVars,
  emailTemplates,
  type EmailTemplate,
} from "@/lib/simulador/copy/emails";

type TemplateValue = string | number | boolean | null | undefined;
type TemplateVars = Record<string, TemplateValue>;
type SendResult = { ok: true; id: string } | { ok: false; reason: string };

interface SendSimuladorTemplateArgs {
  to: string;
  template: EmailTemplate;
  variables: TemplateVars;
  replyTo?: string;
  labels?: string[];
}

interface RenderedSimuladorEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
}

export async function sendSimuladorTemplate({
  to,
  template,
  variables,
  replyTo,
  labels = [],
}: SendSimuladorTemplateArgs): Promise<SendResult> {
  const client = getAgentMail();
  const inboxId = getDefaultInboxId();
  if (!client || !inboxId) {
    console.warn(
      `[email/simulador] AgentMail no configurado; skipping ${template}`,
    );
    return { ok: false, reason: "not_configured" };
  }

  const rendered = renderSimuladorTemplate(template, variables);
  if (!rendered.ok) return { ok: false, reason: rendered.reason };

  try {
    const response = await client.inboxes.messages.send(inboxId, {
      to: [to],
      replyTo: [replyTo ?? getReplyToAddress()],
      subject: rendered.email.subject,
      html: rendered.email.html,
      text: rendered.email.text,
      labels: [`kind:simulador_${template}`, ...labels],
    });

    const id =
      (response as { messageId?: string; id?: string })?.messageId ??
      (response as { id?: string })?.id ??
      "unknown";

    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(`[email/simulador] ${template} error:`, message);
    return { ok: false, reason: message };
  }
}

export function renderSimuladorTemplate(
  template: EmailTemplate,
  variables: TemplateVars,
):
  | { ok: true; email: RenderedSimuladorEmail }
  | { ok: false; reason: string } {
  const definition = emailTemplates[template];
  const missing = (emailTemplateVars[template] as readonly string[]).filter(
    (key) => variables[key] === undefined || variables[key] === null,
  );

  if (missing.length > 0) {
    return {
      ok: false,
      reason: `missing_vars:${missing.join(",")}`,
    };
  }

  const subject = replacePlaceholders(definition.subject, variables, "text");
  const preheader = replacePlaceholders(
    definition.preheader,
    variables,
    "text",
  );
  const text = `${replacePlaceholders(definition.body_text, variables, "text")}

${emailCommonFooter.signature}
${emailCommonFooter.contact_line}
${replacePlaceholders(emailCommonFooter.jurisdiction_disclaimer, {
  ...variables,
  preferences_url:
    variables.preferences_url ?? `${variables.app_url ?? "https://www.itera.la"}/privacy`,
}, "text")}`;

  const bodyHtml = replacePlaceholders(
    definition.body_html,
    variables,
    "html",
  );

  return {
    ok: true,
    email: {
      subject,
      preheader,
      text,
      html: wrapHtml(preheader, bodyHtml, variables),
    },
  };
}

export function sendSignupWelcomeEmail(args: {
  to: string;
  fullName: string;
  onboardingUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "signup_welcome",
    variables: {
      full_name: args.fullName,
      onboarding_url: args.onboardingUrl,
    },
  });
}

export function sendInvitationEmail(args: {
  to: string;
  inviterName: string;
  inviterRole: string;
  teamName: string;
  orgName: string;
  acceptUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "invitation",
    variables: {
      inviter_name: args.inviterName,
      inviter_role: args.inviterRole,
      team_name: args.teamName,
      org_name: args.orgName,
      accept_url: args.acceptUrl,
    },
  });
}

export function sendInvitationAcceptedEmail(args: {
  to: string;
  inviterName: string;
  inviteeName: string;
  inviteeEmail: string;
  totalInvited: number;
  acceptedCount: number;
  pendingCount: number;
  dashboardUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "invitation_accepted",
    variables: {
      inviter_name: args.inviterName,
      invitee_name: args.inviteeName,
      invitee_email: args.inviteeEmail,
      total_invited: args.totalInvited,
      accepted_count: args.acceptedCount,
      pending_count: args.pendingCount,
      dashboard_url: args.dashboardUrl,
    },
  });
}

export function sendCaseAssignedEmail(args: {
  to: string;
  fullName: string;
  managerName: string;
  managerEmail: string;
  caseTitle: string;
  durationMin: number;
  caseUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "case_assigned",
    variables: {
      full_name: args.fullName,
      manager_name: args.managerName,
      manager_email: args.managerEmail,
      case_title: args.caseTitle,
      duration_min: args.durationMin,
      case_url: args.caseUrl,
    },
  });
}

export function sendReportReadyEmployeeEmail(args: {
  to: string;
  fullName: string;
  overallBand: string;
  recommendationAction: string;
  reportUrl: string;
  practiceUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "report_ready_employee",
    variables: {
      full_name: args.fullName,
      overall_band: args.overallBand,
      recommendation_action: args.recommendationAction,
      report_url: args.reportUrl,
      practice_url: args.practiceUrl,
    },
  });
}

export function sendReportReadyManagerEmail(args: {
  to: string;
  managerName: string;
  employeeName: string;
  caseTitle: string;
  durationMin: number;
  overallBand: string;
  riskEventCount: number;
  riskHighCount: number;
  recommendationAction: string;
  pendingReviewDisclaimerIfHigh: string;
  nextActionsPreview: string;
  reportUrl: string;
  dashboardUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "report_ready_manager",
    variables: {
      manager_name: args.managerName,
      employee_name: args.employeeName,
      case_title: args.caseTitle,
      duration_min: args.durationMin,
      overall_band: args.overallBand,
      risk_event_count: args.riskEventCount,
      risk_high_count: args.riskHighCount,
      recommendation_action: args.recommendationAction,
      pending_review_disclaimer_if_high: args.pendingReviewDisclaimerIfHigh,
      next_actions_preview: args.nextActionsPreview,
      report_url: args.reportUrl,
      dashboard_url: args.dashboardUrl,
    },
  });
}

export function sendSprintClosingEmail(args: {
  to: string;
  managerName: string;
  teamName: string;
  daysLeft: number;
  endDate: string;
  completedCount: number;
  totalCount: number;
  inProgressCount: number;
  pendingCount: number;
  pendingEmployeesListIfAny: string;
  dashboardUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "sprint_closing",
    variables: {
      manager_name: args.managerName,
      team_name: args.teamName,
      days_left: args.daysLeft,
      end_date: args.endDate,
      completed_count: args.completedCount,
      total_count: args.totalCount,
      in_progress_count: args.inProgressCount,
      pending_count: args.pendingCount,
      pending_employees_list_if_any: args.pendingEmployeesListIfAny,
      dashboard_url: args.dashboardUrl,
    },
  });
}

// Recordatorio manual del manager (botón "Remind" del dashboard /staff).
// Mismo transporte AgentMail que el resto de transaccionales.
export function sendAssessmentReminderEmail(args: {
  to: string;
  fullName: string;
  managerName: string;
  teamName: string;
  dashboardUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "assessment_reminder",
    variables: {
      full_name: args.fullName,
      manager_name: args.managerName,
      team_name: args.teamName,
      dashboard_url: args.dashboardUrl,
    },
  });
}

export function sendPasswordResetSimuladorEmail(args: {
  to: string;
  email: string;
  resetUrl: string;
}) {
  return sendSimuladorTemplate({
    to: args.to,
    template: "password_reset",
    variables: {
      email: args.email,
      reset_url: args.resetUrl,
    },
  });
}

function replacePlaceholders(
  input: string,
  variables: TemplateVars,
  mode: "html" | "text",
): string {
  return input.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const value = variables[key];
    if (value === undefined || value === null) return match;
    const stringValue = String(value);
    return mode === "html" ? escapeHtml(stringValue) : stringValue;
  });
}

function wrapHtml(
  preheader: string,
  bodyHtml: string,
  variables: TemplateVars,
): string {
  const privacyUrl = String(
    variables.privacy_url ?? `${variables.app_url ?? "https://www.itera.la"}/privacy`,
  );
  const preferencesUrl = String(
    variables.preferences_url ?? `${variables.app_url ?? "https://www.itera.la"}/privacy`,
  );
  const disclaimer = replacePlaceholders(
    emailCommonFooter.jurisdiction_disclaimer,
    {
      ...variables,
      preferences_url: preferencesUrl,
    },
    "html",
  );

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(preheader)}</title>
  <style>
    .cta, .cta-secondary {
      display: inline-block;
      margin: 12px 8px 12px 0;
      padding: 12px 18px;
      border-radius: 999px;
      font-weight: 600;
      text-decoration: none;
    }
    .cta { background: #1472FF; color: #ffffff !important; }
    .cta-secondary { border: 1px solid #d1d5db; color: #111827 !important; }
    p, li { font-size: 15px; line-height: 1.6; color: #3f3f46; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <main style="max-width:560px;margin:32px auto;padding:0 16px;">
    <section style="background:#ffffff;border:1px solid #e5e7eb;border-radius:24px;padding:32px;">
      <div style="color:#1472FF;font-weight:700;font-size:15px;margin-bottom:24px;">itera</div>
      ${bodyHtml}
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 20px;">
      <p style="font-size:13px;color:#71717a;margin:0;">${escapeHtml(emailCommonFooter.signature)}</p>
      <p style="font-size:13px;color:#71717a;margin:6px 0 0;">${escapeHtml(emailCommonFooter.contact_line)}</p>
      <p style="font-size:12px;color:#8a8a91;margin:18px 0 0;">${disclaimer}</p>
      <p style="font-size:12px;color:#8a8a91;margin:8px 0 0;">
        <a href="${escapeAttribute(privacyUrl)}" style="color:#1472FF;">${escapeHtml(emailCommonFooter.legal_link_label)}</a>
      </p>
    </section>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
