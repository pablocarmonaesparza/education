/**
 * PATCH /api/admin/leads/[lead_id]
 *
 * Actualiza status/notas/owner de un lead comercial. Staff-only.
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

interface PatchBody {
  status?: LeadStatus;
  notes?: string | null;
  assign_to_me?: boolean;
}

function cleanNotes(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 4000);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> },
) {
  const { lead_id } = await params;
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;
  if (!staff.user) {
    return NextResponse.json(
      { error: "This action requires a real staff session." },
      { status: 401 },
    );
  }

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }

  const notes = cleanNotes(body.notes);
  if (notes !== undefined) patch.notes = notes;

  const admin = createAdminClient();
  if (body.assign_to_me) {
    const { data: bridgeUser, error: bridgeError } = await admin
      .schema("simulador")
      .from("users")
      .select("id")
      .eq("auth_user_id", staff.user.id)
      .maybeSingle();

    if (bridgeError) {
      console.warn("[admin/leads] bridge user lookup failed", bridgeError);
    }
    patch.owner_user_id = bridgeUser?.id ?? null;
  }

  const { data: updated, error } = await admin
    .schema("simulador")
    .from("leads_inbox")
    .update(patch)
    .eq("id", lead_id)
    .select(
      "id, source, field_test_session_id, name, email, company, role, team_size, status, owner_user_id, notes, metadata_json, created_at, updated_at",
    )
    .maybeSingle();

  if (error) {
    console.error("[admin/leads] update failed", error);
    return NextResponse.json(
      { error: "Could not update the lead." },
      { status: 500 },
    );
  }
  if (!updated) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: updated });
}
