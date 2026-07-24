import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendReportReadyEmployeeEmail,
  sendReportReadyManagerEmail,
} from "@/lib/email/simulador";
import {
  ACTION_DISPLAY,
  BAND_DISPLAY,
  isRecommendationAction,
  normalizeReportDimensions,
} from "@/lib/simulador/reports/model";

interface ReportPayload {
  dimensions?: Array<{
    id?: string;
    band?: string;
    rationale?: string;
    confidence?: number;
  }>;
  risk_events?: Array<{ severity?: string }>;
  recommendation?: {
    action?: string;
    next_week_actions?: string[];
  };
}

interface SendReportReadyEmailsArgs {
  simulationSessionId: string;
  reportId: string;
  payloadJson: unknown;
  appUrl?: string;
}

interface SimUser {
  id: string;
  email: string | null;
  full_name: string | null;
}

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://www.itera.la"
  );
}

function asPayload(value: unknown): ReportPayload {
  if (!value || typeof value !== "object") return {};
  return value as ReportPayload;
}

// Devuelve el label ya traducido (High/Medium/Low): el email nunca imprime el
// valor de BD crudo ("A"/"M"/"B").
function overallBand(payload: ReportPayload): string {
  if (!payload.dimensions?.some((dimension) => dimension.band)) {
    return "not scored";
  }
  const bands = normalizeReportDimensions(payload).map(
    (dimension) => dimension.band,
  );
  if (bands.includes("B")) return BAND_DISPLAY.B;
  if (bands.includes("M")) return BAND_DISPLAY.M;
  if (bands.includes("A")) return BAND_DISPLAY.A;
  return "not scored";
}

function formatNextActions(actions: string[] | undefined): string {
  const usable = (actions ?? []).filter(Boolean).slice(0, 3);
  if (usable.length === 0) {
    return "Review the full report and decide the next case in the sprint.";
  }
  return usable.map((action, index) => `${index + 1}. ${action}`).join("\n");
}

function displayName(user: Pick<SimUser, "email" | "full_name">): string {
  return user.full_name ?? user.email?.split("@")[0] ?? "participant";
}

async function getUsersByIds(ids: string[]): Promise<SimUser[]> {
  if (ids.length === 0) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .schema("simulador")
    .from("users")
    .select("id, email, full_name")
    .in("id", ids);

  return (data ?? []) as SimUser[];
}

export async function sendReportReadyEmailsForSession({
  simulationSessionId,
  reportId,
  payloadJson,
  appUrl = appOrigin(),
}: SendReportReadyEmailsArgs): Promise<void> {
  const admin = createAdminClient();
  const payload = asPayload(payloadJson);

  try {
    const { data: session } = await admin
      .schema("simulador")
      .from("simulation_sessions")
      .select("id, sprint_id, user_id, assignment_id, case_variant_id")
      .eq("id", simulationSessionId)
      .maybeSingle();

    if (!session) {
      console.warn("[email/report-ready] session not found for report", {
        reportId,
        simulationSessionId,
      });
      return;
    }

    const { data: employee } = await admin
      .schema("simulador")
      .from("users")
      .select("id, email, full_name")
      .eq("id", session.user_id)
      .maybeSingle();

    const { data: assignment } = await admin
      .schema("simulador")
      .from("assignments")
      .select("assigned_by")
      .eq("id", session.assignment_id)
      .maybeSingle();

    const { data: variant } = await admin
      .schema("simulador")
      .from("case_variants")
      .select("case_template_id")
      .eq("id", session.case_variant_id)
      .maybeSingle();

    const { data: template } = variant?.case_template_id
      ? await admin
          .schema("simulador")
          .from("case_templates")
          .select("title, duration_estimate_min")
          .eq("id", variant.case_template_id)
          .maybeSingle()
      : { data: null };

    const reportUrl = `${appUrl}/report/${simulationSessionId}`;
    const dashboardUrl = `${appUrl}/dashboard`;
    const band = overallBand(payload);
    // `action` viene del judge como valor de BD: se traduce en la capa de
    // display antes de entrar al template. El default sigue siendo 'entrenar'.
    const recommendationAction =
      ACTION_DISPLAY[
        isRecommendationAction(payload.recommendation?.action)
          ? payload.recommendation.action
          : "entrenar"
      ];
    const riskEvents = payload.risk_events ?? [];
    const riskHighCount = riskEvents.filter(
      (event) => event.severity === "high",
    ).length;
    const nextActionsPreview = formatNextActions(
      payload.recommendation?.next_week_actions,
    );
    const caseTitle = template?.title ?? "AI judgment assessment";
    const durationMin = template?.duration_estimate_min ?? 20;

    if (employee?.email) {
      const result = await sendReportReadyEmployeeEmail({
        to: employee.email,
        fullName: displayName(employee),
        overallBand: band,
        recommendationAction,
        reportUrl,
        practiceUrl: dashboardUrl,
      });
      if (!result.ok && result.reason !== "not_configured") {
        console.warn(
          "[email/report-ready] employee email failed:",
          result.reason,
        );
      }
    }

    const managerIds = new Set<string>();
    if (assignment?.assigned_by) managerIds.add(assignment.assigned_by);

    if (session.sprint_id) {
      const { data: sprint } = await admin
        .schema("simulador")
        .from("sprints")
        .select("team_id, organization_id")
        .eq("id", session.sprint_id)
        .maybeSingle();

      if (sprint?.team_id) {
        const { data: teamManagers } = await admin
          .schema("simulador")
          .from("team_memberships")
          .select("user_id")
          .eq("team_id", sprint.team_id)
          .eq("role", "manager");
        for (const row of teamManagers ?? []) managerIds.add(row.user_id);
      }

      if (sprint?.organization_id) {
        const { data: orgAdmins } = await admin
          .schema("simulador")
          .from("organization_memberships")
          .select("user_id")
          .eq("organization_id", sprint.organization_id)
          .eq("role", "org_admin");
        for (const row of orgAdmins ?? []) managerIds.add(row.user_id);
      }
    }

    managerIds.delete(session.user_id);
    const managers = await getUsersByIds([...managerIds]);
    const employeeName = employee ? displayName(employee) : "participant";
    const pendingReviewDisclaimerIfHigh =
      riskHighCount > 0
        ? "This report includes high severity events and was published after human review by Itera."
        : "No high severity events were detected.";

    for (const manager of managers) {
      if (!manager.email) continue;
      const result = await sendReportReadyManagerEmail({
        to: manager.email,
        managerName: displayName(manager),
        employeeName,
        caseTitle,
        durationMin,
        overallBand: band,
        riskEventCount: riskEvents.length,
        riskHighCount,
        recommendationAction,
        pendingReviewDisclaimerIfHigh,
        nextActionsPreview,
        reportUrl,
        dashboardUrl,
      });
      if (!result.ok && result.reason !== "not_configured") {
        console.warn(
          "[email/report-ready] manager email failed:",
          manager.email,
          result.reason,
        );
      }
    }
  } catch (err) {
    console.warn("[email/report-ready] notification flow failed:", {
      reportId,
      simulationSessionId,
      err,
    });
  }
}
