import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  stripe,
  planFromPriceId,
  PAID_TIER,
  FREE_TIER,
  type BillingPlan,
} from '@/lib/stripe/config';
import { sendPaymentReceipt, sendFailedCharge } from '@/lib/email/send';

export const runtime = 'nodejs';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Resolve user email + name para triggers de email. Hacemos un select
 * corto a `public.users`. Si falla (user no existe aún), devolvemos null
 * y el caller skip el email — el evento de DB igual se procesó.
 */
async function getUserContact(
  supabase: ReturnType<typeof adminClient>,
  userId: string
): Promise<{ email: string; name: string | null } | null> {
  const { data } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .maybeSingle();
  if (!data?.email) return null;
  return { email: data.email, name: data.name ?? null };
}

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    'https://itera.la'
  );
}

function isActiveStatus(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing';
}

/**
 * Valida que un string de metadata sea un plan permitido. Sin esto, un
 * cliente tamperer (aunque requiere firmar el webhook) o un mismatch de
 * env podría insertar un valor inválido y romper el CHECK constraint.
 */
function parsePlan(raw: unknown): BillingPlan | null {
  if (raw === 'monthly' || raw === 'yearly') return raw;
  return null;
}

/**
 * Resolve the internal user id. Tries metadata first (authoritative, set
 * at checkout creation), falls back to looking up by stripe_customer_id.
 * Nunca devuelve null si metadata trae un user_id — incluso si el customer
 * no está enlazado todavía.
 */
async function resolveUserId(
  supabase: ReturnType<typeof adminClient>,
  params: { metadataUserId?: string | null; customerId?: string | null }
): Promise<string | null> {
  if (params.metadataUserId) return params.metadataUserId;
  if (!params.customerId) return null;

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', params.customerId)
    .maybeSingle();

  return data?.id ?? null;
}

/**
 * Extract price ID from an invoice line item. La SDK 2025-11-17 (clover)
 * reemplazó `line.price.id` por `line.pricing.price_details.price`.
 * Aislamos acá para no repetir el workaround.
 */
function priceIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const line = invoice.lines?.data?.[0] as any;
  return line?.pricing?.price_details?.price ?? line?.price?.id ?? null;
}

/**
 * Extraer el subscription_id de un invoice. En SDK 2025-11-17 (clover) se
 * movió de `invoice.subscription` a `invoice.parent.subscription_details.subscription`.
 * Mantenemos el fallback al path viejo para no depender de la versión exacta.
 */
function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subRef =
    invoice.parent?.subscription_details?.subscription ??
    (invoice as any).subscription ??
    null;
  if (!subRef) return null;
  return typeof subRef === 'string' ? subRef : subRef.id;
}

/**
 * user_id leído de cualquier metadata disponible en el invoice.
 *
 * No usamos el primer objeto metadata no-null porque eso falla si
 * `parent.subscription_details.metadata = {}` existe pero no tiene user_id
 * mientras `invoice.metadata` sí lo tiene. Recorremos los 3 candidatos y
 * devolvemos el primer user_id real.
 */
function invoiceUserIdFromMetadata(invoice: Stripe.Invoice): string | null {
  const candidates: Array<Stripe.Metadata | null | undefined> = [
    invoice.parent?.subscription_details?.metadata,
    (invoice as any).subscription_details?.metadata,
    invoice.metadata,
  ];
  for (const m of candidates) {
    const userId = m?.user_id;
    if (userId) return userId;
  }
  return null;
}

/**
 * Update `users` o lanza si Supabase devuelve error. Sin esto, un fallo de
 * DB se silencia y Stripe recibe 200 → no reintenta → perdemos el evento.
 */
async function updateUserOrThrow(
  supabase: ReturnType<typeof adminClient>,
  userId: string,
  update: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('users').update(update).eq('id', userId);
  if (error) {
    throw new Error(`users.update failed for ${userId}: ${error.message}`);
  }
}

/**
 * Intenta marcar este event_id como procesado. Devuelve `true` si es la
 * primera vez (seguir con el handler) y `false` si ya lo habíamos procesado
 * (Stripe reintentó — salir early con 200).
 *
 * Requiere la tabla `stripe_webhook_events` (migration 006).
 */
async function markEventProcessed(
  supabase: ReturnType<typeof adminClient>,
  event: Stripe.Event
): Promise<boolean> {
  const { error } = await supabase.from('stripe_webhook_events').insert({
    event_id: event.id,
    event_type: event.type,
  });
  if (!error) return true;

  // Código '23505' = unique_violation → ya procesado.
  if ((error as any).code === '23505') return false;

  // Otro error (RLS, tabla faltante, etc.) — loggeamos y seguimos procesando
  // para no bloquear eventos si la tabla no existe aún (migración pendiente).
  console.warn(
    `[stripe-webhook] dedup table error (${error.code}): ${error.message}. Proceeding without dedup.`
  );
  return true;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new NextResponse('Stripe webhook secret not set.', { status: 500 });
  }

  const buf = await req.arrayBuffer();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = adminClient();

  // Dedup: si ya procesamos este event_id, devolvemos 200 sin hacer nada.
  const isNew = await markEventProcessed(supabase, event);
  if (!isNew) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || session.client_reference_id;
        if (!userId) {
          console.error('checkout.session.completed sin user_id', session.id);
          break;
        }

        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null;

        // Para mode=subscription SIEMPRE debe haber subscription. Si no está,
        // es un evento inesperado (¿mode=payment one-off?) — no escribimos
        // estado pagado con campos incompletos. Loggeamos y salimos.
        if (!subscriptionId) {
          console.error(
            'checkout.session.completed sin subscription — se salta update para evitar estado inconsistente',
            session.id
          );
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const status = sub.status;
        const active = isActiveStatus(status);
        const currentPeriodEnd = (sub as any).current_period_end ?? null;
        const cancelAtPeriodEnd = sub.cancel_at_period_end ?? false;
        const plan: BillingPlan | null =
          parsePlan(session.metadata?.plan) ??
          planFromPriceId(sub.items.data[0]?.price.id);

        const update: Record<string, unknown> = {
          stripe_subscription_id: subscriptionId,
          subscription_status: status,
          subscription_plan: plan,
          subscription_active: active,
          current_period_end: currentPeriodEnd
            ? new Date(currentPeriodEnd * 1000).toISOString()
            : null,
          cancel_at_period_end: cancelAtPeriodEnd,
          tier: active ? PAID_TIER : FREE_TIER,
          updated_at: new Date().toISOString(),
        };
        // Solo escribimos stripe_customer_id si Stripe nos lo mandó — no
        // queremos blankear un valor previo por un evento incompleto.
        if (customerId) update.stripe_customer_id = customerId;

        await updateUserOrThrow(supabase, userId, update);
        break;
      }

      // paused/resumed Stripe los despacha junto con customer.subscription.updated,
      // pero listamos explícitamente para no depender del orden ni perderlos si
      // aparecen en aislado.
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = await resolveUserId(supabase, {
          metadataUserId: sub.metadata?.user_id,
          customerId,
        });
        if (!userId) {
          console.warn(`${event.type} sin user resolvible`, sub.id);
          break;
        }

        const plan = planFromPriceId(sub.items.data[0]?.price.id);
        const periodEnd = (sub as any).current_period_end as number | undefined;
        const active = isActiveStatus(sub.status);

        const update: Record<string, unknown> = {
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          subscription_plan: plan,
          subscription_active: active,
          current_period_end: periodEnd
            ? new Date(periodEnd * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          tier: active ? PAID_TIER : FREE_TIER,
          updated_at: new Date().toISOString(),
        };
        // Si el evento llega antes de checkout.session.completed, este
        // write enlaza customer_id por primera vez. Defensivo por si falta.
        if (customerId) update.stripe_customer_id = customerId;

        await updateUserOrThrow(supabase, userId, update);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        const userId = await resolveUserId(supabase, {
          metadataUserId: sub.metadata?.user_id,
          customerId,
        });
        if (!userId) break;

        await updateUserOrThrow(supabase, userId, {
          subscription_status: 'canceled',
          subscription_active: false,
          cancel_at_period_end: false,
          tier: FREE_TIER,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case 'customer.deleted': {
        // Edge case: cliente borrado desde Stripe Dashboard o via API.
        // Desenlazamos para que futuros checkouts creen customer nuevo.
        const customer = event.data.object as Stripe.Customer;
        const userId = await resolveUserId(supabase, {
          metadataUserId: customer.metadata?.user_id,
          customerId: customer.id,
        });
        if (!userId) break;

        await updateUserOrThrow(supabase, userId, {
          stripe_customer_id: null,
          stripe_subscription_id: null,
          subscription_status: 'canceled',
          subscription_active: false,
          subscription_plan: null,
          current_period_end: null,
          cancel_at_period_end: false,
          tier: FREE_TIER,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null;
        const subscriptionIdForInvoice = subscriptionIdFromInvoice(invoice);
        let metadataUserId = invoiceUserIdFromMetadata(invoice);
        let retrieveFailed = false;

        // Si no tenemos user_id en metadata pero sí subscription_id,
        // vamos a Stripe por la sub para leer su metadata. Esto cubre el caso
        // donde invoice.payment_succeeded llega antes de checkout.session.completed
        // y stripe_customer_id todavía no está escrito en users.
        if (!metadataUserId && subscriptionIdForInvoice) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionIdForInvoice);
            metadataUserId = sub.metadata?.user_id ?? null;
          } catch (err: any) {
            retrieveFailed = true;
            console.warn(
              `[invoice.payment_succeeded] no pude recuperar sub ${subscriptionIdForInvoice}: ${err.message}`
            );
          }
        }

        const userId = await resolveUserId(supabase, {
          metadataUserId,
          customerId,
        });
        if (!userId) {
          // Si el retrieve falló y tampoco resolvemos por customer, no
          // queremos dar 200 silenciosamente — Stripe debe reintentar.
          if (retrieveFailed) {
            throw new Error(
              `invoice.payment_succeeded unresolvable tras fallo de Stripe retrieve — sub ${subscriptionIdForInvoice}, invoice ${invoice.id}`
            );
          }
          console.warn('invoice.payment_succeeded sin user resolvible', invoice.id);
          break;
        }

        const priceId = priceIdFromInvoice(invoice);
        const plan = planFromPriceId(priceId);
        const paymentIntentId =
          typeof (invoice as any).payment_intent === 'string'
            ? (invoice as any).payment_intent
            : (invoice as any).payment_intent?.id ?? null;

        // Upsert con onConflict para idempotencia en reintentos de webhook.
        // (provider, provider_payment_id) es UNIQUE vía migration 005.
        const { error: upsertError } = await supabase
          .from('payments')
          .upsert(
            {
              user_id: userId,
              amount: invoice.amount_paid ?? 0,
              currency: (invoice.currency ?? 'usd').toLowerCase(),
              provider: 'stripe',
              provider_payment_id: paymentIntentId ?? invoice.id,
              status: 'succeeded',
              tier: PAID_TIER,
              metadata: {
                invoice_id: invoice.id,
                subscription_id: subscriptionIdForInvoice,
                plan,
                billing_reason: invoice.billing_reason ?? null,
                hosted_invoice_url: invoice.hosted_invoice_url ?? null,
              },
            },
            { onConflict: 'provider,provider_payment_id', ignoreDuplicates: false }
          );

        if (upsertError) {
          throw new Error(`payments.upsert failed: ${upsertError.message}`);
        }

        // Disparar recibo. Idempotencia del envío vive a nivel de webhook
        // event: `markEventProcessed` ya descartó retries de Stripe para
        // este `event.id`, así que si llegamos aquí es la primera vez que
        // procesamos este `invoice.payment_succeeded`. Await para que el
        // helper (que swallow-ea errores) complete antes de responder 200.
        const contact = await getUserContact(supabase, userId);
        if (contact) {
          await sendPaymentReceipt({
            to: contact.email,
            userName: contact.name ?? undefined,
            amountCents: invoice.amount_paid ?? 0,
            currency: invoice.currency ?? 'usd',
            plan: plan ?? 'monthly',
            invoiceNumber: invoice.number ?? null,
            paidAtIso: new Date(
              (invoice.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000)) * 1000
            ).toISOString(),
            hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
            billingPortalUrl: `${appOrigin()}/dashboard/perfil`,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = subscriptionIdFromInvoice(invoice);
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer?.id ?? null;

        let metadataUserId = invoiceUserIdFromMetadata(invoice);
        let retrieveFailed = false;
        if (!metadataUserId && subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            metadataUserId = sub.metadata?.user_id ?? null;
          } catch (err: any) {
            retrieveFailed = true;
            console.warn(
              `[invoice.payment_failed] no pude recuperar sub ${subscriptionId}: ${err.message}`
            );
          }
        }

        const userId = await resolveUserId(supabase, {
          metadataUserId,
          customerId,
        });

        // Si no logramos resolver user y Stripe tuvo hiccup, reintentar.
        // Es un pago fallido — no queremos silenciar el evento.
        if (!userId && retrieveFailed) {
          throw new Error(
            `invoice.payment_failed unresolvable tras fallo de Stripe retrieve — sub ${subscriptionId}, invoice ${invoice.id}`
          );
        }

        if (subscriptionId && userId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await updateUserOrThrow(supabase, userId, {
            subscription_status: sub.status,
            subscription_active: isActiveStatus(sub.status),
            cancel_at_period_end: sub.cancel_at_period_end ?? false,
            updated_at: new Date().toISOString(),
          });
        }

        if (userId) {
          const { error: failedUpsertError } = await supabase.from('payments').upsert(
            {
              user_id: userId,
              amount: invoice.amount_due ?? 0,
              currency: (invoice.currency ?? 'usd').toLowerCase(),
              provider: 'stripe',
              provider_payment_id: invoice.id,
              status: 'failed',
              tier: PAID_TIER,
              metadata: {
                invoice_id: invoice.id,
                subscription_id: subscriptionId,
                attempt_count: invoice.attempt_count ?? null,
                next_payment_attempt: invoice.next_payment_attempt
                  ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                  : null,
              },
            },
            { onConflict: 'provider,provider_payment_id', ignoreDuplicates: false }
          );
          if (failedUpsertError) {
            throw new Error(`payments.upsert (failed) failed: ${failedUpsertError.message}`);
          }

          // Dunning email. Idempotencia a nivel de event_id
          // (markEventProcessed), así que Stripe retry-ando el mismo
          // invoice.payment_failed no dispara doble correo. Distintos
          // attempts (Smart Retries) son distintos event_id → es correcto
          // que cada fallo mande correo para que el user actualice tarjeta
          // antes del próximo retry. Await el helper (que swallow-ea errores)
          // para no cortar el work en serverless antes de que el envío
          // complete.
          const contact = await getUserContact(supabase, userId);
          if (contact) {
            await sendFailedCharge({
              to: contact.email,
              userName: contact.name ?? undefined,
              amountCents: invoice.amount_due ?? 0,
              currency: invoice.currency ?? 'usd',
              nextAttemptIso: invoice.next_payment_attempt
                ? new Date(invoice.next_payment_attempt * 1000).toISOString()
                : null,
              updatePaymentUrl: `${appOrigin()}/dashboard/perfil`,
              attemptCount: invoice.attempt_count ?? null,
            });
          }
        }
        break;
      }

      default:
        // no-op para eventos no manejados (firma ya validada arriba)
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    // Devolvemos 500 para que Stripe reintente. El event_id ya quedó en la
    // tabla de dedup, pero el handler no completó — Stripe reintentará y
    // el dedup devolverá false, saltando esta corrida. Workaround: en caso
    // de error, también borramos el event_id para permitir el retry.
    //
    // Crítico: si el DELETE falla también (ej. hiccup de DB), el event_id
    // queda marcado como procesado y Stripe en el siguiente retry lo va a
    // descartar por dedup → pérdida permanente del evento. Inspeccionamos
    // explícitamente el resultado y lo elevamos con prefix [CRITICAL] para
    // alertas downstream (log drain, Sentry, etc.). No podemos recuperar
    // el evento a posteriori — Stripe no permite re-request de webhooks —
    // pero al menos queda visible en logs para triage manual.
    try {
      const { error: delError } = await supabase
        .from('stripe_webhook_events')
        .delete()
        .eq('event_id', event.id);
      if (delError) {
        console.error(
          `[CRITICAL] stripe-webhook ${event.id} (${event.type}) falló Y no pudimos borrar la fila de dedup — el retry será tratado como duplicado y perderá el evento. delete error: ${delError.message}`
        );
      }
    } catch (innerErr: any) {
      console.error(
        `[CRITICAL] stripe-webhook ${event.id} (${event.type}) falló Y el delete del dedup lanzó — el evento se perderá en retry.`,
        innerErr
      );
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
