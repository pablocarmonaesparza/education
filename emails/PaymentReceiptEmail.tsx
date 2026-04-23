import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
  InfoCard,
} from './_shared';

interface PaymentReceiptEmailProps {
  userName?: string;
  /** Monto en la unidad menor (centavos). Ej: 1900 = $19.00 USD. */
  amountCents: number;
  currency: string;
  plan: 'monthly' | 'yearly' | string;
  invoiceNumber?: string | null;
  paidAtIso: string;
  /** URL hospedada de Stripe para descargar la factura PDF. */
  hostedInvoiceUrl?: string | null;
  /** URL del portal de billing para gestionar la suscripción. */
  billingPortalUrl?: string;
}

function formatAmount(amountCents: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(amountCents / 100);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function planLabel(plan: string): string {
  if (plan === 'monthly') return 'mensual';
  if (plan === 'yearly') return 'anual';
  return plan;
}

export default function PaymentReceiptEmail({
  userName,
  amountCents,
  currency,
  plan,
  invoiceNumber,
  paidAtIso,
  hostedInvoiceUrl,
  billingPortalUrl,
}: PaymentReceiptEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'hola';
  const amount = formatAmount(amountCents, currency);
  const paidAt = formatDate(paidAtIso);
  return (
    <EmailLayout preview={`recibo de pago de itera — ${amount}`}>
      <EmailHeading>{firstName}, gracias por tu pago</EmailHeading>

      <EmailParagraph>
        confirmamos el cobro de tu plan <strong>{planLabel(plan)}</strong>.
        tu acceso sigue activo sin interrupciones.
      </EmailParagraph>

      <InfoCard>
        <Text
          style={{
            color: EMAIL_COLORS.textMain,
            fontSize: 14,
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          <strong>monto:</strong> {amount} {currency.toUpperCase()}
          <br />
          <strong>plan:</strong> {planLabel(plan)}
          <br />
          <strong>fecha:</strong> {paidAt}
          {invoiceNumber ? (
            <>
              <br />
              <strong>factura:</strong> {invoiceNumber}
            </>
          ) : null}
        </Text>
      </InfoCard>

      {hostedInvoiceUrl ? (
        <EmailButton href={hostedInvoiceUrl}>ver factura</EmailButton>
      ) : billingPortalUrl ? (
        <EmailButton href={billingPortalUrl}>gestionar suscripción</EmailButton>
      ) : null}

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        precios en dólares estadounidenses (USD). si tu banco aplica
        conversión, el monto en tu moneda local puede variar ligeramente.
      </Text>
    </EmailLayout>
  );
}
