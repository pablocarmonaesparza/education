import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/config";
import {
  isTerminalSimuladorPaymentSyncReason,
  isSimuladorCheckoutSession,
  upsertSimuladorSubscriptionFromCheckout,
  mapStripeSubscriptionStatus,
  syncSimuladorSubscriptionStatus,
} from "@/lib/stripe/simuladorBilling";

export const runtime = "nodejs";

async function markEventProcessed(
  supabase: ReturnType<typeof createAdminClient>,
  event: Stripe.Event,
): Promise<boolean> {
  const { error } = await supabase.schema("simulador").from("stripe_webhook_events").insert({
    event_id: event.id,
    event_type: event.type,
  });

  if (!error) return true;
  if ((error as { code?: string }).code === "23505") return false;

  throw new Error(`stripe_webhook_events.insert failed: ${error.message}`);
}

async function releaseDedup(
  supabase: ReturnType<typeof createAdminClient>,
  event: Stripe.Event,
) {
  const { error } = await supabase
    .schema("simulador")
    .from("stripe_webhook_events")
    .delete()
    .eq("event_id", event.id);

  if (error) {
    console.error(
      `[CRITICAL] stripe-webhook ${event.id} (${event.type}) falló y no pudimos liberar dedup. El retry puede perderse: ${error.message}`,
    );
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse("Stripe webhook secret not set.", { status: 500 });
  }

  const buf = await req.arrayBuffer();
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  const isNew = await markEventProcessed(supabase, event);
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!isSimuladorCheckoutSession(session)) {
        console.warn(
          `[stripe-webhook] checkout ${session.id} ignorado: billing_product no es simulador_b2b`,
        );
        return NextResponse.json({ received: true, ignored: true });
      }

      const result = await upsertSimuladorSubscriptionFromCheckout(session);
      if (!result.ok) {
        if (isTerminalSimuladorPaymentSyncReason(result.reason)) {
          console.error(
            `[stripe-webhook][CRITICAL] terminal simulador checkout sync failure for ${session.id}: ${result.reason}`,
          );
          return NextResponse.json({
            received: true,
            terminalFailure: result.reason,
          });
        }
        throw new Error(`simulador checkout sync failed: ${result.reason}`);
      }

      return NextResponse.json({
        received: true,
        organizationId: result.organizationId,
        subscriptionId: result.subscriptionId,
      });
    }

    // R-02: eventos negativos de suscripción. Stripe es la fuente de verdad;
    // aquí sincronizamos status/period_end para que el guard de acceso (409 al
    // asignar sin sub activa) y el banner de vencida respeten el estado real.
    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        event.type === "customer.subscription.deleted"
          ? "cancelled"
          : mapStripeSubscriptionStatus(sub.status);
      const periodEnd =
        "current_period_end" in sub && typeof sub.current_period_end === "number"
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
      const result = await syncSimuladorSubscriptionStatus(supabase, sub.id, {
        status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end ?? null,
      });
      if (!result.ok && result.reason !== "subscription_not_found") {
        throw new Error(`subscription sync failed: ${result.reason}`);
      }
      return NextResponse.json({ received: true, synced: result.ok });
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      const rawSub = (invoice as unknown as { subscription?: unknown }).subscription;
      const subId =
        typeof rawSub === "string"
          ? rawSub
          : rawSub && typeof rawSub === "object" && "id" in rawSub
            ? String((rawSub as { id: unknown }).id)
            : null;
      if (subId) {
        const result = await syncSimuladorSubscriptionStatus(supabase, subId, {
          status: "past_due",
        });
        if (!result.ok && result.reason !== "subscription_not_found") {
          throw new Error(`invoice sync failed: ${result.reason}`);
        }
        return NextResponse.json({ received: true, synced: result.ok });
      }
    }

    return NextResponse.json({ received: true, ignored: true });
  } catch (error: any) {
    console.error("Error handling Stripe webhook:", error);
    await releaseDedup(supabase, event);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
