/**
 * PATCH /api/admin/leads/[lead_id]
 *
 * Actualiza status/notas/owner de un lead comercial. Staff-only.
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lead_id: string }> },
) {
  const { lead_id } = await params;
  const staff = await requireStaff();
  if (!staff.ok) return staff.response;

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.status !== undefined) {
    if (!VALID_STATUS.has(body.status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
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
      { error: "No se pudo actualizar el lead." },
      { status: 500 },
    );
  }
  if (!updated) {
    return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item: updated });
}
