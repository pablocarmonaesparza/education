/**
 * GET /api/admin/leads
 *
 * Bandeja interna de leads del field-test y fuentes comerciales futuras.
 * Solo staff Itera puede leerla. El endpoint usa service role porque
 * `leads_inbox` es intentionally staff-only y no expone RLS al cliente.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffEmail } from "@/lib/simulador/is-staff";

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

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "No autenticado." }, { status: 401 }),
    };
  }
  if (!isStaffEmail(user.email)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Acceso restringido a staff de Itera." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, user };
}

export async function GET(req: NextRequest) {
  const staff = await requireStaff();
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

  const summary = rows.reduce(
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

  return NextResponse.json({
    items: rows.map((lead) => ({
      ...lead,
      field_test_session: lead.field_test_session_id
        ? sessionsById.get(lead.field_test_session_id) ?? null
        : null,
    })),
    summary,
  });
}
