import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const COMPLETED_SESSION_STATUSES = new Set([
  "completed",
  "submitted",
  "evaluated",
  "evidence_emitted",
]);

const ACTIVE_SESSION_STATUSES = new Set([
  "in_progress",
  "paused",
  "not_started",
]);

export type CaseDestinationAction = "play" | "report";

export interface CaseDestination {
  case_id: string;
  action: CaseDestinationAction;
  href: string;
  session_id: string | null;
  session_status: string | null;
  report_status: string | null;
  case_template_id: string | null;
  case_variant_id: string | null;
  reason:
    | "active_session"
    | "completed_with_report"
    | "completed_waiting_report"
    | "not_started"
    | "case_not_found";
}

export interface CaseDestinationFailure {
  status: 401 | 500;
  error: string;
}

type CaseDestinationResult = CaseDestination | CaseDestinationFailure;

function playDestination(caseId: string, reason: CaseDestination["reason"]): CaseDestination {
  return {
    case_id: caseId,
    action: "play",
    href: `/case/${caseId}`,
    session_id: null,
    session_status: null,
    report_status: null,
    case_template_id: null,
    case_variant_id: null,
    reason,
  };
}

export async function resolveCaseDestination(
  caseId: string,
): Promise<CaseDestinationResult> {
  const caseSlug = caseId.trim();
  if (!caseSlug) return playDestination(caseSlug, "case_not_found");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: 401, error: "Not signed in." };
  }

  const admin = createAdminClient();
  const { data: simUser } = await admin
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!simUser) {
    return { status: 500, error: "Bridge user not initialized." };
  }

  const { data: viewerOrgs } = await admin
    .schema("simulador")
    .from("organization_memberships")
    .select("organization_id")
    .eq("user_id", simUser.id);
  const viewerOrgIds = (viewerOrgs ?? [])
    .map((row) => row.organization_id as string)
    .filter(Boolean);

  let templateQuery = admin
    .schema("simulador")
    .from("case_templates")
    .select("id, slug, organization_id")
    .eq("slug", caseSlug)
    .eq("status", "active");

  templateQuery = viewerOrgIds.length
    ? templateQuery.or(
        `organization_id.is.null,organization_id.in.(${viewerOrgIds.join(",")})`,
      )
    : templateQuery.is("organization_id", null);

  const { data: caseTemplate } = await templateQuery
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!caseTemplate) return playDestination(caseSlug, "case_not_found");

  const { data: variant } = await admin
    .schema("simulador")
    .from("case_variants")
    .select("id")
    .eq("case_template_id", caseTemplate.id)
    .eq("variant_role", "primary")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!variant) return playDestination(caseSlug, "case_not_found");

  const { data: session } = await admin
    .schema("simulador")
    .from("simulation_sessions")
    .select("id, status, started_at, completed_at, last_event_at")
    .eq("user_id", simUser.id)
    .eq("case_variant_id", variant.id)
    .order("last_event_at", { ascending: false, nullsFirst: false })
    .order("completed_at", { ascending: false, nullsFirst: false })
    .order("started_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const base = {
    case_id: caseSlug,
    session_id: (session?.id as string | undefined) ?? null,
    session_status: (session?.status as string | undefined) ?? null,
    case_template_id: caseTemplate.id as string,
    case_variant_id: variant.id as string,
  };

  if (!session || ACTIVE_SESSION_STATUSES.has(session.status as string)) {
    return {
      ...base,
      action: "play",
      href: `/case/${caseSlug}`,
      report_status: null,
      reason: session ? "active_session" : "not_started",
    };
  }

  if (!COMPLETED_SESSION_STATUSES.has(session.status as string)) {
    return {
      ...base,
      action: "play",
      href: `/case/${caseSlug}`,
      report_status: null,
      reason: "active_session",
    };
  }

  const { data: report } = await admin
    .schema("simulador")
    .from("reports")
    .select("id, status")
    .eq("simulation_session_id", session.id)
    .eq("report_type", "participant_mirror")
    .order("generated_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  return {
    ...base,
    action: "report",
    href: `/report/${session.id}`,
    report_status: (report?.status as string | undefined) ?? null,
    reason: report ? "completed_with_report" : "completed_waiting_report",
  };
}
