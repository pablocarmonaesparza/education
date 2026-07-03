/**
 * GET /api/admin/leads
 *
 * Bandeja interna de leads del field-test y fuentes comerciales futuras.
 * Solo staff Itera puede leerla. El endpoint usa service role porque
 * `leads_inbox` es intentionally staff-only y no expone RLS al cliente.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

const VALID_STATUS = new Set([
  "new",
  "qualified",
  "contacted",
  "converted",
  "lost",
  "archived",
]);

type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "converted"
  | "lost"
  | "archived";

interface LeadsInboxRow {
  id: string;
  source: string;
  field_test_lead_id: string | null;
  field_test_session_id: string | null;
  name: string | null;
  email: string;
  company: string | null;
  role: string | null;
  team_size: string | null;
  status: LeadStatus;
  owner_user_id: string | null;
  notes: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface FieldTestSessionRow {
  id: string;
  case_slug: string;
  status: string;
  report_status: string;
  started_at: string;
  completed_at: string | null;
}

interface FunnelSessionRow {
  id: string;
  status: string;
  report_status: string;
  completed_at: string | null;
  last_event_at: string;
  created_at: string;
}

interface FunnelEventRow {
  field_test_session_id: string;
  event_type: string;
}

export async function GET(req: NextRequest) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(req.url);
  const requestedStatus = searchParams.get("status");
  const status =
    requestedStatus && VALID_STATUS.has(requestedStatus)
      ? requestedStatus
      : null;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "100") || 100, 1),
    200,
  );

  const admin = createAdminClient();
  let query = admin
    .schema("simulador")
    .from("leads_inbox")
    .select(
      "id, source, field_test_lead_id, field_test_session_id, name, email, company, role, team_size, status, owner_user_id, notes, metadata_json, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  const { data: leads, error } = await query;
  if (error) {
    console.error("[admin/leads] list failed", error);
    return NextResponse.json(
      { error: "Error listando leads." },
      { status: 500 },
    );
  }

  const rows = (leads ?? []) as LeadsInboxRow[];
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: allLeadRows }, { data: funnelSessions }, { data: funnelEvents }] =
    await Promise.all([
      admin
        .schema("simulador")
        .from("leads_inbox")
        .select("status, created_at")
        .gte("created_at", since),
      admin
        .schema("simulador")
        .from("field_test_sessions")
        .select("id, status, report_status, completed_at, last_event_at, created_at")
        .gte("created_at", since),
      admin
        .schema("simulador")
        .from("field_test_step_events")
        .select("field_test_session_id, event_type")
        .gte("captured_at", since)
        .in("event_type", [
          "field_test_started",
          "section_completed",
          "abandoned",
          "submitted",
          "report_viewed",
          "lead_captured",
        ]),
    ]);

  const sessionIds = [
    ...new Set(
      rows
        .map((lead) => lead.field_test_session_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const sessionsById = new Map<string, FieldTestSessionRow>();
  if (sessionIds.length > 0) {
    const { data: sessions, error: sessionError } = await admin
      .schema("simulador")
      .from("field_test_sessions")
      .select(
        "id, case_slug, status, report_status, started_at, completed_at",
      )
      .in("id", sessionIds);

    if (sessionError) {
      console.warn("[admin/leads] session enrichment failed", sessionError);
    } else {
      for (const session of (sessions ?? []) as FieldTestSessionRow[]) {
        sessionsById.set(session.id, session);
      }
    }
  }

  const allLeadStatusRows = (allLeadRows ?? []) as Array<{
    status: LeadStatus;
    created_at: string;
  }>;

  const summary = allLeadStatusRows.reduce(
    (acc, lead) => {
      acc.total += 1;
      acc.by_status[lead.status] = (acc.by_status[lead.status] ?? 0) + 1;
      return acc;
    },
    {
      total: 0,
      by_status: {
        new: 0,
        qualified: 0,
        contacted: 0,
        converted: 0,
        lost: 0,
        archived: 0,
      } as Record<LeadStatus, number>,
    },
  );

  const funnel = buildFunnelSummary({
    sessions: (funnelSessions ?? []) as FunnelSessionRow[],
    events: (funnelEvents ?? []) as FunnelEventRow[],
    leadsCount: allLeadStatusRows.length,
  });

  return NextResponse.json({
    items: rows.map((lead) => ({
      ...lead,
      field_test_session: lead.field_test_session_id
        ? sessionsById.get(lead.field_test_session_id) ?? null
        : null,
    })),
    summary: { ...summary, funnel },
  });
}

function buildFunnelSummary(input: {
  sessions: FunnelSessionRow[];
  events: FunnelEventRow[];
  leadsCount: number;
}) {
  const eventSessionIds = (eventName: string) =>
    new Set(
      input.events
        .filter((event) => event.event_type === eventName)
        .map((event) => event.field_test_session_id),
    );

  const started = new Set(input.sessions.map((session) => session.id));
  const submitted = eventSessionIds("submitted");
  for (const session of input.sessions) {
    if (session.completed_at || ["submitted", "evaluating", "published"].includes(session.status)) {
      submitted.add(session.id);
    }
  }

  const reportViewed = eventSessionIds("report_viewed");
  const explicitAbandoned = eventSessionIds("abandoned");
  const staleCutoff = Date.now() - 30 * 60 * 1000;
  const inferredAbandoned = input.sessions.filter((session) => {
    if (session.status !== "in_progress") return false;
    const lastEventAt = new Date(session.last_event_at).getTime();
    return Number.isFinite(lastEventAt) && lastEventAt < staleCutoff;
  }).length;

  const starts = started.size;
  const submissions = submitted.size;
  const reportViews = reportViewed.size;
  const leads = input.leadsCount;

  return {
    window_days: 30,
    started: starts,
    submitted: submissions,
    report_viewed: reportViews,
    lead_captured: leads,
    abandoned: Math.max(explicitAbandoned.size, inferredAbandoned),
    submit_rate: rate(submissions, starts),
    report_to_lead_rate: rate(leads, reportViews),
    start_to_lead_rate: rate(leads, starts),
  };
}

function rate(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}
