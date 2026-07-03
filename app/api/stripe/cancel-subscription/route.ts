import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/config";
import { enforceRateLimit, rateLimiters } from "@/lib/ratelimit";

/**
 * POST /api/stripe/cancel-subscription — cancelación in-app (F3).
 *
 * Complementa el portal de Stripe con un flujo propio: el org_admin cancela sin
 * salir de Itera. Cancela AL FIN DEL PERIODO (`cancel_at_period_end`), así el
 * equipo conserva acceso hasta la fecha ya pagada — nunca corta sesiones en
 * curso. El flip final de `status` lo hace el webhook
 * `customer.subscription.deleted` cuando Stripe cierra el periodo (R-02, F5).
 *
 * Guarda el motivo (opcional) en subscription.metadata para el funnel de
 * retención. Idempotente: cancelar dos veces devuelve el mismo estado.
 *
 * Body: { reason?: string }
 * 200 { canceled_at_period_end, access_until } · 403 no org_admin · 400 sin sub.
 */
export async function POST(req: NextRequest) {
  try {
    const blocked = await enforceRateLimit(req, rateLimiters.standard);
    if (blocked) return blocked;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: bridgeId, error: bridgeError } = await admin
      .schema("simulador")
      .rpc("ensure_bridge_user", { p_auth_user_id: user.id });

    if (bridgeError || !bridgeId) {
      console.error("[cancel-subscription] ensure_bridge_user failed", bridgeError);
      return NextResponse.json(
        { error: "No pudimos sincronizar tu cuenta." },
        { status: 500 },
      );
    }

    const { data: membership } = await admin
      .schema("simulador")
      .from("organization_memberships")
      .select("organization_id")
      .eq("user_id", bridgeId)
      .eq("role", "org_admin")
      .limit(1)
      .maybeSingle();

    if (!membership?.organization_id) {
      return NextResponse.json(
        { error: "Solo un administrador de la organización puede cancelar." },
        { status: 403 },
      );
    }

    const { data: subscription } = await admin
      .schema("simulador")
      .from("subscriptions")
      .select("id, stripe_subscription_id, status, current_period_end, metadata")
      .eq("organization_id", membership.organization_id)
      .in("status", ["active", "trial"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No hay una suscripción activa que cancelar." },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { reason?: unknown };
    const reason =
      typeof body.reason === "string" ? body.reason.trim().slice(0, 500) : null;

    // Cancelar al fin del periodo en Stripe (fuente de verdad del billing).
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
      ...(reason ? { metadata: { itera_cancel_reason: reason } } : {}),
    });

    // El acceso corre hasta el fin del periodo ya registrado localmente (el
    // webhook `customer.subscription.updated/deleted` reconcilia la fecha
    // exacta si Stripe la ajusta). Evitamos leerla del response del SDK porque
    // su tipo no la expone consistentemente entre versiones de API.
    const accessUntil =
      (subscription.current_period_end as string | null) ?? null;

    // Reflejar la intención localmente (el webhook confirma el cierre final).
    const nextMetadata = {
      ...((subscription.metadata as Record<string, unknown>) ?? {}),
      cancel_at_period_end: true,
      canceled_reason: reason,
    };
    await admin
      .schema("simulador")
      .from("subscriptions")
      .update({ metadata: nextMetadata })
      .eq("id", subscription.id);

    return NextResponse.json({
      canceled_at_period_end: true,
      access_until: accessUntil,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    console.error("[cancel-subscription] failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
