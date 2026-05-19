import Stripe from "stripe";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/config";
import {
  computePlanAmountUsd,
  isSimuladorBillingPlan,
  SIMULADOR_PLANS,
  type SimuladorBillingPlan,
} from "@/lib/simulador/billing";

export type SimuladorPaymentSyncResult =
  | { ok: true; organizationId: string; subscriptionId: string }
  | { ok: false; reason: string };

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

function endDate(durationDays: number): string {
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
}

function metadataValue(session: Stripe.Checkout.Session, key: string) {
  return session.metadata?.[key] ?? null;
}

export function isSimuladorCheckoutSession(
  session: Stripe.Checkout.Session,
): boolean {
  return metadataValue(session, "billing_product") === "simulador_b2b";
}

export async function syncSimuladorPaymentFromSession(
  sessionId: string,
): Promise<SimuladorPaymentSyncResult> {
  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, reason: "stripe_secret_key_missing" };
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, reason: "supabase_service_role_missing" };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "stripe_retrieve_failed";
    return { ok: false, reason: message };
  }

  return upsertSimuladorSubscriptionFromCheckout(session);
}

export async function upsertSimuladorSubscriptionFromCheckout(
  session: Stripe.Checkout.Session,
): Promise<SimuladorPaymentSyncResult> {
  if (!isSimuladorCheckoutSession(session)) {
    return { ok: false, reason: "not_simulador_checkout" };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, reason: "payment_pending" };
  }

  const organizationId = metadataValue(session, "organization_id");
  const teamId = metadataValue(session, "team_id");
  const buyerUserId = metadataValue(session, "simulador_user_id");
  const rawPlan = metadataValue(session, "plan");
  const seatsFromMetadata = Number(metadataValue(session, "seats"));

  if (!organizationId || !teamId || !buyerUserId) {
    return { ok: false, reason: "missing_org_team_or_buyer_metadata" };
  }
  if (!isSimuladorBillingPlan(rawPlan)) {
    return { ok: false, reason: "invalid_plan_metadata" };
  }

  const planId: SimuladorBillingPlan = rawPlan;
  const { seats, amountUsd, amountCents, plan } = computePlanAmountUsd(
    planId,
    seatsFromMetadata,
  );
  if (
    typeof session.amount_total === "number" &&
    session.amount_total !== amountCents
  ) {
    return { ok: false, reason: "amount_mismatch" };
  }
  const admin = adminClient();
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  const payload = {
    organization_id: organizationId,
    stripe_customer_id: customerId,
    stripe_subscription_id: null,
    status: "active",
    tier: plan.subscriptionTier,
    seats,
    price_usd_total: amountUsd,
    current_period_start: new Date().toISOString(),
    current_period_end: endDate(plan.durationDays),
    metadata: {
      billing_product: "simulador_b2b",
      checkout_session_id: session.id,
      payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      plan: planId,
      plan_label: SIMULADOR_PLANS[planId].label,
      team_id: teamId,
      buyer_user_id: buyerUserId,
    },
  };

  const { data: existing } = await admin
    .schema("simulador")
    .from("subscriptions")
    .select("id")
    .eq("organization_id", organizationId)
    .filter("metadata->>checkout_session_id", "eq", session.id)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await admin
      .schema("simulador")
      .from("subscriptions")
      .update(payload)
      .eq("id", existing.id);
    if (error) {
      return { ok: false, reason: `subscription_update_failed:${error.message}` };
    }
    return { ok: true, organizationId, subscriptionId: existing.id };
  }

  const { data: created, error } = await admin
    .schema("simulador")
    .from("subscriptions")
    .insert(payload)
    .select("id")
    .single();

  if (error || !created?.id) {
    return {
      ok: false,
      reason: `subscription_insert_failed:${error?.message ?? "missing_id"}`,
    };
  }

  return { ok: true, organizationId, subscriptionId: created.id };
}
