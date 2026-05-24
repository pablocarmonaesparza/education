import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe/config";
import {
  isTerminalSimuladorPaymentSyncReason,
  isSimuladorCheckoutSession,
  upsertSimuladorSubscriptionFromCheckout,
} from "@/lib/stripe/simuladorBilling";

export const runtime = "nodejs";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function markEventProcessed(
  supabase: ReturnType<typeof adminClient>,
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
  supabase: ReturnType<typeof adminClient>,
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

  const supabase = adminClient();

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

    return NextResponse.json({ received: true, ignored: true });
  } catch (error: any) {
    console.error("Error handling Stripe webhook:", error);
    await releaseDedup(supabase, event);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
