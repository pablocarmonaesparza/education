/**
 * POST /api/orgs
 *
 * Crea una organización y asigna al user autenticado como org_admin.
 * Usado en el flow de onboarding B2B (buyer crea su organización).
 *
 * Body: { name: string, industry?: string, region?: string, company_size_key?: string }
 * Respuesta:
 *   200 { id, name, ... }
 *   400 { error } — body inválido
 *   401 { error } — no autenticado
 *   500 { error } — error de BD
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: {
    name?: string;
    industry?: string;
    region?: string;
    company_size_key?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const name = body.name?.trim();
  if (!name || name.length < 2) {
    return NextResponse.json(
      { error: "El nombre de la organización debe tener al menos 2 caracteres." },
      { status: 400 },
    );
  }

  // Resolver simulador.users.id del auth user.
  const { data: simUser, error: simUserError } = await supabase
    .schema("simulador")
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (simUserError || !simUser) {
    console.error("[api/orgs] simulador.users not found for auth user:", user.id);
    return NextResponse.json(
      {
        error:
          "Bridge user no inicializado. Re-loguéate para sincronizar tu cuenta.",
      },
      { status: 500 },
    );
  }

  // Crear org + membership en transacción manual (Supabase no soporta tx
  // en cliente; usamos service-role-like: insert org, capturar id, insert
  // membership. Si falla el segundo, rollback manual del org).
  const { data: org, error: orgError } = await supabase
    .schema("simulador")
    .from("organizations")
    .insert({
      name,
      industry: body.industry ?? null,
      region: body.region ?? null,
      company_size_key: body.company_size_key ?? null,
    })
    .select("id, name, industry, region, company_size_key")
    .single();

  if (orgError || !org) {
    console.error("[api/orgs] organizations.insert failed:", orgError);
    return NextResponse.json(
      { error: "No se pudo crear la organización." },
      { status: 500 },
    );
  }

  const { error: memberError } = await supabase
    .schema("simulador")
    .from("organization_memberships")
    .insert({
      organization_id: org.id,
      user_id: simUser.id,
      role: "org_admin",
    });

  if (memberError) {
    console.error("[api/orgs] org_membership.insert failed:", memberError);
    // Rollback: borrar la org que acabamos de crear.
    await supabase
      .schema("simulador")
      .from("organizations")
      .delete()
      .eq("id", org.id);
    return NextResponse.json(
      { error: "No se pudo asignar admin a la organización." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    id: org.id,
    name: org.name,
    industry: org.industry,
    region: org.region,
    company_size_key: org.company_size_key,
  });
}
