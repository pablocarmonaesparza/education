/**
 * GET /api/admin/audit-log
 *
 * Últimas acciones privilegiadas del simulador. Staff puede filtrar por entity
 * y action para investigar cambios sin consultar la base de datos.
 */

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSimuladorStaff } from "@/lib/simulador/admin-auth";

export const runtime = "nodejs";

type AuditLogRow = {
  id: string;
  entity: string;
  entity_id: string | null;
  action: string;
  actor_id: string | null;
  before_state: unknown;
  after_state: unknown;
  occurred_at: string;
};

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
};

export async function GET(req: NextRequest) {
  const staff = await requireSimuladorStaff();
  if (!staff.ok) return staff.response;

  const { searchParams } = new URL(req.url);
  const entity = clean(searchParams.get("entity"));
  const action = clean(searchParams.get("action"));
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "150") || 150, 1),
    300,
  );

  const admin = createAdminClient();
  let query = admin
    .schema("simulador")
    .from("audit_log")
    .select(
      "id, entity, entity_id, action, actor_id, before_state, after_state, occurred_at",
    )
    .order("occurred_at", { ascending: false })
    .limit(limit);

  if (entity) query = query.eq("entity", entity);
  if (action) query = query.eq("action", action);

  const { data, error } = await query;
  if (error) {
    console.error("[admin/audit-log] list failed", error);
    return NextResponse.json(
      { error: "Error leyendo audit log." },
      { status: 500 },
    );
  }

  const rows = (data ?? []) as AuditLogRow[];
  const actorIds = [
    ...new Set(rows.map((row) => row.actor_id).filter((id): id is string => !!id)),
  ];
  const actors = new Map<string, UserRow>();

  if (actorIds.length > 0) {
    const { data: users } = await admin
      .schema("simulador")
      .from("users")
      .select("id, email, full_name")
      .in("id", actorIds);
    for (const user of (users ?? []) as UserRow[]) {
      actors.set(user.id, user);
    }
  }

  return NextResponse.json({
    items: rows.map((row) => ({
      ...row,
      actor: row.actor_id ? actors.get(row.actor_id) ?? null : null,
    })),
    summary: {
      total: rows.length,
      by_entity: countBy(rows, "entity"),
      by_action: countBy(rows, "action"),
    },
  });
}

function clean(value: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "all") return null;
  return trimmed.slice(0, 80);
}

function countBy<T extends Record<string, unknown>>(rows: T[], key: keyof T) {
  const result: Record<string, number> = {};
  for (const row of rows) {
    const value = row[key];
    const label = typeof value === "string" && value ? value : "unknown";
    result[label] = (result[label] ?? 0) + 1;
  }
  return result;
}
